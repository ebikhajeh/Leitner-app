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
    <nav style={styles.nav}>
      <span style={styles.brand}>Leitner App</span>
      {session?.user && (
        <div style={styles.right}>
          <span style={styles.username}>{session.user.name || session.user.email}</span>
          <button onClick={handleSignOut} style={styles.signOutBtn}>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.5rem",
    borderBottom: "1px solid #e5e7eb",
    background: "#fff",
  },
  brand: {
    fontWeight: 700,
    fontSize: "1.1rem",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  username: {
    fontSize: "0.9rem",
    color: "#374151",
  },
  signOutBtn: {
    padding: "0.35rem 0.85rem",
    fontSize: "0.85rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },
};
