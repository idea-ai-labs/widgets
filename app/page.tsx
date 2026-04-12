"use client";

import { useEffect, useMemo, useState } from "react";
import { widgets } from "./data/widgets";
import Link from "next/link";
import TopNav from "./components/TopNav";
import useReveal from "./hooks/useReveal";
import { useTheme } from "./components/ThemeProvider";

const RECENT_KEY = "recent_widgets";
const FAV_KEY = "favorites";

export default function HomePage() {
  const { colors } = useTheme();

  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    setFavorites(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  }, []);

  const filtered = useMemo(() => {
    return widgets.filter((w) =>
      w.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <>
      <TopNav />

      <main style={main(colors, loaded)}>

        {/* SEARCH */}
        <div style={searchWrap}>
          <input
            placeholder="Search apps"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput(colors)}
          />
        </div>

        {/* HERO */}
        <Hero widget={filtered[0] || widgets[0]} />

        {/* FEATURED */}
        <Section title="Featured">
          <Row>
            {filtered.map((w) => (
              <Card key={w.slug} widget={w} />
            ))}
          </Row>
        </Section>
      </main>
    </>
  );
}

/* ---------- HERO ---------- */

function Hero({ widget }: any) {
  const { ref, visible } = useReveal();
  const { colors } = useTheme();

  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        ref={ref}
        style={{
          ...hero(colors),
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(18px)",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
          TODAY
        </p>

        <h1 style={{ color: "#fff", fontSize: 28 }}>
          {widget.name}
        </h1>

        <p style={{ color: "rgba(255,255,255,0.85)" }}>
          {widget.description}
        </p>
      </div>
    </Link>
  );
}

/* ---------- CARD ---------- */

function Card({ widget }: any) {
  const { ref, visible } = useReveal();
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        ref={ref}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        style={{
          ...card(colors),
          opacity: visible ? 1 : 0,
          transform: visible
            ? pressed
              ? "scale(0.97)"
              : "scale(1)"
            : "translateY(14px)",
        }}
      >
        <div style={{ fontSize: 22 }}>{widget.icon}</div>

        <div>
          <h3 style={{ color: colors.text, margin: 0 }}>
            {widget.name}
          </h3>

          <p style={{ color: colors.subtext, fontSize: 12 }}>
            {widget.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ---------- SECTION ---------- */

function Section({ title, children }: any) {
  const { ref, visible } = useReveal();
  const { colors } = useTheme();

  return (
    <section
      ref={ref}
      style={{
        padding: "18px 16px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <h2 style={{ color: colors.text }}>{title}</h2>
      {children}
    </section>
  );
}

/* ---------- STYLES ---------- */

const main = (colors: any, loaded: boolean): React.CSSProperties => ({
  paddingBottom: 80,
  background: colors.background,
  transition: "all 0.3s ease",
  opacity: loaded ? 1 : 0,
});

const searchWrap: React.CSSProperties = {
  padding: "12px 16px",
};

const searchInput = (colors: any): React.CSSProperties => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  background: colors.card,
  color: colors.text,
  outline: "none",
});

const hero = (colors: any): React.CSSProperties => ({
  margin: "12px 16px",
  height: 320,
  borderRadius: 28,
  padding: 22,
  background:
    "linear-gradient(135deg, #007aff, #5e5ce6, #af52de)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
});

const card = (colors: any): React.CSSProperties => ({
  minWidth: 260,
  height: 160,
  borderRadius: 22,
  padding: 14,
  background: colors.card,
  border: `1px solid ${colors.border}`,
  boxShadow: colors.shadow,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});