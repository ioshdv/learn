import React, { useMemo, useState } from "react";
import CreateTaskForm from "./CreateTaskForm";

export default function TasksBoard({
  projectId,
  tasks,
  filters,
  onSetFilter,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUploadAttachment
}) {
  const [fileByTask, setFileByTask] = useState({});
  const [uploadingByTask, setUploadingByTask] = useState({});

  const filtered = useMemo(() => {
    const q = (filters.q || "").toLowerCase().trim();
    return tasks.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority) return false;
      if (filters.assignee !== "all" && String(t.assigneeId || "") !== String(filters.assignee)) return false;
      if (q) {
        const hay = `${t.title || ""} ${t.description || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const uploadOne = async (taskId) => {
    const f = fileByTask[taskId];
    if (!f) return;

    setUploadingByTask((s) => ({ ...s, [taskId]: true }));
    try {
      await onUploadAttachment(taskId, f);
      // limpiar file seleccionado
      setFileByTask((s) => ({ ...s, [taskId]: null }));
    } finally {
      setUploadingByTask((s) => ({ ...s, [taskId]: false }));
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Tasks</h3>

      {!projectId ? <p>Selecciona o crea un proyecto</p> : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <select value={filters.status} onChange={(e) => onSetFilter({ status: e.target.value })}>
          <option value="all">status: all</option>
          <option value="todo">todo</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
        </select>

        <select value={filters.priority} onChange={(e) => onSetFilter({ priority: e.target.value })}>
          <option value="all">priority: all</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>

        <input placeholder="search..." value={filters.q} onChange={(e) => onSetFilter({ q: e.target.value })} />
      </div>

      {projectId ? <CreateTaskForm projectId={projectId} onCreate={onCreateTask} /> : null}

      <hr />

      {filtered.length === 0 ? <p>No tasks</p> : null}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filtered.map((t) => {
          const selected = fileByTask[t.id];
          const uploading = !!uploadingByTask[t.id];

          return (
            <li key={t.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <strong>{t.title}</strong>
                  <div style={{ fontSize: 12 }}>
                    status: {t.status} | priority: {t.priority}{" "}
                    {t.dueDate ? `| due: ${String(t.dueDate).slice(0, 10)}` : ""}
                  </div>
                  {t.description ? <div style={{ fontSize: 13 }}>{t.description}</div> : null}
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button onClick={() => onUpdateTask(t.id, { status: "todo" })}>todo</button>
                  <button onClick={() => onUpdateTask(t.id, { status: "in_progress" })}>progress</button>
                  <button onClick={() => onUpdateTask(t.id, { status: "completed" })}>done</button>
                  <button onClick={() => onDeleteTask(t.id)}>delete</button>
                </div>
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="file"
                  onChange={(e) =>
                    setFileByTask((s) => ({ ...s, [t.id]: e.target.files?.[0] || null }))
                  }
                />
                <button onClick={() => uploadOne(t.id)} disabled={!selected || uploading}>
                  {uploading ? "uploading..." : "upload attachment"}
                </button>
              </div>

              {/* Mostrar adjuntos si vienen en la tarea */}
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <b>Attachments:</b>{" "}
                {Array.isArray(t.attachments) && t.attachments.length > 0 ? (
                  <ul style={{ margin: "6px 0 0 18px" }}>
                    {t.attachments.map((a) => (
                      <li key={a.id}>
                        <a href={`http://localhost:3001${a.path}`} target="_blank" rel="noreferrer">
                          {a.originalName}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>None</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
