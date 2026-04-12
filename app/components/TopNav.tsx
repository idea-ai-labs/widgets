"use client";

import { useState } from "react";

export default function TopNav() {
  const [tab, setTab] = useState("Today");

  const tabs = ["Today", "Apps", "Search"];

  return (
    <header style={navWrap}>
      <div style={blurBar}>
        <div style={title}>App Store</div>

        <div style={segmented}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...tabBtn,
                opacity: tab === t ? 1 : 0.4,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ---------- STYLES ---------- */

const navWrap: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
};

const blurBar: React.CSSProperties = {
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  background: "rgba(245, 245, 247, 0.7)",
  padding: "14px 16px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

const title: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: -0.8,
  marginBottom: 10,
};

const segmented: React.CSSProperties = {
  display: "flex",
  gap: 14,
};

const tabBtn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s ease",
};
