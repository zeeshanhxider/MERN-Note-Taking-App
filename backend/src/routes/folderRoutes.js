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

router.use(auth);
router.get("/", getFolders);
router.post("/", createFolder);
router.get("/:id/path", getFolderPath);
router.put("/:id", updateFolder);
router.delete("/:id", deleteFolder);

export default router;
