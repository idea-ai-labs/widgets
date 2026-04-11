"use client";

import { useEffect, useMemo, useState } from "react";
import { widgets, Widget } from "./data/widgets";
import WidgetCard from "./components/WidgetCard";

const RECENT_KEY = "recent_widgets";
const FAV_KEY = "favorites";

export default function HomePage() {
  const [search, setSearch] = useState("");

  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    setFavorites(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  }, []);

  const featured = widgets.find((w) => w.featured);

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
    <main style={styles.page}>
      
      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div>
          <h1 style={styles.title}>🧩 Widget Store</h1>
          <p style={styles.subtitle}>
            Your personal toolkit of AI-powered utilities
          </p>

          <input
            placeholder="Search widgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>
      </section>

      {/* FEATURED */}
      {featured && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🔥 Featured</h2>

          <div style={styles.featuredCard}>
            <div style={{ fontSize: 42 }}>{featured.icon}</div>
            <div>
              <h3 style={{ margin: 0 }}>{featured.name}</h3>
              <p style={{ margin: "6px 0", color: "#666" }}>
                {featured.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAVORITES */}
      {favoriteWidgets.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⭐ Favorites</h2>
          <div style={styles.grid}>
            {favoriteWidgets.map((w) => (
              <WidgetCard key={w.slug} widget={w} />
            ))}
          </div>
        </section>
      )}

      {/* RECENT */}
      {recentWidgets.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🕒 Recently Used</h2>
          <div style={styles.grid}>
            {recentWidgets.map((w) => (
              <WidgetCard key={w.slug} widget={w} />
            ))}
          </div>
        </section>
      )}

      {/* ALL WIDGETS */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>All Tools</h2>

        <div style={styles.grid}>
          {filtered.map((w) => (
            <WidgetCard key={w.slug} widget={w} />
          ))}
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px",
    background: "#fafafa",
  },

  hero: {
    padding: "40px 20px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #f0f4ff, #ffffff)",
    border: "1px solid #eee",
    marginBottom: 30,
  },

  title: {
    fontSize: 34,
    margin: 0,
    fontWeight: 700,
  },

  subtitle: {
    color: "#666",
    marginTop: 6,
  },

  search: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    fontSize: 14,
  },

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },

  featuredCard: {
    display: "flex",
    gap: 16,
    padding: 20,
    borderRadius: 16,
    background: "#fff",
    border: "1px solid #eee",
    alignItems: "center",
  },
};