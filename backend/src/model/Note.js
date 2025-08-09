import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null means it's in the root directory
    },
    date: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ["manual", "pdf_upload", "ppt_upload"],
      default: "manual",
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;
