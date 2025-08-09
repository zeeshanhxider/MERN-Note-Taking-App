const FormattingHelp = ({ showFormatHelp }) => {
  return (
    <>
      {/* Formatting Help Section */}
      {showFormatHelp && (
        <div className="bg-[#1A3628] rounded-xl p-4 mb-3 text-sm">
          <h4 className="font-bold text-base mb-3 text-base-content">
            Formatting Guide
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <span className="font-semibold text-primary">
                Text Formatting:
              </span>
              <div className="text-xs opacity-75 mt-1 space-y-1">
                <div>**bold text**</div>
                <div>*italic text*</div>
                <div>__underlined text__</div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-primary">Headings:</span>
              <div className="text-xs opacity-75 mt-1 space-y-1">
                <div># Large Heading</div>
                <div>## Medium Heading</div>
                <div>### Small Heading</div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-primary">Code:</span>
              <div className="text-xs opacity-75 mt-1 space-y-1">
                <div>`inline code`</div>
                <div>```code block```</div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-primary">Lists:</span>
              <div className="text-xs opacity-75 mt-1 space-y-1">
                <div>- List item</div>
                <div>* Also list item</div>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
            </div>
          </div>
          <div className="text-xs mt-5 font-semibold">
                Use the Preview button to see formatted text
              </div>
        </div>
      )}
    </>
  );
};

export default FormattingHelp;
