"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const STORAGE_KEY = "projects_v9";

/* ================= HELPERS ================= */

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function format(d: Date) {
  return d.toISOString().split("T")[0];
}

/* ================= CORE SCHEDULING ================= */

function calculate(tasks: Task[], projectStart: string) {
  const map = new Map(tasks.map((t) => [t.id, t]));

  return tasks.map((t) => {
    if (t.mode === "manual") return t;

    let start = new Date(projectStart);

    if (t.predecessors) {
      const preds = t.predecessors
        .split(",")
        .map((p) => p.trim())
        .map((p) => {
          const m = p.match(/(\d+)(FS|SS)/);
          return m ? { id: Number(m[1]), type: m[2] } : null;
        })
        .filter(Boolean) as { id: number; type: string }[];

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

/* ================= COMPONENT ================= */

export default function ProjectScheduler() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectStart, setProjectStart] = useState("2026-01-01");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      setActiveId(parsed?.[0]?.id || null);
    } else {
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
    }
  }, []);

  /* ================= SAVE ================= */

  useEffect(() => {
    if (projects.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeId) || projects[0];
  }, [projects, activeId]);

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

  /* ================= IMPORT ================= */

  const importProjects = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (Array.isArray(data)) {
          setProjects(data);
          setActiveId(data[0]?.id || null);
        }
      } catch {
        alert("Invalid file");
      }
    };

    reader.readAsText(file);
  };

  /* ================= EXPORT ================= */

  const exportProjects = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ================= TASK OPS ================= */

  const updateTask = (id: number, field: keyof Task, value: any) => {
    const updated = activeProject.tasks.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );

    const recalculated = calculate(updated, projectStart);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id ? { ...p, tasks: recalculated } : p
      )
    );
  };

  const addTask = () => {
    const nextId =
      Math.max(...activeProject.tasks.map((t) => t.id)) + 1;

    updateTask(nextId, "name", "New Task");
  };

  /* ================= UI ================= */

  if (!activeProject) return null;

  return (
    <div style={styles.app}>
      {/* TOP BAR */}
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

          <button onClick={exportProjects}>Export</button>

          <button onClick={() => fileInputRef.current?.click()}>
            Import
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) =>
              e.target.files?.[0] &&
              importProjects(e.target.files[0])
            }
          />
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
                      updateTask(
                        t.id,
                        "duration",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>

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
            ))}
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