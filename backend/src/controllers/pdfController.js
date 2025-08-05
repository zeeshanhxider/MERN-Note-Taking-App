import PDFParser from "pdf2json";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Note from "../model/Note.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function processPdfAndCreateNote(req, res) {
  let tempFilePath = null;

  try {
    // Debug: Check if API key is loaded (moved here after dotenv loads)
    console.log(
      "GEMINI_API_KEY loaded:",
      process.env.GEMINI_API_KEY ? "Yes" : "No"
    );
    console.log("API Key length:", process.env.GEMINI_API_KEY?.length || 0);

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message:
          "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.",
      });
    }

    // Initialize Gemini AI client here (after env check)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    // Create a temporary file from the uploaded buffer
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Extract text from PDF using pdf2json
    const extractedText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          // Extract text from all pages with improved formatting
          let text = "";
          if (pdfData.Pages) {
            pdfData.Pages.forEach((page) => {
              let pageText = "";
              if (page.Texts) {
                // Sort texts by position for better reading order
                const sortedTexts = page.Texts.sort((a, b) => {
                  if (Math.abs(a.y - b.y) < 0.1) {
                    return a.x - b.x; // Same line, sort by x position
                  }
                  return a.y - b.y; // Different lines, sort by y position
                });

                sortedTexts.forEach((textItem) => {
                  if (textItem.R) {
                    let lineText = "";
                    textItem.R.forEach((textRun) => {
                      if (textRun.T) {
                        // Decode the text
                        let decodedText = decodeURIComponent(textRun.T);
                        lineText += decodedText;
                      }
                    });

                    // Add the line text with a space
                    if (lineText.trim()) {
                      pageText += lineText + " ";
                    }
                  }
                });
              }

              // Clean up page text and add page break
              pageText = pageText
                .replace(/\s+/g, " ") // Replace multiple spaces with single space
                .trim();

              if (pageText) {
                text += pageText + "\n\n";
              }
            });
          }

          // Final cleanup of the extracted text
          let cleanedText = text
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .replace(/\n\s*\n\s*\n/g, "\n\n") // Replace multiple newlines with double newline
            .trim();

          resolve(cleanedText);
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.loadPDF(tempFilePath);
    });

    // Clean up temp file after extraction
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ message: "No text found in the PDF" });
    }

    // Generate notes using Gemini AI with retry logic and multiple model fallback
    let generatedContent = null;
    let title = "Notes from PDF";
    let content = extractedText;

    try {
      // Try only valid models (removed invalid gemini-pro)
      const models = [
        "gemini-1.5-flash", // Free tier friendly, fast
        "gemini-1.5-pro", // Better quality but higher quota usage
      ];

      let modelUsed = null;
      let quotaExceeded = false;

      for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
        const modelName = models[modelIndex];

        try {
          console.log(`Trying model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });

          const prompt = `
            Please analyze the following text extracted from a PDF and create well-structured notes. 
            Be concise but comprehensive. Use clear headings and organize information logically.
            Use simple formatting without asterisks or markdown symbols.
            
            Text:
            ${extractedText}
            
            Format response as:
            TITLE: [Short title]
            
            CONTENT:
            [Structured notes using headings and numbered/lettered lists, but avoid using asterisks for formatting]
          `;

          // Retry logic with exponential backoff for current model
          const maxRetries = 2; // Reduced retries since we have model fallback
          let retryDelay = 1000;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(
                `Model ${modelName}: Attempt ${attempt}/${maxRetries}`
              );
              const result = await model.generateContent(prompt);
              const response = await result.response;
              generatedContent = response.text();
              modelUsed = modelName;
              console.log(`Success with model: ${modelName}`);
              break; // Success, exit retry loop
            } catch (modelError) {
              console.log(
                `Model ${modelName} attempt ${attempt} failed:`,
                modelError.message
              );

              if (attempt === maxRetries) {
                throw modelError; // Re-throw on final attempt for this model
              }

              if (modelError.status === 503 || modelError.status === 429) {
                console.log(
                  `Retrying ${modelName} in ${retryDelay}ms... (${
                    modelError.status === 429
                      ? "Quota limit"
                      : "Service overloaded"
                  })`
                );
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                retryDelay *= 2;
              } else {
                throw modelError; // Don't retry for non-503/429 errors
              }
            }
          }

          // If we got content, break out of model loop
          if (generatedContent) {
            break;
          }
        } catch (modelError) {
          console.log(
            `Model ${modelName} failed completely:`,
            modelError.message
          );

          // Track if we hit quota limits
          if (modelError.status === 429) {
            quotaExceeded = true;
          }

          // Continue to next model
          if (modelIndex === models.length - 1) {
            // Last model failed, throw error to be caught by outer catch
            throw modelError;
          }
        }
      }

      if (generatedContent) {
        // Parse the AI response to extract title and content
        const titleMatch = generatedContent.match(/TITLE:\s*(.+)/);
        const contentMatch = generatedContent.match(/CONTENT:\s*([\s\S]+)/);

        title = titleMatch
          ? titleMatch[1].trim()
          : `AI-Generated Notes from PDF (${modelUsed})`;
        content = contentMatch ? contentMatch[1].trim() : generatedContent;
      }
    } catch (aiError) {
      console.log("AI processing failed:", aiError.message);

      // Check the type of AI error and provide appropriate user feedback
      if (aiError.status === 503) {
        return res.status(503).json({
          success: false,
          message:
            "AI service is currently busy. Please try again in a few moments.",
          error: "service_unavailable",
        });
      }

      if (aiError.status === 429) {
        return res.status(429).json({
          success: false,
          message:
            "AI service quota exceeded. Please try again later or consider upgrading your plan.",
          error: "quota_exceeded",
        });
      }

      // For other AI errors
      return res.status(500).json({
        success: false,
        message: "AI service is currently unavailable. Please try again later.",
        error: "ai_service_error",
      });
    }

    // Only create and save the note if AI processing was successful
    if (!generatedContent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate AI notes. Please try again later.",
        error: "ai_processing_failed",
      });
    }

    // Create and save the note
    const note = new Note({
      title,
      content,
      user: req.user.userId,
      source: "pdf_upload",
      folder: req.body.folder || null,
    });

    const savedNote = await note.save();

    res.status(201).json({
      success: true,
      note: savedNote,
      extractedText: extractedText.substring(0, 500) + "...", // Preview of extracted text
    });
  } catch (error) {
    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    console.error("Error processing PDF:", error);
    if (error.message.includes("API key")) {
      return res.status(500).json({
        message: "AI service configuration error. Please check API key.",
      });
    }
    res.status(500).json({
      message: "Failed to process PDF and generate notes",
      error: error.message,
    });
  }
}
