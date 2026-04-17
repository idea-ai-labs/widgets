"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type Task = {
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

type Project = {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: number;
};

/* ================= STORAGE ================= */

const STORAGE_KEY = "projects_v4";

/* ================= HELPERS ================= */

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function format(d: Date) {
  return d.toISOString().split("T")[0];
}

function parsePred(pred?: string) {
  if (!pred) return [];
  return pred.split(",").map((p) => {
    const m = p.match(/(\d+)(FS|SS)/);
    return m ? { id: Number(m[1]), type: m[2] } : null;
  }).filter(Boolean) as { id: number; type: string }[];
}

/* ================= CALC ================= */

function calculate(tasks: Task[], projectStart: string) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  tasks.forEach((t) => {
    if (t.mode === "manual") return;

    let start = new Date(projectStart);

    if (t.predecessors) {
      const preds = parsePred(t.predecessors);

      preds.forEach((p) => {
        const pt = map.get(p.id);
        if (!pt || !pt.finish) return;

        const pf = new Date(pt.finish);

        if (p.type === "FS") start = addDays(pf, 1);
        if (p.type === "SS" && pt.start)
          start = new Date(pt.start);
      });
    }

    t.start = format(start);
    t.finish = format(addDays(start, t.duration));
  });

  return tasks;
}

/* ================= WBS HELPERS ================= */

function getLevel(tasks: Task[], task: Task): number {
  let level = 0;
  let current = task;

  while (current.parentId) {
    const parent = tasks.find((t) => t.id === current.parentId);
    if (!parent) break;
    level++;
    current = parent;
  }

  return level;
}

function getChildren(tasks: Task[], parentId: number): Task[] {
  return tasks.filter((t) => t.parentId === parentId);
}

function rollup(tasks: Task[]) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  tasks.forEach((t) => {
    const children = tasks.filter((c) => c.parentId === t.id);

    if (children.length > 0) {
      const avg =
        children.reduce((sum, c) => sum + c.percent, 0) /
        children.length;

      t.percent = Math.round(avg);
    }
  });

  return [...tasks];
}

function isHidden(tasks: Task[], task: Task): boolean {
  let current = task;

  while (current.parentId) {
    const parent = tasks.find((t) => t.id === current.parentId);
    if (!parent) break;

    if (parent.collapsed) return true;
    current = parent;
  }

  return false;
}

/* ================= COMPONENT ================= */

export default function ProjectScheduler() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectStart, setProjectStart] = useState("2026-01-01");

  /* LOAD */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      setActiveId(parsed[0]?.id || null);
    } else {
      createProject("My First Project");
    }
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  /* PROJECT OPS */

  const createProject = (name: string) => {
    const newProj: Project = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      tasks: [
        {
          id: 1,
          name: "Start",
          duration: 1,
          percent: 100,
          mode: "auto",
        },
      ],
    };

    setProjects((p) => [newProj, ...p]);
    setActiveId(newProj.id);
  };

  const renameProject = (id: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const activeProject = projects.find((p) => p.id === activeId);

  const updateTasks = (tasks: Task[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, tasks } : p
      )
    );
  };

  /* TASK OPS */

  const updateTask = (id: number, field: keyof Task, value: any) => {
    if (!activeProject) return;

    let updated = activeProject.tasks.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );

    updated = calculate(updated, projectStart);
    updated = rollup(updated);

    updateTasks(updated);
  };

  const addTask = () => {
    if (!activeProject) return;

    const nextId =
      Math.max(...activeProject.tasks.map((t) => t.id)) + 1;

    updateTasks([
      ...activeProject.tasks,
      {
        id: nextId,
        name: "New Task",
        duration: 1,
        percent: 0,
        mode: "auto",
      },
    ]);
  };

  const indentTask = (task: Task) => {
    const prev = activeProject?.tasks.find(
      (t) => t.id === task.id - 1
    );
    if (!prev) return;

    updateTasks(
      activeProject!.tasks.map((t) =>
        t.id === task.id ? { ...t, parentId: prev.id } : t
      )
    );
  };

  const outdentTask = (task: Task) => {
    updateTasks(
      activeProject!.tasks.map((t) =>
        t.id === task.id ? { ...t, parentId: null } : t
      )
    );
  };

  const toggleCollapse = (task: Task) => {
    updateTasks(
      activeProject!.tasks.map((t) =>
        t.id === task.id
          ? { ...t, collapsed: !t.collapsed }
          : t
      )
    );
  };

  if (!activeProject) return null;

  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div style={{ width: 240, borderRight: "1px solid #ddd", padding: 10 }}>
        <h3>Projects</h3>
        {projects.map((p) => (
          <div key={p.id}>
            <input
              value={p.name}
              onChange={(e) =>
                renameProject(p.id, e.target.value)
              }
              onClick={() => setActiveId(p.id)}
            />
          </div>
        ))}
        <button onClick={() => createProject("New Project")}>
          + New
        </button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 16 }}>
        <button onClick={addTask}>+ Add Task</button>

        <table style={{ width: "100%", marginTop: 12 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Task Name</th>
              <th>Duration (Days)</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Mode</th>
              <th>Predecessors (FS/SS)</th>
              <th>% Complete</th>
            </tr>
          </thead>

          <tbody>
            {activeProject.tasks.map((t) => {
              if (isHidden(activeProject.tasks, t)) return null;

              const level = getLevel(activeProject.tasks, t);

              return (
                <tr key={t.id}>
                  <td>{t.id}</td>

                  <td>
                    <div style={{ paddingLeft: level * 16 }}>
                      <button onClick={() => toggleCollapse(t)}>
                        {t.collapsed ? "+" : "-"}
                      </button>

                      <button onClick={() => indentTask(t)}>→</button>
                      <button onClick={() => outdentTask(t)}>←</button>

                      <input
                        value={t.name}
                        onChange={(e) =>
                          updateTask(t.id, "name", e.target.value)
                        }
                      />
                    </div>
                  </td>

                  <td>
                    <input
                      type="number"
                      value={t.duration}
                      onChange={(e) =>
                        updateTask(
                          t.id,
                          "duration",
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  <td>{t.start}</td>
                  <td>{t.finish}</td>

                  <td>
                    <select
                      value={t.mode}
                      onChange={(e) =>
                        updateTask(
                          t.id,
                          "mode",
                          e.target.value as any
                        )
                      }
                    >
                      <option value="auto">Auto</option>
                      <option value="manual">Manual</option>
                    </select>
                  </td>

                  <td>
                    <input
                      value={t.predecessors || ""}
                      onChange={(e) =>
                        updateTask(
                          t.id,
                          "predecessors",
                          e.target.value
                        )
                      }
                    />
                  </td>

                  <td>{t.percent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}