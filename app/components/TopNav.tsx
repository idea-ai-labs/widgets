"use client";

import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export default function TopNav() {
  const { mode, toggle, colors } = useTheme();
  const [tab, setTab] = useState("Today");

  const tabs = ["Today", "Apps", "Search"];

  return (
    <header style={navWrap(colors)}>
      <div style={blurBar(colors)}>
        <div style={title(colors)}>App Store</div>

        <div style={row}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...tabBtn(colors),
                opacity: tab === t ? 1 : 0.5,
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

/* ---------- STYLES ---------- */

const navWrap = () => ({
  position: "sticky",
  top: 0,
  zIndex: 50,
});

const blurBar = (colors: any) => ({
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  background: colors.blur,
  padding: "14px 16px",
  borderBottom: `1px solid ${colors.border}`,
});

const title = (colors: any) => ({
  fontSize: 34,
  fontWeight: 700,
  color: colors.text,
  letterSpacing: -0.8,
  marginBottom: 10,
});

const row = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const tabBtn = (colors: any) => ({
  border: "none",
  background: "transparent",
  fontSize: 14,
  fontWeight: 600,
  color: colors.text,
  cursor: "pointer",
});

const toggleBtn = (colors: any) => ({
  marginLeft: "auto",
  border: "none",
  background: colors.card,
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
  color: colors.text,
});