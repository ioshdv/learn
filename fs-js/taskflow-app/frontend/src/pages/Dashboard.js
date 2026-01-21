import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DashboardProvider, useDashboard } from "../context/DashboardContext";

import UserProfile from "../components/UserProfile";
import ProjectsPanel from "../components/ProjectsPanel";
import TasksBoard from "../components/TasksBoard";

function DashboardInner() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const { state, actions } = useDashboard();

  useEffect(() => {
    // si el token es invalido, el backend responde 401 y dejamos al user fuera
    // (si tu app ya maneja esto en interceptors, esto no molesta)
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <UserProfile />

        <button
          onClick={() => {
            logout();
            nav("/login");
          }}
          style={{ height: 40 }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16, marginTop: 12 }}>
        <ProjectsPanel
          projects={state.projects}
          currentProject={state.currentProject}
          onSelectProject={actions.selectProject}
          onCreateProject={actions.createProject}
        />

        <TasksBoard
          projectId={state.currentProject?.id || null}
          tasks={state.tasks}
          filters={state.filters}
          onSetFilter={actions.setFilter}
          onCreateTask={actions.createTask}
          onUpdateTask={actions.updateTask}
          onDeleteTask={actions.deleteTask}
          onUploadAttachment={actions.uploadAttachment}
        />
      </div>

      {state.error ? (
        <div style={{ marginTop: 12, color: "crimson" }}>
          {state.error}
        </div>
      ) : null}
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
}
