import { useSession } from "../lib/auth-client";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <h2>Welcome back, {session?.user?.name || session?.user?.email}!</h2>
      </main>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: "2rem 1.5rem",
  },
};
