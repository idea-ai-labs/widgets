"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Project, Task, TaskMode } from "./lib/types";
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

  /* ================= UPDATE (with displayNo) ================= */
  const updateTasks = (tasks: Task[]) => {
    // Derive displayNo from array index before scheduling
    const tasksWithDisplayNo = tasks.map((t, idx) => ({
      ...t,
      displayNo: idx + 1,
    }));

    const updated = calculate(tasksWithDisplayNo, projectStart);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? { ...p, tasks: updated.map(t => ({ ...t, displayNo: t.displayNo })) }
          : p
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

  /* ================= STYLES (enhanced) ================= */
  const input = {
    width: "100%",
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: 4,
    fontSize: 13,
    outline: "none",
    background: "#fff",
  };

  const inputReadonly = {
    ...input,
    background: "#f8f9fa",
    color: "#888",
    cursor: "not-allowed",
  };

  const btn = {
    border: "1px solid #ddd",
    background: "#fff",
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 4,
    cursor: "pointer",
  };

  const btnPrimary = {
    ...btn,
    background: "#0070f3",
    color: "#fff",
    border: "1px solid #0070f3",
  };

  const select = {
    padding: "6px 10px",
    fontSize: 13,
    border: "1px solid #ddd",
    borderRadius: 4,
    outline: "none",
  };

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f5f6f8",
        minHeight: "100vh",
        padding: "16px 20px",
        color: "#333",
      }}
    >
      {/* HEADER + TOOLBAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
          borderBottom: "1px solid #ddd",
          paddingBottom: 12,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📊 Project Scheduler
        </h1>

        <select
          value={activeProject.id}
          onChange={(e) => setActiveId(e.target.value)}
          style={select}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button onClick={addProject} style={btn}>
          + New Project
        </button>

        <button onClick={addTask} style={btnPrimary}>
          + Add Task
        </button>

        <button onClick={() => fileRef.current?.click()} style={btn}>
          Import
        </button>

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
          style={btn}
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

      {/* PROJECT START TOOLBAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          padding: "12px 16px",
          backgroundColor: "#fff",
          borderRadius: 8,
          boxShadow: "0 0 2px rgba(0,0,0,0.1)",
        }}
      >
        <label style={{ fontSize: 13, fontWeight: 500 }}>
          Project Start:
          <input
            type="date"
            value={projectStart}
            onChange={(e) => setProjectStart(e.target.value)}
            style={{ marginLeft: 8, ...input, width: 130 }}
          />
        </label>
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 0 4px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#f8f9fa",
            fontSize: 13,
            fontWeight: 600,
            borderBottom: "1px solid #ddd",
          }}
        >
          ✅ Schedule
        </div>

        <div
          style={{
            overflowX: "auto",
            padding: "0 16px 16px 16px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#555",
                  textAlign: "left",
                  borderTop: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <th style={{ padding: "8px 6px", width: 40 }}>#</th>
                <th style={{ padding: "8px 6px" }}>Mode</th>
                <th style={{ padding: "8px 6px", minWidth: 180 }}>Task</th>
                <th style={{ padding: "8px 6px", width: 80 }}>Duration</th>
                <th style={{ padding: "8px 6px" }}>Start</th>
                <th style={{ padding: "8px 6px" }}>Finish</th>
                <th style={{ padding: "8px 6px", minWidth: 120 }}>Predecessors</th>
                <th style={{ padding: "8px 6px", width: 80 }}>%</th>
                <th style={{ padding: "8px 6px" }}></th>
              </tr>
            </thead>

            <tbody>
              {activeProject.tasks.map((t, idx) => (
                <tr
                  key={t.id}
                  style={{
                    borderTop: "1px solid #eee",
                    fontSize: 13,
                  }}
                >
                  {/* DISPLAY ROW NUMBER */}
                  <td
                    style={{
                      padding: "6px 3px",
                      textAlign: "center",
                      color: "#888",
                      fontWeight: 500,
                    }}
                  >
                    {idx + 1}
                  </td>

                  {/* MODE */}
                  <td style={{ padding: "6px 3px" }}>
                    <select
                      value={t.mode}
                      onChange={(e) =>
                        updateTask(t.id, "mode", e.target.value as any)
                      }
                      style={{
                        ...input,
                        width: "auto",
                        fontSize: 12,
                        height: 24,
                      }}
                    >
                      <option value="auto">Auto</option>
                      <option value="manual">Manual</option>
                    </select>
                  </td>

                  {/* TASK NAME */}
                  <td style={{ padding: "6px 3px" }}>
                    <input
                      value={t.name}
                      onChange={(e) =>
                        updateTask(t.id, "name", e.target.value)
                      }
                      style={input}
                    />
                  </td>

                  {/* DURATION */}
                  <td style={{ padding: "6px 3px" }}>
                    <input
                      type="number"
                      value={t.duration}
                      onChange={(e) =>
                        updateTask(t.id, "duration", Number(e.target.value))
                      }
                      style={{ ...input, width: 70, height: 24 }}
                    />
                  </td>

                  {/* START */}
                  <td style={{ padding: "6px 3px" }}>
                    <input
                      type={t.mode === "manual" ? "date" : "text"}
                      value={t.start || ""}
                      readOnly={t.mode === "auto"}
                      onChange={(e) =>
                        updateTask(t.id, "start", e.target.value)
                      }
                      style={t.mode === "auto" ? inputReadonly : input}
                    />
                  </td>

                  {/* FINISH */}
                  <td style={{ padding: "6px 3px" }}>
                    <input
                      type={t.mode === "manual" ? "date" : "text"}
                      value={t.finish || ""}
                      readOnly={t.mode === "auto"}
                      onChange={(e) =>
                        updateTask(t.id, "finish", e.target.value)
                      }
                      style={t.mode === "auto" ? inputReadonly : input}
                    />
                  </td>

                  {/* PREDECESSORS */}
                  <td style={{ padding: "6px 3px" }}>
                    <input
                      value={t.predecessors || ""}
                      onChange={(e) =>
                        updateTask(t.id, "predecessors", e.target.value)
                      }
                      style={{ ...input, width: 120, fontSize: 12 }}
                    />
                  </td>

                  {/* PROGRESS */}
                  <td style={{ padding: "6px 3px" }}>
                    <input
                      type="number"
                      value={t.percent}
                      onChange={(e) =>
                        updateTask(t.id, "percent", Number(e.target.value))
                      }
                      style={{ ...input, width: 60, height: 24, fontSize: 12 }}
                    />
                  </td>

                  {/* WBS INDENT / OUTDENT */}
                  <td style={{ padding: "6px 6px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => indent(t)}
                        style={{
                          ...btn,
                          width: 28,
                          height: 24,
                          fontSize: 12,
                          padding: 0,
                        }}
                      >
                        →
                      </button>
                      <button
                        onClick={() => outdent(t)}
                        style={{
                          ...btn,
                          width: 28,
                          height: 24,
                          fontSize: 12,
                          padding: 0,
                        }}
                      >
                        ←
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
