"use client";
 
import { useCallback, useEffect, useState } from "react";

// --- THEME DEFINITIONS ---
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
  background: "#000000",
  card: "#1c1c1e",
  elevated: "#2c2c2e",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  subtext: "rgba(235,235,245,0.6)",
  shadow: "0 10px 30px rgba(0,0,0,0.4)",
  blur: "rgba(28,28,30,0.72)",
};

type ThemeType = typeof lightTheme;

// --- TYPES & CONSTANTS ---
type PromptType = "Zero-Shot" | "Few-Shot" | "Chain of Thought" | "Prompt Chaining" | "Tree of Thought" | "ReAct" | "Role Prompting" | "Self-Consistency" | "Generated Knowledge" | "Least-to-Most";
type Complexity = "Beginner" | "Intermediate" | "Advanced";
type PromptMeta = { complexity: Complexity; color: string; description: string; icon: string; };
type PromptFields = Record<string, string>;

const PROMPT_TYPES: PromptType[] = ["Zero-Shot", "Few-Shot", "Chain of Thought", "Prompt Chaining", "Tree of Thought", "ReAct", "Role Prompting", "Self-Consistency", "Generated Knowledge", "Least-to-Most"];
const STORAGE_KEY = "prompt-generator-v2";

const PROMPT_META: Record<PromptType, PromptMeta> = {
  "Zero-Shot": { complexity: "Beginner", color: "#22c55e", description: "Give the AI a task with no examples — just a clear, direct instruction.", icon: "⚡" },
  "Few-Shot": { complexity: "Beginner", color: "#22c55e", description: "Provide 2–5 input/output examples before your request.", icon: "📋" },
  "Chain of Thought": { complexity: "Intermediate", color: "#f59e0b", description: "Force the AI to show its reasoning step-by-step.", icon: "🔗" },
  "Prompt Chaining": { complexity: "Intermediate", color: "#f59e0b", description: "Feed one prompt’s output as the next prompt’s input.", icon: "⛓️" },
  "Tree of Thought": { complexity: "Advanced", color: "#ef4444", description: "Multiple reasoning branches are explored simultaneously.", icon: "🌳" },
  "ReAct": { complexity: "Advanced", color: "#ef4444", description: "Combines Reasoning + Acting in a loop.", icon: "⚙️" },
  "Role Prompting": { complexity: "Beginner", color: "#22c55e", description: "Assign the AI a specific expert persona before the task.", icon: "🎭" },
  "Self-Consistency": { complexity: "Intermediate", color: "#f59e0b", description: "Run the same prompt multiple times and select the most consistent answer.", icon: "🔄" },
  "Generated Knowledge": { complexity: "Intermediate", color: "#f59e0b", description: "Generate facts first, then use that knowledge to answer.", icon: "💡" },
  "Least-to-Most": { complexity: "Intermediate", color: "#f59e0b", description: "Decompose a hard problem into simpler sub-problems.", icon: "🪜" },
};

const DEFAULT_PROMPTS: Record<PromptType, PromptFields> = {
  "Zero-Shot": { Task: "Summarize the article...", Constraints: "Keep it under 200 words", Format: "3 bullet points" },
  "Few-Shot": { "Example 1 Input": "Review: 'Great!'", "Example 1 Output": "Positive", "Your Input": "Review: 'Works perfectly'", Task: "Classify sentiment" },
  "Chain of Thought": { Problem: "Math logic...", Instruction: "Think step by step", "Show Reasoning": "Yes" },
  "Prompt Chaining": { "Step 1": "Summarize...", "Step 2": "Analyze...", "Step 3": "Draft..." },
  "Tree of Thought": { Problem: "GTM Strategy...", "Expert 1 Lens": "Growth hacking", "Expert 2 Lens": "Enterprise sales" },
  "ReAct": { Goal: "Research Spark on EKS", "Thought 1": "Identify operators", "Action 1": "Search..." },
  "Role Prompting": { Persona: "Senior AWS Architect", Task: "Review migration plan", Tone: "Technical" },
  "Self-Consistency": { Problem: "Database choice...", Instruction: "Answer 3 times independently" },
  "Generated Knowledge": { "Step 1": "Generate Facts", "Step 2": "Apply Knowledge" },
  "Least-to-Most": { "Complex Goal": "Legal resolution timeline", "Sub-problem 1": "Stages of process" },
};

const emptyFields = (type: PromptType): PromptFields => ({ ...DEFAULT_PROMPTS[type] });

