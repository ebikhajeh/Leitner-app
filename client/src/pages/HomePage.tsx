import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useSession, signOut } from "../lib/auth-client";

export default function HomePage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const name = session?.user?.name || session?.user?.email || "";

  const handleSignOut = async () => {
    await signOut({ fetchOptions: { onSuccess: () => navigate("/login") } });
  };

  return (
    <div className="px-5 pt-6 pb-28 max-w-lg mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Hello, {name}</h1>
          <p className="text-sm text-muted-foreground">Welcome back to your deck</p>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <p className="text-sm font-semibold">Get started</p>
        <p className="text-sm text-muted-foreground mt-1">
          Tap <span className="font-medium text-foreground">Add</span> below to save your first word.
        </p>
      </div>
    </div>
  );
}
