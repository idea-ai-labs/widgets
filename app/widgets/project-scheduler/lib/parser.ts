import { DependencyType } from "./types";

export type ParsedPred = {
  predecessorId: string; // stable id, not row number
  type: DependencyType;
  lag: number; // negative = lead, positive = lag
  lagUnit?: "m" | "h" | "d" | "w" | "mo" | "pct";
};

const DEP_TYPE_RE = /(FS|SS|FF|SF)/i;
const LAG_RE = /([+-])\s*(\d+(?:\.\d+)?)\s*(m|h|d|w|mo|%|pct)?/i;

function normalizeLagUnit(raw?: string): ParsedPred["lagUnit"] {
  if (!raw) return undefined;
  const v = raw.toLowerCase();
  if (v === "%") return "pct";
  if (v === "pct") return "pct";
  if (v === "m") return "m";
  if (v === "h") return "h";
  if (v === "d") return "d";
  if (v === "w") return "w";
  if (v === "mo") return "mo";
  return undefined;
}

export function parsePred(
  input?: string,
  idMapByDisplay: Map<number, string>
): ParsedPred[] {
  if (!input?.trim()) return [];

  return input
    .split(",")
    .map((raw) => {
      const item = raw.trim();
      if (!item) return null;

      const taskNoMatch = item.match(/^(\d+)/);
      if (!taskNoMatch) return null;

      const displayNo = Number(taskNoMatch[1]);
      const ancestorId = idMapByDisplay.get(displayNo);
      if (!ancestorId) return null;

      const typeMatch = item.match(DEP_TYPE_RE);
      const type = (typeMatch?.[1]?.toUpperCase() as DependencyType) || "FS";

      const lagMatch = item.match(LAG_RE);
      const lagSign = lagMatch?.[1] === "-" ? -1 : lagMatch?.[1] === "+" ? 1 : 0;
      const lagValue = lagMatch ? Number(lagMatch[2]) : 0;
      const lag = lagSign * lagValue;
      const lagUnit = normalizeLagUnit(lagMatch?.[3]);

      return {
        predecessorId: ancestorId,
        type,
        lag,
        ...(lagUnit ? { lagUnit } : {}),
      };
    })
    .filter((x): x is ParsedPred => Boolean(x));
}
