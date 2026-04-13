"use client";

import PromptGenerator from "./PromptGenerator";
import { useEffect } from "react";
import { useTheme } from "../../components/ThemeProvider";

export default function Page() {
  const { colors } = useTheme();

  // Track "recently used"
  useEffect(() => {
    const key = "recent_widgets";
    let items = JSON.parse(localStorage.getItem(key) || "[]");

    items = [
      "prompt-generator",
      ...items.filter((i: string) => i !== "prompt-generator"),
    ].slice(0, 5);

    localStorage.setItem(key, JSON.stringify(items));
  }, []);

  return (
    <main style={wrap(colors)}>
      <div style={container}>
        <h1 style={title(colors)}>🧠 Prompt Generator</h1>

        <p style={subtitle(colors)}>
          Build structured prompts using reasoning patterns like ReAct,
          Reflection, and Tree of Thought.
        </p>

        <div style={card(colors)}>
          <PromptGenerator />
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
  maxWidth: 900,
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