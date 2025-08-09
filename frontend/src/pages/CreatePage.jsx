import { ArrowLeftIcon } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router";
import api from "../lib/axios";
import { useAIFeatures } from "../hooks/useAIFeatures";

// Import components
import ModeSelector from "../components/ModeSelector";
import ManualNoteForm from "../components/ManualNoteForm";
import PDFUploadForm from "../components/PDFUploadForm";
import PPTUploadForm from "../components/PPTUploadForm";
import ProcessingState from "../components/ProcessingState";

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

  // Use shared AI features hook
  const {
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
  } = useAIFeatures();

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

  // Apply AI suggestion to content
  const handleApplySuggestion = () => {
    if (writingAssistance) {
      setContent(writingAssistance);
      setWritingAssistance("");
      toast.success("Writing improvements applied!");
    }
  };

  // Add summary to content
  const handleAddSummary = () => {
    if (aiSummary) {
      const summarySection = `\n\n## Summary\n${aiSummary}`;
      setContent(content + summarySection);
      setAiSummary("");
      toast.success("Summary added to note!");
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

  const renderContent = () => {
    if (pdfLoading || pptLoading) {
      return (
        <ProcessingState
          typewriterText={typewriterText}
          pdfLoading={pdfLoading}
          pptLoading={pptLoading}
        />
      );
    }

    switch (mode) {
      case "pdf":
        return (
          <PDFUploadForm
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            handlePdfUpload={handlePdfUpload}
            pdfLoading={pdfLoading}
            typewriterText={typewriterText}
          />
        );
      case "ppt":
        return (
          <PPTUploadForm
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            handlePptUpload={handlePptUpload}
            pptLoading={pptLoading}
            typewriterText={typewriterText}
          />
        );
      default:
        return (
          <ManualNoteForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            showFormatHelp={showFormatHelp}
            setShowFormatHelp={setShowFormatHelp}
            handleSubmit={handleSubmit}
            loading={loading}
            isCheckingWriting={isCheckingWriting}
            checkWriting={() => checkWriting(content)}
            isGeneratingSummary={isGeneratingSummary}
            generateSummary={() => generateSummary(content)}
            writingAssistance={writingAssistance}
            aiSummary={aiSummary}
            showAiPanel={showAiPanel}
            setShowAiPanel={setShowAiPanel}
            applySuggestion={handleApplySuggestion}
            addSummary={handleAddSummary}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
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

              <ModeSelector mode={mode} setMode={setMode} />

              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
