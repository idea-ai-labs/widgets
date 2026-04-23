“use client”;

import { useEffect, useState, useCallback } from “react”;

// ─── Types ────────────────────────────────────────────────────────────────────

const PROMPT_TYPES = [
“Zero-Shot”,
“Few-Shot”,
“Chain of Thought”,
“Prompt Chaining”,
“Tree of Thought”,
“ReAct”,
“Role Prompting”,
“Self-Consistency”,
“Generated Knowledge”,
“Least-to-Most”,
];

const STORAGE_KEY = “prompt-generator-v2”;

// ─── Metadata: description + complexity badge ─────────────────────────────────

const PROMPT_META = {
“Zero-Shot”: {
complexity: “Beginner”,
color: “#22c55e”,
description:
“Give the AI a task with no examples — just a clear, direct instruction. Best for simple, well-defined tasks.”,
icon: “⚡”,
},
“Few-Shot”: {
complexity: “Beginner”,
color: “#22c55e”,
description:
“Provide 2–5 input/output examples before your request so the AI learns your pattern, tone, and format.”,
icon: “📋”,
},
“Chain of Thought”: {
complexity: “Intermediate”,
color: “#f59e0b”,
description:
‘Force the AI to show its reasoning step-by-step before answering. Add “think step by step” to boost accuracy on complex tasks.’,
icon: “🔗”,
},
“Prompt Chaining”: {
complexity: “Intermediate”,
color: “#f59e0b”,
description:
“Feed one prompt’s output as the next prompt’s input — building a pipeline of connected tasks for complex workflows.”,
icon: “⛓️”,
},
“Tree of Thought”: {
complexity: “Advanced”,
color: “#ef4444”,
description:
“Multiple reasoning branches are explored simultaneously. The AI evaluates and prunes weak paths — best for complex decisions.”,
icon: “🌳”,
},
ReAct: {
complexity: “Advanced”,
color: “#ef4444”,
description:
“Combines Reasoning + Acting. The AI alternates between thinking and taking external actions (search, tool use) in a loop.”,
icon: “⚙️”,
},
“Role Prompting”: {
complexity: “Beginner”,
color: “#22c55e”,
description:
“Assign the AI a specific expert persona before the task. Dramatically shapes tone, depth, and domain expertise.”,
icon: “🎭”,
},
“Self-Consistency”: {
complexity: “Intermediate”,
color: “#f59e0b”,
description:
“Run the same prompt multiple times with varied reasoning, then select the most consistent or frequent answer.”,
icon: “🔄”,
},
“Generated Knowledge”: {
complexity: “Intermediate”,
color: “#f59e0b”,
description:
“Ask the AI to generate relevant facts or context FIRST, then use that knowledge to answer the main question.”,
icon: “💡”,
},
“Least-to-Most”: {
complexity: “Intermediate”,
color: “#f59e0b”,
description:
“Decompose a hard problem into sub-problems, solve the simplest first, then use those answers to tackle harder ones.”,
icon: “🪜”,
},
};

// ─── Default field values for each prompt type ────────────────────────────────

