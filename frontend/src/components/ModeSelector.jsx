import { FileText, File, Presentation } from "lucide-react";

const ModeSelector = ({ mode, setMode }) => {
  return (
    <div className="tabs tabs-boxed mb-6">
      <button
        className={`tab ${!mode || mode === "manual" ? "tab-active" : ""}`}
        onClick={() => setMode("manual")}
      >
        <FileText className="size-4 mr-2" />
        Mannual
      </button>
      <button
        className={`tab ${mode === "pdf" ? "tab-active" : ""}`}
        onClick={() => setMode("pdf")}
      >
        <File className="size-4 mr-2" />
        PDF
      </button>
      <button
        className={`tab ${mode === "ppt" ? "tab-active" : ""}`}
        onClick={() => setMode("ppt")}
      >
        <Presentation className="size-4 mr-2" />
        PPT
      </button>
    </div>
  );
};

export default ModeSelector;
