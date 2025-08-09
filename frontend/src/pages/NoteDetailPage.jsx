import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "lucide-react";
import api from "../lib/axios";
import { useAIFeatures } from "../hooks/useAIFeatures";
import LoadingSpinner from "../components/LoadingSpinner";
import NoteViewMode from "../components/NoteViewMode";
import NoteEditMode from "../components/NoteEditMode";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [originalNote, setOriginalNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

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

  // Apply AI suggestion to content
  const handleApplySuggestion = () => {
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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Notes
            </Link>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              {!isEditMode ? (
                <NoteViewMode
                  note={note}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ) : (
                <NoteEditMode
                  note={note}
                  setNote={setNote}
                  isEditMode={isEditMode}
                  saving={saving}
                  handleSave={handleSave}
                  handleCancel={handleCancel}
                  handleDelete={handleDelete}
                  isCheckingWriting={isCheckingWriting}
                  checkWriting={checkWriting}
                  isGeneratingSummary={isGeneratingSummary}
                  generateSummary={generateSummary}
                  writingAssistance={writingAssistance}
                  aiSummary={aiSummary}
                  showAiPanel={showAiPanel}
                  setShowAiPanel={setShowAiPanel}
                  handleApplySuggestion={handleApplySuggestion}
                  addSummary={addSummary}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteDetailPage;
