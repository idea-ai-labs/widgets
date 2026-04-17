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

const STORAGE_KEY = "projects_v7";

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
  return pred
    .split(",")
    .map((p) => {
      const m = p.match(/(\d+)(FS|SS)/);
      return m ? { id: Number(m[1]), type: m[2] } : null;
    })
    .filter(Boolean) as { id: number; type: string }[];
}

/* ================= CORE SCHEDULER ================= */

function calculate(tasks: Task[], projectStart: string) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  return tasks.map((t) => {
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
  let cur = task;

  while (cur.parentId) {
    const p = tasks.find((t) => t.id === cur.parentId);
    if (!p) break;
    level++;
    cur = p;
  }

  return level;
}

function isHidden(tasks: Task[], task: Task) {
  let cur = task;

  while (cur.parentId) {
    const p = tasks.find((t) => t.id === cur.parentId);
    if (!p) break;
    if (p.collapsed) return true;
    cur = p;
  }

  return false;
}

/* ================= COMPONENT ================= */

export default function ProjectScheduler() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectStart, setProjectStart] = useState("2026-01-01");

  /* ================= SAFE LOAD ================= */

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
    } catch {
      // ignore corrupted storage
    }

    // ALWAYS fallback
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

  /* ================= SAFE ACTIVE PROJECT ================= */

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeId) || projects[0];
  }, [projects, activeId]);

  /* ================= SAVE ================= */

  useEffect(() => {
    if (projects.length > 0) {
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

  const renameProject = (id: string, name: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  /* ================= TASK OPS ================= */

  const updateTasks = (tasks: Task[]) => {
    const recalculated = calculate(tasks, projectStart);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, tasks: recalculated } : p
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

  /* ================= SAFE RENDER GUARD ================= */

  if (!activeProject) {
    return (
      <div style={{ padding: 20 }}>
        Loading project...
      </div>
    );
  }

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
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button onClick={createProject}>+ New</button>
        </div>

        <input
          type="date"
          value={projectStart}
          onChange={(e) => setProjectStart(e.target.value)}
        />
      </div>

      {/* BODY */}
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

                  <td>{t.start}</td>
                  <td>{t.finish}</td>

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