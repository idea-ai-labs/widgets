"use client";

import { useEffect, useState } from "react";
import { widgets } from "./data/widgets";
import Link from "next/link";

const RECENT_KEY = "recent_widgets";
const FAV_KEY = "favorites";

export default function HomePage() {
  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    setFavorites(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
  }, []);

  const recentWidgets = widgets.filter((w) =>
    recent.includes(w.slug)
  );

  const favoriteWidgets = widgets.filter((w) =>
    favorites.includes(w.slug)
  );

  return (
    <main style={{ paddingBottom: 40 }}>

      {/* 📰 HERO */}
      <EditorialCard widget={widgets[0]} />

      {/* 🔥 FEATURED */}
      <Section title="Featured">
        <SnapRow>
          {widgets.map((w) => (
            <MediumCard key={w.slug} widget={w} />
          ))}
        </SnapRow>
      </Section>

      {/* ⭐ FAVORITES */}
      {favoriteWidgets.length > 0 && (
        <Section title="Favorites">
          <SnapRow>
            {favoriteWidgets.map((w) => (
              <MediumCard key={w.slug} widget={w} />
            ))}
          </SnapRow>
        </Section>
      )}

      {/* 🕒 RECENT */}
      {recentWidgets.length > 0 && (
        <Section title="Recently Used">
          <SnapRow>
            {recentWidgets.map((w) => (
              <MediumCard key={w.slug} widget={w} />
            ))}
          </SnapRow>
        </Section>
      )}
    </main>
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
  return (
    <section style={{ padding: "20px 16px" }}>
      <h2 style={{ marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  );
}

/* ---------- SNAP ROW (KEY iOS FEEL) ---------- */

function SnapRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        scrollSnapType: "x mandatory",   // 🧲 snap
        scrollBehavior: "smooth",        // ✨ smooth
        paddingBottom: 10,
        paddingLeft: 4,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- HERO CARD ---------- */

function EditorialCard({ widget }: any) {
  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        style={{
          margin: 16,
          height: 220,
          borderRadius: 28,
          padding: 24,
          color: "#fff",
          background:
            "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          scrollSnapAlign: "start", // important
          cursor: "pointer",
        }}
      >
        <div>
          <p style={{ opacity: 0.8 }}>FEATURED TOOL</p>
          <h1 style={{ margin: "6px 0" }}>{widget.name}</h1>
        </div>

        <p style={{ opacity: 0.9 }}>{widget.description}</p>
      </div>
    </Link>
  );
}

/* ---------- MEDIUM CARD ---------- */

function MediumCard({ widget }: any) {
  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        style={{
          minWidth: 260,
          height: 140,
          borderRadius: 20,
          padding: 16,
          background:
            "linear-gradient(135deg, #1f2937, #111827)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          scrollSnapAlign: "start", // 🧲 required
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: 22 }}>{widget.icon}</div>

        <div>
          <h3 style={{ margin: 0 }}>{widget.name}</h3>
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            {widget.description}
          </p>
        </div>
      </div>
    </Link>
  );
}