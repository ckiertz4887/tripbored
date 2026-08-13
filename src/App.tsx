import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { Home } from "./pages/Home";
import { Game } from "./pages/Game";
import { Profile } from "./pages/Profile";

function Gate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <div className="loading">Warming up the arcade...</div>;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Gate>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Gate>
      </BrowserRouter>
    </AuthProvider>
  );
}
