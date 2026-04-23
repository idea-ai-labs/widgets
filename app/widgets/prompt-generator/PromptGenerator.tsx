"use client";

import { useCallback, useEffect, useState, useMemo } from "react";

// --- 1. THEME DEFINITIONS ---
export const lightTheme = {
  background: "#f5f5f7",
  card: "#ffffff",
  elevated: "#ffffff",
  border: "rgba(0,0,0,0.08)",
  text: "#1d1d1f",
  subtext: "rgba(60,60,67,0.6)",
  shadow: "0 6px 18px rgba(0,0,0,0.06)",
  blur: "rgba(255,255,255,0.7)",
};

export const darkTheme = {
  background: "#0d0d1a",
  card: "#13132a",
  elevated: "#1a1a2e",
  border: "rgba(255,255,255,0.08)",
  text: "#e2e2f0",
  subtext: "#6060a0",
  shadow: "0 10px 30px rgba(0,0,0,0.4)",
  blur: "rgba(19,19,42,0.8)",
};

type AppTheme = typeof lightTheme;

// --- 2. TYPES & CONSTANTS ---
type PromptType =
  | "Zero-Shot" | "Few-Shot" | "Chain of Thought" | "Prompt Chaining"
  | "Tree of Thought" | "ReAct" | "Role Prompting" | "Self-Consistency"
  | "Generated Knowledge" | "Least-to-Most";

type Complexity = "Beginner" | "Intermediate" | "Advanced";

type PromptMeta = { complexity: Complexity; color: string; description: string; icon: string; };
type PromptFields = Record<string, string>;

interface StorageData {
  promptType: PromptType;
  fields: PromptFields;
}

const PROMPT_TYPES: PromptType[] = [
  "Zero-Shot", "Few-Shot", "Chain of Thought", "Prompt Chaining",
  "Tree of Thought", "ReAct", "Role Prompting", "Self-Consistency",
  "Generated Knowledge", "Least-to-Most",
];

const STORAGE_KEY = "prompt-generator-v2";
const THEME_KEY = "prompt-generator-theme";

const PROMPT_META: Record<PromptType, PromptMeta> = {
  "Zero-Shot": { complexity: "Beginner", color: "#22c55e", description: "Give the AI a task with no examples — just a clear, direct instruction. Best for simple, well-defined tasks.", icon: "⚡" },
  "Few-Shot": { complexity: "Beginner", color: "#22c55e", description: "Provide 2–5 input/output examples before your request so the AI learns your pattern, tone, and format.", icon: "📋" },
  "Chain of Thought": { complexity: "Intermediate", color: "#f59e0b", description: 'Force the AI to show its reasoning step-by-step before answering. Add "think step by step" to boost accuracy.', icon: "🔗" },
  "Prompt Chaining": { complexity: "Intermediate", color: "#f59e0b", description: "Feed one prompt’s output as the next prompt’s input — building a pipeline of connected tasks.", icon: "⛓️" },
  "Tree of Thought": { complexity: "Advanced", color: "#ef4444", description: "Multiple reasoning branches are explored simultaneously. The AI evaluates and prunes weak paths.", icon: "🌳" },
  ReAct: { complexity: "Advanced", color: "#ef4444", description: "Combines Reasoning + Acting. The AI alternates between thinking and taking external actions in a loop.", icon: "⚙️" },
  "Role Prompting": { complexity: "Beginner", color: "#22c55e", description: "Assign the AI a specific expert persona before the task. Dramatically shapes tone, depth, and expertise.", icon: "🎭" },
  "Self-Consistency": { complexity: "Intermediate", color: "#f59e0b", description: "Run the same prompt multiple times with varied reasoning, then select the most consistent answer.", icon: "🔄" },
  "Generated Knowledge": { complexity: "Intermediate", color: "#f59e0b", description: "Ask the AI to generate relevant facts FIRST, then use that knowledge to answer the main question.", icon: "💡" },
  "Least-to-Most": { complexity: "Intermediate", color: "#f59e0b", description: "Decompose a hard problem into sub-problems, solve the simplest first, then use those to tackle harder ones.", icon: "🪜" },
};

