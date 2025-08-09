import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = ({ path, onNavigate, className = "" }) => {
  return (
    <nav
      className={`flex items-center gap-1 sm:gap-2 text-base-content/60 overflow-x-auto ${className}`}
    >
      {path.map((item, index) => (
        <div
          key={item._id || "home"}
          className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
        >
          {index > 0 && (
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
          )}
          <button
            onClick={() => onNavigate(item._id)}
            className={`hover:text-base-content transition-colors text-base sm:text-lg truncate max-w-[140px] sm:max-w-none ${
              index === path.length - 1
                ? "text-base-content font-bold"
                : "hover:underline"
            }`}
            disabled={index === path.length - 1}
            title={item.name} // Show full name on hover
          >
            {index === 0 ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
            ) : (
              <span className="truncate">{item.name}</span>
            )}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
