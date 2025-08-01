import express from 'express';
import { createNote, updateNote, getAllNotes, deleteNote, fetchNote } from '../controllers/controller.js';

const router = express.Router();

router.get('/', getAllNotes);
router.post('/', createNote);
router.get('/:id', fetchNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;