import { Link, useNavigate } from "react-router";
import { PlusIcon, LogOut } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">
            Scribbly
          </h1>
          <div className="flex items-center gap-4">
            <Link to={"/create"} className="btn btn-primary">
              <PlusIcon className="size-5" />
              <span>New Note</span>
            </Link>
            {localStorage.getItem("token") && (
              <button
                onClick={handleLogout}
                className="btn btn-circle btn-outline btn-default"
                title="Logout"
              >
                <LogOut className="size-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;