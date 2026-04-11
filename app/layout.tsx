"use client";

import ThemeProvider, { useTheme } from "./components/ThemeProvider";

function Header() {
  const { theme, toggle, colors } = useTheme();

  return (
    <header
      style={{
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        backdropFilter: "blur(10px)",
        background:
          theme === "dark"
            ? "rgba(10,15,28,0.7)"
            : "rgba(255,255,255,0.7)",
        borderBottom: `1px solid ${colors.border}`,
        zIndex: 100,
      }}
    >
      <a href="/" style={{ textDecoration: "none", fontWeight: 600 }}>
        🧩 Widget Store
      </a>

      <button
        onClick={toggle}
        style={{
          border: `1px solid ${colors.border}`,
          padding: "6px 12px",
          borderRadius: 10,
          cursor: "pointer",
          background: colors.card,
        }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}