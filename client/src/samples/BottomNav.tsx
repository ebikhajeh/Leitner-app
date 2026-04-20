import { Home, BookOpen, PenLine, BarChart3, Plus } from "lucide-react";

type Screen = "dashboard" | "review" | "practice" | "addword" | "stats";

interface BottomNavProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const items: { key: Screen; icon: typeof Home; label: string }[] = [
  { key: "dashboard", icon: Home, label: "Home" },
  { key: "review", icon: BookOpen, label: "Review" },
  { key: "practice", icon: PenLine, label: "Practice" },
  { key: "addword", icon: Plus, label: "Add" },
  { key: "stats", icon: BarChart3, label: "Stats" },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
    <div className="max-w-lg mx-auto flex items-center justify-around py-2">
      {items.map(({ key, icon: Icon, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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

export default BottomNav;
