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

  /* ================= PROJECT OPS (FIXED + RESTORED) ================= */

  const addProject = () => {
    const name = prompt("Project name?");
    if (!name) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      tasks: [],
    };

    setProjects((p) => [newProject, ...p]);
    setActiveId(newProject.id);
  };

  /* ================= TASK OPS ================= */

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

  /* ================= UI ================= */

  if (!activeProject) return null;

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", gap: 10 }}>
        <select
          value={activeProject.id}
          onChange={(e) => setActiveId(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id}>{p.name}</option>
          ))}
        </select>

        {/* FIXED: NEW PROJECT BUTTON RESTORED */}
        <button onClick={addProject}>+ New Project</button>
        <button onClick={addTask}>+ Task</button>
      </div>

      {/* START DATE */}
      <input
        type="date"
        value={projectStart}
        onChange={(e) => setProjectStart(e.target.value)}
      />

      {/* TABLE */}
      <table>
        <thead>
          <tr>
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
          {activeProject.tasks.map((t) => (
            <tr key={t.id}>
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

              <td>{t.start}</td>
              <td>{t.finish}</td>

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
  );
}
