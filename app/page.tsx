"use client";

import { useEffect, useMemo, useState } from "react";
import { widgets } from "./data/widgets";
import Link from "next/link";
import TopNav from "./components/TopNav";
import useReveal from "./hooks/useReveal";

const RECENT_KEY = "recent_widgets";
const FAV_KEY = "favorites";

export default function HomePage() {
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

  const recentWidgets = widgets.filter((w) =>
    recent.includes(w.slug)
  );

  const favoriteWidgets = widgets.filter((w) =>
    favorites.includes(w.slug)
  );

  return (
    <>
      <TopNav />

      <main style={{ ...mainStyle, opacity: loaded ? 1 : 0 }}>

        {/* SEARCH */}
        <div style={searchWrap}>
          <input
            placeholder="Search apps"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        {/* TODAY HERO */}
        <Hero widget={filtered[0] || widgets[0]} />

        {/* FEATURED */}
        <Section title="Featured">
          <Row>
            {filtered.map((w) => (
              <Card key={w.slug} widget={w} />
            ))}
          </Row>
        </Section>

        {/* FAVORITES */}
        {favoriteWidgets.length > 0 && (
          <Section title="Favorites">
            <Row>
              {favoriteWidgets.map((w) => (
                <Card key={w.slug} widget={w} />
              ))}
            </Row>
          </Section>
        )}

        {/* RECENT */}
        {recentWidgets.length > 0 && (
          <Section title="Recently Used">
            <Row>
              {recentWidgets.map((w) => (
                <Card key={w.slug} widget={w} />
              ))}
            </Row>
          </Section>
        )}
      </main>
    </>
  );
}

/* ---------- SECTION ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { ref, visible } = useReveal();

  return (
    <section
      ref={ref}
      style={{
        ...sectionStyle,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/* ---------- ROW ---------- */

function Row({ children }: any) {
  return <div style={rowStyle}>{children}</div>;
}

/* ---------- HERO (TODAY STYLE) ---------- */

function Hero({ widget }: any) {
  const { ref, visible } = useReveal();

  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        ref={ref}
        style={{
          ...heroStyle,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <div>
          <p style={heroLabel}>TODAY</p>
          <h1 style={heroTitle}>{widget.name}</h1>
        </div>

        <p style={heroDesc}>{widget.description}</p>
      </div>
    </Link>
  );
}

/* ---------- CARD ---------- */

function Card({ widget }: any) {
  const { ref, visible } = useReveal();
  const [pressed, setPressed] = useState(false);

  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        ref={ref}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        style={{
          ...cardStyle,
          opacity: visible ? 1 : 0,
          transform: visible
            ? pressed
              ? "scale(0.97)"
              : "scale(1)"
            : "translateY(16px)",
        }}
      >
        <div style={{ fontSize: 22 }}>{widget.icon}</div>

        <div>
          <h3 style={titleText}>{widget.name}</h3>
          <p style={descText}>{widget.description}</p>
        </div>
      </div>
    </Link>
  );
}

/* ---------- STYLES ---------- */

const mainStyle: React.CSSProperties = {
  paddingBottom: 80,
  background: "#f5f5f7",
  transition: "opacity 0.4s ease",
};

const searchWrap: React.CSSProperties = {
  padding: "12px 16px",
};

const searchInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#fff",
  fontSize: 15,
  outline: "none",
};

const sectionStyle: React.CSSProperties = {
  padding: "18px 16px",
  marginTop: 6,
  transition: "all 0.4s ease",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 10,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  scrollBehavior: "smooth",
  paddingBottom: 8,
};

const heroStyle: React.CSSProperties = {
  margin: "12px 16px",
  height: 320,
  borderRadius: 28,
  padding: 22,
  background:
    "linear-gradient(135deg, #007aff, #5856d6, #af52de)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
};

const heroLabel: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 1.2,
  opacity: 0.85,
};

const heroTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  margin: "6px 0",
};

const heroDesc: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.9,
};

const cardStyle: React.CSSProperties = {
  minWidth: 260,
  height: 160,
  borderRadius: 22,
  padding: 14,
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  scrollSnapAlign: "start",
  transition: "all 0.25s ease",
};

const titleText: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
};

const descText: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.6,
};