import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, PenLine, Plus, Settings } from "lucide-react";

const items = [
  { key: "dashboard", path: "/",          icon: Home,      label: "Home" },
  { key: "review",    path: "/review",     icon: BookOpen,  label: "Review" },
  { key: "practice",  path: "/",          icon: PenLine,   label: "Practice" },
  { key: "addword",   path: "/words/new", icon: Plus,      label: "Add" },
  { key: "settings",  path: "/settings",  icon: Settings,  label: "Settings" },
];

function getActiveKey(pathname: string): string {
  if (pathname === "/words/new") return "addword";
  if (pathname === "/review") return "review";
  if (pathname === "/settings") return "settings";
  if (pathname === "/") return "dashboard";
  return "";
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = getActiveKey(location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {items.map(({ key, path, icon: Icon, label }) => {
          const isActive = activeKey === key;
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                isActive ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
