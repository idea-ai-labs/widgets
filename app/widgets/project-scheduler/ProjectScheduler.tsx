"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Project, Task } from "./lib/types";
import { calculate } from "./lib/scheduler";
import { indent as indentFn, outdent as outdentFn } from "./lib/wbs";
import { load, save } from "./lib/storage";

/* ================= ID GENERATOR ================= */
function getNextId(tasks: Task[]) {
  if (!tasks.length) return 1;
  return Math.max(...tasks.map((t) => t.id)) + 1;
}

export default function ProjectScheduler() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projectStart, setProjectStart] = useState("2026-01-01");

  const fileRef = useRef<HTMLInputElement>(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    const data = load();

    if (data.length === 0) {
      const fallback: Project = {
        id: "1",
        name: "My First Project",
        createdAt: Date.now(),
        tasks: [
          {
            id: 1,
            name: "Project Start",
            duration: 1,
            percent: 100,
            mode: "auto",
            parentId: null,
          },
        ],
      };

      setProjects([fallback]);
      setActiveId("1");
      return;
    }

    setProjects(data);
    setActiveId(data[0].id);
  }, []);

  /* ================= SAVE ================= */
  useEffect(() => {
    if (projects.length) save(projects);
  }, [projects]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId)!,
    [projects, activeId]
  );

  /* ================= UPDATE ================= */
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

  /* ================= TASK OPS ================= */
  const addTask = () => {
    const nextId = getNextId(activeProject.tasks);

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

  /* ================= PROJECT OPS ================= */
  const addProject = () => {
    const name = prompt("Project name?");
    if (!name) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      tasks: [],
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveId(newProject.id);
  };

  /* ================= WBS ================= */
  const indent = (t: Task) =>
    updateTasks(indentFn(activeProject.tasks, t.id));

  const outdent = (t: Task) =>
    updateTasks(outdentFn(activeProject.tasks, t.id));

  if (!activeProject) return null;

  /* ================= STYLES ================= */
  const input: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #e6e6e6",
    borderRadius: 8,
    fontSize: 13,
    outline: "none",
    background: "#fff",
  };

  const inputReadonly: React.CSSProperties = {
    ...input,
    background: "#f6f7f9",
    color: "#666",
  };

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#f5f6f8",
        minHeight: "100vh",
        padding: 16,
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>📊 Project Scheduler</div>

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

        <button onClick={addProject}>+ New Project</button>

        <button onClick={addTask}>+ Task</button>

        {/* IMPORT */}
        <button onClick={() => fileRef.current?.click()}>
          Import
        </button>

        {/* EXPORT */}
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(projects)], {
              type: "application/json",
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "projects.json";
            a.click();
          }}
        >
          Export
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
              const data = JSON.parse(String(ev.target?.result));
              setProjects(data);
              setActiveId(data[0]?.id || null);
            };
            reader.readAsText(file);
          }}
        />
      </div>

      {/* ✅ PROJECT START (RESTORED) */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Project Start:</label>
        <input
          type="date"
          value={projectStart}
          onChange={(e) => setProjectStart(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa", fontSize: 12 }}>
              <th>ID</th>
              <th>Mode</th>
              <th>Task</th>
              <th>Duration</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Predecessors</th>
              <th>%</th>
              <th>WBS</th>
            </tr>
          </thead>

          <tbody>
            {activeProject.tasks.map((t, idx) => (
              <tr key={t.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{idx + 1}</td>

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
                    value={t.name}
                    onChange={(e) =>
                      updateTask(t.id, "name", e.target.value)
                    }
                    style={input}
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
                    style={{ ...input, width: 70 }}
                  />
                </td>

                {/* START */}
                <td>
                  <input
                    type={t.mode === "manual" ? "date" : "text"}
                    value={t.start || ""}
                    readOnly={t.mode === "auto"}
                    onChange={(e) =>
                      updateTask(t.id, "start", e.target.value)
                    }
                    style={
                      t.mode === "auto"
                        ? inputReadonly
                        : input
                    }
                  />
                </td>

                {/* FINISH */}
                <td>
                  <input
                    type={t.mode === "manual" ? "date" : "text"}
                    value={t.finish || ""}
                    readOnly={t.mode === "auto"}
                    onChange={(e) =>
                      updateTask(t.id, "finish", e.target.value)
                    }
                    style={
                      t.mode === "auto"
                        ? inputReadonly
                        : input
                    }
                  />
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
                    style={{ ...input, width: 120 }}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={t.percent}
                    onChange={(e) =>
                      updateTask(
                        t.id,
                        "percent",
                        Number(e.target.value)
                      )
                    }
                    style={{ ...input, width: 60 }}
                  />
                </td>

                <td>
                  <button onClick={() => indent(t)}>→</button>
                  <button onClick={() => outdent(t)}>←</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}