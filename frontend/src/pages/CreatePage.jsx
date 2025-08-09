import {
  ArrowLeftIcon,
  FileText,
  Sparkles,
  FileCheck,
  Wand2,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  File,
  Presentation,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router";
import api from "../lib/axios";
import { formatText, hasFormatting } from "../lib/textFormatter";

const CreatePage = () => {
  const [searchParams] = useSearchParams();
  const currentFolder = searchParams.get("folder") || null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("manual");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [pptLoading, setPptLoading] = useState(false);

  // AI Features state
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [writingAssistance, setWritingAssistance] = useState("");
  const [isCheckingWriting, setIsCheckingWriting] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Text formatting preview
  const [showPreview, setShowPreview] = useState(false);
  const [showFormatHelp, setShowFormatHelp] = useState(false);

  const processingMessages = [
    "Extracting text from PDF...",
    "AI is reading through your content...",
    "Generating intelligent notes...",
    "Organizing insights...",
    "Almost done! Finalizing notes...",
  ];

  const pptProcessingMessages = [
    "Extracting text from PowerPoint...",
    "AI is reading through your slides...",
    "Generating structured notes...",
    "Organizing key points...",
    "Almost done! Finalizing notes...",
  ];

  const navigate = useNavigate();

  // AI Writing Assistant Function
  const checkWriting = async () => {
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
      toast.success("Writing analysis complete!");
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

  // AI Note Summarizer Function
  const generateSummary = async () => {
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

  // Apply writing suggestions
  const applySuggestion = (improvedContent) => {
    setContent(improvedContent);
    setShowAiPanel(false); // Close the AI panel
    toast.success("Writing suggestions applied!");
  };

  // Typewriter effect for processing
  useEffect(() => {
    let interval;
    let charIndex = 0;

    if (pdfLoading || pptLoading) {
      const messages = pptLoading ? pptProcessingMessages : processingMessages;
      const currentMessage = messages[currentMessageIndex];

      interval = setInterval(() => {
        if (charIndex <= currentMessage.length) {
          setTypewriterText(currentMessage.slice(0, charIndex));
          charIndex++;
        } else {
          // Move to next message after a pause
          setTimeout(() => {
            setCurrentMessageIndex((prev) =>
              prev === messages.length - 1 ? 0 : prev + 1
            );
            charIndex = 0;
            setTypewriterText("");
          }, 1000);
        }
      }, 50); // Typing speed
    } else {
      setTypewriterText("");
      setCurrentMessageIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pdfLoading, pptLoading, currentMessageIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating note with folder:", currentFolder); // Debug log
      await api.post("/notes", {
        title,
        content,
        folder: currentFolder,
      });

      toast.success("Note created successfully!");
      // Navigate back to the current folder
      if (currentFolder) {
        navigate(`/?folder=${currentFolder}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log("Error creating note", error);
      if (error.response.status === 429) {
        toast.error("Slow down! You're creating notes too fast", {
          duration: 4000,
          icon: "💀",
        });
      } else {
        toast.error("Failed to create note");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const mode =
      new URLSearchParams(window.location.search).get("mode") ||
      document
        .querySelector(".tab-active")
        ?.textContent?.toLowerCase()
        .includes("pdf")
        ? "pdf"
        : document
            .querySelector(".tab-active")
            ?.textContent?.toLowerCase()
            .includes("ppt")
        ? "ppt"
        : "pdf";

    if (mode === "pdf") {
      if (file && file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        toast.error("Please select a valid PDF file");
        e.target.value = "";
      }
    } else if (mode === "ppt") {
      if (
        file &&
        (file.type === "application/vnd.ms-powerpoint" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
          file.name.toLowerCase().endsWith(".ppt") ||
          file.name.toLowerCase().endsWith(".pptx"))
      ) {
        setSelectedFile(file);
      } else {
        toast.error("Please select a valid PowerPoint file (.ppt or .pptx)");
        e.target.value = "";
      }
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    setPdfLoading(true);
    const formData = new FormData();
    formData.append("pdf", selectedFile);
    if (currentFolder) {
      formData.append("folder", currentFolder);
    }

    try {
      const response = await api.post("/notes/pdf-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // AI processing was successful
      toast.success("AI-generated notes created successfully!", {
        icon: "🤖",
      });

      // Navigate back to the current folder
      if (currentFolder) {
        navigate(`/?folder=${currentFolder}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log("Error uploading PDF", error);

      // Handle specific error types from backend
      const errorCode = error.response?.data?.error;
      const errorMessage = error.response?.data?.message;

      if (
        errorCode === "service_unavailable" ||
        error.response?.status === 503
      ) {
        toast.error(
          "AI service is currently busy. Please try again in a few moments.",
          {
            duration: 6000,
            icon: "🔄",
          }
        );
      } else if (
        errorCode === "quota_exceeded" ||
        error.response?.status === 429
      ) {
        toast.error("AI service quota exceeded. Please try again later.", {
          duration: 6000,
          icon: "⏰",
        });
      } else if (
        errorCode === "ai_service_error" ||
        errorCode === "ai_processing_failed"
      ) {
        toast.error(
          "AI service is currently unavailable. Please try again later.",
          {
            duration: 6000,
            icon: "🤖",
          }
        );
      } else {
        toast.error(errorMessage || "Failed to process PDF");
      }
    } finally {
      setPdfLoading(false);
    }
  };

  // PPT Upload Handler
  const handlePptUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a PowerPoint file");
      return;
    }

    setPptLoading(true);
    const formData = new FormData();
    formData.append("ppt", selectedFile);
    if (currentFolder) {
      formData.append("folder", currentFolder);
    }

    try {
      const response = await api.post("/notes/ppt-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // AI processing was successful
      toast.success("AI-generated notes created successfully!", {
        icon: "🤖",
      });

      // Navigate back to the current folder
      if (currentFolder) {
        navigate(`/?folder=${currentFolder}`);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log("Error uploading PowerPoint", error);

      // Handle specific error types from backend
      const errorCode = error.response?.data?.error;
      const errorMessage = error.response?.data?.message;

      if (
        errorCode === "service_unavailable" ||
        error.response?.status === 503
      ) {
        toast.error(
          "AI service is currently busy. Please try again in a few moments.",
          {
            duration: 6000,
            icon: "🔄",
          }
        );
      } else if (
        errorCode === "quota_exceeded" ||
        error.response?.status === 429
      ) {
        toast.error("AI service quota exceeded. Please try again later.", {
          duration: 6000,
          icon: "⏰",
        });
      } else if (
        errorCode === "ai_service_error" ||
        errorCode === "ai_processing_failed"
      ) {
        toast.error(
          "AI service is currently unavailable. Please try again later.",
          {
            duration: 6000,
            icon: "🔄",
          }
        );
      } else if (errorCode === "text_extraction_failed") {
        toast.error(
          "Could not extract text from the PowerPoint file. Please ensure it contains text content.",
          {
            duration: 6000,
            icon: "📝",
          }
        );
      } else if (errorCode === "file_processing_failed") {
        toast.error(
          "Failed to process the PowerPoint file. Please ensure it's a valid PPT/PPTX file.",
          {
            duration: 6000,
            icon: "📁",
          }
        );
      } else {
        toast.error(errorMessage || "Failed to process PowerPoint file");
      }
    } finally {
      setPptLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            to={currentFolder ? `/?folder=${currentFolder}` : "/"}
            className="btn btn-ghost mb-6"
          >
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Create New Note</h2>

              {/* Mode Switcher */}
              <div className="tabs tabs-boxed mb-6">
                <button
                  className={`tab ${
                    !mode || mode === "manual" ? "tab-active" : ""
                  }`}
                  onClick={() => setMode("manual")}
                >
                  <FileText className="size-4 mr-2" />
                  Mannual
                </button>
                <button
                  className={`tab ${mode === "pdf" ? "tab-active" : ""}`}
                  onClick={() => setMode("pdf")}
                >
                  <File className="size-4 mr-2" />
                  PDF
                </button>
                <button
                  className={`tab ${mode === "ppt" ? "tab-active" : ""}`}
                  onClick={() => setMode("ppt")}
                >
                  <Presentation className="size-4 mr-2" />
                  PPT
                </button>
              </div>

              {!mode || mode === "manual" ? (
                // Default Manual Form
                <>
                  <form onSubmit={handleSubmit}>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text text-base font-semibold">
                          Title
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Note Title"
                        className="input input-bordered"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text text-base font-semibold flex items-center gap-2">
                          Content
                          <button
                            type="button"
                            onClick={() => setShowFormatHelp(!showFormatHelp)}
                            className="btn btn-ghost btn-xs p-1 h-auto min-h-0"
                          >
                            <Info className="size-4 text-base-content/60 hover:text-base-content" />
                          </button>
                        </span>
                        {hasFormatting(content) && (
                          <div className="label-text-alt">
                            <button
                              type="button"
                              onClick={() => setShowPreview(!showPreview)}
                              className="btn btn-xs btn-ghost"
                            >
                              {showPreview ? (
                                <>
                                  <Edit className="size-3 mr-1" />
                                  Edit
                                </>
                              ) : (
                                <>
                                  <Eye className="size-3 mr-1" />
                                  Preview
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </label>

                      {/* Formatting Help Section */}
                      {showFormatHelp && (
                        <div className="bg-base-200 rounded-lg p-4 mb-3 text-sm">
                          <h4 className="font-bold text-base mb-3 text-base-content">
                            📝 Formatting Guide
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                              <span className="font-semibold text-primary">
                                Text Formatting:
                              </span>
                              <div className="text-xs opacity-75 mt-1 space-y-1">
                                <div>**bold text**</div>
                                <div>*italic text*</div>
                                <div>__underlined text__</div>
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold text-primary">
                                Headings:
                              </span>
                              <div className="text-xs opacity-75 mt-1 space-y-1">
                                <div># Large Heading</div>
                                <div>## Medium Heading</div>
                                <div>### Small Heading</div>
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold text-primary">
                                Code:
                              </span>
                              <div className="text-xs opacity-75 mt-1 space-y-1">
                                <div>`inline code`</div>
                                <div>```code block```</div>
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold text-primary">
                                Lists:
                              </span>
                              <div className="text-xs opacity-75 mt-1 space-y-1">
                                <div>- List item</div>
                                <div>* Also list item</div>
                              </div>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1"></div>
                          </div>
                        </div>
                      )}

                      {showPreview && hasFormatting(content) ? (
                        <div
                          className="textarea textarea-bordered min-h-80 resize-y bg-base-100 prose prose-sm max-w-none p-4"
                          dangerouslySetInnerHTML={{
                            __html: formatText(content),
                          }}
                        />
                      ) : (
                        <textarea
                          className="textarea textarea-bordered min-h-80 resize-y"
                          placeholder="Write your note here..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                      )}

                      {/* AI Features Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          type="button"
                          onClick={checkWriting}
                          disabled={isCheckingWriting || !content.trim()}
                          className="btn btn-sm btn-outline btn-primary"
                        >
                          {isCheckingWriting ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <Wand2 className="size-4" />
                          )}
                          {isCheckingWriting
                            ? "Analyzing..."
                            : "Writing Assistant"}
                        </button>

                        <button
                          type="button"
                          onClick={generateSummary}
                          disabled={isGeneratingSummary || !content.trim()}
                          className="btn btn-sm btn-outline btn-secondary"
                        >
                          {isGeneratingSummary ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <Sparkles className="size-4" />
                          )}
                          {isGeneratingSummary
                            ? "Summarizing..."
                            : "Generate Summary"}
                        </button>
                      </div>
                    </div>

                    {/* AI Results Panel */}
                    {showAiPanel && (writingAssistance || aiSummary) && (
                      <div className="card bg-base-200 mb-4">
                        <div className="card-body p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="card-title text-lg">
                              <Sparkles className="size-5 text-primary" />
                              AI Assistant
                            </h3>
                            <button
                              onClick={() => setShowAiPanel(false)}
                              className="btn btn-ghost btn-xs"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Writing Assistant Results */}
                          {writingAssistance && (
                            <div className="mb-4">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle className="size-4 text-primary" />
                                Writing Suggestions
                              </h4>
                              <div className="bg-base-100 p-3 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">
                                  {writingAssistance}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    applySuggestion(writingAssistance)
                                  }
                                  className="btn btn-xs btn-primary mt-2"
                                >
                                  Apply Suggestions
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Summary Results */}
                          {aiSummary && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <FileCheck className="size-4 text-secondary" />
                                AI Summary
                              </h4>
                              <div className="bg-base-100 p-3 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">
                                  {aiSummary}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContent(
                                      content + "\n\n**Summary:**\n" + aiSummary
                                    );
                                    setShowAiPanel(false); // Close the AI panel
                                    toast.success(
                                      "Summary added to note! You can now edit and create the note when ready."
                                    );
                                  }}
                                  className="btn btn-xs btn-secondary mt-2"
                                >
                                  Add to Note
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="card-actions justify-end mt-6">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Note"}
                      </button>
                    </div>
                  </form>
                </>
              ) : mode === "pdf" ? (
                // PDF Upload Mode
                <>
                  <form onSubmit={handlePdfUpload}>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Select PDF File</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        className="file-input file-input-bordered w-full"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <div className="label">
                          <span className="label-text-alt text-success">
                            Selected: {selectedFile.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="label-text-alt text-base-content/60">
                      AI will generate structured notes automatically
                    </span>

                    <div className="card-actions justify-end">
                      <button
                        type="submit"
                        className={`btn min-w-[280px] ${
                          pdfLoading
                            ? "btn-primary"
                            : selectedFile
                            ? "btn-primary"
                            : "btn-primary opacity-60 cursor-not-allowed"
                        }`}
                        disabled={!selectedFile && !pdfLoading}
                        onClick={
                          !selectedFile && !pdfLoading
                            ? (e) => {
                                e.preventDefault();
                                toast.error("Please select a PDF file first");
                              }
                            : undefined
                        }
                      >
                        {pdfLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="loading loading-spinner loading-sm text-black"></div>
                            <span className=" text-black font-mono">
                              {typewriterText}
                              <span className="animate-pulse">|</span>
                            </span>
                          </div>
                        ) : (
                          "Generate Notes from PDF"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : mode === "ppt" ? (
                // PPT Upload Mode
                <>
                  <form onSubmit={handlePptUpload}>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">
                          Select PPT or PPTX File
                        </span>
                      </label>
                      <input
                        type="file"
                        accept=".ppt,.pptx"
                        className="file-input file-input-bordered w-full"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <div className="label">
                          <span className="label-text-alt text-success">
                            Selected: {selectedFile.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="label-text-alt text-base-content/60">
                      AI will generate structured notes automatically
                    </span>

                    <div className="card-actions justify-end">
                      <button
                        type="submit"
                        className={`btn min-w-[280px] ${
                          pptLoading
                            ? "btn-primary"
                            : selectedFile
                            ? "btn-primary"
                            : "btn-primary opacity-60 cursor-not-allowed"
                        }`}
                        disabled={!selectedFile && !pptLoading}
                        onClick={
                          !selectedFile && !pptLoading
                            ? (e) => {
                                e.preventDefault();
                                toast.error("Please select a PPT file first");
                              }
                            : undefined
                        }
                      >
                        {pptLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="loading loading-spinner loading-sm text-black"></div>
                            <span className=" text-black font-mono">
                              {typewriterText}
                              <span className="animate-pulse">|</span>
                            </span>
                          </div>
                        ) : (
                          "Generate Notes from PPT"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatePage;
