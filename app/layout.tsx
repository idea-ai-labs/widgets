"use client";

import ThemeProvider, { useTheme } from "./components/ThemeProvider";

function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header
      style={{
        padding: "12px 20px",
        borderBottom: "1px solid #eee",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: theme === "dark" ? "#0b0f19" : "#fff",
        zIndex: 100,
      }}
    >
      <a href="/" style={{ textDecoration: "none", fontWeight: 600 }}>
        🧩 Widget Store
      </a>

      {/* 🌙 DARK MODE TOGGLE */}
      <button
        onClick={toggle}
        style={{
          border: "1px solid #ddd",
          padding: "6px 10px",
          borderRadius: 8,
          cursor: "pointer",
          background: "transparent",
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