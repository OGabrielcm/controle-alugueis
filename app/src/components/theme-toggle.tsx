"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "controle-alugueis.theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    let frameId: number | undefined;

    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);
      const nextTheme: Theme = savedTheme === "dark" ? "dark" : "light";
      applyTheme(nextTheme);
      frameId = window.requestAnimationFrame(() => setTheme(nextTheme));
    } catch {
      applyTheme("light");
    }

    return () => {
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
    };
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    setTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The theme still changes for the current session when storage is unavailable.
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-sm shadow-primary/5 transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-pressed={isDark}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      {isDark ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
