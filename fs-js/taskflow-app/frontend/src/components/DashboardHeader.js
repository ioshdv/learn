import React from "react";

export default function DashboardHeader({ me, stats, onLogout }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
      <div>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ fontSize: 14 }}>
          {me ? (
            <>
              <strong>{me.nombre}</strong> — {me.email} ({me.role})
            </>
          ) : "Cargando usuario..."}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 12, textAlign: "right" }}>
          <div>Projects: {stats.totalProjects}</div>
          <div>Tasks: {stats.totalTasks}</div>
          <div>Completed: {stats.completedTasks}</div>
          <div>Overdue: {stats.overdueTasks}</div>
        </div>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
