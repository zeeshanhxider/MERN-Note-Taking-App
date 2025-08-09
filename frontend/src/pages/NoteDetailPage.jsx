import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  Trash2Icon,
  EditIcon,
  SaveIcon,
  XIcon,
  Sparkles,
  FileCheck,
  Wand2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
} from "lucide-react";
import api from "../lib/axios";
import { formatText, hasFormatting } from "../lib/textFormatter";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [originalNote, setOriginalNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // AI Features State
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [writingAssistance, setWritingAssistance] = useState("");
  const [isCheckingWriting, setIsCheckingWriting] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Text formatting preview
  const [showPreview, setShowPreview] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
        setOriginalNote(res.data);
      } catch (error) {
        console.log("Error in fetching note", error);
        toast.error("Failed to fetch the note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Please add a title or content");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/notes/${id}`, note);
      toast.success("Note updated successfully");
      setOriginalNote(note);
      setIsEditMode(false);
    } catch (error) {
      console.log("Error saving the note:", error);
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setNote(originalNote);
    setIsEditMode(false);
  };

  // AI Writing Assistant
  const checkWriting = async () => {
    if (!note.content.trim()) {
      toast.error("Please write some content first");
      return;
    }

    setIsCheckingWriting(true);
    try {
      const response = await api.post("/ai/writing-assistant", {
        content: note.content,
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
  const generateSummary = async () => {
    if (!note.content.trim()) {
      toast.error("Please write some content first");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await api.post("/ai/summarize", {
        content: note.content,
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
  const applySuggestion = () => {
    if (writingAssistance) {
      setNote({ ...note, content: writingAssistance });
      setWritingAssistance("");
      toast.success("Writing improvements applied!");
    }
  };

  // Add summary to content
  const addSummary = () => {
    if (aiSummary) {
      const summarySection = `\n\n## Summary\n${aiSummary}`;
      setNote({ ...note, content: note.content + summarySection });
      setAiSummary("");
      toast.success("Summary added to note!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <svg
          className="w-6 h-6 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-base-content mb-4">
            Note not found
          </h2>
          <Link to="/" className="btn btn-primary">
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Notes
            </Link>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              {!isEditMode ? (
                // Preview Mode
                <>
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-base-content mb-4">
                      {note.title}
                    </h1>
                    <div className="prose max-w-none">
                      <div
                        className="whitespace-pre-wrap text-base-content leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatText(note.content),
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 ">
                    <button
                      onClick={handleDelete}
                      className="btn btn-error btn-outline"
                    >
                      <Trash2Icon className="h-5 w-5" />
                      Delete Note
                    </button>

                    <button onClick={handleEdit} className="btn btn-primary">
                      <EditIcon className="h-5 w-5" />
                      Edit Note
                    </button>
                  </div>
                </>
              ) : (
                // Edit Mode
                <>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text text-base font-semibold">
                        Title
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Note title"
                      className="input input-bordered"
                      value={note.title}
                      onChange={(e) =>
                        setNote({ ...note, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text text-base font-semibold">
                        Content
                      </span>
                      {hasFormatting(note.content) && (
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

                    {showPreview && hasFormatting(note.content) ? (
                      <div
                        className="textarea textarea-bordered min-h-80 resize-y bg-base-100 prose prose-sm max-w-none p-4"
                        dangerouslySetInnerHTML={{
                          __html: formatText(note.content),
                        }}
                      />
                    ) : (
                      <textarea
                        className="textarea textarea-bordered min-h-80 resize-y"
                        placeholder="Write your note here... (Try: **bold**, # heading, ## subheading)"
                        value={note.content}
                        onChange={(e) =>
                          setNote({ ...note, content: e.target.value })
                        }
                      />
                    )}

                    {/* AI Features */}
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={checkWriting}
                        disabled={isCheckingWriting || !note.content.trim()}
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
                        disabled={isGeneratingSummary || !note.content.trim()}
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
                  {(writingAssistance || aiSummary) && (
                    <div className="card bg-base-200 mb-4">
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            AI Results
                          </h3>
                          <button
                            onClick={() => setShowAiPanel(!showAiPanel)}
                            className="btn btn-sm btn-ghost"
                          >
                            {showAiPanel ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {showAiPanel && (
                          <div className="space-y-4">
                            {/* Writing Assistance Result */}
                            {writingAssistance && (
                              <div className="border border-primary/20 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-sm flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    Writing Improvements
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={applySuggestion}
                                    className="btn btn-xs btn-primary"
                                  >
                                    Apply Suggestions
                                  </button>
                                </div>
                                <div className="bg-base-100 rounded p-2 text-sm">
                                  <div className="whitespace-pre-wrap">
                                    {writingAssistance}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Summary Result */}
                            {aiSummary && (
                              <div className="border border-secondary/20 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-sm flex items-center gap-1">
                                    <FileCheck className="h-4 w-4 text-secondary" />
                                    AI Summary
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={addSummary}
                                    className="btn btn-xs btn-secondary"
                                  >
                                    Add to Note
                                  </button>
                                </div>
                                <div className="bg-base-100 rounded p-2 text-sm">
                                  <div className="whitespace-pre-wrap">
                                    {aiSummary}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end items-center mt-6">
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="btn btn-outline btn-default"
                      >
                        <XIcon className="h-5 w-5" />
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={saving}
                        onClick={handleSave}
                      >
                        <SaveIcon className="h-5 w-5" />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteDetailPage;
