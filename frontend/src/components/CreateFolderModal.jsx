import { useState } from "react";
import { FolderPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const CreateFolderModal = ({
  isOpen,
  onClose,
  parentFolder,
  onFolderCreated,
}) => {
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#1EB854");
  const [loading, setLoading] = useState(false);

  const colors = [
    "#1EB854", // Green
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/folders", {
        name: folderName.trim(),
        parentFolder: parentFolder || null,
        color: selectedColor,
      });

      onFolderCreated(response.data);
      toast.success("Folder created successfully!");
      onClose();
      setFolderName("");
      setSelectedColor("#10B981");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFolderName("");
    setSelectedColor("#3B82F6");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Create New Folder</h3>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Folder Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter folder name"
              className="input input-bordered w-full"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Folder Color</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-base-content scale-110"
                      : "border-base-300 hover:border-base-content"
                  } transition-all`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !folderName.trim()}
            >
              {loading ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
