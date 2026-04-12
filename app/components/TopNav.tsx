"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggle, colors } = useTheme();

  const tabs = [
    { name: "Today", path: "/" },
    { name: "Apps", path: "/apps" },
    { name: "Search", path: "/search" },
  ];

  return (
    <header style={navWrap}>
      <div style={blurBar(colors)}>
        <div style={title(colors)}>App Store</div>

        <div style={row}>
          {tabs.map((t) => {
            const active = pathname === t.path;

            return (
              <button
                key={t.path}
                onClick={() => router.push(t.path)}
                style={{
                  ...tabBtn(colors),
                  opacity: active ? 1 : 0.45,
                }}
              >
                {t.name}
              </button>
            );
          })}

          <button onClick={toggle} style={toggleBtn(colors)}>
            {mode === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ================= STYLES ================= */

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
  color: colors.text,
  letterSpacing: -0.8,
  marginBottom: 10,
});

const row: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
};

const tabBtn = (colors: any): React.CSSProperties => ({
  border: "none",
  background: "transparent",
  fontSize: 14,
  fontWeight: 600,
  color: colors.text,
  cursor: "pointer",
});

const toggleBtn = (colors: any): React.CSSProperties => ({
  marginLeft: "auto",
  border: `1px solid ${colors.border}`,
  background: colors.card,
  color: colors.text,
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
});