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

  function setDarkTheme(enabled: boolean) {
    const nextTheme: Theme = enabled ? "dark" : "light";
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
      onClick={() => setDarkTheme(!isDark)}
      className="inline-grid size-10 place-items-center rounded-lg text-ink-muted transition hover:bg-surface-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
