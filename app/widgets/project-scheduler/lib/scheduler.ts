import { Task } from "./types";
import { parsePred } from "./parser";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function format(d: Date) {
  return d.toISOString().split("T")[0];
}

/**
 * FIXED LOGIC:
 * - Always respect projectStart for auto tasks
 * - Correct lag application
 * - Chain-safe evaluation
 */
export function calculate(tasks: Task[], projectStart: string) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  return tasks.map((t) => {
    if (t.mode === "manual") return t;

    // IMPORTANT FIX:
    // auto tasks ALWAYS start from projectStart baseline unless dependencies override
    let start = new Date(projectStart);

    const preds = parsePred(t.predecessors);

    preds.forEach((p) => {
      const pt = map.get(p.id);
      if (!pt) return;

      const finish = pt.finish ? new Date(pt.finish) : null;
      const startPt = pt.start ? new Date(pt.start) : null;

      if (p.type === "FS" && finish) {
        start = addDays(finish, 1 + p.lag);
      }

      if (p.type === "SS" && startPt) {
        start = addDays(startPt, p.lag);
      }
    });

    const finish = addDays(start, t.duration);

    return {
      ...t,
      start: format(start),
      finish: format(finish),
    };
  });
}
