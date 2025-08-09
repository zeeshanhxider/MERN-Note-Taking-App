import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import RateLimitedUI from "../components/RateLimitedUI";
import NoteCard from "../components/NoteCard";
import FolderCard from "../components/FolderCard";
import Breadcrumb from "../components/Breadcrumb";
import CreateFolderModal from "../components/CreateFolderModal";
import toast from "react-hot-toast";
import api from "../lib/axios";
import NotesNotFound from "../components/NotesNotFound";
import { Plus, FolderPlus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFolder = searchParams.get("folder") || null;

  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState([
    { _id: null, name: "Home" },
  ]);
  const [loading, setLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (isRateLimited) return;

      try {
        setLoading(true);

        // Fetch notes and folders for current directory
        const [notesResponse, foldersResponse] = await Promise.all([
          api.get(`/notes?folder=${currentFolder || ""}`),
          api.get(`/folders?parentFolder=${currentFolder || ""}`),
        ]);

        setNotes(notesResponse.data);
        setFolders(foldersResponse.data);
        setIsRateLimited(false);

        // Fetch breadcrumb path if we're in a folder
        if (currentFolder) {
          try {
            const pathResponse = await api.get(
              `/folders/${currentFolder}/path`
            );
            setBreadcrumbPath(pathResponse.data);
          } catch (error) {
            console.log("Error fetching folder path:", error);
            setBreadcrumbPath([{ _id: null, name: "Home" }]);
          }
        } else {
          setBreadcrumbPath([{ _id: null, name: "Home" }]);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        if (error.response && error.response.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to fetch data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentFolder, isRateLimited]);

  const handleNavigateToFolder = (folderId) => {
    if (folderId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ folder: folderId });
    }
  };

  const handleFolderClick = (folder) => {
    setSearchParams({ folder: folder._id });
  };

  const handleFolderCreated = (newFolder) => {
    setFolders((prev) => [newFolder, ...prev]);
  };

  const handleFolderUpdate = (updatedFolder) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder._id === updatedFolder._id ? updatedFolder : folder
      )
    );
  };

  const handleFolderDelete = (folderId) => {
    setFolders((prev) => prev.filter((folder) => folder._id !== folderId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        {isRateLimited && <RateLimitedUI />}
        <div className="max-w-7xl mx-auto p-4 mt-2">
          {/* Header Section with Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="mb-2">
                <Breadcrumb
                  path={breadcrumbPath}
                  onNavigate={handleNavigateToFolder}
                  className="text-lg sm:text-2xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex items-center justify-center min-h-[50vh]">
            <svg
              className="w-8 h-8 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="mb-2">
              <Breadcrumb
                path={breadcrumbPath}
                onNavigate={handleNavigateToFolder}
                className="text-lg sm:text-2xl font-bold"
              />
            </div>
            <p className="text-base-content/60 text-sm">
              {folders.length > 0 || notes.length > 0 || currentFolder
                ? `${folders.length} folders, ${notes.length} notes`
                : "Start organizing your thoughts"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="btn btn-outline btn-primary gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </button>
            <Link
              to={currentFolder ? `/create?folder=${currentFolder}` : "/create"}
              className="btn btn-primary gap-2"
            >
              <Plus className="h-4 w-4" />
              New Note
            </Link>
          </div>
        </div>

        {folders.length === 0 && notes.length === 0 && !isRateLimited && (
          <NotesNotFound
            currentFolder={currentFolder}
            folderName={
              breadcrumbPath.length > 1
                ? breadcrumbPath[breadcrumbPath.length - 1].name
                : null
            }
          />
        )}

        {(folders.length > 0 || notes.length > 0) && !isRateLimited && (
          <div className="space-y-6">
            {/* Folders Section */}
            {folders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-base-content mb-3">
                  Folders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      onFolderClick={handleFolderClick}
                      onFolderUpdate={handleFolderUpdate}
                      onFolderDelete={handleFolderDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {notes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-base-content mb-3">
                  Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notes.map((note) => (
                    <NoteCard key={note._id} note={note} setNotes={setNotes} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Folder Modal */}
        <CreateFolderModal
          isOpen={showCreateFolderModal}
          onClose={() => setShowCreateFolderModal(false)}
          parentFolder={currentFolder}
          onFolderCreated={handleFolderCreated}
        />
      </div>
    </div>
  );
};

export default HomePage;
