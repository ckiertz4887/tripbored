const GAME_URL_KEY = "tb_last_game";
const RETURN_KEY = "tb_minigame_return";
const TOT_SESSION_KEY = "tb_tot_session";

export function saveGameUrl(gameId: string) {
  try { sessionStorage.setItem(GAME_URL_KEY, `/game/${gameId}`); } catch {}
}

export function getGameUrl(): string | null {
  try { return sessionStorage.getItem(GAME_URL_KEY); } catch { return null; }
}

export function saveMinigameReturn(route: string, name: string) {
  try { sessionStorage.setItem(RETURN_KEY, JSON.stringify({ route, name })); } catch {}
}

export function getMinigameReturn(): { route: string; name: string } | null {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    return raw ? (JSON.parse(raw) as { route: string; name: string }) : null;
  } catch { return null; }
}

export function clearMinigameReturn() {
  try { sessionStorage.removeItem(RETURN_KEY); } catch {}
}

export function saveTotSession(data: unknown) {
  try { sessionStorage.setItem(TOT_SESSION_KEY, JSON.stringify(data)); } catch {}
}

export function loadTotSession(): unknown | null {
  try {
    const raw = sessionStorage.getItem(TOT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearTotSession() {
  try { sessionStorage.removeItem(TOT_SESSION_KEY); } catch {}
}
