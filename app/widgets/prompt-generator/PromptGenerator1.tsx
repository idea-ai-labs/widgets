"use client";

import React, { useEffect, useState } from "react";

type PromptType =
  | "ReAct"
  | "Reflection"
  | "Direct Instruction"
  | "Creative Brainstorm"
  | "Structured Template"
  | "Tree of Thought";

type PromptFields = { [key: string]: string };

const STORAGE_KEY = "prompt-generator-state";

const defaultPrompts: Record<PromptType, PromptFields> = {
  ReAct: {
    Problem: "Plan a one-day sightseeing itinerary for Paris",
    Constraints: "Limited to budget travel",
    Boundary: "Only within central Paris",
    "Start With": "List the top tourist spots",
    Think: "Consider travel time between locations",
    Act: "Provide schedule with timings",
    Observer: "Check feasibility of itinerary",
  },
  Reflection: {
    "State the problem": "Evaluate the market potential for a new vegan protein bar",
    "Step 1 (Initial analysis)": "Research current market trends",
    "Step 2 (Reflection)": "Assess competitor products",
    "Step 3 (Critique)": "Identify gaps and opportunities",
    "Step 4 (Refined analysis)": "Conclude the market potential",
  },
  "Direct Instruction": {
    Task: "Summarize the article about renewable energy trends",
    Constraints: "Keep it under 200 words",
    Example: "Provide concise bullet points",
  },
  "Creative Brainstorm": {
    Goal: "Generate ideas for a new eco-friendly packaging design",
    Constraints: "Must be recyclable",
    Generate: "List at least 10 creative concepts",
  },
  "Structured Template": {
    "Section 1": "Introduction: Explain the importance of cybersecurity",
    "Section 2": "Body: Discuss current threats and mitigation strategies",
    "Section 3": "Conclusion: Summarize best practices",
  },
  "Tree of Thought": {
    Problem: "Find the best way to reduce traffic congestion in a city",
    "Step 1": "Analyze current traffic patterns",
    "Step 2": "Identify bottlenecks",
    "Step 3": "Propose potential solutions",
    "Step 4": "Evaluate feasibility of solutions",
    "Step 5": "Recommend the most effective approach",
  },
};

export default function PromptGenerator() {
  const [promptType, setPromptType] = useState<PromptType>("ReAct");
  const [fields, setFields] = useState<PromptFields>(defaultPrompts["ReAct"]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setPromptType(parsed.promptType);
      setFields(parsed.fields);
    }
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ promptType, fields })
    );
  }, [promptType, fields]);

  // Generate prompt dynamically
  useEffect(() => {
    const text = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    setGeneratedPrompt(text);
  }, [fields]);

  const handleTypeChange = (type: PromptType) => {
    setPromptType(type);
    setFields(defaultPrompts[type]);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setFields(defaultPrompts[promptType]);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedPrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Prompt Type Selector */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {Object.keys(defaultPrompts).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type as PromptType)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: promptType === type ? "2px solid #0070f3" : "1px solid #ccc",
              background: promptType === type ? "#eef6ff" : "#fff",
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div style={{ marginTop: 20 }}>
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 600 }}>{key}</label>
            <input
              value={value}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}>
        <button onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleDownload}>Download .txt</button>
      </div>

      {/* Output */}
      <textarea
        value={generatedPrompt}
        readOnly
        rows={12}
        style={{
          width: "100%",
          marginTop: 15,
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc",
          fontFamily: "monospace",
        }}
      />
    </div>
  );
}
