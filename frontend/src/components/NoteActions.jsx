import { SaveIcon, XIcon, EditIcon, Trash2Icon } from "lucide-react";

const NoteActions = ({
  isEditMode,
  setIsEditMode,
  handleSave,
  handleCancel,
  handleDelete,
  saving,
}) => {
  return (
    <div className="flex justify-end items-center mt-6">
      <div className="flex gap-3">
        {isEditMode ? (
          <>
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
          </>
        ) : (
          <>
            <button
              onClick={handleDelete}
              className="btn btn-outline btn-error"
            >
              <Trash2Icon className="h-5 w-5" />
              Delete
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className="btn btn-primary"
            >
              <EditIcon className="h-5 w-5" />
              Edit Note
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NoteActions;
