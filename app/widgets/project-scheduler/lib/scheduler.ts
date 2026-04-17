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

export function calculate(tasks: Task[], projectStart: string) {
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  return tasks.map((task, index) => {
    if (task.mode === "manual") return task;

    let start = new Date(projectStart);

    const preds = parsePred(task.predecessors);

    preds.forEach((p) => {
      // convert display taskNo → actual task
      const refTask = tasks[p.taskNo - 1]; // IMPORTANT FIX
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