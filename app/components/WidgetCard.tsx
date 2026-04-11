"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Widget } from "../data/widgets";

const FAV_KEY = "favorites";

export default function WidgetCard({ widget }: { widget: Widget }) {
  const [fav, setFav] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const f = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    setFav(f.includes(widget.slug));
  }, []);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();

    let f = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");

    if (f.includes(widget.slug)) {
      f = f.filter((x: string) => x !== widget.slug);
      setFav(false);
    } else {
      f.push(widget.slug);
      setFav(true);
    }

    localStorage.setItem(FAV_KEY, JSON.stringify(f));
  };

  return (
    <Link href={`/widgets/${widget.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          ...card,
          transform: hovered ? "translateY(-4px)" : "translateY(0px)",
          boxShadow: hovered
            ? "0 8px 25px rgba(0,0,0,0.08)"
            : "0 2px 8px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={iconWrap}>
          <span style={{ fontSize: 26 }}>{widget.icon}</span>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{widget.name}</h3>
          <p style={{ margin: "4px 0", color: "#666", fontSize: 13 }}>
            {widget.description}
          </p>
        </div>

        <button onClick={toggleFav} style={star}>
          {fav ? "⭐" : "☆"}
        </button>
      </div>
    </Link>
  );
}

const card: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: 14,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #eee",
  transition: "all 0.2s ease",
  cursor: "pointer",
};

const iconWrap: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: "#f5f7ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const star: React.CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
};