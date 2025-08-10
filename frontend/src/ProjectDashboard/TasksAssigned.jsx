// src/pages/projectDashboard/TasksAssigned.jsx
import React from "react";
import LeadTasksPage from "./LeadTasksPage";
import MemberTasksPage from "./MemberTaskPage";

export default function TasksAssigned({ role }) {
  return (
    <div>
      <h2 style={{ marginTop: 0, color: "#FFFFFF" }}>Tasks Assigned</h2>
      <div style={{ color: "#B3B3B3", marginBottom: 12 }}>
        {role === "lead" ? "Lead: assign tasks to team members" : "Your assigned tasks"}
      </div>

      {role === "lead" ? <LeadTasksPage /> : <MemberTasksPage />}
    </div>
  );
}
