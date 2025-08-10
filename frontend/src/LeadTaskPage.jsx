// src/pages/projectDashboard/LeadTasksPage.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import TaskFormModal from "./TaskFormModal";

// small color constants
const COLORS = {
  card: "#1A1A1A",
  text: "#FFFFFF",
  muted: "#B3B3B3",
  primary: "#A259FF",
  accent: "#7C3AED",
};

export default function LeadTasksPage() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // GET team members — implement backend /team/members
    apiFetch("/team/members")
      .then((list) => setMembers(list || []))
      .catch((err) => {
        console.error("fetch members", err);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: COLORS.muted }}>Loading team members...</div>;
  }

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* members list */}
      <div style={{
        flex: "0 0 320px",
        background: COLORS.card,
        padding: 12,
        borderRadius: 10
      }}>
        <h3 style={{ marginTop: 0, color: COLORS.text }}>Team Members</h3>
        {members.length === 0 && <div style={{ color: COLORS.muted }}>No members found.</div>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {members.map((m) => (
            <li
              key={m.id}
              onClick={() => setSelectedMember(m)}
              style={{
                cursor: "pointer",
                padding: "10px 8px",
                borderRadius: 8,
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: selectedMember?.id === m.id ? COLORS.accent : "transparent"
              }}
            >
              <div>
                <div style={{ color: COLORS.text, fontWeight: 600 }}>{m.displayName || m.username}</div>
                <div style={{ color: COLORS.muted, fontSize: 12 }}>{m.role || "Member"}</div>
              </div>
              <div style={{ color: COLORS.primary, fontSize: 12 }}>Assign</div>
            </li>
          ))}
        </ul>
      </div>

      {/* right panel: details & existing assigned tasks summary (simple) */}
      <div style={{ flex: 1, background: COLORS.card, borderRadius: 10, padding: 16 }}>
        {!selectedMember ? (
          <div style={{ color: COLORS.muted }}>Click a team member to assign a task.</div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: COLORS.text }}>{selectedMember.displayName || selectedMember.username}</h3>
                <div style={{ color: COLORS.muted, marginTop: 6 }}>{selectedMember.email || "—"}</div>
              </div>
              <div>
                <button
                  onClick={() => setSelectedMember((s) => ({ ...s, openAssign: true }))}
                  style={{
                    background: COLORS.primary,
                    color: "#0D0D0D",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  + Assign Task
                </button>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <h4 style={{ color: COLORS.text, marginBottom: 8 }}>Recent Tasks (sample)</h4>
              {/* show sample; ideally fetch assigned tasks for that member */}
              <div style={{ color: COLORS.muted }}>No assigned tasks yet for this member.</div>
            </div>
          </>
        )}
      </div>

      {/* Task modal */}
      {selectedMember?.openAssign && (
        <TaskFormModal
          member={selectedMember}
          onClose={() => setSelectedMember((s) => ({ ...s, openAssign: false }))}
        />
      )}
    </div>
  );
}
