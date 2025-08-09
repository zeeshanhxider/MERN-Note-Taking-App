import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null, // null means it's a root folder
    },
    color: {
      type: String,
      default: "#10B981", // Default green color
    },
  },
  { timestamps: true }
);

// Index for better query performance
folderSchema.index({ user: 1, parentFolder: 1 });

const Folder = mongoose.model("Folder", folderSchema);
export default Folder;
