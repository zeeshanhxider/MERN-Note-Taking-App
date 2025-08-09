import express from "express";
import {
  createNote,
  updateNote,
  getAllNotes,
  deleteNote,
  fetchNote,
} from "../controllers/controller.js";
import { processPdfAndCreateNote } from "../controllers/pdfController.js";
import { processPptAndCreateNote } from "../controllers/pptController.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", auth, getAllNotes);
router.post("/", auth, createNote);
router.post("/pdf-upload", auth, upload.single("pdf"), processPdfAndCreateNote);
router.post("/ppt-upload", auth, upload.single("ppt"), processPptAndCreateNote);
router.get("/:id", auth, fetchNote);
router.put("/:id", auth, updateNote);
router.delete("/:id", auth, deleteNote);

export default router;
