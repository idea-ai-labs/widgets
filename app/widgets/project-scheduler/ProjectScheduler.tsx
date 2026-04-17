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
};

type Project = {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: number;
};

/* ================= STORAGE ================= */

const STORAGE_KEY = "projects_v2";

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
    // MANUAL → skip scheduling
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

  return [...tasks];
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

  const updateTasks = (tasks: Task[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, tasks } : p
      )
    );
  };

  const activeProject = projects.find((p) => p.id === activeId);

  /* TASK OPS */

  const updateTask = (id: number, field: keyof Task, value: any) => {
    if (!activeProject) return;

    let updated = activeProject.tasks.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );

    updated = calculate(updated, projectStart);

    updateTasks(updated);
  };

  const addTask = () => {
    if (!activeProject) return;

    const nextId =
      activeProject.tasks.length > 0
        ? Math.max(...activeProject.tasks.map((t) => t.id)) + 1
        : 1;

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

  if (!activeProject) return null;

  /* ================= UI ================= */

  return (
    <div>
      {/* PROJECT HEADER */}
      <div style={{ marginBottom: 12 }}>
        <select
          value={activeId || ""}
          onChange={(e) => setActiveId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            const name = prompt("Project name?");
            if (name) createProject(name);
          }}
          style={{ marginLeft: 8 }}
        >
          + New
        </button>
      </div>

      {/* PROJECT START */}
      <div style={{ marginBottom: 12 }}>
        <label>Project Start: </label>
        <input
          type="date"
          value={projectStart}
          onChange={(e) => setProjectStart(e.target.value)}
        />
      </div>

      <button onClick={addTask}>+ Add Task</button>

      {/* GRID */}
      <table style={{ width: "100%", marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Task</th>
            <th>Dur</th>
            <th>Start</th>
            <th>Finish</th>
            <th>Mode</th>
            <th>Pred</th>
            <th>%</th>
          </tr>
        </thead>

        <tbody>
          {activeProject.tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>

              <td>
                <input
                  value={t.name}
                  onChange={(e) =>
                    updateTask(t.id, "name", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={t.duration}
                  onChange={(e) =>
                    updateTask(t.id, "duration", Number(e.target.value))
                  }
                />
              </td>

              {/* START (TEXT + CALENDAR) */}
              <td>
                <input
                  type="date"
                  value={t.start || ""}
                  onChange={(e) =>
                    updateTask(t.id, "start", e.target.value)
                  }
                  disabled={t.mode === "auto"}
                />
              </td>

              {/* FINISH */}
              <td>
                <input
                  type="date"
                  value={t.finish || ""}
                  onChange={(e) =>
                    updateTask(t.id, "finish", e.target.value)
                  }
                  disabled={t.mode === "auto"}
                />
              </td>

              {/* MODE */}
              <td>
                <select
                  value={t.mode}
                  onChange={(e) =>
                    updateTask(
                      t.id,
                      "mode",
                      e.target.value as "auto" | "manual"
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
                    updateTask(t.id, "predecessors", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={t.percent}
                  onChange={(e) =>
                    updateTask(t.id, "percent", Number(e.target.value))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}