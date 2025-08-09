import { Info, Eye, Edit } from "lucide-react";
import { formatText, hasFormatting } from "../lib/textFormatter";
import FormattingHelp from "./FormattingHelp";
import AIFeatures from "./AIFeatures";

const ManualNoteForm = ({
  title,
  setTitle,
  content,
  setContent,
  showPreview,
  setShowPreview,
  showFormatHelp,
  setShowFormatHelp,
  handleSubmit,
  loading,
  // AI Features props
  isCheckingWriting,
  checkWriting,
  isGeneratingSummary,
  generateSummary,
  writingAssistance,
  aiSummary,
  showAiPanel,
  setShowAiPanel,
  applySuggestion,
  addSummary,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          placeholder="Enter note title"
          className="input input-bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-control mb-4">
        <label className="label">
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
          {hasFormatting(content) && (
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

        {showPreview && hasFormatting(content) ? (
          <div
            className="textarea textarea-bordered min-h-80 resize-y bg-base-100 prose prose-sm max-w-none p-4"
            dangerouslySetInnerHTML={{
              __html: formatText(content),
            }}
          />
        ) : (
          <textarea
            className="textarea textarea-bordered min-h-80 resize-y"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        )}

        <AIFeatures
          content={content}
          isCheckingWriting={isCheckingWriting}
          checkWriting={checkWriting}
          isGeneratingSummary={isGeneratingSummary}
          generateSummary={generateSummary}
          writingAssistance={writingAssistance}
          aiSummary={aiSummary}
          showAiPanel={showAiPanel}
          setShowAiPanel={setShowAiPanel}
          applySuggestion={applySuggestion}
          addSummary={addSummary}
        />
      </div>

      <div className="card-actions justify-end mt-6">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Note"}
        </button>
      </div>
    </form>
  );
};

export default ManualNoteForm;
