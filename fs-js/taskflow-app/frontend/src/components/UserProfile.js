import React, { useMemo, useState } from "react";
import { useDashboard } from "../context/DashboardContext";

export default function UserProfile() {
  const { state, actions } = useDashboard();
  const me = state.me;

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const avatarSrc = useMemo(() => {
    // avatarPath esperado: "/uploads/avatars/1-xxxx.jpg"
    if (!me?.avatarPath) return null;

    // Siempre usar el mismo origen que sirve la UI (nginx en prod)
    // Evita problemas entre frontend/backend
    return `${window.location.origin}${me.avatarPath}`;
  }, [me?.avatarPath]);

  if (!me) return null;

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await actions.uploadAvatar(file);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 64, height: 64, border: "1px solid #ccc" }}>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="avatar"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "#666"
            }}
          >
            avatar
          </div>
        )}
      </div>

      <div>
        <div>
          <strong>{me.nombre}</strong> — {me.email} ({me.role})
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button disabled={!file || uploading} onClick={upload}>
            {uploading ? "uploading..." : "upload avatar"}
          </button>
        </div>

        <div style={{ fontSize: 12, color: "#666" }}>
          {me.avatarPath ? `avatarPath: ${me.avatarPath}` : "avatarPath: (none)"}
        </div>
      </div>
    </div>
  );
}
