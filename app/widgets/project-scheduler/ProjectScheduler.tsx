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

const STORAGE_KEY = "projects_v5";

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

/* ================= CORE SCHEDULER (FIXED) ================= */

function calculate(tasks: Task[], projectStart: string) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  return tasks.map((t) => {
    // MANUAL = freeze dates
    if (t.mode === "manual") return t;

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

    return {
      ...t,
      start: format(start),
      finish: format(addDays(start, t.duration)),
    };
  });
}

/* ================= WBS ================= */

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

  const activeProject = projects.find((p) => p.id === activeId);

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

  const updateTasks = (tasks: Task[]) => {
    const recalculated = calculate(tasks, projectStart);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, tasks: recalculated } : p
      )
    );
  };

  /* TASK OPS */

  const updateTask = (id: number, field: keyof Task, value: any) => {
    if (!activeProject) return;

    const updated = activeProject.tasks.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );

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

  /* ================= UI ================= */

  return (
    <div style={styles.app}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.brand}>📊 Project Scheduler</div>

        <div style={styles.projectBar}>
          <select
            value={activeId || ""}
            onChange={(e) => setActiveId(e.target.value)}
            style={styles.select}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button onClick={() => createProject("New Project")}>
            + New
          </button>
        </div>

        <input
          type="date"
          value={projectStart}
          onChange={(e) => setProjectStart(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div style={styles.container}>
        <button onClick={addTask} style={styles.primaryBtn}>
          + Add Task
        </button>

        <table style={styles.table}>
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

                      <input
                        value={t.name}
                        onChange={(e) =>
                          updateTask(t.id, "name", e.target.value)
                        }
                        style={styles.input}
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
                      style={styles.input}
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
                      style={styles.input}
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

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  app: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#f5f5f7",
    minHeight: "100vh",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "white",
    borderBottom: "1px solid #e5e5e5",
  },

  brand: {
    fontSize: 18,
    fontWeight: 600,
  },

  projectBar: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  select: {
    padding: 6,
  },

  container: {
    padding: 16,
  },

  table: {
    width: "100%",
    marginTop: 12,
    background: "white",
    borderRadius: 12,
    borderCollapse: "collapse",
    overflow: "hidden",
  },

  input: {
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 4,
  },

  primaryBtn: {
    background: "#007aff",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
  },
};