import { useState } from "react";
import { hasFormatting } from "../lib/textFormatter";
import NoteEditor from "./NoteEditor";
import AIFeatures from "./AIFeatures";
import NoteActions from "./NoteActions";

const NoteEditMode = ({
  note,
  setNote,
  isEditMode,
  saving,
  handleSave,
  handleCancel,
  handleDelete,
  // AI Features props
  isCheckingWriting,
  checkWriting,
  isGeneratingSummary,
  generateSummary,
  writingAssistance,
  aiSummary,
  showAiPanel,
  setShowAiPanel,
  handleApplySuggestion,
  addSummary,
}) => {
  return (
    <>
      <NoteEditor note={note} setNote={setNote} isEditMode={isEditMode} />

      <AIFeatures
        content={note.content}
        isCheckingWriting={isCheckingWriting}
        checkWriting={() => checkWriting(note.content)}
        isGeneratingSummary={isGeneratingSummary}
        generateSummary={() => generateSummary(note.content)}
        writingAssistance={writingAssistance}
        aiSummary={aiSummary}
        showAiPanel={showAiPanel}
        setShowAiPanel={setShowAiPanel}
        applySuggestion={handleApplySuggestion}
        addSummary={addSummary}
      />

      <NoteActions
        isEditMode={isEditMode}
        setIsEditMode={() => {}} // Not needed in edit mode
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleDelete={handleDelete}
        saving={saving}
      />
    </>
  );
};

export default NoteEditMode;