// --- MAIN COMPONENT ---
export default function PromptGenerator() {
  const [isDark, setIsDark] = useState(true);
  const [promptType, setPromptType] = useState<PromptType>("Zero-Shot");
  const [fields, setFields] = useState<PromptFields>(() => emptyFields("Zero-Shot"));
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");

  const theme = isDark ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.promptType) {
          setPromptType(parsed.promptType);
          setFields(parsed.fields || DEFAULT_PROMPTS[parsed.promptType]);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ promptType, fields }));
  }, [promptType, fields]);

  useEffect(() => {
    const text = Object.entries(fields).map(([k, v]) => `[${k}]\n${v}`).join("\n\n");
    setGeneratedPrompt(text);
  }, [fields]);

  const handleTypeChange = useCallback((type: PromptType) => {
    setPromptType(type);
    setFields(emptyFields(type));
  }, []);

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const meta = PROMPT_META[promptType];

  return (
    <div style={styles.root}>
      {/* Header & Theme Toggle */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>✦</span>
          <div>
            <h1 style={styles.title}>Prompt Engineer</h1>
            <p style={styles.subtitle}>Structure your logic</p>
          </div>
        </div>
        <button onClick={() => setIsDark(!isDark)} style={styles.themeToggle}>
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Technique Selector */}
      <div style={styles.selectorGrid}>
        {PROMPT_TYPES.map((type) => {
          const isActive = promptType === type;
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              style={{
                ...styles.typeBtn,
                borderColor: isActive ? meta.color : theme.border,
                background: isActive ? `${meta.color}15` : theme.card,
                color: theme.text
              }}
            >
              {PROMPT_META[type].icon} {type}
            </button>
          );
        })}
      </div>

      {/* Info Card */}
      <div style={{ ...styles.infoCard, borderColor: `${meta.color}40` }}>
        <h3 style={{ color: meta.color, margin: "0 0 4px 0" }}>{promptType}</h3>
        <p style={styles.infoDesc}>{meta.description}</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button onClick={() => setActiveTab("builder")} style={{...styles.tab, ...(activeTab === "builder" ? styles.tabActive : {})}}>Builder</button>
        <button onClick={() => setActiveTab("preview")} style={{...styles.tab, ...(activeTab === "preview" ? styles.tabActive : {})}}>Preview</button>
      </div>

      {/* Content */}
      <div style={styles.contentArea}>
        {activeTab === "builder" ? (
          <div style={styles.fields}>
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} style={styles.fieldRow}>
                <label style={styles.fieldLabel}>{key}</label>
                <textarea
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  style={styles.fieldInput}
                  rows={3}
                />
              </div>
            ))}
          </div>
        ) : (
          <pre style={styles.previewText}>{generatedPrompt}</pre>
        )}
      </div>

      <div style={styles.actions}>
        <button onClick={handleCopy} style={styles.copyBtn}>
          {copied ? "✓ Copied" : "Copy Prompt"}
        </button>
        <button onClick={() => setFields(emptyFields(promptType))} style={styles.resetBtn}>Reset</button>
      </div>
    </div>
  );
}

// --- DYNAMIC STYLES ---
const getStyles = (theme: ThemeType): Record<string, React.CSSProperties> => ({
  root: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: theme.background,
    color: theme.text,
    minHeight: "100vh",
    padding: "40px 20px",
    maxWidth: "800px",
    margin: "0 auto",
    transition: "background 0.3s ease, color 0.3s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { fontSize: "32px" },
  title: { fontSize: "24px", margin: 0, fontWeight: 700 },
  subtitle: { fontSize: "12px", color: theme.subtext, margin: 0, textTransform: "uppercase" },
  themeToggle: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: `1px solid ${theme.border}`,
    background: theme.elevated,
    color: theme.text,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
  },
  selectorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "8px",
    marginBottom: "24px",
  },
  typeBtn: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    transition: "all 0.2s",
  },
  infoCard: {
    background: theme.blur,
    backdropFilter: "blur(10px)",
    border: "1px solid",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: theme.shadow,
  },
  infoDesc: { fontSize: "14px", color: theme.subtext, lineHeight: 1.5 },
  tabBar: { display: "flex", gap: "20px", borderBottom: `1px solid ${theme.border}`, marginBottom: "20px" },
  tab: { padding: "10px 0", background: "none", border: "none", color: theme.subtext, cursor: "pointer", borderBottom: "2px solid transparent" },
  tabActive: { color: theme.text, borderBottomColor: theme.text, fontWeight: 600 },
  contentArea: { background: theme.card, borderRadius: "12px", padding: "20px", border: `1px solid ${theme.border}` },
  fieldRow: { marginBottom: "16px" },
  fieldLabel: { display: "block", fontSize: "11px", fontWeight: 700, color: theme.subtext, marginBottom: "6px", textTransform: "uppercase" },
  fieldInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${theme.border}`,
    background: theme.background,
    color: theme.text,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  previewText: { whiteSpace: "pre-wrap", fontSize: "14px", color: theme.text, margin: 0 },
  actions: { display: "flex", gap: "12px", marginTop: "24px" },
  copyBtn: { flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: theme.text, color: theme.background, fontWeight: 600, cursor: "pointer" },
  resetBtn: { padding: "12px 24px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: "transparent", color: theme.text, cursor: "pointer" },
});
