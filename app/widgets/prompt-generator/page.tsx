"use client";

import PromptGenerator from "./PromptGenerator";
import { useEffect } from "react";

export default function Page() {
  // Track "recently used"
  useEffect(() => {
    const key = "recent_widgets";
    let items = JSON.parse(localStorage.getItem(key) || "[]");

    items = [
      "prompt-generator",
      ...items.filter((i: string) => i !== "prompt-generator"),
    ].slice(0, 5);

    localStorage.setItem(key, JSON.stringify(items));
  }, []);

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h1>🧠 Prompt Generator</h1>
      <PromptGenerator />
    </main>
  );
}
