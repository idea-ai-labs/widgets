"use client";

import { widgets } from "../../data/widgets";
import { useTheme } from "../../components/ThemeProvider";
import Link from "next/link";

export default function WidgetPage({ params }: any) {
  const { colors } = useTheme();

  const widget = widgets.find((w) => w.slug === params.slug);

  if (!widget) {
    return (
      <div style={wrap(colors)}>
        <h2 style={{ color: colors.text }}>Widget not found</h2>
      </div>
    );
  }

  return (
    <div style={wrap(colors)}>
      <div style={container}>
        <Link href="/" style={{ color: colors.subtext }}>
          ← Back
        </Link>

        <h1 style={title(colors)}>{widget.name}</h1>

        <p style={desc(colors)}>{widget.description}</p>

        <div style={card(colors)}>
          <p style={{ color: colors.text }}>
            This is where the widget UI will render.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const wrap = (colors: any): React.CSSProperties => ({
  minHeight: "100vh",
  background: colors.background,
  padding: 20,
});

const container: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
};

const title = (colors: any): React.CSSProperties => ({
  fontSize: 32,
  fontWeight: 700,
  color: colors.text,
  marginTop: 16,
});

const desc = (colors: any): React.CSSProperties => ({
  fontSize: 16,
  color: colors.subtext,
  marginTop: 8,
});

const card = (colors: any): React.CSSProperties => ({
  marginTop: 24,
  padding: 20,
  borderRadius: 16,
  background: colors.card,
  border: `1px solid ${colors.border}`,
});