import { Task } from "./types";

export function indent(tasks: Task[], id: number): Task[] {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx <= 0) return tasks;

  const prev = tasks[idx - 1];

  return tasks.map((t) =>
    t.id === id ? { ...t, parentId: prev.id } : t
  );
}

export function outdent(tasks: Task[], id: number): Task[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, parentId: null } : t
  );
}
