const ProcessingState = ({ typewriterText, pdfLoading, pptLoading }) => {
  if (!pdfLoading && !pptLoading) return null;

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-4">
        <span className="loading loading-spinner loading-sm text-primary"></span>
        <p className="text-lg text-primary font-mono font-bold">
          {typewriterText}
        </p>
      </div>
    </div>
  );
};

export default ProcessingState;
