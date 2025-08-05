import express from "express";
import {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderPath,
} from "../controllers/folderController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get folders (optionally filtered by parent folder)
router.get("/", getFolders);

// Create a new folder
router.post("/", createFolder);

// Get folder breadcrumb path
router.get("/:id/path", getFolderPath);

// Update a folder
router.put("/:id", updateFolder);

// Delete a folder
router.delete("/:id", deleteFolder);

export default router;
