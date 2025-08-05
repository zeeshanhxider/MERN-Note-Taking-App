import { Link, useNavigate } from "react-router";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Get user initials from localStorage or default to 'U'
  const getUserInitials = () => {
    const userName = localStorage.getItem("userName");

    if (userName) {
      // Handle usernames with underscores (converted from spaces)
      const names = userName.split("_");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      // For single words or usernames, take only the first character
      return userName[0].toUpperCase();
    }
    return "U";
  };

  const userInitials = getUserInitials();

  return (
    <header className="bg-base-100/80 backdrop-blur-sm border-b border-base-content/5 sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold text-primary font-mono tracking-tight hover:text-primary-focus transition-colors"
          >
            Scribbly AI
          </Link>

          {localStorage.getItem("token") && (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm leading-none">
                    {userInitials}
                  </span>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
              >
                <div className="px-3 py-2 border-b border-base-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-center">
                      <span className="text-primary font-bold text-sm leading-none">
                        {userInitials}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-base-content">
                        {localStorage.getItem("userName")?.replace(/_/g, " ") ||
                          "User"}
                      </div>
                      <div className="text-xs text-base-content/60">
                        @{localStorage.getItem("userName") || "username"}
                      </div>
                    </div>
                  </div>
                </div>
                <li>
                  <button onClick={handleLogout} className="text-error">
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
