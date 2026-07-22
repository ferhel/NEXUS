// ─────────────────────────────────────────────
// ThemeContext.js
// Provee el tema activo (claro/oscuro) a toda la
// app y permite alternarlo en vivo con useTheme().
// ─────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from "react";
import { darkTheme, lightTheme, font } from "./theme";

const STORAGE_KEY = "nexus_theme_mode";

function leerPreferenciaGuardada() {
  try {
    const guardada = localStorage.getItem(STORAGE_KEY);
    if (guardada === "light" || guardada === "dark") return guardada;
  } catch {}
  return null;
}

function leerPreferenciaSistema() {
  try {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  } catch {
    return "dark";
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => leerPreferenciaGuardada() || leerPreferenciaSistema());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch {}
  }, [mode]);

  const toggleTheme = () => setMode(m => (m === "dark" ? "light" : "dark"));
  const t = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ t, font, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
