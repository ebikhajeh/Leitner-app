import { useSession } from "../lib/auth-client";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <>
      <Navbar />
      <main className="p-8">
        <h2 className="text-xl font-semibold">
          Welcome back, {session?.user?.name || session?.user?.email}!
        </h2>
      </main>
    </>
  );
}
