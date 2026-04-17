export type ParsedPred = {
  id: number;
  type: "FS" | "SS";
  lag: number;
};

export function parsePred(input?: string): ParsedPred[] {
  if (!input) return [];

  return input.split(",").map((raw) => {
    const item = raw.trim();

    const lagMatch = item.match(/\+(\d+)d/);
    const lag = lagMatch ? Number(lagMatch[1]) : 0;

    const cleaned = item.replace(/\+\d+d/, "").trim();

    const m = cleaned.match(/(\d+)(FS|SS)?/);

    if (!m) return null;

    return {
      id: Number(m[1]),
      type: (m[2] || "FS") as "FS" | "SS",
      lag,
    };
  }).filter(Boolean) as ParsedPred[];
}
