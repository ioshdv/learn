import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { api } from "../api/taskflow";

const DashboardContext = createContext(null);

const initialState = {
  me: null,
  projects: [],
  currentProject: null,
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: "all",
    assignee: "all",
    priority: "all",
    q: ""
  },
  stats: {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  }
};

function computeStats(projects, tasks) {
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed"
  ).length;
  return { totalProjects, totalTasks, completedTasks, overdueTasks };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_ME":
      return { ...state, me: action.payload };

    case "SET_PROJECTS": {
      const projects = action.payload;
      const stats = computeStats(projects, state.tasks);
      const currentProject =
        state.currentProject && projects.some((p) => p.id === state.currentProject.id)
          ? state.currentProject
          : projects[0] || null;

      return { ...state, projects, currentProject, stats };
    }

    case "SELECT_PROJECT":
      return { ...state, currentProject: action.payload };

    case "SET_TASKS": {
      const tasks = action.payload;
      const stats = computeStats(state.projects, tasks);
      return { ...state, tasks, stats };
    }

    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload } };

    default:
      return state;
  }
}

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const [me, projects] = await Promise.all([api.me(), api.getProjects()]);
      dispatch({ type: "SET_ME", payload: me });
      dispatch({ type: "SET_PROJECTS", payload: projects });

      const projectId = projects[0]?.id || null;
      const tasks = projectId ? await api.getTasks({ projectId }) : [];
      dispatch({ type: "SET_TASKS", payload: tasks });
    } catch (e) {
      // ✅ FIX: si el token es inválido/expiró, limpiamos sesión y volvemos a /login
      if (e?.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      const msg = e?.response?.data?.error || e?.message || "Error";
      dispatch({ type: "SET_ERROR", payload: msg });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const refreshTasks = async () => {
    if (!state.currentProject?.id) return;

    try {
      const tasks = await api.getTasks({ projectId: state.currentProject.id });
      dispatch({ type: "SET_TASKS", payload: tasks });
    } catch (e) {
      // si se cae por 401 durante polling, también forzamos login
      if (e?.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
    }
  };

  // load inicial
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cuando cambia proyecto, recarga tasks
  useEffect(() => {
    refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentProject?.id]);

  // “tiempo real” simple: polling cada 5s
  useEffect(() => {
    const id = setInterval(() => {
      refreshTasks().catch(() => {});
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentProject?.id]);

  const actions = useMemo(
    () => ({
      reloadAll: load,

      selectProject: (project) => dispatch({ type: "SELECT_PROJECT", payload: project }),
      setFilter: (patch) => dispatch({ type: "SET_FILTER", payload: patch }),

      createProject: async ({ name, description }) => {
        const p = await api.createProject({ name, description });
        const projects = await api.getProjects();
        dispatch({ type: "SET_PROJECTS", payload: projects });
        dispatch({ type: "SELECT_PROJECT", payload: p });
        return p;
      },

      createTask: async (payload) => {
        const t = await api.createTask(payload);
        await refreshTasks();
        return t;
      },

      updateTask: async (id, patch) => {
        await api.updateTask(id, patch);
        await refreshTasks();
      },

      deleteTask: async (id) => {
        await api.deleteTask(id);
        await refreshTasks();
      },

      uploadAttachment: async (taskId, file) => {
        await api.uploadTaskAttachment(taskId, file);
        await refreshTasks();
      },

      uploadAvatar: async (file) => {
        await api.uploadAvatar(file);
        const me = await api.me();
        dispatch({ type: "SET_ME", payload: me });
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.currentProject?.id]
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