const DEFAULT_PROMPTS: Record<PromptType, PromptFields> = {
  "Zero-Shot": { Task: "Summarize the article...", Constraints: "Keep it under 200 words", Format: "3 bullet points" },
  "Few-Shot": { "Example 1 Input": "Review: 'Great!'", "Example 1 Output": "Positive", "Your Input": "Review: 'Works perfectly'", Task: "Classify sentiment" },
  "Chain of Thought": { Problem: "Math logic...", Instruction: "Think step by step", "Show Reasoning": "Yes" },
  "Prompt Chaining": { "Step 1": "Summarize", "Step 2": "Analyze", "Step 3": "Draft", "Step 4": "Format" },
  "Tree of Thought": { Problem: "GTM Strategy", "Expert 1 Lens": "Growth", "Expert 2 Lens": "Sales", "Expert 3 Lens": "PLG" },
  ReAct: { Goal: "EKS Migration Research", "Thought 1": "Check operators", "Action 1": "Search", "Observation 1": "..." },
  "Role Prompting": { Persona: "AWS Architect", Task: "Review plan", Tone: "Technical", Context: "Migration" },
  "Self-Consistency": { Problem: "Database choice", "Run 1": "Latency focus", "Run 2": "Cost focus", "Run 3": "Simplicity focus" },
  "Generated Knowledge": { "Step 1": "Generate Facts", "Step 2": "Apply Knowledge", "Step 3": "Recommendation" },
  "Least-to-Most": { "Complex Goal": "Legal resolution", "Sub-problem 1": "Stages", "Sub-problem 2": "Duration" },
};

const COMPLEXITY_STYLES: Record<Complexity, { bg: string; text: string }> = {
  Beginner: { bg: "#dcfce7", text: "#15803d" },
  Intermediate: { bg: "#fef9c3", text: "#a16207" },
  Advanced: { bg: "#fee2e2", text: "#b91c1c" },
};

