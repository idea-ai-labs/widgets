"use client";

import { useEffect, useMemo, useState } from "react";

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

const STORAGE_KEY = "projects_v8";

/* ================= DATE HELPERS ================= */

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
  return pred
    .split(",")
    .map((p) => {
      const m = p.trim().match(/(\d+)(FS|SS)/);
      return m ? { id: Number(m[1]), type: m[2] } : null;
    })
    .filter(Boolean) as { id: number; type: string }[];
}

/* ================= CORE SCHEDULING ================= */

function calculate(tasks: Task[], projectStart: string) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  return tasks.map((t) => {
    // AUTO = system controlled
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

/* ================= WBS HELPERS ================= */

function getLevel(tasks: Task[], task: Task): number {
  let level = 0;
  let cur = task;

  while (cur.parentId) {
    const parent = tasks.find((t) => t.id === cur.parentId);
    if (!parent) break;
    level++;
    cur = parent;
  }

  return level;
}

function isHidden(tasks: Task[], task: Task) {
  let cur = task;

  while (cur.parentId) {
    const parent = tasks.find((t) => t.id === cur.parentId);
    if (!parent) break;
    if (parent.collapsed) return true;
    cur = parent;
  }

  return false;
}

/* ================= COMPONENT ================= */

export default function ProjectScheduler() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectStart, setProjectStart] = useState("2026-01-01");

  /* ================= LOAD SAFE ================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: Project[] = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          setActiveId(parsed[0].id);
          return;
        }
      }
    } catch {}

    const fallback: Project = {
      id: "1",
      name: "My First Project",
      createdAt: Date.now(),
      tasks: [
        {
          id: 1,
          name: "Start",
          duration: 1,
          percent: 100,
          mode: "auto",
          parentId: null,
        },
      ],
    };

    setProjects([fallback]);
    setActiveId("1");
  }, []);

  /* ================= ACTIVE PROJECT ================= */

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeId) || projects[0];
  }, [projects, activeId]);

  /* ================= SAVE ================= */

  useEffect(() => {
    if (projects.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  /* ================= PROJECT OPS ================= */

  const createProject = () => {
    const name = prompt("Project name?");
    if (!name) return;

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
          parentId: null,
        },
      ],
    };

    setProjects((p) => [newProj, ...p]);
    setActiveId(newProj.id);
  };

  /* ================= TASK UPDATE ================= */

  const updateTasks = (tasks: Task[]) => {
    const updated = calculate(tasks, projectStart);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, tasks: updated } : p
      )
    );
  };

  const updateTask = (id: number, field: keyof Task, value: any) => {
    const updated = activeProject.tasks.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );

    updateTasks(updated);
  };

  const addTask = () => {
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
        parentId: null,
      },
    ]);
  };

  /* ================= WBS OPS ================= */

  const indent = (task: Task) => {
    const prev = activeProject.tasks.find((t) => t.id === task.id - 1);
    if (!prev) return;
    updateTask(task.id, "parentId", prev.id);
  };

  const outdent = (task: Task) => {
    updateTask(task.id, "parentId", null);
  };

  const toggleCollapse = (task: Task) => {
    updateTask(task.id, "collapsed", !task.collapsed);
  };

  if (!activeProject) return null;

  /* ================= UI ================= */

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <div style={styles.topBar}>
        <div style={styles.brand}>📊 Project Scheduler</div>

        <div style={styles.row}>
          <select
            value={activeProject.id}
            onChange={(e) => setActiveId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>

          <button onClick={createProject}>+ New</button>
        </div>

        <div style={styles.row}>
          <label>Start:</label>
          <input
            type="date"
            value={projectStart}
            onChange={(e) => setProjectStart(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.container}>
        <button onClick={addTask}>+ Add Task</button>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Duration</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Mode</th>
              <th>Predecessors</th>
              <th>%</th>
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

                      <button onClick={() => indent(t)}>→</button>
                      <button onClick={() => outdent(t)}>←</button>

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

                  {/* START (FIXED) */}
                  <td>
                    <input
                      type="date"
                      value={t.start || ""}
                      disabled={t.mode === "auto"}
                      onChange={(e) =>
                        updateTask(t.id, "start", e.target.value)
                      }
                    />
                  </td>

                  {/* FINISH (FIXED) */}
                  <td>
                    <input
                      type="date"
                      value={t.finish || ""}
                      disabled={t.mode === "auto"}
                      onChange={(e) =>
                        updateTask(t.id, "finish", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <select
                      value={t.mode}
                      onChange={(e) =>
                        updateTask(t.id, "mode", e.target.value as any)
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
                        updateTask(t.id, "predecessors", e.target.value)
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
    justifyContent: "space-between",
    padding: 12,
    background: "white",
    borderBottom: "1px solid #e5e5e5",
    alignItems: "center",
  },
  brand: { fontSize: 18, fontWeight: 600 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  container: { padding: 16 },
  table: {
    width: "100%",
    marginTop: 12,
    background: "white",
    borderRadius: 12,
  },
};