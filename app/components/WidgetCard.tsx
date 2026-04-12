"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import useReveal from "./useReveal";

export default function WidgetCard({ widget }: any) {
  const { colors } = useTheme();
  const { ref, visible } = useReveal();
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/widgets/${widget.slug}`}>
      <div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          minWidth: 260,
          height: 160,
          padding: 16,
          borderRadius: 18,

          background: hovered ? colors.elevated : colors.card,
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow,

          transition: "all 0.25s ease",
          cursor: "pointer",

          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",

          opacity: visible ? 1 : 0,
          transform: visible
            ? hovered
              ? "translateY(-4px)"
              : "translateY(0)"
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