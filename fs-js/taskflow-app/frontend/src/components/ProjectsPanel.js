import React from "react";
import ProjectsList from "./ProjectsList";
import CreateProjectForm from "./CreateProjectForm";

export default function ProjectsPanel({ projects, currentProject, onSelectProject, onCreateProject }) {
  return (
    <div>
      <ProjectsList
        projects={projects}
        currentProject={currentProject}
        onSelect={onSelectProject}
      />
      <CreateProjectForm onCreate={onCreateProject} />
    </div>
  );
}
