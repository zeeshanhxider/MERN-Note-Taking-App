import { CohereClient } from "cohere-ai";
import Note from "../model/Note.js";
import officeParser from "officeparser";
import fs from "fs";

export const processPptAndCreateNote = async (req, res) => {
  try {
    console.log("=== PPT Processing Started ===");
    console.log("Request body:", req.body);

    // Check if API key is available
    if (!process.env.COHERE_API_KEY) {
      return res.status(500).json({
        message: "AI service is not configured properly.",
        error: "missing_api_key",
      });
    }

    // Initialize Cohere client inside the function
    const cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });

    const userId = req.user.userId; // Get userId from auth middleware
    const folder = req.body.folder || null;

    if (!req.file) {
      return res.status(400).json({
        message: "PowerPoint file is required",
        error: "missing_file",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
        error: "missing_auth",
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    console.log("Processing PPT file:", fileName);
    console.log("File path:", filePath);

    let extractedText = "";

    try {
      // Extract text from PowerPoint file
      console.log("Extracting text from PowerPoint...");

      const data = await officeParser.parseOfficeAsync(filePath);
      extractedText = data || "";

      console.log("Text extraction completed");
      console.log("Extracted text length:", extractedText.length);

      if (!extractedText || extractedText.trim().length < 10) {
        // Clean up the uploaded file
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.log("Error cleaning up file:", cleanupError.message);
        }

        return res.status(400).json({
          message:
            "Could not extract text from the PowerPoint file. The file might be empty, corrupted, or contain only images.",
          error: "text_extraction_failed",
        });
      }
    } catch (extractionError) {
      console.log("Error extracting text from PPT:", extractionError.message);

      // Clean up the uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.log("Error cleaning up file:", cleanupError.message);
      }

      return res.status(400).json({
        message:
          "Failed to process the PowerPoint file. Please ensure it's a valid PPT/PPTX file.",
        error: "file_processing_failed",
      });
    }

    // Generate AI-enhanced notes using Cohere
    console.log("Generating AI notes...");
    let title = "Notes from PowerPoint";
    let content = extractedText;
    let generatedContent = "";

    try {
      const prompt = `You are an expert academic note-taking assistant. Your task is to transform this PowerPoint presentation into clear, comprehensive, and easy-to-understand study notes.

PRESENTATION CONTENT:
${extractedText}

INSTRUCTIONS:
Create well-structured notes that are:
- Clear and easy to read
- Comprehensive (don't miss any important points)
- Logically organized
- Perfect for studying and reference
- Self-explanatory with proper context

OUTPUT FORMAT:
Start with: TITLE: [Generate an appropriate descriptive title based on the content]

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
- Start with an overview if the presentation has one
- Group related concepts together
- Maintain logical flow from basic to advanced concepts
- Include examples and practical applications
- End with key takeaways or summary if applicable

EXPLANATION REQUIREMENTS - ABSOLUTELY CRITICAL:
- STOP! Before writing ANY technical term, ask: "What IS this fundamentally?"
- EVERY technical term MUST be treated as if the reader has NEVER heard it before
- MANDATORY: Start with "**[Term]**: A [type of concept] that [fundamental definition]"
- Examples of proper starts:
  * "**Pass by Reference**: A programming technique that..."
  * "**Array**: A data structure that..."
  * "**Pointer**: A variable that..."
  * "**Function**: A reusable block of code that..."
- NEVER start with "You can..." or "This involves..." - those are HOW descriptions, not WHAT definitions
- Use this EXACT format: **[Term]**: A [fundamental concept type] that [basic definition]. [How it works]. [Why it's useful]. [When to use it].
- NEVER assume the reader knows what any technical term means
- If slides mention technical terms without definition, add a short explanation in your own words
- When presenting code examples or syntax, explain what the code does and why it's useful
- For concepts that build on previous knowledge, briefly remind what the prerequisite concepts are
- Add context for why certain techniques or approaches are important or when they should be used

DEFINITION ENFORCEMENT - NO EXCEPTIONS:
Every technical term gets this treatment:
1. **[Term]**: A [concept type] that [what it fundamentally is]
2. [How it works mechanically]  
3. [Why it's useful/important]
4. [When/where to use it]
5. [Code example with explanation]

CRITICAL EXAMPLES:
WRONG: "Pass by Reference: You can explicitly pass an array by reference..."
RIGHT: "**Pass by Reference**: A programming technique that allows functions to receive direct access to the original variable's memory location rather than a copy of its value..."

WRONG: "Array Initialization: You can initialize arrays with..."
RIGHT: "**Array Initialization**: A programming process that assigns initial values to array elements at the time of declaration..."

QUALITY STANDARDS:
- Every important point from the slides must be included
- Make technical content accessible without losing accuracy
- Use clear, concise language
- Ensure notes are self-contained and make sense independently
- Format for optimal readability and study efficiency
- A reader should understand each concept even if they haven't seen the original slides
- NO technical term should appear without a proper definition first

EXAMPLE APPROACH - FOLLOW THIS EXACTLY:
ABSOLUTELY WRONG: "Pass by Reference: You can explicitly pass an array by reference using reference syntax."

ABSOLUTELY RIGHT: "**Pass by Reference**: A programming technique that allows functions to receive direct access to the original variable's memory location rather than a copy of its value. When you pass by reference, the function works directly with the original data in memory, meaning any changes made inside the function will modify the original variable. This is useful for avoiding the memory overhead of copying large data structures and when you need a function to modify the original data. It's commonly used with arrays, objects, and when functions need to return multiple values.

\`\`\`cpp
void funcThree(int (&n)[3], int size) {
    cout << n[1]; // accesses the second element
}

int myArray[3] = {10, 20, 30};
funcThree(myArray, 3);
\`\`\`

In this C++ example, the function receives a reference to the original array rather than a copy, allowing it to access and potentially modify the original array elements."

KEY DIFFERENCE:
- WRONG starts with "You can..." (describes HOW to do something)
- RIGHT starts with "A programming technique that..." (defines WHAT it fundamentally is)
- Always define the concept BEFORE explaining how to use it

REMEMBER: Ask yourself "What IS this?" not "How do you do this?" when starting any technical explanation.

IMPORTANT CODE FORMATTING RULES:
- ALWAYS use three backticks with cpp for C++ code blocks (with the language specified)
- NEVER use single backticks for multi-line code
- ALWAYS close code blocks with three backticks
- Put code blocks on separate lines with proper spacing

NOTICE THE DEFINITION FORMAT:
- Start with WHAT it fundamentally is (a programming mechanism)
- Then explain HOW it works mechanically (receives memory address) 
- Then explain WHY it's useful (modify original data, avoid copying)
- Then show practical application (code example with context)
- Use clear sentences separated by periods, NOT table formatting

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
          : "AI-Generated Notes from PowerPoint";
        content = contentMatch ? contentMatch[1].trim() : generatedContent;
      }
    } catch (aiError) {
      console.log("AI processing failed:", aiError.message);

      // Check the type of AI error and provide appropriate user feedback
      if (aiError.status === 503 || aiError.statusCode === 503) {
        // Clean up the uploaded file
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.log("Error cleaning up file:", cleanupError.message);
        }

        return res.status(503).json({
          success: false,
          message:
            "AI service is currently busy. Please try again in a few moments.",
          error: "ai_service_busy",
        });
      } else if (aiError.status === 429 || aiError.statusCode === 429) {
        // Clean up the uploaded file
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.log("Error cleaning up file:", cleanupError.message);
        }

        return res.status(429).json({
          success: false,
          message: "Too many requests. Please wait before trying again.",
          error: "rate_limit_exceeded",
        });
      } else {
        // Fallback: Use the original extracted text as content
        console.log("Using original extracted text as fallback");
        title = "AI-Generated Notes from PowerPoint";
        content = extractedText;
      }
    }

    // Save note to database
    try {
      console.log("Saving note to database...");
      const newNote = new Note({
        title,
        content,
        source: "ppt_upload",
        user: userId,
        folder: folder || null,
      });

      const savedNote = await newNote.save();
      console.log("Note saved successfully:", savedNote._id);

      // Clean up the uploaded file
      try {
        fs.unlinkSync(filePath);
        console.log("Uploaded file cleaned up successfully");
      } catch (cleanupError) {
        console.log("Error cleaning up file:", cleanupError.message);
      }

      res.status(201).json({
        success: true,
        message: "PowerPoint processed and note created successfully!",
        note: savedNote,
        fileInfo: {
          originalName: fileName,
          textLength: extractedText.length,
        },
      });
    } catch (dbError) {
      console.log("Database error:", dbError.message);

      // Clean up the uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.log("Error cleaning up file:", cleanupError.message);
      }

      return res.status(500).json({
        message: "Failed to save the note to database",
        error: "database_error",
      });
    }
  } catch (error) {
    console.log("Unexpected error:", error.message);

    // Clean up the uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.log("Error cleaning up file:", cleanupError.message);
      }
    }

    res.status(500).json({
      message:
        "An unexpected error occurred while processing the PowerPoint file",
      error: "unexpected_error",
    });
  }
};
