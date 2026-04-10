"use client";

import { useState } from "react";

export default function Header({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        background: "#fff",
        padding: 15,
        borderBottom: "1px solid #eee",
        zIndex: 10,
      }}
    >
      <h2 style={{ margin: 0 }}>🧩 Widget Store</h2>

      <input
        placeholder="Search widgets..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        style={{
          marginTop: 10,
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
}
