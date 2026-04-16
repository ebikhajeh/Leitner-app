import { useNavigate } from "react-router-dom";
import { useSession, signOut } from "../lib/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => navigate("/login"),
      },
    });
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      <span className="font-bold text-lg">Leitner App</span>
      {session?.user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {session.user.name || session.user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