const DEFAULT_PROMPTS = {
“Zero-Shot”: {
Task: “Summarize the article about renewable energy trends”,
Constraints: “Keep it under 200 words, use plain language”,
Format: “Return as 3 concise bullet points”,
},
“Few-Shot”: {
“Example 1 Input”: “Review: ‘Great product, love it!’”,
“Example 1 Output”: “Sentiment: Positive”,
“Example 2 Input”: “Review: ‘Terrible, broke in a week.’”,
“Example 2 Output”: “Sentiment: Negative”,
“Example 3 Input”: “Review: ‘Decent but shipping was slow.’”,
“Example 3 Output”: “Sentiment: Mixed”,
“Your Input”: “Review: ‘Works perfectly, very happy with the purchase.’”,
Task: “Classify the sentiment of the input above using the examples as reference”,
},
“Chain of Thought”: {
Problem:
“A store has 48 apples. They sell 1/3 in the morning and 12 more in the afternoon. How many remain?”,
Instruction: “Think step by step before giving your final answer”,
“Show Reasoning”: “Yes — write out each calculation clearly”,
“Final Answer Format”: “State the answer in the last line”,
},
“Prompt Chaining”: {
“Step 1 — Summarize”:
“Summarize this 10-page report into 5 bullet points: [paste report here]”,
“Step 2 — Analyze”:
“Based on those 5 bullet points, identify the top 3 risks”,
“Step 3 — Draft”:
“Write an executive summary paragraph using the risks identified”,
“Step 4 — Format”:
“Create 3 slide titles for a presentation based on the executive summary”,
Note: “Feed the output of each step as input to the next”,
},
“Tree of Thought”: {
Problem: “Find the best go-to-market strategy for a B2B SaaS product targeting mid-size banks”,
Instruction:
“Imagine 3 expert strategists each share one step of their thinking, then continue to the next step. If any expert finds a flaw in their reasoning, they drop out.”,
“Expert 1 Lens”: “Growth hacking and viral adoption”,
“Expert 2 Lens”: “Enterprise sales and compliance”,
“Expert 3 Lens”: “Product-led growth and freemium”,
“Evaluation Criteria”: “Fastest path to 10 paying customers”,
},
ReAct: {
Goal: “Research the current best practices for migrating PySpark workloads to Amazon EKS”,
“Thought 1”: “I need to identify current EKS-compatible Spark operators”,
“Action 1”: “Search: ‘Amazon EKS Spark operator 2025 best practices’”,
“Observation 1”: “[Insert search result here]”,
“Thought 2”: “Now I need cost optimization strategies”,
“Action 2”: “Search: ‘PySpark EKS spot instances cost optimization’”,
“Observation 2”: “[Insert search result here]”,
“Final Answer”: “Synthesize findings into a migration recommendation”,
},
“Role Prompting”: {
Persona:
“You are a senior AWS cloud architect with 10 years of EKS and data engineering experience”,
Tone: “Technical but accessible — write for an engineering lead audience”,
Task: “Review the following migration plan and identify the top 3 risks”,
Context: “The team is migrating from EC2-based PySpark to Amazon EKS”,
Constraints: “Focus on operational risk, not cost”,
“Output Format”: “Numbered list with a brief mitigation for each risk”,
},
“Self-Consistency”: {
Problem:
“What is the best database for a real-time analytics platform with 50M daily events?”,
Instruction:
“Answer this question 3 times independently, each time using a different reasoning approach”,
“Run 1 Approach”: “Focus on query performance and latency”,
“Run 2 Approach”: “Focus on cost and scalability”,
“Run 3 Approach”: “Focus on operational simplicity and team familiarity”,
“Final Step”: “Compare the 3 answers and recommend the most consistent choice”,
},
“Generated Knowledge”: {
“Step 1 — Generate Facts”:
“List 5 key facts about Coronary Artery Calcium (CAC) scoring methodology and what each score range means clinically”,
“Step 2 — Apply Knowledge”:
“Based on those facts, explain how a radiologist would interpret a CAC score of 150 for a 55-year-old male with no symptoms”,
“Step 3 — Recommendation”:
“What lifestyle or clinical follow-up steps are typically recommended at this score level?”,
Note: “Complete Step 1 fully before proceeding to Step 2”,
},
“Least-to-Most”: {
“Complex Goal”:
“Determine whether a Virginia DPOR complaint filed in January 2025 would be resolved before year-end”,
“Sub-problem 1 (Simplest)”:
“What are the stages of the Virginia DPOR complaint process?”,
“Sub-problem 2”:
“What is the typical duration for each stage?”,
“Sub-problem 3”:
“What factors can extend or shorten the timeline?”,
“Sub-problem 4 (Hardest)”:
“Given a January 2025 filing date and average timelines, project a likely resolution date”,
Note: “Solve each sub-problem in order before attempting the next”,
},
};

// ─── Complexity badge colors ──────────────────────────────────────────────────

