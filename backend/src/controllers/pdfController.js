import PDFParser from "pdf2json";
import { CohereClient } from "cohere-ai";
import Note from "../model/Note.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processPdfAndCreateNote = async (req, res) => {
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

    const filePath = req.file.path;
    const fileName = req.file.originalname;

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

      pdfParser.loadPDF(filePath);
    });

    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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

      const prompt = `You are an expert academic note-taking assistant. Your task is to transform this PDF document into clear, comprehensive, and easy-to-understand study notes.

PDF CONTENT:
${extractedText}

INSTRUCTIONS:
Create well-structured notes that are:
- Clear and easy to read
- Comprehensive (don't miss any important points)
- Logically organized
- Perfect for studying and reference
- Self-explanatory with proper context

OUTPUT FORMAT:
Start with: TITLE: Notes: ${fileName.replace(/\.pdf$/i, "")}

Then: CONTENT:
[Your organized notes here]

FORMATTING GUIDELINES:
1. Use # for main topics/chapters
2. Use ## for subtopics/sections  
3. Use ### for sub-subtopics/detailed sections
4. Use **bold** for key terms, definitions, and important concepts
5. Use *italic* for emphasis and examples
6. Use - for bullet points and lists
7. Use numbered lists (1., 2., 3.) for procedures or sequential steps
8. For code snippets, use proper markdown code blocks with language specification:
   \`\`\`cpp
   // Your C++ code here
   \`\`\`
   \`\`\`javascript
   // Your JavaScript code here
   \`\`\`
   \`\`\`python
   # Your Python code here
   \`\`\`
9. Include all formulas, equations, or code snippets exactly as shown
10. Summarize complex concepts in simple terms
11. Add context where needed to make isolated points understandable
12. NEVER use #### or deeper heading levels - stick to #, ##, and ### only

CONTENT ORGANIZATION:
- Start with an overview if the document has one
- Group related concepts together
- Maintain logical flow from basic to advanced concepts
- Include examples and practical applications
- End with key takeaways or summary if applicable

EXPLANATION REQUIREMENTS - ABSOLUTELY CRITICAL:
- STOP! Before writing ANY technical term, ask: "What IS this fundamentally?"
- EVERY technical term MUST be treated as if the reader has NEVER heard it before
- MANDATORY: Start with "**[Term]**: A [type of concept] that [fundamental definition]"
- Examples of proper starts:
  * "**Machine Learning**: A subset of artificial intelligence that..."
  * "**Neural Network**: A computing system that..."
  * "**Algorithm**: A step-by-step procedure that..."
  * "**Database**: A structured collection that..."
- NEVER start with "You can..." or "This involves..." - those are HOW descriptions, not WHAT definitions
- Use this EXACT format: **[Term]**: A [fundamental concept type] that [basic definition]. [How it works]. [Why it's useful]. [When to use it].
- NEVER assume the reader knows what any technical term means
- If document mentions technical terms without definition, add a short explanation in your own words
- When presenting code examples or syntax, explain what the code does and why it's useful
- For concepts that build on previous knowledge, briefly remind what the prerequisite concepts are
- Add context for why certain techniques or approaches are important or when they should be used

DEFINITION ENFORCEMENT - NO EXCEPTIONS:
Every technical term gets this treatment:
1. **[Term]**: A [concept type] that [what it fundamentally is]
2. [How it works mechanically]  
3. [Why it's useful/important]
4. [When/where to use it]
5. [Code example with explanation if applicable]

CRITICAL EXAMPLES:
WRONG: "Machine Learning: You can use machine learning to..."
RIGHT: "**Machine Learning**: A subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario..."

WRONG: "Data Preprocessing: You can clean and prepare data..."
RIGHT: "**Data Preprocessing**: A data preparation technique that involves cleaning, transforming, and organizing raw data into a format suitable for analysis..."

QUALITY STANDARDS:
- Every important point from the document must be included
- Make technical content accessible without losing accuracy
- Use clear, concise language
- Ensure notes are self-contained and make sense independently
- Format for optimal readability and study efficiency
- A reader should understand each concept even if they haven't seen the original document

EXAMPLE APPROACH - FOLLOW THIS EXACTLY:
ABSOLUTELY WRONG: "Neural Networks: You can use neural networks to process data..."

ABSOLUTELY RIGHT: "**Neural Networks**: A computing system inspired by biological neural networks that consists of interconnected nodes (neurons) that process information. These networks learn patterns from data by adjusting connections between nodes based on training examples. This is useful for recognizing complex patterns, making predictions, and solving problems that traditional programming approaches struggle with. They're commonly used in image recognition, natural language processing, and predictive analytics.

\`\`\`python
# Simple neural network example
import tensorflow as tf
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])
\`\`\`

This example creates a basic neural network with two layers that can classify data into 10 categories."

KEY DIFFERENCE:
- WRONG starts with "You can..." (describes HOW to do something)
- RIGHT starts with "A computing system that..." (defines WHAT it fundamentally is)
- Always define the concept BEFORE explaining how to use it

IMPORTANT CODE FORMATTING RULES:
- ALWAYS use three backticks with language for code blocks
- NEVER use single backticks for multi-line code
- ALWAYS close code blocks with three backticks
- Put code blocks on separate lines with proper spacing

REMEMBER: Ask yourself "What IS this?" not "How do you do this?" when starting any technical explanation.

FINAL REMINDER - ABSOLUTELY CRITICAL:
Before writing any technical term, ask yourself: "If someone has never heard this term before, would they understand what it fundamentally IS from my first sentence?" If not, rewrite with a proper fundamental definition first.

Remember: Start with "TITLE: " then "CONTENT:" exactly as shown. Make these the best study notes possible with PROPER DEFINITIONS for every technical term!`;

      const response = await cohere.chat({
        model: "command-r-plus",
        message: prompt,
        temperature: 0.2, // Lower temperature for more consistent, focused output
        maxTokens: 4000, // Increased for more comprehensive notes
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
    // Clean up uploaded file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up uploaded file:", cleanupError);
      }
    }

    console.error("Error processing PDF:", error);
    res.status(500).json({
      message: "Error processing PDF file",
      error: error.message,
    });
  }
};
