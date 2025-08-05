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
} from "lucide-react";
import api from "../lib/axios";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [originalNote, setOriginalNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
                      <div className="whitespace-pre-wrap text-base-content leading-relaxed">
                        {note.content}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 ">
                    <button
                      onClick={handleDelete}
                      className="btn btn-error btn-outline"
                    >
                      <Trash2Icon className="h-5 w-5" />
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
                      <span className="label-text">Title</span>
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
                      <span className="label-text">Content</span>
                    </label>
                    <textarea
                      placeholder="Write your note here..."
                      className="textarea textarea-bordered min-h-80 resize-y"
                      value={note.content}
                      onChange={(e) =>
                        setNote({ ...note, content: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end items-center mt-4">
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
