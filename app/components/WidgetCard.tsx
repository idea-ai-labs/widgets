"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Widget } from "../data/widgets";

const FAV_KEY = "favorites";

export default function WidgetCard({ widget }: { widget: Widget }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    setFavorite(favs.includes(widget.slug));
  }, [widget.slug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();

    let favs = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");

    if (favs.includes(widget.slug)) {
      favs = favs.filter((f: string) => f !== widget.slug);
      setFavorite(false);
    } else {
      favs.push(widget.slug);
      setFavorite(true);
    }

    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  };

  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        style={{
          borderRadius: 16,
          padding: 20,
          background: "#fff",
          border: "1px solid #eee",
          transition: "all 0.2s",
          cursor: "pointer",
          position: "relative",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-4px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0px)")
        }
      >
        {/* Favorite Star */}
        <div
          onClick={toggleFavorite}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 18,
          }}
        >
          {favorite ? "⭐" : "☆"}
        </div>

        <div style={{ fontSize: 42 }}>{widget.icon}</div>

        <h3 style={{ margin: "10px 0 5px" }}>{widget.name}</h3>

        <p style={{ fontSize: 14, color: "#666" }}>
          {widget.description}
        </p>
      </div>
    </Link>
  );
}
