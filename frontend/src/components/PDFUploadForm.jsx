import toast from "react-hot-toast";

const PDFUploadForm = ({
  selectedFile,
  handleFileChange,
  handlePdfUpload,
  pdfLoading,
  typewriterText,
}) => {
  return (
    <form onSubmit={handlePdfUpload}>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Select PDF File</span>
        </label>
        <input
          type="file"
          accept=".pdf"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
        {selectedFile && (
          <div className="label">
            <span className="label-text-alt text-success">
              Selected: {selectedFile.name}
            </span>
          </div>
        )}
      </div>

      <span className="label-text-alt text-base-content/60">
        AI will generate structured notes automatically
      </span>

      <div className="card-actions justify-end mt-5">
        <button
          type="submit"
          className={`btn min-w-[280px] ${
            pdfLoading
              ? "btn-primary"
              : selectedFile
              ? "btn-primary"
              : "btn-primary opacity-60 cursor-not-allowed"
          }`}
          disabled={!selectedFile && !pdfLoading}
          onClick={
            !selectedFile && !pdfLoading
              ? (e) => {
                  e.preventDefault();
                  toast.error("Please select a PDF file first");
                }
              : undefined
          }
        >
          {pdfLoading ? (
            <div className="flex items-center justify-center">
              <span className="text-black font-mono">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </span>
            </div>
          ) : (
            "Generate Notes from PDF"
          )}
        </button>
      </div>
    </form>
  );
};

export default PDFUploadForm;
