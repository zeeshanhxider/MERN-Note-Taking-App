import PDFParser from "pdf2json";
import { CohereClient } from "cohere-ai";
import Note from "../model/Note.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processPdfAndCreateNote = async (req, res) => {
  let tempFilePath = null;

  try {
    // Debug: Check if API key is loaded
    console.log(
      "COHERE_API_KEY loaded:",
      process.env.COHERE_API_KEY ? "Yes" : "No"
    );
    console.log("API Key length:", process.env.COHERE_API_KEY?.length || 0);

    // Check if API key is available
    if (!process.env.COHERE_API_KEY) {
      return res.status(500).json({
        message:
          "Cohere API key not configured. Please add COHERE_API_KEY to your .env file.",
      });
    }

    // Initialize Cohere AI client
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    // Create temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save uploaded file temporarily
    tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Extract text from PDF using pdf2json
    let extractedText = "";
    await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          let fullText = "";
          if (pdfData.Pages) {
            pdfData.Pages.forEach((page) => {
              if (page.Texts) {
                page.Texts.forEach((text) => {
                  if (text.R) {
                    text.R.forEach((textRun) => {
                      if (textRun.T) {
                        // Decode URI components and add space
                        fullText += decodeURIComponent(textRun.T) + " ";
                      }
                    });
                  }
                });
              }
              fullText += "\n"; // Add line break after each page
            });
          }

          // Clean up the text
          extractedText = fullText
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, "\n") // Replace multiple newlines with single newline
            .trim();

          resolve();
        } catch (parseError) {
          reject(parseError);
        }
      });

      pdfParser.loadPDF(tempFilePath);
    });

    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: "No text found in the PDF" });
    }

    // Generate AI notes using Cohere
    let title = "Notes from PDF";
    let content = extractedText;
    let generatedContent = "";

    try {
      console.log("Generating AI notes with Cohere...");

      const prompt = `You are a note-taking assistant. You must analyze the provided PDF text and create structured notes following EXACTLY this format:

TITLE: [Write a specific, descriptive title based on the main topic/subject - NOT generic]

CONTENT:
[Your structured notes here using markdown formatting]

STRICT FORMATTING RULES:
1. Start with exactly "TITLE: " followed by the title
2. Then have a blank line
3. Then start with exactly "CONTENT:" 
4. Use # for main headings ONLY
5. Use ## for subheadings ONLY
6. NEVER use ### or #### - only # and ##
7. Use **bold** for important terms
8. Use *italic* for emphasis
9. Use - for bullet points

EXAMPLE OUTPUT:
TITLE: Machine Learning Fundamentals and Neural Networks

CONTENT:
# Introduction to Machine Learning
- **Machine Learning** is a subset of artificial intelligence
- Focuses on *algorithms* that improve through experience

## Types of Learning
- **Supervised Learning**: Uses labeled data
- **Unsupervised Learning**: Finds patterns in unlabeled data

Now analyze this PDF text and follow the EXACT format above:

${extractedText}

Remember: Start with "TITLE: " and include "CONTENT:" exactly as shown. Use ONLY # and ## for headings, never ###.`;

      const response = await cohere.chat({
        model: "command-r-plus",
        message: prompt,
        temperature: 0.3,
        maxTokens: 3000,
      });

      generatedContent = response.text;

      if (generatedContent) {
        // Parse the AI response to extract title and content
        const titleMatch = generatedContent.match(/TITLE:\s*(.+)/);
        const contentMatch = generatedContent.match(/CONTENT:\s*([\s\S]+)/);

        title = titleMatch
          ? titleMatch[1].trim()
          : "AI-Generated Notes from PDF";
        content = contentMatch ? contentMatch[1].trim() : generatedContent;
      }
    } catch (aiError) {
      console.log("AI processing failed:", aiError.message);

      // Check the type of AI error and provide appropriate user feedback
      if (aiError.status === 503 || aiError.statusCode === 503) {
        return res.status(503).json({
          success: false,
          message:
            "AI service is currently busy. Please try again in a few moments.",
          error: "service_unavailable",
        });
      }

      if (aiError.status === 429 || aiError.statusCode === 429) {
        return res.status(429).json({
          success: false,
          message:
            "AI service quota exceeded. Please try again later or use manual note creation.",
          error: "quota_exceeded",
        });
      }

      // For other AI errors, fall back to raw text
      console.log("Falling back to raw extracted text");
      title = "Notes from PDF (AI processing failed)";
      content = extractedText;
    }

    // Only create and save the note if we have content
    if (!content || content.trim().length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to process PDF content. Please try again later.",
        error: "processing_failed",
      });
    }

    // Create and save the note
    const note = new Note({
      title,
      content,
      user: req.user.userId,
      source: "pdf_upload",
      folder: req.body.folder || null,
      isPdfGenerated: true, // Mark as AI-generated
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
    res.status(500).json({
      message: "Error processing PDF file",
      error: error.message,
    });
  }
};
