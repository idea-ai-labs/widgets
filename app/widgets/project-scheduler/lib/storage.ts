import { Project } from "./types";

const KEY = "projects_v1";

export function load(): Project[] {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function save(data: Project[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
