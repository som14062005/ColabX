// src/pages/projectDashboard/MemberTasksPage.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../../api";

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    apiFetch("/tasks/mine")
      .then((t) => setTasks(t || []))
      .catch((err) => {
        console.error("fetch tasks", err);
        setTasks([]);
      });
  }, []);

  if (tasks === null) return <div style={{ color: "#B3B3B3" }}>Loading your tasks...</div>;

  return (
    <div style={{ background: "#131313", padding: 12, borderRadius: 10 }}>
      {tasks.length === 0 ? (
        <div style={{ color: "#B3B3B3" }}>No tasks assigned.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((t) => (
            <li key={t.id} style={{ background: "#1A1A1A", marginBottom: 10, padding: 10, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#FFFFFF", fontWeight: 700 }}>{t.taskName}</div>
                  <div style={{ color: "#B3B3B3", fontSize: 13 }}>{t.description}</div>
                </div>
                <div style={{ color: "#B3B3B3", fontSize: 12 }}>
                  {t.deadline ? new Date(t.deadline).toLocaleString() : "No deadline"}
                </div>
              </div>
              {t.subtasks && t.subtasks.length > 0 && (
                <ul style={{ marginTop: 8, paddingLeft: 18, color: "#B3B3B3" }}>
                  {t.subtasks.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
