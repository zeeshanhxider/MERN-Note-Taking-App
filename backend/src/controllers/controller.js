import Note from "../model/Note.js";

export async function getAllNotes(req, res) {
  try {
    const { folder } = req.query;

    const query = { user: req.user.userId };

    // Filter by folder if specified
    if (folder === "null" || folder === "" || !folder) {
      query.folder = null; // Root folder
    } else {
      query.folder = folder;
    }

    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .populate("folder", "name color");

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function fetchNote(req, res) {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!note) return res.status(404).json({ message: "Note not found!" });
    res.json(note);
  } catch (error) {
    console.error("Error in getNoteById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createNote(req, res) {
  try {
    const { title, content, folder } = req.body;
    console.log("Backend createNote - received folder:", folder); // Debug log

    const note = new Note({
      title,
      content,
      user: req.user.userId,
      folder: folder || null,
    });

    const savedNote = await note.save();
    await savedNote.populate("folder", "name color");
    console.log(
      "Backend createNote - saved note with folder:",
      savedNote.folder
    ); // Debug log
    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateNote(req, res) {
  try {
    const { title, content } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      {
        new: true,
      }
    );

    if (!updatedNote)
      return res.status(404).json({ message: "Note not found" });

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteNote(req, res) {
  try {
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!deletedNote)
      return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
