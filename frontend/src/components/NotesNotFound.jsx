import { NotebookIcon, FolderIcon } from "lucide-react";
import { Link } from "react-router";

const NotesNotFound = ({ currentFolder = null, folderName = null }) => {
  const isInFolder = currentFolder !== null;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 max-w-sm mx-auto text-center">
      <div className="bg-primary/10 rounded-full p-6">
        {isInFolder ? (
          <FolderIcon className="size-8 text-primary" />
        ) : (
          <NotebookIcon className="size-8 text-primary" />
        )}
      </div>
      <h3 className="text-xl font-bold">
        {isInFolder ? `No notes in "${folderName}"` : "No notes yet"}
      </h3>
      <p className="text-sm text-base-content/70">
        {isInFolder
          ? "This folder is empty. Start adding notes or create subfolders to organize your content."
          : "Ready to organize your thoughts? Create your first note to get started on your journey."}
      </p>
      <Link
        to={isInFolder ? `/create?folder=${currentFolder}` : "/create"}
        className="btn btn-primary"
      >
        {isInFolder ? "Add Note to This Folder" : "Create Your First Note"}
      </Link>
    </div>
  );
};
export default NotesNotFound;
