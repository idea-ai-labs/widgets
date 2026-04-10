"use client";

import { useEffect, useState } from "react";
import { widgets, Widget } from "./data/widgets";
import WidgetCard from "./components/WidgetCard";
import Header from "./components/Header";

const RECENT_KEY = "recent_widgets";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    setRecent(stored);
  }, []);

  const categories = ["All", ...new Set(widgets.map((w) => w.category))];

  const filtered = widgets.filter((w) => {
    return (
      (category === "All" || w.category === category) &&
      w.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const featured = widgets.filter((w) => w.featured);

  return (
    <main style={{ maxWidth: 1100, margin: "auto" }}>
      <Header onSearch={setSearch} />

      {/* Categories */}
      <div style={{ display: "flex", gap: 10, padding: 10, flexWrap: "wrap" }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: category === c ? "2px solid #0070f3" : "1px solid #ccc",
              background: category === c ? "#eef6ff" : "#fff",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section style={{ padding: 10 }}>
          <h2>🔥 Featured</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 15 }}>
            {featured.map((w) => (
              <WidgetCard key={w.slug} widget={w} />
            ))}
          </div>
        </section>
      )}

      {/* All Widgets */}
      <section style={{ padding: 10 }}>
        <h2>All Widgets</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 15 }}>
          {filtered.map((w) => (
            <WidgetCard key={w.slug} widget={w} />
          ))}
        </div>
      </section>
    </main>
  );
}
