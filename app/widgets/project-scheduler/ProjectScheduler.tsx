"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Project, Task } from "./lib/types";
import { calculate } from "./lib/scheduler";
import { indent as indentFn, outdent as outdentFn } from "./lib/wbs";
import { load, save } from "./lib/storage";

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
        parentId: null,
      },
    ]);
  };

  /* ================= WBS ================= */

  const indent = (t: Task) =>
    updateTasks(indentFn(activeProject.tasks, t.id));

  const outdent = (t: Task) =>
    updateTasks(outdentFn(activeProject.tasks, t.id));

  if (!activeProject) return null;

  return (
    <div style={{ fontFamily: "system-ui", padding: 12 }}>
      {/* HEADER */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
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

        <button onClick={() => alert("Add Project")}>
          + New Project
        </button>

        <button onClick={addTask}>+ Task</button>
      </div>

      {/* PROJECT START */}
      <div style={{ marginBottom: 10 }}>
        <label>Project Start: </label>
        <input
          type="date"
          value={projectStart}
          onChange={(e) => setProjectStart(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 900,
          }}
        >
          {/* ================= HEADER (FIXED) ================= */}
          <thead>
            <tr>
              <th style={{ textAlign: "left", minWidth: 220 }}>
                Task
              </th>
              <th>Duration</th>
              <th>Start</th>
              <th>Finish</th>
              <th>Mode</th>
              <th>Predecessors</th>
              <th>% Complete</th>
              <th>WBS</th>
            </tr>
          </thead>

          <tbody>
            {activeProject.tasks.map((t) => (
              <tr key={t.id}>
                {/* ================= TASK COLUMN (FIXED) ================= */}
                <td style={{ minWidth: 220 }}>
                  <input
                    value={t.name}
                    placeholder="Task name"
                    onChange={(e) =>
                      updateTask(t.id, "name", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "4px 6px",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                    }}
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
                    style={{ width: 70 }}
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
                    style={{
                      width: "100%",
                      background:
                        t.mode === "auto" ? "#f3f3f3" : "white",
                    }}
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
                    style={{
                      width: "100%",
                      background:
                        t.mode === "auto" ? "#f3f3f3" : "white",
                    }}
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
                    style={{ width: 120 }}
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
                    style={{ width: 70 }}
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