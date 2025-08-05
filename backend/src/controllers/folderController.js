import Folder from "../model/Folder.js";
import Note from "../model/Note.js";

// Get all folders for a user (optionally filtered by parent folder)
export const getFolders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { parentFolder } = req.query;

    const query = { user: userId };
    if (parentFolder === "null" || parentFolder === "" || !parentFolder) {
      query.parentFolder = null;
    } else {
      query.parentFolder = parentFolder;
    }

    const folders = await Folder.find(query)
      .sort({ createdAt: -1 })
      .populate("parentFolder", "name");

    res.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Failed to fetch folders" });
  }
};

// Create a new folder
export const createFolder = async (req, res) => {
  try {
    const { name, parentFolder, color } = req.body;
    const userId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    // Check if folder with same name exists in the same parent directory
    const existingFolder = await Folder.findOne({
      user: userId,
      name: name.trim(),
      parentFolder: parentFolder || null,
    });

    if (existingFolder) {
      return res.status(400).json({
        message: "A folder with this name already exists in this location",
      });
    }

    // If parentFolder is provided, verify it exists and belongs to user
    if (parentFolder) {
      const parent = await Folder.findOne({
        _id: parentFolder,
        user: userId,
      });

      if (!parent) {
        return res.status(400).json({ message: "Parent folder not found" });
      }
    }

    const folder = new Folder({
      name: name.trim(),
      user: userId,
      parentFolder: parentFolder || null,
      color: color || "#3B82F6",
    });

    const savedFolder = await folder.save();
    await savedFolder.populate("parentFolder", "name");

    res.status(201).json(savedFolder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

// Update a folder
export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.userId;

    const folder = await Folder.findOne({ _id: id, user: userId });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (name && name.trim()) {
      // Check if folder with same name exists in the same parent directory
      const existingFolder = await Folder.findOne({
        user: userId,
        name: name.trim(),
        parentFolder: folder.parentFolder,
        _id: { $ne: id }, // Exclude current folder
      });

      if (existingFolder) {
        return res.status(400).json({
          message: "A folder with this name already exists in this location",
        });
      }

      folder.name = name.trim();
    }

    if (color) {
      folder.color = color;
    }

    const updatedFolder = await folder.save();
    await updatedFolder.populate("parentFolder", "name");

    res.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ message: "Failed to update folder" });
  }
};

// Delete a folder
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const folder = await Folder.findOne({ _id: id, user: userId });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if folder has subfolders
    const subfolders = await Folder.countDocuments({
      parentFolder: id,
      user: userId,
    });

    // Check if folder has notes
    const notes = await Note.countDocuments({
      folder: id,
      user: userId,
    });

    if (subfolders > 0 || notes > 0) {
      return res.status(400).json({
        message:
          "Cannot delete folder that contains subfolders or notes. Please move or delete the contents first.",
      });
    }

    await Folder.findByIdAndDelete(id);

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};

// Get folder breadcrumb path
export const getFolderPath = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || id === "null") {
      return res.json([{ _id: null, name: "Home" }]);
    }

    const folder = await Folder.findOne({ _id: id, user: userId });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const path = [{ _id: null, name: "Home" }];
    let currentFolder = folder;

    const folderPath = [];
    while (currentFolder) {
      folderPath.unshift(currentFolder);
      if (currentFolder.parentFolder) {
        currentFolder = await Folder.findById(currentFolder.parentFolder);
      } else {
        currentFolder = null;
      }
    }

    path.push(...folderPath.map((f) => ({ _id: f._id, name: f.name })));

    res.json(path);
  } catch (error) {
    console.error("Error getting folder path:", error);
    res.status(500).json({ message: "Failed to get folder path" });
  }
};
