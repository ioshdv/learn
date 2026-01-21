import React from "react";

export default function ProjectsList({ projects, currentProject, onSelect }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Projects</h3>
      {projects.length === 0 ? <p>No projects</p> : null}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {projects.map(p => (
          <li key={p.id} style={{ marginBottom: 6 }}>
            <button
              onClick={() => onSelect(p)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "6px 8px",
                border: "1px solid #ccc",
                background: currentProject?.id === p.id ? "#eee" : "white",
                cursor: "pointer"
              }}
            >
              <strong>{p.name}</strong>
              {p.description ? <div style={{ fontSize: 12 }}>{p.description}</div> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
