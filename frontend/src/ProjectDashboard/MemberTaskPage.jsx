// src/pages/projectDashboard/MemberTasksPage.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";

const COLORS = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  text: "#FFFFFF",
  muted: "#B3B3B3",
  primary: "#A259FF",
  accent: "#7C3AED",
  hover: "#2A2A2A",
  danger: "#EF4444",
  success: "#22C55E",
  warning: "#EAB308",
  info: "#3B82F6",
};

// Task Detail Modal Component
function TaskDetailModal({ task, onClose, onUpdateStatus, onAddComment }) {
  const [newComment, setNewComment] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(task.id, newComment.trim());
      setNewComment("");
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return COLORS.danger;
    if (priority === "Medium") return COLORS.warning;
    return COLORS.success;
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return COLORS.success;
    if (status === "In Progress") return COLORS.info;
    return COLORS.warning;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 16,
          width: "90%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${COLORS.hover}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: COLORS.text, fontSize: 20 }}>
              {task.title}
            </h2>
            <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center" }}>
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
                {task.priority} Priority
              </span>
              <span
                style={{
                  background: getStatusColor(task.status),
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#0D0D0D",
                }}
              >
                {task.status}
              </span>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>
                Due: {task.dueDate || "No deadline"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.muted,
              fontSize: 24,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Description */}
          {task.description && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: COLORS.primary, marginBottom: 8 }}>Description</h4>
              <p style={{ color: COLORS.text, lineHeight: 1.6, margin: 0 }}>
                {task.description}
              </p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h4 style={{ color: COLORS.primary, margin: 0 }}>
                  Subtasks ({task.subtasks.length})
                </h4>
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: COLORS.accent,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  {showSubtasks ? "Hide" : "Show"}
                </button>
              </div>
              {showSubtasks && (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {task.subtasks.map((subtask, idx) => (
                    <li
                      key={idx}
                      style={{
                        background: COLORS.hover,
                        padding: "8px 12px",
                        borderRadius: 6,
                        marginBottom: 6,
                        color: COLORS.text,
                        fontSize: 14,
                      }}
                    >
                      • {subtask}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h4 style={{ color: COLORS.primary, marginBottom: 12 }}>Progress Notes</h4>
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a progress note or comment..."
                style={{
                  width: "100%",
                  minHeight: 60,
                  padding: 10,
                  borderRadius: 6,
                  border: "none",
                  background: COLORS.hover,
                  color: COLORS.text,
                  resize: "vertical",
                  fontSize: 14,
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  background: newComment.trim() ? COLORS.primary : COLORS.hover,
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  color: newComment.trim() ? "#0D0D0D" : COLORS.muted,
                  cursor: newComment.trim() ? "pointer" : "not-allowed",
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Add Note
              </button>
            </div>
            
            {/* Display existing comments */}
            {task.comments && task.comments.length > 0 && (
              <div style={{ maxHeight: 150, overflowY: "auto" }}>
                {task.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: COLORS.background,
                      padding: 10,
                      borderRadius: 6,
                      marginBottom: 8,
                      fontSize: 12,
                    }}
                  >
                    <div style={{ color: COLORS.text }}>{comment.text}</div>
                    <div style={{ color: COLORS.muted, marginTop: 4 }}>
                      {comment.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${COLORS.hover}`,
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          {task.status !== "Completed" && (
            <>
              <button
                onClick={() => onUpdateStatus(task.id, "In Progress")}
                style={{
                  background: COLORS.info,
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  color: "#0D0D0D",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Mark In Progress
              </button>
              <button
                onClick={() => onUpdateStatus(task.id, "Completed")}
                style={{
                  background: COLORS.success,
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  color: "#0D0D0D",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                ✓ Mark Complete
              </button>
            </>
          )}
          <button
            onClick={onClose}
            style={{
              background: COLORS.hover,
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              color: COLORS.text,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main MemberTasksPage Component
export default function MemberTasksPage() {
  const [tasks, setTasks] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, in-progress, completed
  const [sortBy, setSortBy] = useState("dueDate"); // dueDate, priority, status
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Mock data for demonstration - replace with actual API call
    const mockTasks = [
      {
        id: 1,
        title: "Fix login authentication bug",
        description: "There's an issue with user authentication that needs to be resolved. Users are experiencing login failures.",
        subtasks: ["Investigate login flow", "Check database connections", "Test with different browsers"],
        dueDate: "2025-08-15",
        status: "Assigned",
        priority: "High",
        assignedAt: "2025-08-10T10:00:00Z",
        comments: []
      },
      {
        id: 2,
        title: "Update API documentation",
        description: "Need to update the API docs with new endpoints and examples.",
        subtasks: ["Review new endpoints", "Write examples", "Update changelog"],
        dueDate: "2025-08-20",
        status: "In Progress",
        priority: "Medium",
        assignedAt: "2025-08-09T14:30:00Z",
        comments: [
          { text: "Started working on endpoint documentation", timestamp: "2025-08-11 10:30 AM" }
        ]
      }
    ];
    
    setTasks(mockTasks);
    
    // Uncomment when API is ready
    // apiFetch("/tasks/mine")
    //   .then((t) => setTasks(t || []))
    //   .catch((err) => {
    //     console.error("fetch tasks", err);
    //     setTasks([]);
    //   });
  }, []);

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setSelectedTask(null);
    
    // Here you would make an API call to update the task status
    // apiFetch(`/tasks/${taskId}/status`, { method: 'PUT', body: { status: newStatus } });
  };

  const handleAddComment = (taskId, comment) => {
    const newComment = {
      text: comment,
      timestamp: new Date().toLocaleString()
    };
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...(task.comments || []), newComment] }
        : task
    ));
    
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
    }
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    let filtered = tasks.filter(task => {
      const matchesFilter = 
        filter === "all" ||
        (filter === "pending" && ["Assigned", "Pending"].includes(task.status)) ||
        (filter === "in-progress" && task.status === "In Progress") ||
        (filter === "completed" && task.status === "Completed");
      
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
    
    return filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate || "2099-12-31") - new Date(b.dueDate || "2099-12-31");
      }
      if (sortBy === "priority") {
        const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
  }, [tasks, filter, sortBy, searchQuery]);

  const getTaskStats = () => {
    if (!tasks) return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => ["Assigned", "Pending"].includes(t.status)).length,
      inProgress: tasks.filter(t => t.status === "In Progress").length,
      completed: tasks.filter(t => t.status === "Completed").length,
    };
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return COLORS.danger;
    if (priority === "Medium") return COLORS.warning;
    return COLORS.success;
  };

  const getStatusColor = (status) => {
    if (status === "Completed") return COLORS.success;
    if (status === "In Progress") return COLORS.info;
    return COLORS.warning;
  };

  const stats = getTaskStats();

  if (tasks === null) {
    return (
      <div
        style={{
          background: COLORS.background,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ color: COLORS.muted, fontSize: 18 }}>Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.background,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
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
        <div style={{ color: COLORS.muted }}>My Tasks</div>
      </nav>

      {/* Stats Bar */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "16px 24px",
          background: COLORS.hover,
        }}
      >
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: COLORS.primary }}>
            {stats.total}
          </div>
          <div style={{ color: COLORS.muted }}>Total Tasks</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: COLORS.warning }}>
            {stats.pending}
          </div>
          <div style={{ color: COLORS.muted }}>Pending</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: COLORS.info }}>
            {stats.inProgress}
          </div>
          <div style={{ color: COLORS.muted }}>In Progress</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: COLORS.success }}>
            {stats.completed}
          </div>
          <div style={{ color: COLORS.muted }}>Completed</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div
        style={{
          padding: "16px 24px",
          background: COLORS.card,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: COLORS.hover,
            color: COLORS.text,
            fontSize: 14,
            minWidth: 200,
          }}
        />
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: COLORS.hover,
            color: COLORS.text,
            cursor: "pointer",
          }}
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: COLORS.hover,
            color: COLORS.text,
            cursor: "pointer",
          }}
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {/* Tasks List */}
      <div style={{ flex: 1, padding: 24 }}>
        {filteredAndSortedTasks.length === 0 ? (
          <div
            style={{
              background: COLORS.card,
              padding: 40,
              borderRadius: 12,
              textAlign: "center",
              color: COLORS.muted,
            }}
          >
            {searchQuery ? "No tasks match your search." : "No tasks assigned yet."}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filteredAndSortedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  background: COLORS.card,
                  padding: 20,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.hover;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = COLORS.card;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: COLORS.text, fontSize: 18 }}>
                      {task.title}
                    </h3>
                    <p style={{ color: COLORS.muted, margin: "8px 0", fontSize: 14 }}>
                      {task.description}
                    </p>
                    
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
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
                      <span
                        style={{
                          background: getStatusColor(task.status),
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "#0D0D0D",
                        }}
                      >
                        {task.status}
                      </span>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span style={{ color: COLORS.muted, fontSize: 12 }}>
                          {task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: "right", color: COLORS.muted, fontSize: 12 }}>
                    <div>Due: {task.dueDate || "No deadline"}</div>
                    <div style={{ marginTop: 4 }}>
                      Assigned: {new Date(task.assignedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {task.status !== "Completed" && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, "Completed")}
                      style={{
                        background: COLORS.success,
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        color: "#0D0D0D",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      ✓ Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
