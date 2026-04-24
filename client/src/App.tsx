import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
import { useSession } from "./lib/auth-client";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AddWordPage from "./pages/AddWordPage";
import ReviewPage from "./pages/ReviewPage";
import SettingsPage from "./pages/SettingsPage";
import BottomNav from "./components/BottomNav";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  );
}

function ProtectedRoute({ session, children }: { session: boolean; children: React.ReactNode }) {
  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppShell() {
  const { data: session, isPending } = useSession();

  if (isPending) return <LoadingScreen />;

  const authed = !!session;

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route
          path="/login"
          element={authed ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={<ProtectedRoute session={authed}><HomePage /></ProtectedRoute>}
        />
        <Route
          path="/words/new"
          element={<ProtectedRoute session={authed}><AddWordPage /></ProtectedRoute>}
        />
        <Route
          path="/review"
          element={<ProtectedRoute session={authed}><ReviewPage /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute session={authed}><SettingsPage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {authed && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
        <Toaster position="bottom-center" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