export default function PromptGenerator() {
  const [isDark, setIsDark] = useState(true);
  const [promptType, setPromptType] = useState<PromptType>("Zero-Shot");
  const [fields, setFields] = useState<PromptFields>(() => ({ ...DEFAULT_PROMPTS["Zero-Shot"] }));
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");

  const theme = isDark ? darkTheme : lightTheme;
  const styles = useMemo(() => getStyles(theme), [isDark]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) setIsDark(savedTheme === "dark");
    else setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as Partial<StorageData>;
        if (parsed.promptType && DEFAULT_PROMPTS[parsed.promptType]) {
          setPromptType(parsed.promptType);
          setFields(parsed.fields || DEFAULT_PROMPTS[parsed.promptType]);
        }
      } catch (e) { console.error("Load failed", e); }
    }
  }, []);

  useEffect(() => { localStorage.setItem(THEME_KEY, isDark ? "dark" : "light"); }, [isDark]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ promptType, fields })); }, [promptType, fields]);

  useEffect(() => {
    const text = Object.entries(fields).map(([k, v]) => `[${k}]\n${v}`).join("\n\n");
    setGeneratedPrompt(text);
  }, [fields]);

  const handleTypeChange = (type: PromptType) => {
    setPromptType(type);
    setFields({ ...DEFAULT_PROMPTS[type] });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) { console.error(err); }
  };

  const meta = PROMPT_META[promptType];
  const complexStyle = COMPLEXITY_STYLES[meta.complexity];

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>✦</span>
          <div>
            <h1 style={styles.title}>Prompt Engineer</h1>
            <p style={styles.subtitle}>10 techniques · structured builder</p>
          </div>
        </div>
        <button onClick={() => setIsDark(!isDark)} style={styles.themeToggle}>
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <div style={styles.section}>
        <p style={styles.label}>SELECT TECHNIQUE</p>
        <div style={styles.selectorGrid}>
          {PROMPT_TYPES.map((type) => {
            const isActive = promptType === type;
            const m = PROMPT_META[type];
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                style={{
                  ...styles.typeBtn,
                  borderColor: isActive ? m.color : theme.border,
                  background: isActive ? `${m.color}15` : theme.elevated,
                }}
              >
                <span style={{ fontSize: "14px" }}>{m.icon}</span>
                <span style={{ flex: 1, fontSize: "12px", fontWeight: 600 }}>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...styles.infoCard, borderColor: `${meta.color}40` }}>
        <div style={styles.infoCardHeader}>
          <span style={{ ...styles.infoIcon, background: `${meta.color}20`, color: meta.color }}>{meta.icon}</span>
          <span style={{ fontWeight: 700, fontSize: "16px", color: meta.color }}>{promptType}</span>
          <span style={{ ...styles.badge, background: complexStyle.bg, color: complexStyle.text }}>{meta.complexity}</span>
        </div>
        <p style={styles.infoDesc}>{meta.description}</p>
      </div>

      <div style={styles.tabBar}>
        <button onClick={() => setActiveTab("builder")} style={{ ...styles.tab, ...(activeTab === "builder" ? styles.tabActive : {}) }}>⚒ Builder</button>
        <button onClick={() => setActiveTab("preview")} style={{ ...styles.tab, ...(activeTab === "preview" ? styles.tabActive : {}) }}>👁 Preview</button>
      </div>

      <div style={styles.mainArea}>
        {activeTab === "builder" ? (
          <div style={styles.fieldsList}>
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={styles.fieldLabel}>{key}</label>
                <textarea
                  value={value}
                  onChange={(e) => setFields(prev => ({ ...prev, [key]: e.target.value }))}
                  style={styles.textarea}
                  rows={3}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: 1.7 }}>{generatedPrompt}</div>
        )}
      </div>

      <div style={styles.actions}>
        <button onClick={handleCopy} style={styles.primaryBtn}>{copied ? "✓ Copied!" : "⧉ Copy Prompt"}</button>
        <button onClick={() => setFields({ ...DEFAULT_PROMPTS[promptType] })} style={styles.secondaryBtn}>↺ Reset</button>
      </div>

      {/* --- QUICK REFERENCE SECTION --- */}
      <details style={styles.referenceDetails}>
        <summary style={styles.referenceSummary}>📖 All Techniques Quick Reference</summary>
        <div style={styles.referenceGrid}>
          {PROMPT_TYPES.map((type) => {
            const m = PROMPT_META[type];
            const cs = COMPLEXITY_STYLES[m.complexity];
            return (
              <div key={type} style={{ ...styles.refCard, borderColor: `${m.color}30` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px" }}>{m.icon}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, flex: 1, color: m.color }}>{type}</span>
                  <span style={{ ...styles.badge, background: cs.bg, color: cs.text, fontSize: "8px" }}>{m.complexity}</span>
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: theme.subtext, lineHeight: 1.4 }}>{m.description}</p>
                <button
                  onClick={() => { handleTypeChange(type); setActiveTab("builder"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
  );
}

const getStyles = (theme: AppTheme): Record<string, React.CSSProperties> => ({
  root: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: theme.background, color: theme.text, minHeight: "100vh",
    padding: "40px 20px", maxWidth: "860px", margin: "0 auto", transition: "all 0.4s ease",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", paddingBottom: "20px", borderBottom: `1px solid ${theme.border}` },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  logo: { fontSize: "28px", color: "#818cf8" },
  title: { fontSize: "22px", margin: 0, fontWeight: 700 },
  subtitle: { fontSize: "11px", color: theme.subtext, margin: 0, textTransform: "uppercase" },
  themeToggle: { padding: "8px 14px", borderRadius: "10px", border: `1px solid ${theme.border}`, background: theme.elevated, color: theme.text, cursor: "pointer", fontSize: "12px", fontWeight: 600, boxShadow: theme.shadow },
  section: { marginBottom: "24px" },
  label: { fontSize: "10px", fontWeight: 800, color: theme.subtext, marginBottom: "12px", letterSpacing: "0.1em" },
  selectorGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" },
  typeBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", border: "1px solid", cursor: "pointer", textAlign: "left", color: theme.text, transition: "all 0.2s ease" },
  infoCard: { background: theme.blur, backdropFilter: "blur(12px)", border: "1px solid", borderRadius: "16px", padding: "20px", marginBottom: "28px", boxShadow: theme.shadow },
  infoCardHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" },
  infoIcon: { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  badge: { fontSize: "9px", fontWeight: 800, padding: "2px 8px", borderRadius: "20px", textTransform: "uppercase" },
  infoDesc: { fontSize: "14px", color: theme.subtext, lineHeight: 1.6, margin: 0 },
  tabBar: { display: "flex", gap: "24px", borderBottom: `1px solid ${theme.border}`, marginBottom: "20px" },
  tab: { padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: theme.subtext, borderBottom: "2px solid transparent" },
  tabActive: { color: theme.text, borderBottomColor: theme.text },
  mainArea: { background: theme.card, borderRadius: "16px", border: `1px solid ${theme.border}`, padding: "24px", minHeight: "300px", boxShadow: theme.shadow },
  fieldsList: { display: "flex", flexDirection: "column", gap: "18px" },
  fieldLabel: { fontSize: "11px", fontWeight: 700, color: theme.subtext, textTransform: "uppercase" },
  textarea: { width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${theme.border}`, background: theme.background, color: theme.text, fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  actions: { display: "flex", gap: "12px", marginTop: "32px", marginBottom: "48px" },
  primaryBtn: { flex: 1, padding: "14px", borderRadius: "12px", border: "none", background: theme.text, color: theme.background, fontWeight: 700, cursor: "pointer" },
  secondaryBtn: { padding: "14px 24px", borderRadius: "12px", border: `1px solid ${theme.border}`, background: "transparent", color: theme.text, fontWeight: 600, cursor: "pointer" },
  referenceDetails: { background: theme.card, border: `1px solid ${theme.border}`, borderRadius: "12px", overflow: "hidden" },
  referenceSummary: { padding: "16px", cursor: "pointer", fontSize: "12px", fontWeight: 700, color: theme.subtext, textTransform: "uppercase", userSelect: "none" },
  referenceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px", padding: "0 16px 16px" },
  refCard: { background: theme.elevated, border: "1px solid", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" },
  refBtn: { background: "transparent", border: "1px solid", borderRadius: "6px", padding: "6px 10px", fontSize: "11px", fontWeight: 600, cursor: "pointer", marginTop: "auto", alignSelf: "flex-start" },
});
