// src/pages/projectDashboard/LeadTasksPage.jsx
import React, { useState } from "react";

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  text: "#FFFFFF",
  muted: "#B3B3B3",
  primary: "#A259FF", // Purple for "Colab"
  accent: "#7C3AED",
  hover: "#2A2A2A",
  danger: "#EF4444",
  success: "#22C55E",
  warning: "#EAB308",
};

// ---------------- TaskFormModal Component ----------------
function TaskFormModal({ member, onClose, onSubmit }) {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([""]);
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium"); // New state for priority

  const addSubtask = () => setSubtasks([...subtasks, ""]);
  const updateSubtask = (value, index) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };
  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Format the datetime-local value to just the date for display consistency
    const formattedDate = deadline ? deadline.split('T')[0] : deadline;
    
    const newTask = {
      id: Date.now(),
      title: taskName.trim(),
      description: description.trim(),
      subtasks: subtasks.filter(st => st.trim() !== ""),
      dueDate: formattedDate,
      status: "Assigned", // This will count as pending
      priority: priority, // Use selected priority instead of hardcoded "Medium"
      assignedAt: new Date().toISOString(),
    };

    if (onSubmit) {
      onSubmit(newTask);
    }

    // Reset form
    setTaskName("");
    setDescription("");
    setSubtasks([""]);
    setDeadline("");
    setPriority("Medium"); // Reset priority to default
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: COLORS.card,
          padding: 20,
          borderRadius: 12,
          width: "400px",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ color: COLORS.primary, marginTop: 0 }}>
          Assign Task to {member.displayName}
        </h2>

        <label style={labelStyle}>Task Name</label>
        <input
          style={inputStyle}
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Enter task name"
        />

        <label style={labelStyle}>Task Description</label>
        <textarea
          style={{ ...inputStyle, height: "70px" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task"
        />

        <label style={labelStyle}>Subtasks</label>
        {subtasks.map((st, index) => (
          <div key={index} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={st}
              onChange={(e) => updateSubtask(e.target.value, index)}
              placeholder={`Subtask ${index + 1}`}
            />
            {subtasks.length > 1 && (
              <button style={removeBtnStyle} onClick={() => removeSubtask(index)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button style={smallBtnStyle} onClick={addSubtask}>
          + Add Subtask
        </button>

        {/* Priority Selection */}
        <label style={labelStyle}>Priority Level</label>
        <select
          style={selectStyle}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">🟢 Low Priority</option>
          <option value="Medium">🟡 Medium Priority</option>
          <option value="High">🔴 High Priority</option>
        </select>

        <label style={labelStyle}>Deadline</label>
        <input
          type="datetime-local"
          style={inputStyle}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
          <button style={cancelBtnStyle} onClick={onClose}>
            Cancel
          </button>
          <button
            style={submitBtnStyle}
            onClick={handleSubmit}
            disabled={!taskName.trim() || !deadline}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { color: "#B3B3B3", fontSize: 14, marginTop: 10, display: "block" };
const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "none",
  background: "#2A2A2A",
  color: "#FFFFFF",
  outline: "none",
};
const selectStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "none",
  background: "#2A2A2A",
  color: "#FFFFFF",
  outline: "none",
  cursor: "pointer",
};
const smallBtnStyle = {
  background: "#A259FF",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  color: "#0D0D0D",
  cursor: "pointer",
  fontSize: 12,
};
const removeBtnStyle = {
  background: "#FF4C4C",
  border: "none",
  padding: "0 8px",
  borderRadius: 6,
  color: "#FFF",
  cursor: "pointer",
};
const cancelBtnStyle = {
  background: "#2A2A2A",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  color: "#FFFFFF",
  cursor: "pointer",
};
const submitBtnStyle = {
  background: "#A259FF",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  color: "#0D0D0D",
  fontWeight: 600,
  cursor: "pointer",
};

// ---------------- LeadTasksPage Component ----------------
export default function LeadTasksPage() {
  const [members, setMembers] = useState([
    {
      id: 1,
      displayName: "John Doe",
      role: "Developer",
      email: "john@example.com",
      tasks: [
        { title: "Fix login bug", status: "In Progress", priority: "High", dueDate: "2025-08-12" },
        { title: "Update API docs", status: "Pending", priority: "Low", dueDate: "2025-08-15" },
      ],
    },
    {
      id: 2,
      displayName: "Jane Smith",
      role: "Designer",
      email: "jane@example.com",
      tasks: [
        { title: "Redesign homepage", status: "Completed", priority: "High", dueDate: "2025-08-08" },
      ],
    },
    {
      id: 3,
      displayName: "Mike Johnson",
      role: "QA Tester",
      email: "mike@example.com",
      tasks: [],
    },
  ]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAssignTask = (memberId, task) => {
    // Update the members array with the new task
    setMembers(prevMembers => {
      const updatedMembers = prevMembers.map((m) =>
        m.id === memberId ? { ...m, tasks: [...m.tasks, task] } : m
      );
      
      // If this member is currently selected, update the selectedMember as well
      if (selectedMember && selectedMember.id === memberId) {
        const updatedMember = updatedMembers.find(m => m.id === memberId);
        setSelectedMember(updatedMember);
      }
      
      return updatedMembers;
    });
  };

  const filteredMembers = members.filter((m) =>
    m.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTaskCounts = () => {
    let total = 0,
      pending = 0,
      completed = 0;
    members.forEach((m) => {
      m.tasks.forEach((t) => {
        total++;
        if (t.status === "Completed") {
          completed++;
        } else {
          pending++; // All non-completed tasks are considered pending
        }
      });
    });
    return { total, pending, completed };
  };

  const { total, pending, completed } = getTaskCounts();

  const getPriorityColor = (priority) => {
    if (priority === "High") return COLORS.danger;
    if (priority === "Medium") return COLORS.warning;
    return COLORS.success;
  };

  return (
    <div
      style={{
        background: COLORS.background,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: COLORS.card,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          <span style={{ color: COLORS.primary }}>Colab</span>
          <span style={{ color: COLORS.text }}>X</span>
        </div>
        <div style={{ color: COLORS.muted }}>Lead Dashboard</div>
      </nav>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "16px 24px",
          background: COLORS.hover,
        }}
      >
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: COLORS.primary }}>{total}</div>
          <div style={{ color: COLORS.muted }}>Total Tasks</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: COLORS.warning }}>{pending}</div>
          <div style={{ color: COLORS.muted }}>Pending / In Progress</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: COLORS.success }}>{completed}</div>
          <div style={{ color: COLORS.muted }}>Completed</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", padding: 20, gap: 20 }}>
        {/* Members list */}
        <div
          style={{
            flex: "0 0 300px",
            background: COLORS.card,
            padding: 16,
            borderRadius: 12,
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            height: "fit-content",
          }}
        >
          <h3 style={{ marginTop: 0, color: COLORS.primary }}>Team Members</h3>
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: 12,
              borderRadius: 6,
              border: "none",
              background: COLORS.hover,
              color: COLORS.text,
            }}
          />
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filteredMembers.map((m) => (
              <li
                key={m.id}
                onClick={() => setSelectedMember(m)}
                style={{
                  cursor: "pointer",
                  padding: "12px 10px",
                  borderRadius: 8,
                  marginBottom: 8,
                  background: selectedMember?.id === m.id ? COLORS.accent : COLORS.hover,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primary)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    selectedMember?.id === m.id ? COLORS.accent : COLORS.hover)
                }
              >
                <div style={{ color: COLORS.text, fontWeight: 600 }}>
                  {m.displayName}
                </div>
                <div style={{ color: COLORS.muted, fontSize: 12 }}>
                  {m.role} • {m.tasks?.length || 0} tasks
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: 1,
            background: COLORS.card,
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!selectedMember ? (
            <div style={{ color: COLORS.text }}>
              <h2 style={{ marginTop: 0 }}>Team Overview</h2>
              <p style={{ color: COLORS.muted }}>
                Select a member to view and manage their tasks.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, color: COLORS.text }}>
                    {selectedMember.displayName}
                  </h2>
                  <div style={{ color: COLORS.muted }}>
                    {selectedMember.email} • {selectedMember.tasks?.length || 0} tasks
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSelectedMember({ ...selectedMember, openAssign: true })
                  }
                  style={{
                    background: COLORS.primary,
                    color: "#0D0D0D",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = COLORS.accent)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = COLORS.primary)
                  }
                >
                  + Assign Task
                </button>
              </div>

              <div style={{ marginTop: 20 }}>
                <h4 style={{ color: COLORS.text, marginBottom: 8 }}>
                  Recent Tasks
                </h4>
                {selectedMember.tasks && selectedMember.tasks.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {selectedMember.tasks.map((task, idx) => (
                      <li
                        key={task.id || idx}
                        style={{
                          background: COLORS.hover,
                          padding: 12,
                          borderRadius: 8,
                          color: COLORS.text,
                          marginBottom: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                          <div
                            style={{
                              fontSize: 12,
                              color: COLORS.muted,
                              marginTop: 4,
                            }}
                          >
                            Due: {task.dueDate} | Status: {task.status}
                          </div>
                        </div>
                        <span
                          style={{
                            background: getPriorityColor(task.priority),
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "#0D0D0D",
                          }}
                        >
                          {task.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div
                    style={{
                      background: COLORS.hover,
                      padding: 12,
                      borderRadius: 8,
                      color: COLORS.muted,
                    }}
                  >
                    No assigned tasks yet for this member.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task modal */}
      {selectedMember?.openAssign && (
        <TaskFormModal
          member={selectedMember}
          onClose={() =>
            setSelectedMember({ ...selectedMember, openAssign: false })
          }
          onSubmit={(task) => handleAssignTask(selectedMember.id, task)}
        />
      )}
    </div>
  );
}
