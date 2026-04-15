import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <>
      <h1>Leitner App</h1>
      <p>Server status: {status ?? "loading..."}</p>
    </>
  );
}
