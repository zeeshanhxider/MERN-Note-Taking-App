import { Wand2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const AIFeatures = ({
  content,
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
    <>
      {/* AI Features Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={checkWriting}
          disabled={isCheckingWriting || !content.trim()}
          className="btn btn-sm btn-outline btn-primary"
        >
          {isCheckingWriting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Wand2 className="size-4" />
          )}
          {isCheckingWriting ? "Analyzing..." : "Writing Assistant"}
        </button>

        <button
          type="button"
          onClick={generateSummary}
          disabled={isGeneratingSummary || !content.trim()}
          className="btn btn-sm btn-outline btn-secondary"
        >
          {isGeneratingSummary ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Sparkles className="size-4" />
          )}
          {isGeneratingSummary ? "Summarizing..." : "Generate Summary"}
        </button>
      </div>

      {/* AI Results Panel */}
      {(writingAssistance || aiSummary) && (
        <div className="card bg-base-200 mt-4">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Assistant Results
              </h3>
              <button
                type="button"
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="btn btn-xs btn-ghost"
              >
                {showAiPanel ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {showAiPanel && (
              <div className="space-y-3">
                {writingAssistance && (
                  <div className="bg-base-100 p-3 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">
                      Writing Suggestions:
                    </h4>
                    <p className="text-sm text-base-content/80 mb-3">
                      {writingAssistance}
                    </p>
                    {applySuggestion && (
                      <div className="flex justify-end">
                        <button
                          onClick={applySuggestion}
                          className="btn btn-xs btn-primary"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {aiSummary && (
                  <div className="bg-base-100 p-3 rounded-lg">
                    <h4 className="font-medium text-secondary mb-2">
                      Generated Summary:
                    </h4>
                    <p className="text-sm text-base-content/80 mb-3">
                      {aiSummary}
                    </p>
                    {addSummary && (
                      <div className="flex justify-end">
                        <button
                          onClick={addSummary}
                          className="btn btn-xs btn-secondary"
                        >
                          Add to Note
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AIFeatures;
