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
};

type Project = {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: number;
};

/* ================= STORAGE ================= */

const STORAGE_KEY = "projects_v1";

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

function calculate(tasks: Task[]) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  tasks.forEach((t) => {
    if (!t.predecessors) return;

    let start = new Date();
    const preds = parsePred(t.predecessors);

    preds.forEach((p) => {
      const pt = map.get(p.id);
      if (!pt || !pt.finish) return;

      const pf = new Date(pt.finish);

      if (p.type === "FS") start = addDays(pf, 1);
      if (p.type === "SS" && pt.start) start = new Date(pt.start);
    });

    t.start = format(start);
    t.finish = format(addDays(start, t.duration));
  });

  return [...tasks];
}

/* ================= COMPONENT ================= */

export default function ProjectScheduler() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

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
        { id: 1, name: "Start", duration: 1, percent: 100 },
      ],
    };

    setProjects((p) => [newProj, ...p]);
    setActiveId(newProj.id);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    setActiveId(updated[0]?.id || null);
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

    const updated = activeProject.tasks.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );

    updateTasks(calculate(updated));
  };

  const addTask = () => {
    if (!activeProject) return;

    updateTasks([
      ...activeProject.tasks,
      {
        id: Date.now(),
        name: "New Task",
        duration: 1,
        percent: 0,
      },
    ]);
  };

  /* ================= UI ================= */

  if (!activeProject) return null;

  return (
    <div>
      {/* PROJECT SELECTOR */}
      <div style={{ marginBottom: 16 }}>
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

        <button
          onClick={() => deleteProject(activeId!)}
          style={{ marginLeft: 8 }}
        >
          Delete
        </button>
      </div>

      {/* TASK GRID */}
      <button onClick={addTask}>+ Add Task</button>

      <table style={{ width: "100%", marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Task</th>
            <th>Dur</th>
            <th>Start</th>
            <th>Finish</th>
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

              <td>{t.start}</td>
              <td>{t.finish}</td>

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
