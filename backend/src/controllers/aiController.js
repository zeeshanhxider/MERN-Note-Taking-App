import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";

dotenv.config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Writing Assistant - Check grammar, style, and suggest improvements
export const writingAssistant = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const prompt = `
Please analyze the following text and provide writing improvements. Focus on:
1. Grammar and spelling corrections
2. Clarity and readability improvements  
3. Style and tone suggestions
4. Structure and flow enhancements

Provide an improved version of the text with better grammar, clarity and style. Keep the original meaning and key points intact. Return ONLY the imrpoved text with no explanations, no introductions, no "here is" statements, and no additional commentary

Text to analyze:
${content}
`;

    const response = await cohere.chat({
      model: "command-r-plus",
      message: prompt,
      temperature: 0.3,
      maxTokens: 2000,
    });

    const suggestions = response.text;

    res.json({
      suggestions: suggestions.trim(),
      originalLength: content.length,
      improvedLength: suggestions.trim().length,
    });
  } catch (error) {
    console.error("Error in writing assistant:", error);

    // Handle specific error types
    if (error.status === 429 || error.statusCode === 429) {
      return res.status(429).json({
        message: "AI service quota exceeded. Please try again later.",
        error: "QUOTA_EXCEEDED",
      });
    }

    if (error.status === 404 || error.statusCode === 404) {
      return res.status(503).json({
        message: "AI model is currently unavailable. Please try again later.",
        error: "MODEL_UNAVAILABLE",
      });
    }

    res.status(500).json({
      message: "Failed to analyze writing. Please try again.",
      error: error.message,
    });
  }
};

// Note Summarizer - Generate concise summary of long content
export const summarizeNote = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const prompt = `
Please create a concise, well-structured summary of the following content. The summary should:
1. Capture all key points and main ideas
2. Be significantly shorter than the original
3. Use clear, professional language
4. Maintain logical flow and organization

Content to summarize:
${content}

Provide a summary that is approximately 20-30% of the original length while preserving all important information. Return ONLY the summary with no explanations, no introductions, no "here is" statements, and no additional commentary
`;

    const response = await cohere.chat({
      model: "command-r-plus",
      message: prompt,
      temperature: 0.3,
      maxTokens: 1500,
    });

    const summary = response.text;

    res.json({
      summary: summary.trim(),
      originalLength: content.length,
      summaryLength: summary.trim().length,
      compressionRatio: (
        ((content.length - summary.trim().length) / content.length) *
        100
      ).toFixed(1),
    });
  } catch (error) {
    console.error("Error in note summarizer:", error);

    // Handle specific error types
    if (error.status === 429 || error.statusCode === 429) {
      return res.status(429).json({
        message: "AI service quota exceeded. Please try again later.",
        error: "QUOTA_EXCEEDED",
      });
    }

    if (error.status === 404 || error.statusCode === 404) {
      return res.status(503).json({
        message: "AI model is currently unavailable. Please try again later.",
        error: "MODEL_UNAVAILABLE",
      });
    }

    res.status(500).json({
      message: "Failed to generate summary. Please try again.",
      error: error.message,
    });
  }
};

// Auto-tagging - Generate relevant tags for content
export const generateTags = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const prompt = `
Analyze the following content and generate 5-8 relevant tags that best describe the topic, themes, and key concepts. 

Guidelines:
- Use single words or short phrases (2-3 words max)
- Focus on main topics, subjects, and themes
- Include both specific and general tags
- Make tags useful for searching and organization
- Separate tags with commas

Content:
${content}

Respond with only the tags separated by commas, no other text or formatting.
`;

    const response = await cohere.chat({
      model: "command-r-plus",
      message: prompt,
      temperature: 0.3,
      maxTokens: 100,
    });

    const tagsText = response.text.trim();

    // Clean and format tags
    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 8); // Limit to 8 tags max

    res.json({
      tags,
      count: tags.length,
    });
  } catch (error) {
    console.error("Error in tag generation:", error);

    // Handle specific error types
    if (error.status === 429 || error.statusCode === 429) {
      return res.status(429).json({
        message: "AI service quota exceeded. Please try again later.",
        error: "QUOTA_EXCEEDED",
      });
    }

    if (error.status === 404 || error.statusCode === 404) {
      return res.status(503).json({
        message: "AI model is currently unavailable. Please try again later.",
        error: "MODEL_UNAVAILABLE",
      });
    }

    res.status(500).json({
      message: "Failed to generate tags. Please try again.",
      error: error.message,
    });
  }
};
