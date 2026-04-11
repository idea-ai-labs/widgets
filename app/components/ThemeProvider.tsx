"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const themes = {
  light: {
    bg: "#f8fafc",
    card: "#ffffff",
    elevated: "#ffffff",
    text: "#0f172a",
    subtext: "#64748b",
    border: "#e2e8f0",
    glow: "rgba(0,0,0,0.05)",
  },
  dark: {
    bg: "#0a0f1c",
    card: "#111827",
    elevated: "#1f2937",
    text: "#f9fafb",
    subtext: "#9ca3af",
    border: "#1f2937",
    glow: "rgba(0,0,0,0.4)",
  },
};

const ThemeContext = createContext<any>(null);

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode;
    if (saved) setTheme(saved);
  }, []);

  const toggle = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggle, colors }}>
      <div
        style={{
          background: colors.bg,
          color: colors.text,
          minHeight: "100vh",
          transition: "all 0.25s ease",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}