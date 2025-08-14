// src/pages/projectDashboard/LeadTasksPage.jsx
import React, { useState, useEffect } from "react";

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

// API Helper Functions
const API_BASE = "http://localhost:3000";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const fetchProjectMembers = async (projectId) => {
  const response = await fetch(`${API_BASE}/projects/${projectId}/members`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to fetch members');
  const data = await response.json();
  
  // Return the exact structure from your API
  return {
    owner: data.owner,
    members: data.members
  };
};

const fetchProjectTasks = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE}/tasks-lead/${projectId}/tasks`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch tasks - endpoint might not exist yet');
      return [];
    }
    return await response.json();
  } catch (error) {
    console.warn('Tasks endpoint not available:', error);
    return [];
  }
};

const assignTaskAPI = async (projectId, userId, taskData) => {
  const response = await fetch(`${API_BASE}/tasks-lead/${projectId}/assign/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  });
  
  if (!response.ok) throw new Error('Failed to assign task');
  return await response.json();
};

const transferOwnershipAPI = async (projectId, newOwnerId) => {
  const response = await fetch(`${API_BASE}/tasks-lead/${projectId}/role/${newOwnerId}`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to transfer ownership');
  return await response.json();
};

// ---------------- TaskFormModal Component ----------------
function TaskFormModal({ member, onClose, onSubmit, isLoading }) {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([""]);
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");

  const addSubtask = () => setSubtasks([...subtasks, ""]);
  const updateSubtask = (value, index) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };
  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const taskData = {
      title: taskName.trim(),
      description: description.trim(),
      subtasks: subtasks.filter(st => st.trim() !== ""),
      dueDate: deadline,
      priority: priority,
    };

    if (onSubmit) {
      await onSubmit(taskData);
    }

    // Reset form
    setTaskName("");
    setDescription("");
    setSubtasks([""]);
    setDeadline("");
    setPriority("Medium");
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
          disabled={isLoading}
        />

        <label style={labelStyle}>Task Description</label>
        <textarea
          style={{ ...inputStyle, height: "70px" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task"
          disabled={isLoading}
        />

        <label style={labelStyle}>Subtasks</label>
        {subtasks.map((st, index) => (
          <div key={index} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={st}
              onChange={(e) => updateSubtask(e.target.value, index)}
              placeholder={`Subtask ${index + 1}`}
              disabled={isLoading}
            />
            {subtasks.length > 1 && (
              <button 
                style={removeBtnStyle} 
                onClick={() => removeSubtask(index)}
                disabled={isLoading}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button 
          style={smallBtnStyle} 
          onClick={addSubtask}
          disabled={isLoading}
        >
          + Add Subtask
        </button>

        <label style={labelStyle}>Priority Level</label>
        <select
          style={selectStyle}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={isLoading}
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
          disabled={isLoading}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
          <button 
            style={cancelBtnStyle} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            style={{
              ...submitBtnStyle,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSubmit}
            disabled={!taskName.trim() || !deadline || isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- TransferOwnershipModal Component ----------------
function TransferOwnershipModal({ members, currentOwner, onClose, onTransfer, isLoading }) {
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const handleTransfer = async () => {
    if (selectedMemberId && onTransfer) {
      await onTransfer(selectedMemberId);
      onClose();
    }
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
        <h2 style={{ color: COLORS.danger, marginTop: 0 }}>
          Transfer Project Ownership
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 14 }}>
          Select a member to transfer ownership to. This action cannot be undone.
        </p>

        <label style={labelStyle}>New Owner</label>
        <select
          style={selectStyle}
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select a member...</option>
          {members.filter(m => m._id !== currentOwner._id).map((member) => (
            <option key={member._id} value={member._id}>
              {member.displayName} ({member.email})
            </option>
          ))}
        </select>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, gap: 10 }}>
          <button 
            style={cancelBtnStyle} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            style={{
              ...submitBtnStyle,
              background: COLORS.danger,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onClick={handleTransfer}
            disabled={!selectedMemberId || isLoading}
          >
            {isLoading ? 'Transferring...' : 'Transfer Ownership'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- LeadTasksPage Component ----------------
export default function LeadTasksPage() {
  const [projectId, setProjectId] = useState(null);
  const [owner, setOwner] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [error, setError] = useState(null);

  // Get project ID from session storage and fetch data
  useEffect(() => {
    const storedProjectId = sessionStorage.getItem('currentProjectId');
    
    console.log('Project ID found:', storedProjectId);
    
    if (storedProjectId) {
      setProjectId(storedProjectId);
      loadProjectData(storedProjectId);
    } else {
      setError('No project ID found in session');
      setLoading(false);
    }
  }, []);

  const loadProjectData = async (projId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch members and tasks in parallel
      const [membersData, tasksData] = await Promise.all([
        fetchProjectMembers(projId),
        fetchProjectTasks(projId)
      ]);
      
      setOwner(membersData.owner);
      setMembers(membersData.members);
      setTasks(tasksData);
      
      console.log('Loaded data:', { membersData, tasksData });
    } catch (err) {
      setError('Failed to load project data: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (memberId, taskData) => {
    try {
      setAssignLoading(true);
      console.log('Assigning task:', { memberId, taskData });
      
      const response = await assignTaskAPI(projectId, memberId, taskData);
      
      console.log('Assignment response:', response);
      
      if (response.success) {
        // Add the new task to our local state
        if (response.data) {
          setTasks(prevTasks => [...prevTasks, response.data]);
        }
        
        // Refresh data to get latest state
        await loadProjectData(projectId);
        alert('Task assigned successfully!');
      } else {
        throw new Error(response.message || 'Assignment failed');
      }
    } catch (err) {
      alert('Failed to assign task: ' + err.message);
      console.error('Assignment error:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleTransferOwnership = async (newOwnerId) => {
    try {
      setTransferLoading(true);
      console.log('Transferring ownership to:', newOwnerId);
      
      const response = await transferOwnershipAPI(projectId, newOwnerId);
      console.log('Transfer response:', response);
      
      // Refresh the data after transfer
      await loadProjectData(projectId);
      alert('Ownership transferred successfully!');
    } catch (err) {
      alert('Failed to transfer ownership: ' + err.message);
      console.error('Transfer error:', err);
    } finally {
      setTransferLoading(false);
    }
  };

  // Filter members based on search
  const filteredMembers = members.filter((m) =>
    m.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get tasks for a specific member with member info
  const getMemberTasks = (memberId) => {
    return tasks.filter(task => task.assignedTo === memberId).map(task => {
      const assignedMember = members.find(m => m._id === task.assignedTo) || 
                           (owner && owner._id === task.assignedTo ? owner : null);
      return {
        ...task,
        assignedMemberName: assignedMember ? assignedMember.displayName : 'Unknown User',
        assignedMemberEmail: assignedMember ? assignedMember.email : ''
      };
    });
  };

  // Get all tasks with member information for display
  const getEnrichedTasks = () => {
    return tasks.map(task => {
      const assignedMember = members.find(m => m._id === task.assignedTo) || 
                           (owner && owner._id === task.assignedTo ? owner : null);
      return {
        ...task,
        assignedMemberName: assignedMember ? assignedMember.displayName : 'Unknown User',
        assignedMemberEmail: assignedMember ? assignedMember.email : ''
      };
    });
  };

  // Calculate task statistics
  const getTaskCounts = () => {
    let total = tasks.length;
    let pending = tasks.filter(t => t.status === "Assigned" || t.status === "In Progress").length;
    let completed = tasks.filter(t => t.status === "Completed").length;
    
    return { total, pending, completed };
  };

  const { total, pending, completed } = getTaskCounts();

  const getPriorityColor = (priority) => {
    if (priority === "High") return COLORS.danger;
    if (priority === "Medium") return COLORS.warning;
    return COLORS.success;
  };

  if (loading) {
    return (
      <div style={{ 
        background: COLORS.background, 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        color: COLORS.text 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 10 }}>Loading...</div>
          <div style={{ color: COLORS.muted }}>Fetching project data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: COLORS.background, 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        color: COLORS.danger,
        textAlign: "center"
      }}>
        <div>
          <div style={{ fontSize: 18, marginBottom: 10 }}>Error</div>
          <div>{error}</div>
          <div style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>
            Available sessionStorage keys: {Object.keys(sessionStorage).join(', ')}
          </div>
          <input 
            type="text" 
            placeholder="Enter project ID manually"
            style={{ ...inputStyle, marginTop: 10, width: "300px" }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const projId = e.target.value.trim();
                if (projId) {
                  setProjectId(projId);
                  sessionStorage.setItem('currentProjectId', projId);
                  loadProjectData(projId);
                }
              }
            }}
          />
          <button 
            style={{ ...submitBtnStyle, marginTop: 10, marginLeft: 10 }}
            onClick={() => projectId && loadProjectData(projectId)}
          >
            Retry
          </button>
        </div>
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ color: COLORS.muted }}>
            Owner: {owner?.displayName} | Project: {projectId?.slice(-8)}
          </div>
          <button
            onClick={() => setShowTransferModal(true)}
            style={{
              background: COLORS.danger,
              color: COLORS.text,
              border: "none",
              padding: "8px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
            disabled={transferLoading}
          >
            {transferLoading ? 'Transferring...' : 'Transfer Ownership'}
          </button>
        </div>
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
          <h3 style={{ marginTop: 0, color: COLORS.primary }}>Team Members ({members.length})</h3>
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
            {filteredMembers.map((m) => {
              const memberTasks = getMemberTasks(m._id);
              return (
                <li
                  key={m._id}
                  onClick={() => setSelectedMember(m)}
                  style={{
                    cursor: "pointer",
                    padding: "12px 10px",
                    borderRadius: 8,
                    marginBottom: 8,
                    background: selectedMember?._id === m._id ? COLORS.accent : COLORS.hover,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primary)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      selectedMember?._id === m._id ? COLORS.accent : COLORS.hover)
                  }
                >
                  <div style={{ color: COLORS.text, fontWeight: 600 }}>
                    {m.displayName}
                  </div>
                  <div style={{ color: COLORS.muted, fontSize: 12 }}>
                    {m.email} • {memberTasks.length} tasks
                  </div>
                </li>
              );
            })}
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
              <div style={{ marginTop: 20 }}>
                <h4 style={{ color: COLORS.text }}>Project Details</h4>
                <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>
                  <div>Project ID: {projectId}</div>
                  <div>Owner: {owner?.displayName} ({owner?.email})</div>
                  <div>Total Members: {members.length}</div>
                  <div>Total Tasks: {tasks.length}</div>
                </div>
              </div>
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
                    {selectedMember.email} • {getMemberTasks(selectedMember._id).length} tasks
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
                  disabled={assignLoading}
                >
                  + Assign Task
                </button>
              </div>

              <div style={{ marginTop: 20 }}>
                <h4 style={{ color: COLORS.text, marginBottom: 8 }}>
                  Assigned Tasks ({getMemberTasks(selectedMember._id).length})
                </h4>
                {(() => {
                  const memberTasks = getMemberTasks(selectedMember._id);
                  return memberTasks.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {memberTasks.map((task, idx) => (
                        <li
                          key={task._id || idx}
                          style={{
                            background: COLORS.hover,
                            padding: 12,
                            borderRadius: 8,
                            color: COLORS.text,
                            marginBottom: 8,
                            border: `1px solid ${getPriorityColor(task.priority)}20`
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
                              
                              {task.description && (
                                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>
                                  {task.description}
                                </div>
                              )}
                              
                              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>
                                <strong>Assigned to:</strong> {task.assignedMemberName} ({task.assignedMemberEmail})
                              </div>
                              
                              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>
                                <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()} | 
                                <strong> Status:</strong> {task.status}
                              </div>
                              
                              {task.assignedAt && (
                                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>
                                  <strong>Assigned:</strong> {new Date(task.assignedAt).toLocaleDateString()}
                                </div>
                              )}
                              
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>
                                  <strong>Subtasks ({task.subtasks.length}):</strong>
                                  <ul style={{ margin: "4px 0", paddingLeft: 16 }}>
                                    {task.subtasks.map((subtask, sIdx) => (
                                      <li key={sIdx} style={{ fontSize: 11, color: COLORS.muted }}>
                                        {subtask}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            <span
                              style={{
                                background: getPriorityColor(task.priority),
                                padding: "4px 8px",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: "bold",
                                color: "#0D0D0D",
                                marginLeft: 12,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {task.priority}
                            </span>
                          </div>
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
                        textAlign: "center"
                      }}
                    >
                      No assigned tasks yet for this member.
                    </div>
                  );
                })()}
              </div>
              
              {/* Show all project tasks section */}
              <div style={{ marginTop: 30 }}>
                <h4 style={{ color: COLORS.text, marginBottom: 8 }}>
                  All Project Tasks ({tasks.length})
                </h4>
                {(() => {
                  const enrichedTasks = getEnrichedTasks();
                  return enrichedTasks.length > 0 ? (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {enrichedTasks.map((task, idx) => (
                          <li
                            key={task._id || idx}
                            style={{
                              background: task.assignedTo === selectedMember._id ? COLORS.primary + "20" : COLORS.hover,
                              padding: 8,
                              borderRadius: 6,
                              color: COLORS.text,
                              marginBottom: 6,
                              fontSize: 13,
                              border: task.assignedTo === selectedMember._id ? `1px solid ${COLORS.primary}` : "none"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <span style={{ fontWeight: 600 }}>{task.title}</span>
                                <span style={{ color: COLORS.muted, marginLeft: 8 }}>
                                  → {task.assignedMemberName}
                                </span>
                              </div>
                              <span
                                style={{
                                  background: getPriorityColor(task.priority),
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: "bold",
                                  color: "#0D0D0D",
                                }}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: COLORS.hover,
                        padding: 12,
                        borderRadius: 8,
                        color: COLORS.muted,
                        textAlign: "center"
                      }}
                    >
                      No tasks assigned in this project yet.
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task Assignment Modal */}
      {selectedMember?.openAssign && (
        <TaskFormModal
          member={selectedMember}
          onClose={() =>
            setSelectedMember({ ...selectedMember, openAssign: false })
          }
          onSubmit={(taskData) => handleAssignTask(selectedMember._id, taskData)}
          isLoading={assignLoading}
        />
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <TransferOwnershipModal
          members={members}
          currentOwner={owner}
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransferOwnership}
          isLoading={transferLoading}
        />
      )}
    </div>
  );
}

// Styles
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