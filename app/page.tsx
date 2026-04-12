"use client";

import { useEffect, useMemo, useState } from "react";
import { widgets } from "./data/widgets";
import { useTheme } from "./components/ThemeProvider";
import Link from "next/link";

const RECENT_KEY = "recent_widgets";
const FAV_KEY = "favorites";

export default function HomePage() {
  const { colors } = useTheme();

  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
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
    <main style={{ paddingBottom: 40 }}>

      {/* 🔍 SEARCH BAR (iOS style) */}
      <div style={searchWrap(colors)}>
        <input
          placeholder="Search apps"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput(colors)}
        />
      </div>

      {/* 📰 HERO */}
      <EditorialCard widget={filtered[0] || widgets[0]} />

      {/* 🔥 FEATURED */}
      <Section title="Featured">
        <SnapRow>
          {filtered.map((w) => (
            <MediumCard key={w.slug} widget={w} colors={colors} />
          ))}
        </SnapRow>
      </Section>

      {/* ⭐ FAVORITES */}
      {favoriteWidgets.length > 0 && (
        <Section title="Favorites">
          <SnapRow>
            {favoriteWidgets.map((w) => (
              <MediumCard key={w.slug} widget={w} colors={colors} />
            ))}
          </SnapRow>
        </Section>
      )}

      {/* 🕒 RECENT */}
      {recentWidgets.length > 0 && (
        <Section title="Recently Used">
          <SnapRow>
            {recentWidgets.map((w) => (
              <MediumCard key={w.slug} widget={w} colors={colors} />
            ))}
          </SnapRow>
        </Section>
      )}
    </main>
  );
}

/* ---------- SECTION ---------- */

function Section({ title, children }: any) {
  return (
    <section style={{ padding: "16px 20px" }}>
      <h2 style={sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/* ---------- SNAP ROW ---------- */

function SnapRow({ children }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        scrollBehavior: "smooth",
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- HERO ---------- */

function EditorialCard({ widget }: any) {
  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div style={heroCard}>
        <div>
          <p style={heroLabel}>FEATURED</p>
          <h1 style={heroTitle}>{widget.name}</h1>
        </div>

        <p style={heroDesc}>{widget.description}</p>
      </div>
    </Link>
  );
}

/* ---------- CARD ---------- */

function MediumCard({ widget, colors }: any) {
  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div style={card(colors)}>
        <div style={iconBox}>{widget.icon}</div>

        <div>
          <h3 style={{ margin: 0 }}>{widget.name}</h3>
          <p style={{ fontSize: 12, color: colors.subtext }}>
            {widget.description}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ---------- STYLES ---------- */

const searchWrap = (colors: any) => ({
  padding: "12px 20px",
});

const searchInput = (colors: any) => ({
  width: "100%",
  padding: "12px 16px",
  borderRadius: 14,
  border: `1px solid ${colors.border}`,
  background: colors.card,
  fontSize: 15,
  outline: "none",
});

const sectionTitle = {
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 10,
};

const heroCard = {
  margin: "12px 20px",
  height: 240,
  borderRadius: 28,
  padding: 24,
  background: "linear-gradient(135deg, #007aff, #5856d6)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  scrollSnapAlign: "start",
};

const heroLabel = {
  fontSize: 12,
  opacity: 0.8,
  letterSpacing: 1,
};

const heroTitle = {
  margin: "6px 0",
  fontSize: 28,
  fontWeight: 700,
};

const heroDesc = {
  opacity: 0.9,
};

const card = (colors: any) => ({
  minWidth: 260,
  height: 150,
  borderRadius: 20,
  padding: 16,
  background: colors.card,
  border: `1px solid ${colors.border}`,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  scrollSnapAlign: "start",
});

const iconBox = {
  fontSize: 22,
};