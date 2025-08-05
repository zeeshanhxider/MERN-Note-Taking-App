import { Clock, FileText, Calendar } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";

const NoteCard = ({ note, setNotes }) => {
  // Get word count for content preview
  const getWordCount = (text) => {
    return text
      ? text.split(/\s+/).filter((word) => word.length > 0).length
      : 0;
  };

  // Get maximum content preview
  const getContentPreview = (content) => {
    if (!content) return "No content available...";

    // Show more content - up to 300 characters or 6 lines
    const lines = content.split("\n");
    const preview = lines.slice(0, 6).join(" ");

    return preview.length > 300
      ? preview.substring(0, 300) + "..."
      : preview || "No content available...";
  };

  return (
    <div>
      <Link to={`/note/${note._id}`} className="block">
        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-200 border border-base-300 relative overflow-hidden">
          {/* Colored accent bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

          <div className="card-body p-5">
            {/* Header with title and type indicator */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="card-title text-lg font-bold text-base-content line-clamp-2 flex-1 pr-2">
                {note.title}
              </h3>
              <div className="flex items-center gap-1 text-primary/60 shrink-0">
                <FileText className="size-4" />
              </div>
            </div>

            {/* Content preview - maximized */}
            <p className="text-base-content/70 text-sm leading-relaxed line-clamp-6 mb-4">
              {getContentPreview(note.content)}
            </p>

            {/* Metadata section */}
            <div className="flex items-center justify-between text-xs text-base-content/60">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  <span>{formatDate(new Date(note.createdAt))}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>{getWordCount(note.content)} words</span>
                {note.updatedAt !== note.createdAt && (
                  <span className="badge badge-sm badge-ghost">Updated</span>
                )}
                {note.isPdfGenerated && (
                  <span className="badge badge-sm badge-primary badge-outline">
                    AI Generated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
export default NoteCard;
