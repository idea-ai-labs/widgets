"use client";

import { useEffect, useState } from "react";
import { widgets } from "../data/widgets";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const filtered = widgets.filter((w) =>
    w.name.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div style={overlay} onClick={() => setOpen(false)}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          placeholder="Search widgets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={input}
        />

        {filtered.map((w) => (
          <div
            key={w.slug}
            style={item}
            onClick={() => router.push(`/widgets/${w.slug}`)}
          >
            <span>{w.icon}</span>
            <span>{w.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  paddingTop: 100,
};

const box: React.CSSProperties = {
  width: 500,
  background: "#fff",
  borderRadius: 12,
  padding: 10,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 8,
};

const item: React.CSSProperties = {
  padding: 10,
  cursor: "pointer",
  display: "flex",
  gap: 10,
};
