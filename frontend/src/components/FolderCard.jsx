import { FolderIcon, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const FolderCard = ({
  folder,
  onFolderClick,
  onFolderUpdate,
  onFolderDelete,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleEdit = async () => {
    if (!editName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    try {
      const response = await api.put(`/folders/${folder._id}`, {
        name: editName.trim(),
      });
      onFolderUpdate(response.data);
      setIsEditing(false);
      toast.success("Folder renamed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to rename folder");
      setEditName(folder.name); // Reset to original name
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete the folder "${folder.name}"?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/folders/${folder._id}`);
      onFolderDelete(folder._id);
      toast.success("Folder deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete folder");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(folder.name);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-200 border border-base-200">
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => !isEditing && onFolderClick(folder)}
          >
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${folder.color}20`,
                color: folder.color,
              }}
            >
              <FolderIcon className="h-6 w-6" />
            </div>

            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleEdit}
                  onKeyDown={handleKeyPress}
                  className="input input-bordered input-sm w-full"
                  autoFocus
                />
              ) : (
                <h3 className="font-semibold text-base-content truncate">
                  {folder.name}
                </h3>
              )}
              <p className="text-sm text-base-content/60 mt-1">
                Created {new Date(folder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </div>
            {showDropdown && (
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40"
                onBlur={() => setShowDropdown(false)}
              >
                <li>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setShowDropdown(false);
                    }}
                    className="text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Rename
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                      setShowDropdown(false);
                    }}
                    className="text-sm text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderCard;
