import { Task, TaskMode } from "./types";
import { DependencyType, parsePred } from "./parser";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function format(d: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  };

  return d.toLocaleDateString("en-US", options);
}

function maxDate(a: Date | null, b: Date | null) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

export function calculate(tasks: Task[], projectStart: string) {
  // Build map: displayNo → stable id (if displayNo exists)
  const idMapByDisplay = new Map<number, string>();
  tasks.forEach((task) => {
    const displayNo = task.displayNo ?? 0; // default to 0 if missing
    idMapByDisplay.set(displayNo, task.id);
  });

  return tasks.map((task) => {
    if (task.mode === "manual") return task;

    const preds = parsePred(task.predecessors, idMapByDisplay);
    let start = new Date(projectStart);
    let finish = addDays(start, task.duration);

    let requiredStart: Date | null = null;
    let requiredFinish: Date | null = null;

    preds.forEach((p) => {
      const refTask = tasks.find((t) => t.id === p.predecessorId);
      if (!refTask?.start || !refTask?.finish) return;

      const refStart = new Date(refTask.start);
      const refFinish = new Date(refTask.finish);

      const offsetDays = p.lag ?? 0;

      let candidateStart: Date | null = null;
      let candidateFinish: Date | null = null;

      switch (p.type) {
        case "FS":
          candidateStart = addDays(refFinish, 1 + offsetDays);
          requiredStart = maxDate(requiredStart, candidateStart);
          break;

        case "SS":
          candidateStart = addDays(refStart, offsetDays);
          requiredStart = maxDate(requiredStart, candidateStart);
          break;

        case "FF":
          candidateFinish = addDays(refFinish, offsetDays);
          requiredFinish = maxDate(requiredFinish, candidateFinish);
          break;

        case "SF":
          candidateFinish = addDays(refStart, offsetDays);
          requiredFinish = maxDate(requiredFinish, candidateFinish);
          break;
      }
    });

    if (requiredStart) {
      start = requiredStart;
      finish = addDays(start, task.duration);
    }

    if (requiredFinish) {
      finish = requiredFinish;
      start = addDays(finish, -task.duration);
    }

    return {
      ...task,
      start: format(start),
      finish: format(finish),
    };
  });
}
