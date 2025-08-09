const ProcessingState = ({ typewriterText, pdfLoading, pptLoading }) => {
  if (!pdfLoading && !pptLoading) return null;

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center justify-center">
        <p className="text-lg text-primary font-mono font-bold">
          {typewriterText}
          <span className="animate-pulse">|</span>
        </p>
      </div>
    </div>
  );
};

export default ProcessingState;
