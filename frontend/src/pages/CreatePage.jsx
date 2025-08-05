import { ArrowLeftIcon, Upload, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router";
import api from "../lib/axios";

const CreatePage = () => {
  const [searchParams] = useSearchParams();
  const currentFolder = searchParams.get("folder") || null;

  console.log("CreatePage - currentFolder:", currentFolder); // Debug log

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("manual");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const processingMessages = [
    "Extracting text from PDF...",
    "AI is reading through your content...",
    "Generating intelligent notes...",
    "Organizing insights...",
    "Almost done! Finalizing notes...",
  ];

  const navigate = useNavigate();

  // Typewriter effect for PDF processing
  useEffect(() => {
    let interval;
    let charIndex = 0;

    if (pdfLoading) {
      const currentMessage = processingMessages[currentMessageIndex];

      interval = setInterval(() => {
        if (charIndex <= currentMessage.length) {
          setTypewriterText(currentMessage.slice(0, charIndex));
          charIndex++;
        } else {
          // Move to next message after a pause
          setTimeout(() => {
            setCurrentMessageIndex((prev) =>
              prev === processingMessages.length - 1 ? 0 : prev + 1
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
  }, [pdfLoading, currentMessageIndex]);

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
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Please select a valid PDF file");
      e.target.value = "";
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

              {!mode || mode === "manual" ? (
                // Default Manual Form
                <>
                  <form onSubmit={handleSubmit}>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Title</span>
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
                        <span className="label-text">Content</span>
                      </label>
                      <textarea
                        placeholder="Write your note here..."
                        className="textarea textarea-bordered h-32"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <div className="card-actions justify-between items-center">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setMode("pdf")}
                      >
                        <Upload className="size-4 mr-2" />
                        Or upload PDF instead
                      </button>

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
              ) : (
                // PDF Upload Mode
                <>
                  <form onSubmit={handlePdfUpload}>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Select PDF File</span>
                        <span className="label-text-alt text-base-content/60">
                          AI will generate structured notes automatically
                        </span>
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

                    <div className="card-actions justify-between items-center">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setMode("manual")}
                      >
                        <FileText className="size-4 mr-2" />
                        Write manually instead
                      </button>

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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatePage;
