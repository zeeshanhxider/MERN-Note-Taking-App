import { Trash2Icon, EditIcon } from "lucide-react";
import { formatText } from "../lib/textFormatter";

const NoteViewMode = ({ note, handleEdit, handleDelete }) => {
  return (
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
        <button onClick={handleDelete} className="btn btn-error btn-outline">
          <Trash2Icon className="h-5 w-5" />
          Delete Note
        </button>

        <button onClick={handleEdit} className="btn btn-primary">
          <EditIcon className="h-5 w-5" />
          Edit Note
        </button>
      </div>
    </>
  );
};

export default NoteViewMode;
