// src/pages/projectDashboard/ProjectDashboard.jsx
import React, { useEffect, useState } from "react";
import TasksAssigned from "./TasksAssigned";
import { apiFetch } from "../../api";

export default function ProjectDashboard() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: call /auth/me to get user and role. Replace with your endpoint.
    apiFetch("/auth/me")
      .then((user) => {
        // backend should return { id, username, role: 'lead'|'member' }
        setRole(user.role || "member");
      })
      .catch(() => {
        setRole("member");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: "#0D0D0D", minHeight: "100vh", color: "#B3B3B3" }}>
        <div className="container" style={{ padding: 30 }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", color: "#FFFFFF", padding: 20 }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
      }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h1 style={{ color: "#A259FF", fontSize: 22, margin: 0 }}>Project Dashboard</h1>
          <div style={{ color: "#B3B3B3" }}>Welcome — role: <strong style={{ color: "#FFFFFF" }}>{role}</strong></div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <div style={{ background: "#1A1A1A", borderRadius: 12, padding: 18 }}>
            <TasksAssigned role={role} />
          </div>

          {/* You can add Team's Progress and Project Documentation cards here */}
        </div>
      </div>
    </div>
  );
}
