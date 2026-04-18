export type Task = {
  id: number;
  name: string;
  duration: number;
  start?: string;
  finish?: string;
  predecessors?: string;
  percent: number;
  mode: "auto" | "manual";
  parentId?: number | null;
  collapsed?: boolean;
};

export type Project = {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: number;
};
