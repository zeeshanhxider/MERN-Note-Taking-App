import express from 'express';
import { createNote, updateNote, getAllNotes, deleteNote, fetchNote } from '../controllers/controller.js';
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get('/', auth, getAllNotes);
router.post('/', auth, createNote);
router.get('/:id', auth, fetchNote);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);

export default router;