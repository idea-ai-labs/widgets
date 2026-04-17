import { Task } from "./types";
import { parsePred } from "./parser";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* ✅ UPDATED: Human-readable date format */
function format(d: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  };

  return d.toLocaleDateString("en-US", options);
}

export function calculate(tasks: Task[], projectStart: string) {
  return tasks.map((task, index) => {
    if (task.mode === "manual") return task;

    let start = new Date(projectStart);

    const preds = parsePred(task.predecessors);

    preds.forEach((p) => {
      const refTask = tasks[p.taskNo - 1]; // uses display order
      if (!refTask) return;

      const finish = refTask.finish ? new Date(refTask.finish) : null;
      const startPt = refTask.start ? new Date(refTask.start) : null;

      if (p.type === "FS" && finish) {
        start = addDays(finish, 1 + p.lag);
      }

      if (p.type === "SS" && startPt) {
        start = addDays(startPt, p.lag);
      }
    });

    const finish = addDays(start, task.duration);

    return {
      ...task,
      start: format(start),
      finish: format(finish),
    };
  });
}