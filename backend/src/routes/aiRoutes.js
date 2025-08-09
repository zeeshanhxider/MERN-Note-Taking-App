import express from "express";
import {
  writingAssistant,
  summarizeNote,
} from "../controllers/aiController.js";
import { auth } from "../middleware/auth.js";
import rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(auth);
router.use(rateLimiter);
router.post("/writing-assistant", writingAssistant);
router.post("/summarize", summarizeNote);

export default router;
