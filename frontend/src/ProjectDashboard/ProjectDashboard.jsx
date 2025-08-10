// src/pages/projectDashboard/ProjectDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ProjectDashboard() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Dummy API role fetch
    setTimeout(() => {
      setRole("lead"); // change to "member" for testing
      setLoading(false);
    }, 500);
  }, []);

  const handleNav = (page) => {
    if (page === "tasks") {
      role === "lead" ? navigate("/tasks-lead") : navigate("/tasks-member");
    } else if (page === "progress") {
      navigate("/team-progress");
    } else if (page === "docs") {
      navigate("/project-docs");
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#0D0D0D", minHeight: "100vh", color: "#B3B3B3" }}>
        <div style={{ padding: 30 }}>Loading dashboard...</div>
      </div>
    );
  }

  // Dummy chart data
  const progressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Team Progress (%)",
        data: [20, 45, 70, 85],
        borderColor: "#A259FF",
        backgroundColor: "rgba(162, 89, 255, 0.2)",
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", color: "#FFFFFF" }}>
      
      {/* Navbar */}
      <div style={{
        background: "#1A1A1A",
        padding: "15px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #333"
      }}>
        <h1 style={{ fontSize: 26, fontWeight: "bold" }}>
          <span style={{ color: "#A259FF" }}>COLAB</span>
          <span style={{ color: "#FFFFFF" }}>X</span>
        </h1>
      </div>

      <div style={{ display: "flex" }}>
        
        {/* Sidebar */}
        <div style={{
          width: 220,
          background: "#1A1A1A",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 15,
          borderRight: "1px solid #333"
        }}>
          <h2 style={{ color: "#A259FF", fontSize: 20, marginBottom: 10 }}>Menu</h2>
          <button onClick={() => handleNav("tasks")} style={sidebarBtnStyle}>Task Assignment</button>
          <button onClick={() => handleNav("progress")} style={sidebarBtnStyle}>Team Progress</button>
          <button onClick={() => handleNav("docs")} style={sidebarBtnStyle}>Project Documentation</button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 30 }}>
          <header style={{ marginBottom: 20 }}>
            <h1 style={{ color: "#A259FF", fontSize: 24 }}>Project Dashboard</h1>
            <p style={{ color: "#B3B3B3" }}>
              Role: <strong style={{ color: "#FFFFFF" }}>{role}</strong>
            </p>
          </header>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            {/* Progress Chart */}
            <div style={{ background: "#1A1A1A", borderRadius: 12, padding: 20 }}>
              <h3 style={{ marginBottom: 10 }}>Team Progress</h3>
              <Line data={progressData} />
            </div>

            {/* Summary */}
            <div style={{ background: "#1A1A1A", borderRadius: 12, padding: 20 }}>
              <h3 style={{ marginBottom: 10 }}>Project Summary</h3>
              <p style={{ color: "#B3B3B3" }}>Total Tasks: <strong style={{ color: "#FFFFFF" }}>25</strong></p>
              <p style={{ color: "#B3B3B3" }}>Completed: <strong style={{ color: "#FFFFFF" }}>18</strong></p>
              <p style={{ color: "#B3B3B3" }}>Pending: <strong style={{ color: "#FFFFFF" }}>7</strong></p>
            </div>
          </div>

          {/* Details */}
          <div style={{ marginTop: 20, background: "#1A1A1A", borderRadius: 12, padding: 20 }}>
            <h3>Project Details</h3>
            <p style={{ color: "#B3B3B3" }}>
              This is a dummy project description showing how much work has been done so far. 
              The team is progressing steadily and is on track to meet the deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const sidebarBtnStyle = {
  background: "#0D0D0D",
  color: "#FFFFFF",
  border: "1px solid #333",
  padding: "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  textAlign: "left",
  transition: "all 0.3s ease",
  boxShadow: "inset 0 0 5px rgba(0,0,0,0.5)"
};

const btnHover = `
  button:hover {
    background-color: #A259FF !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(162, 89, 255, 0.4);
  }
`;

// Inject hover styles globally
const styleSheet = document.createElement("style");
styleSheet.innerText = btnHover;
document.head.appendChild(styleSheet);
