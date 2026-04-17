export type DependencyType = "FS" | "SS" | "FF" | "SF";

export type TaskMode = "auto" | "manual";

export type Task = {
  id: number; // stable identifier (existing)
  displayNo: number; // row number for UI / parsing; you can derive this in UI
  name: string;
  duration: number;
  start?: string;
  finish?: string;
  predecessors?: string; // e.g., "2FS+3d,3FF-2h"
  percent: number;
  mode: TaskMode;
  parentId?: number | null;
  collapsed?: boolean;
};

export type Project = {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: number;
};
