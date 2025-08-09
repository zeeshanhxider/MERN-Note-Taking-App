import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";

export const useAIFeatures = () => {
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [writingAssistance, setWritingAssistance] = useState("");
  const [isCheckingWriting, setIsCheckingWriting] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // AI Writing Assistant
  const checkWriting = async (content) => {
    if (!content.trim()) {
      toast.error("Please write some content first");
      return;
    }

    setIsCheckingWriting(true);
    try {
      const response = await api.post("/ai/writing-assistant", {
        content: content,
      });
      setWritingAssistance(response.data.suggestions);
      setShowAiPanel(true);
      toast.success("Writing suggestions generated!");
    } catch (error) {
      console.error("Error checking writing:", error);

      // Handle specific error types
      if (error.response?.status === 429) {
        toast.error("AI service quota exceeded. Please try again later.");
      } else if (error.response?.status === 503) {
        toast.error(
          "AI service is temporarily unavailable. Please try again later."
        );
      } else {
        toast.error("Failed to analyze writing. Please try again.");
      }
    } finally {
      setIsCheckingWriting(false);
    }
  };

  // AI Note Summarizer
  const generateSummary = async (content) => {
    if (!content.trim()) {
      toast.error("Please write some content first");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await api.post("/ai/summarize", {
        content: content,
      });
      setAiSummary(response.data.summary);
      setShowAiPanel(true);
      toast.success("Summary generated!");
    } catch (error) {
      console.error("Error generating summary:", error);

      // Handle specific error types
      if (error.response?.status === 429) {
        toast.error("AI service quota exceeded. Please try again later.");
      } else if (error.response?.status === 503) {
        toast.error(
          "AI service is temporarily unavailable. Please try again later."
        );
      } else {
        toast.error("Failed to generate summary. Please try again.");
      }
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Apply AI suggestion to content
  const applySuggestion = (suggestion, setContent) => {
    setContent(suggestion);
    toast.success("Suggestion applied to content!");
  };

  return {
    aiSummary,
    setAiSummary,
    isGeneratingSummary,
    writingAssistance,
    setWritingAssistance,
    isCheckingWriting,
    showAiPanel,
    setShowAiPanel,
    checkWriting,
    generateSummary,
    applySuggestion,
  };
};
