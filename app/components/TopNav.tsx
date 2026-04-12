"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";

export default function TopNav() {
  const { mode, toggle, colors } = useTheme();
  const [tab, setTab] = useState<"Today" | "Apps" | "Search">("Today");

  const tabs: ("Today" | "Apps" | "Search")[] = [
    "Today",
    "Apps",
    "Search",
  ];

  return (
    <header style={navWrap}>
      <div style={blurBar(colors)}>
        <div style={title(colors)}>App Store</div>

        <div style={row}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...tabBtn(colors),
                opacity: tab === t ? 1 : 0.45,
              }}
            >
              {t}
            </button>
          ))}

          <button onClick={toggle} style={toggleBtn(colors)}>
            {mode === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================
   STYLES (FULL TYPE SAFE)
   ========================= */

const navWrap: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
};

const blurBar = (colors: any): React.CSSProperties => ({
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  background: colors.blur,
  padding: "14px 16px",
  borderBottom: `1px solid ${colors.border}`,
});

const title = (colors: any): React.CSSProperties => ({
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: -0.8,
  color: colors.text,
  marginBottom: 10,
});

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const tabBtn = (colors: any): React.CSSProperties => ({
  border: "none",
  background: "transparent",
  fontSize: 14,
  fontWeight: 600,
  color: colors.text,
  cursor: "pointer",
  transition: "opacity 0.2s ease",
});

const toggleBtn = (colors: any): React.CSSProperties => ({
  marginLeft: "auto",
  border: `1px solid ${colors.border}`,
  background: colors.card,
  color: colors.text,
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 14,
});