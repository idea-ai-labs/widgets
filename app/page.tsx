"use client";

import { useEffect, useMemo, useState } from "react";
import { widgets } from "./data/widgets";
import Link from "next/link";
import TopNav from "./components/TopNav";
import useReveal from "./components/useReveal";
import { useTheme } from "./components/ThemeProvider";

const RECENT_KEY = "recent_widgets";

export default function HomePage() {
  const { colors } = useTheme();

  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
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
        <div style={searchWrap(colors)}>
          <input
            placeholder="Search apps"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput(colors)}
          />
        </div>

        {/* HERO */}
        <Hero widget={filtered[0] || widgets[0]} />

        {/* FEATURED GRID (NO Row COMPONENT ANYMORE) */}
        <section style={section}>
          <h2 style={{ color: colors.text }}>Featured</h2>

          <div style={grid}>
            {filtered.map((w) => (
              <Card key={w.slug} widget={w} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

/* ================= HERO ================= */

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
          transform: visible ? "translateY(0)" : "translateY(16px)",
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

/* ================= CARD ================= */

function Card({ widget }: any) {
  const { ref, visible } = useReveal();
  const { colors } = useTheme();

  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        ref={ref}
        style={{
          ...card(colors),
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0)"
            : "translateY(12px)",
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

/* ================= STYLES ================= */

const main = (colors: any, loaded: boolean): React.CSSProperties => ({
  paddingBottom: 80,
  background: colors.background,
  opacity: loaded ? 1 : 0,
  transition: "all 0.3s ease",
});

const searchWrap = (colors: any): React.CSSProperties => ({
  padding: "12px 16px",
});

const searchInput = (colors: any): React.CSSProperties => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  background: colors.card,
  color: colors.text,
  outline: "none",
});

const section: React.CSSProperties = {
  padding: "18px 16px",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 14,
};

const hero = (colors: any): React.CSSProperties => ({
  margin: "12px 16px",
  height: 320,
  borderRadius: 28,
  padding: 22,
  background:
    "linear-gradient(135deg, #007aff, #5856d6, #af52de)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
});