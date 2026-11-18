import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import twemoji from "@twemoji/api";
import { AuthProvider, useAuth } from "./lib/auth";
import { useSettings, applyTheme } from "./lib/settings";
import { Home } from "./pages/Home";
import { Game } from "./pages/Game";
import { Profile } from "./pages/Profile";
import { CategoryLetter } from "./pages/CategoryLetter";
import { Magic8Ball } from "./pages/Magic8Ball";
import { WouldYouRather } from "./pages/WouldYouRather";
import { ThisOrThat } from "./pages/ThisOrThat";
import { LineUp } from "./pages/LineUp";
import { WhoWouldWin } from "./pages/WhoWouldWin";

const TWEMOJI_OPTS = {
  base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
};

function ThemeSync() {
  const { settings } = useSettings();
  useEffect(() => { applyTheme(settings.darkMode); }, [settings.darkMode]);
  return null;
}

function EmojiSync() {
  useEffect(() => {
    twemoji.parse(document.body, TWEMOJI_OPTS);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            twemoji.parse(node as HTMLElement, TWEMOJI_OPTS);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}

function Gate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <div className="loading">Warming up the arcade...</div>;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeSync />
      <EmojiSync />
      <BrowserRouter>
        <Gate>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:gameId" element={<Game />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/name-it" element={<CategoryLetter />} />
            <Route path="/magic-8" element={<Magic8Ball />} />
            <Route path="/would-you-rather" element={<WouldYouRather />} />
            <Route path="/this-or-that" element={<ThisOrThat />} />
            <Route path="/line-up" element={<LineUp />} />
            <Route path="/who-would-win" element={<WhoWouldWin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Gate>
      </BrowserRouter>
    </AuthProvider>
  );
}
