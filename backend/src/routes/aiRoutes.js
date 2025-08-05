import express from "express";
import {
  writingAssistant,
  summarizeNote,
  generateTags,
} from "../controllers/aiController.js";
import { auth } from "../middleware/auth.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

// All AI routes require authentication and rate limiting
router.use(auth);
router.use(rateLimiter);

// Writing Assistant - Improve grammar, style, and clarity
router.post("/writing-assistant", writingAssistant);

// Note Summarizer - Generate concise summary
router.post("/summarize", summarizeNote);

// Tag Generator - Auto-generate relevant tags
router.post("/generate-tags", generateTags);

export default router;