const COMPLEXITY_STYLES = {
Beginner: { bg: “#dcfce7”, text: “#15803d” },
Intermediate: { bg: “#fef9c3”, text: “#a16207” },
Advanced: { bg: “#fee2e2”, text: “#b91c1c” },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PromptGenerator() {
const [promptType, setPromptType] = useState(“Zero-Shot”);
const [fields, setFields] = useState(DEFAULT_PROMPTS[“Zero-Shot”]);
const [generatedPrompt, setGeneratedPrompt] = useState(””);
const [copied, setCopied] = useState(false);
const [activeTab, setActiveTab] = useState(“builder”); // “builder” | “preview”

// Load saved state
useEffect(() => {
try {
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
const parsed = JSON.parse(saved);
if (parsed.promptType && DEFAULT_PROMPTS[parsed.promptType]) {
setPromptType(parsed.promptType);
setFields(parsed.fields || DEFAULT_PROMPTS[parsed.promptType]);
}
}
} catch (_) {}
}, []);

// Persist state
useEffect(() => {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify({ promptType, fields }));
} catch (_) {}
}, [promptType, fields]);

// Build prompt text
useEffect(() => {
const text = Object.entries(fields)
.map(([k, v]) => `[${k}]\n${v}`)
.join(”\n\n”);
setGeneratedPrompt(text);
}, [fields]);

const handleTypeChange = useCallback((type) => {
setPromptType(type);
setFields(DEFAULT_PROMPTS[type]);
}, []);

const handleFieldChange = useCallback((key, value) => {
setFields((prev) => ({ …prev, [key]: value }));
}, []);

const handleCopy = async () => {
await navigator.clipboard.writeText(generatedPrompt);
setCopied(true);
setTimeout(() => setCopied(false), 1800);
};

const handleReset = () => setFields(DEFAULT_PROMPTS[promptType]);

const handleDownload = () => {
const blob = new Blob([generatedPrompt], { type: “text/plain” });
const url = URL.createObjectURL(blob);
const a = document.createElement(“a”);
a.href = url;
a.download = `prompt-${promptType.toLowerCase().replace(/ /g, "-")}.txt`;
a.click();
URL.revokeObjectURL(url);
};

const meta = PROMPT_META[promptType];
const complexStyle = COMPLEXITY_STYLES[meta.complexity];
const fieldCount = Object.keys(fields).length;
const charCount = generatedPrompt.length;

return (
<div style={styles.root}>
{/* ── Header ── */}
<div style={styles.header}>
<div style={styles.headerLeft}>
<span style={styles.logo}>✦</span>
<div>
<h1 style={styles.title}>Prompt Engineer</h1>
<p style={styles.subtitle}>10 techniques · structured builder</p>
</div>
</div>
<div style={styles.stats}>
<span style={styles.stat}>{fieldCount} fields</span>
<span style={styles.statDivider}>·</span>
<span style={styles.stat}>{charCount} chars</span>
</div>
</div>

```
  {/* ── Technique Selector ── */}
  <div style={styles.selectorSection}>
    <p style={styles.selectorLabel}>SELECT TECHNIQUE</p>
    <div style={styles.selectorGrid}>
      {PROMPT_TYPES.map((type) => {
        const m = PROMPT_META[type];
        const isActive = promptType === type;
        return (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            style={{
              ...styles.typeBtn,
              ...(isActive ? styles.typeBtnActive : {}),
              borderColor: isActive ? m.color : "transparent",
              background: isActive ? `${m.color}18` : "#1a1a2e",
            }}
          >
            <span style={styles.typeBtnIcon}>{m.icon}</span>
            <span style={styles.typeBtnLabel}>{type}</span>
            <span
              style={{
                ...styles.complexBadge,
                background: isActive ? complexStyle.bg : "#2a2a40",
                color: isActive ? complexStyle.text : "#888",
              }}
            >
              {m.complexity}
            </span>
          </button>
        );
      })}
    </div>
  </div>

  {/* ── Technique Info Card ── */}
  <div style={{ ...styles.infoCard, borderColor: `${meta.color}40` }}>
    <div style={styles.infoCardHeader}>
      <span style={{ ...styles.infoIcon, background: `${meta.color}20`, color: meta.color }}>
        {meta.icon}
      </span>
      <div style={styles.infoCardTitles}>
        <span style={{ ...styles.infoCardName, color: meta.color }}>{promptType}</span>
        <span
          style={{
            ...styles.infoComplexBadge,
            background: complexStyle.bg,
            color: complexStyle.text,
          }}
        >
          {meta.complexity}
        </span>
      </div>
    </div>
    <p style={styles.infoDesc}>{meta.description}</p>
  </div>

  {/* ── Tabs ── */}
  <div style={styles.tabBar}>
    {["builder", "preview"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        style={{
          ...styles.tab,
          ...(activeTab === tab ? styles.tabActive : {}),
        }}
      >
        {tab === "builder" ? "⚒ Builder" : "👁 Preview"}
      </button>
    ))}
  </div>

  {/* ── Builder Tab ── */}
  {activeTab === "builder" && (
    <div style={styles.fields}>
      {Object.entries(fields).map(([key, value]) => (
        <div key={key} style={styles.fieldRow}>
          <label style={styles.fieldLabel}>{key}</label>
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            rows={value.length > 80 ? 3 : 2}
            style={styles.fieldInput}
          />
        </div>
      ))}
    </div>
  )}

  {/* ── Preview Tab ── */}
  {activeTab === "preview" && (
    <div style={styles.previewBox}>
      <pre style={styles.previewText}>{generatedPrompt}</pre>
    </div>
  )}

  {/* ── Actions ── */}
  <div style={styles.actions}>
    <button onClick={handleCopy} style={{ ...styles.actionBtn, ...styles.actionBtnPrimary }}>
      {copied ? "✓ Copied!" : "⧉ Copy Prompt"}
    </button>
    <button onClick={handleDownload} style={styles.actionBtn}>
      ↓ Download .txt
    </button>
    <button onClick={handleReset} style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}>
      ↺ Reset
    </button>
  </div>

  {/* ── Technique Reference ── */}
  <details style={styles.referenceDetails}>
    <summary style={styles.referenceSummary}>📖 All Techniques Quick Reference</summary>
    <div style={styles.referenceGrid}>
      {PROMPT_TYPES.map((type) => {
        const m = PROMPT_META[type];
        const cs = COMPLEXITY_STYLES[m.complexity];
        return (
          <div key={type} style={{ ...styles.refCard, borderColor: `${m.color}30` }}>
            <div style={styles.refCardHeader}>
              <span style={styles.refIcon}>{m.icon}</span>
              <span style={{ ...styles.refName, color: m.color }}>{type}</span>
              <span style={{ ...styles.refBadge, background: cs.bg, color: cs.text }}>
                {m.complexity}
              </span>
            </div>
            <p style={styles.refDesc}>{m.description}</p>
            <button
              onClick={() => {
                handleTypeChange(type);
                setActiveTab("builder");
              }}
              style={{ ...styles.refBtn, color: m.color, borderColor: `${m.color}40` }}
            >
              Use this →
            </button>
          </div>
        );
      })}
    </div>
  </details>
</div>
```

);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
root: {
fontFamily: “‘DM Mono’, ‘Fira Code’, ‘Courier New’, monospace”,
background: “#0d0d1a”,
minHeight: “100vh”,
color: “#e2e2f0”,
padding: “24px 20px 48px”,
maxWidth: 860,
margin: “0 auto”,
},
header: {
display: “flex”,
alignItems: “center”,
justifyContent: “space-between”,
marginBottom: 28,
paddingBottom: 20,
borderBottom: “1px solid #1e1e35”,
},
headerLeft: {
display: “flex”,
alignItems: “center”,
gap: 14,
},
logo: {
fontSize: 28,
color: “#818cf8”,
lineHeight: 1,
},
title: {
margin: 0,
fontSize: 22,
fontWeight: 700,
letterSpacing: “-0.5px”,
color: “#f1f1ff”,
},
subtitle: {
margin: “2px 0 0”,
fontSize: 11,
color: “#555577”,
letterSpacing: “0.05em”,
textTransform: “uppercase”,
},
stats: {
display: “flex”,
alignItems: “center”,
gap: 6,
},
stat: {
fontSize: 12,
color: “#555577”,
fontFamily: “inherit”,
},
statDivider: {
color: “#333355”,
fontSize: 12,
},
selectorSection: {
marginBottom: 20,
},
selectorLabel: {
fontSize: 10,
letterSpacing: “0.12em”,
color: “#444466”,
margin: “0 0 10px”,
},
selectorGrid: {
display: “grid”,
gridTemplateColumns: “repeat(auto-fill, minmax(160px, 1fr))”,
gap: 8,
},
typeBtn: {
display: “flex”,
alignItems: “center”,
gap: 7,
padding: “9px 12px”,
borderRadius: 8,
border: “1.5px solid transparent”,
cursor: “pointer”,
transition: “all 0.15s ease”,
textAlign: “left”,
flexWrap: “wrap”,
},
typeBtnActive: {
boxShadow: “0 0 0 1px rgba(130,130,255,0.15), 0 2px 12px rgba(0,0,0,0.4)”,
},
typeBtnIcon: {
fontSize: 14,
flexShrink: 0,
},
typeBtnLabel: {
fontSize: 12,
fontWeight: 600,
color: “#d0d0f0”,
flex: 1,
whiteSpace: “nowrap”,
},
complexBadge: {
fontSize: 9,
fontWeight: 700,
padding: “2px 6px”,
borderRadius: 20,
letterSpacing: “0.04em”,
textTransform: “uppercase”,
whiteSpace: “nowrap”,
},
infoCard: {
background: “#13132a”,
border: “1px solid”,
borderRadius: 10,
padding: “14px 16px”,
marginBottom: 18,
},
infoCardHeader: {
display: “flex”,
alignItems: “center”,
gap: 10,
marginBottom: 8,
},
infoIcon: {
width: 34,
height: 34,
borderRadius: 8,
display: “flex”,
alignItems: “center”,
justifyContent: “center”,
fontSize: 16,
flexShrink: 0,
},
infoCardTitles: {
display: “flex”,
alignItems: “center”,
gap: 8,
},
infoCardName: {
fontSize: 15,
fontWeight: 700,
letterSpacing: “-0.3px”,
},
infoComplexBadge: {
fontSize: 10,
fontWeight: 700,
padding: “2px 8px”,
borderRadius: 20,
letterSpacing: “0.05em”,
textTransform: “uppercase”,
},
infoDesc: {
margin: 0,
fontSize: 13,
color: “#9090bb”,
lineHeight: 1.6,
},
tabBar: {
display: “flex”,
gap: 4,
marginBottom: 16,
borderBottom: “1px solid #1a1a30”,
paddingBottom: 0,
},
tab: {
padding: “8px 16px”,
background: “transparent”,
border: “none”,
borderBottom: “2px solid transparent”,
color: “#555577”,
cursor: “pointer”,
fontSize: 12,
fontFamily: “inherit”,
fontWeight: 600,
letterSpacing: “0.03em”,
marginBottom: -1,
transition: “all 0.15s”,
},
tabActive: {
color: “#818cf8”,
borderBottomColor: “#818cf8”,
},
fields: {
display: “flex”,
flexDirection: “column”,
gap: 12,
marginBottom: 16,
},
fieldRow: {
display: “flex”,
flexDirection: “column”,
gap: 5,
},
fieldLabel: {
fontSize: 11,
fontWeight: 700,
color: “#6060a0”,
letterSpacing: “0.08em”,
textTransform: “uppercase”,
},
fieldInput: {
width: “100%”,
padding: “9px 12px”,
borderRadius: 7,
border: “1px solid #1e1e38”,
background: “#111128”,
color: “#d8d8f8”,
fontSize: 13,
fontFamily: “inherit”,
lineHeight: 1.5,
resize: “vertical”,
outline: “none”,
boxSizing: “border-box”,
transition: “border-color 0.15s”,
},
previewBox: {
background: “#0a0a18”,
border: “1px solid #1a1a30”,
borderRadius: 8,
padding: “16px”,
marginBottom: 16,
maxHeight: 420,
overflowY: “auto”,
},
previewText: {
margin: 0,
fontSize: 12,
color: “#a0a0cc”,
lineHeight: 1.7,
fontFamily: “inherit”,
whiteSpace: “pre-wrap”,
wordBreak: “break-word”,
},
actions: {
display: “flex”,
gap: 8,
flexWrap: “wrap”,
marginBottom: 28,
},
actionBtn: {
padding: “9px 16px”,
borderRadius: 7,
border: “1px solid #2a2a45”,
background: “#16162a”,
color: “#9090cc”,
fontSize: 12,
fontFamily: “inherit”,
fontWeight: 600,
cursor: “pointer”,
letterSpacing: “0.03em”,
transition: “all 0.15s”,
},
actionBtnPrimary: {
background: “#1e1e4a”,
border: “1px solid #3a3a70”,
color: “#818cf8”,
},
actionBtnDanger: {
color: “#f87171”,
borderColor: “#3a2020”,
},
referenceDetails: {
background: “#0f0f22”,
border: “1px solid #1a1a30”,
borderRadius: 10,
padding: “0”,
overflow: “hidden”,
},
referenceSummary: {
padding: “13px 16px”,
cursor: “pointer”,
fontSize: 12,
fontWeight: 700,
color: “#6060a0”,
letterSpacing: “0.06em”,
textTransform: “uppercase”,
listStyle: “none”,
userSelect: “none”,
},
referenceGrid: {
display: “grid”,
gridTemplateColumns: “repeat(auto-fill, minmax(240px, 1fr))”,
gap: 10,
padding: “4px 14px 16px”,
},
refCard: {
background: “#12122a”,
border: “1px solid”,
borderRadius: 8,
padding: “12px 14px”,
display: “flex”,
flexDirection: “column”,
gap: 6,
},
refCardHeader: {
display: “flex”,
alignItems: “center”,
gap: 7,
},
refIcon: {
fontSize: 14,
},
refName: {
fontSize: 12,
fontWeight: 700,
flex: 1,
},
refBadge: {
fontSize: 9,
fontWeight: 700,
padding: “2px 6px”,
borderRadius: 20,
letterSpacing: “0.04em”,
textTransform: “uppercase”,
},
refDesc: {
margin: 0,
fontSize: 11,
color: “#666688”,
lineHeight: 1.5,
},
refBtn: {
background: “transparent”,
border: “1px solid”,
borderRadius: 5,
padding: “4px 10px”,
fontSize: 11,
fontFamily: “inherit”,
fontWeight: 600,
cursor: “pointer”,
marginTop: 2,
alignSelf: “flex-start”,
},
};
