// src/pages/teamProgress/TeamProgress.jsx
import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function TeamProgress() {
  const navigate = useNavigate();

  // Final Data Values
  const totalTasksFinal = 25;
  const completedTasksFinal = 18;
  const pendingTasksFinal = totalTasksFinal - completedTasksFinal;
  const completionPercentageFinal = Math.round(
    (completedTasksFinal / totalTasksFinal) * 100
  );

  // Animated State
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (progress < completionPercentageFinal) {
        progress++;
        setCompletionPercentage(progress);
      }
    }, 15);

    let count = 0;
    const statsInterval = setInterval(() => {
      if (count < totalTasksFinal) {
        count++;
        setTotalTasks(count);
        if (count <= completedTasksFinal) setCompletedTasks(count);
        if (count <= pendingTasksFinal) setPendingTasks(count);
      }
    }, 30);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statsInterval);
    };
  }, []);

  // Chart Data
  const weeklyProgressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Team Progress (%)",
        data: [20, 45, 70, 85],
        borderColor: "#A259FF",
        backgroundColor: "rgba(162, 89, 255, 0.3)",
        fill: true,
        tension: 0.3
      }
    ]
  };

  const departmentBarData = {
    labels: ["Design", "Development", "Testing", "Management"],
    datasets: [
      {
        label: "Tasks Completed",
        data: [5, 8, 3, 2],
        backgroundColor: "#A259FF"
      },
      {
        label: "Tasks Pending",
        data: [1, 3, 2, 1],
        backgroundColor: "#EF4444"
      }
    ]
  };

  const resourcePieData = {
    labels: ["Design", "Development", "QA", "Documentation"],
    datasets: [
      {
        data: [25, 40, 20, 15],
        backgroundColor: ["#A259FF", "#10B981", "#F59E0B", "#3B82F6"],
        borderColor: ["#1A1A1A", "#1A1A1A", "#1A1A1A", "#1A1A1A"]
      }
    ]
  };

  const handleNav = (page) => {
    if (page === "tasks") navigate("/tasks-lead");
    else if (page === "progress") navigate("/team-progress");
    else if (page === "docs") navigate("/project-docs");
  };

  // -------------------------
  // GitHub-style contribution heatmap
  // -------------------------
  const purpleShades = [
    "#4d4656ae",
    "#E0C6FF",
    "#C69EFF",
    "#A259FF",
    "#8434D9",
    "#5B0099"
  ];

  const getColor = (count) => {
    if (count === 0) return purpleShades[0];
    if (count >= 10) return purpleShades[5];
    if (count >= 7) return purpleShades[4];
    if (count >= 5) return purpleShades[3];
    if (count >= 3) return purpleShades[2];
    return purpleShades[1];
  };

  const weeks = 53;
  const days = 7;
  const contributionData = Array.from({ length: weeks }, () =>
    Array.from({ length: days }, () => Math.floor(Math.random() * 12))
  );

  // --- FIXED: Dynamic month label positions ---
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);
  const monthPositions = [];
  let lastMonth = null;

  for (let w = 0; w < weeks; w++) {
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + w * 7);
    const monthName = weekDate.toLocaleString("default", { month: "short" });

    if (monthName !== lastMonth) {
      monthPositions.push({ name: monthName, index: w });
      lastMonth = monthName;
    }
  }

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", color: "#FFFFFF" }}>
      {/* Top Navbar */}
      <div
        style={{
          background: "#1A1A1A",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #333"
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#A259FF" }}>Colab<span style={{ color: "#ffffffff" }}>X</span></h1>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 220,
            background: "#1A1A1A",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 15,
            borderRight: "1px solid #333"
          }}
        >
          <h2 style={{ color: "#A259FF", fontSize: 20, marginBottom: 10 }}>Menu</h2>
          <button onClick={() => handleNav("tasks")} style={sidebarBtnStyle}>
            Task Assignment
          </button>
          <button onClick={() => handleNav("progress")} style={sidebarBtnStyle}>
            Team Progress
          </button>
          <button onClick={() => handleNav("docs")} style={sidebarBtnStyle}>
            Project Documentation
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 30 }}>
          <header style={{ marginBottom: 20 }}>
            <h1 style={{ color: "#A259FF", fontSize: 24 }}>Team Progress Overview</h1>
          </header>

          {/* Charts Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20
            }}
          >
            <div style={cardStyle}>
              <h3>Weekly Progress</h3>
              <Line
                data={weeklyProgressData}
                height={200}
                options={{ animation: { duration: 1500 } }}
              />
            </div>

            <div style={cardStyle}>
              <h3>Tasks by Department</h3>
              <Bar
                data={departmentBarData}
                height={200}
                options={{
                  animation: { duration: 1500 },
                  responsive: true,
                  plugins: { legend: { labels: { color: "#FFF" } } },
                  scales: {
                    x: { ticks: { color: "#FFF" } },
                    y: { ticks: { color: "#FFF" } }
                  }
                }}
              />
            </div>

            <div style={cardStyle}>
              <h3>Resource Allocation</h3>
              <Pie
                data={resourcePieData}
                height={200}
                options={{
                  animation: { duration: 1500 },
                  plugins: { legend: { labels: { color: "#FFF" } } }
                }}
              />
            </div>
          </div>

          <div style={{ ...cardStyle, marginTop: 20 }}>
            <h3>Overall Completion</h3>
            <div
              style={{
                background: "#333",
                height: 10,
                borderRadius: 10,
                overflow: "hidden",
                marginTop: 10
              }}
            >
              <div
                style={{
                  width: `${completionPercentage}%`,
                  background: "#A259FF",
                  height: "100%",
                  transition: "width 0.5s ease"
                }}
              ></div>
            </div>
            <p style={{ marginTop: 8, color: "#B3B3B3" }}>
              {completionPercentage}% completed ({completedTasks} / {totalTasks} tasks)
            </p>
          </div>

          {/* GitHub-style contribution heatmap */}
          <div style={{ ...cardStyle, marginTop: 20, overflowX: "auto" }}>
            <h3>Contributions in the Last Year</h3>

            {/* Dynamic Month Row */}
            <div style={{ position: "relative", height: 20, marginLeft: 40, marginBottom: 4 }}>
              {monthPositions.map((m, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${m.index * 15}px`,
                    fontSize: 12,
                    color: "#B3B3B3"
                  }}
                >
                  {m.name}
                </div>
              ))}
            </div>

            <div style={{ display: "flex" }}>
              {/* Days column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 7 * 15
                }}
              >
                {["Mon", "Wed", "Fri"].map((day) => (
                  <div key={day} style={{ fontSize: 12, color: "#B3B3B3" }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks grid */}
              <div style={{ display: "flex", gap: 3 }}>
                {contributionData.map((week, wi) => (
                  <div
                    key={wi}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3
                    }}
                  >
                    {week.map((count, di) => (
                      <div
                        key={di}
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: getColor(count),
                          borderRadius: 2
                        }}
                        title={`${count} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card Style
const cardStyle = {
  background: "#1A1A1A",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #333"
};

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
