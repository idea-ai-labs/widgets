"use client";

import { useEffect } from "react";
import { useTheme } from "../../components/ThemeProvider";
import ProjectScheduler from "./ProjectScheduler";

export default function Page() {
  const { colors } = useTheme();

  // Track "recently used"
  useEffect(() => {
    const key = "recent_widgets";
    let items = JSON.parse(localStorage.getItem(key) || "[]");

    items = [
      "project-scheduler",
      ...items.filter((i: string) => i !== "project-scheduler"),
    ].slice(0, 5);

    localStorage.setItem(key, JSON.stringify(items));
  }, []);

  return (
    <main style={wrap(colors)}>
      <div style={container}>
        {/* HEADER */}
        <h1 style={title(colors)}>📊 Project Scheduler</h1>

        <p style={subtitle(colors)}>
          Build detailed project plans with tasks, dependencies (FS/SS), and
          automatic scheduling—similar to Microsoft Project.
        </p>

        {/* MAIN TOOL */}
        <div style={card(colors)}>
          <ProjectScheduler />
        </div>
      </div>
    </main>
  );
}

/* ================= STYLES ================= */

const wrap = (colors: any): React.CSSProperties => ({
  minHeight: "100vh",
  background: colors.background,
  padding: "24px 16px",
});

const container: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
};

const title = (colors: any): React.CSSProperties => ({
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: -0.8,
  color: colors.text,
  marginBottom: 6,
});

const subtitle = (colors: any): React.CSSProperties => ({
  fontSize: 15,
  color: colors.subtext,
  marginBottom: 18,
  lineHeight: 1.4,
});

const card = (colors: any): React.CSSProperties => ({
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 18,
  padding: 18,
  boxShadow: colors.shadow,
});
