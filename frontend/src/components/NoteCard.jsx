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

  // Get consistent content preview - always same length
  const getContentPreview = (content) => {
    if (!content) {
      // Pad with placeholder text to maintain consistent height
      return "No content available...".padEnd(120, " ");
    }

    // Always show exactly 120 characters for consistency
    const cleanContent = content
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (cleanContent.length >= 120) {
      return cleanContent.substring(0, 117) + "...";
    } else {
      // Pad shorter content with spaces to maintain consistent height
      return cleanContent.padEnd(120, " ");
    }
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
            </div>

            {/* Content preview - consistent height */}
            <p className="text-base-content/70 text-sm leading-relaxed line-clamp-3 mb-4 h-16">
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
