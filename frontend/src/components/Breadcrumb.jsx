import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = ({ path, onNavigate, className = "" }) => {
  return (
    <nav
      className={`flex items-center gap-2 text-base-content/60 ${className}`}
    >
      {path.map((item, index) => (
        <div key={item._id || "home"} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-5 w-5" />}
          <button
            onClick={() => onNavigate(item._id)}
            className={`hover:text-base-content transition-colors ${
              index === path.length - 1
                ? "text-base-content font-bold"
                : "hover:underline"
            }`}
            disabled={index === path.length - 1}
          >
            {index === 0 ? (
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            ) : (
              item.name
            )}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
