import { useState } from "react";
import { Eye, Edit, Info } from "lucide-react";
import { formatText, hasFormatting } from "../lib/textFormatter";
import FormattingHelp from "./FormattingHelp";

const NoteEditor = ({ note, setNote, isEditMode }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showFormatHelp, setShowFormatHelp] = useState(false);

  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text text-base font-semibold">Title</span>
      </label>
      <input
        type="text"
        className="input input-bordered"
        value={note.title}
        onChange={(e) => setNote({ ...note, title: e.target.value })}
        disabled={!isEditMode}
      />

      <label className="label mt-4">
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

      <FormattingHelp showFormatHelp={showFormatHelp} />

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
          placeholder="Write your note here..."
          value={note.content}
          onChange={(e) => setNote({ ...note, content: e.target.value })}
          disabled={!isEditMode}
        />
      )}
    </div>
  );
};

export default NoteEditor;
