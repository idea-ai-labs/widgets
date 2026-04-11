"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Widget } from "../data/widgets";
import { useTheme } from "./ThemeProvider";

const FAV_KEY = "favorites";

export default function WidgetCard({ widget }: { widget: Widget }) {
  const [fav, setFav] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { colors } = useTheme();

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
          display: "flex",
          gap: 14,
          alignItems: "center",
          padding: 16,
          borderRadius: 18,
          background: hovered ? colors.elevated : colors.card,
          border: `1px solid ${colors.border}`,
          transition: "all 0.25s ease",
          cursor: "pointer",
          transform: hovered ? "translateY(-6px)" : "translateY(0px)",
          boxShadow: hovered
            ? `0 12px 30px ${colors.glow}`
            : "0 4px 12px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background:
              "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 22,
          }}
        >
          {widget.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{widget.name}</h3>
          <p
            style={{
              margin: "4px 0",
              color: colors.subtext,
              fontSize: 13,
            }}
          >
            {widget.description}
          </p>
        </div>

        {/* Favorite */}
        <button
          onClick={toggleFav}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          {fav ? "⭐" : "☆"}
        </button>
      </div>
    </Link>
  );
}