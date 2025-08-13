import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, ChevronDown, MessageCircle, Code, FileText, CheckSquare, GitBranch, PenTool } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const theme = {
  background: "linear-gradient(135deg, #0F0F23 0%, #1A0B3D 100%)",
  card: "rgba(255, 255, 255, 0.05)",
  cardBorder: "rgba(162, 89, 255, 0.2)",
  primary: "linear-gradient(135deg, #A259FF 0%, #7C3AED 100%)",
  accent: "#7C3AED",
  text: "#FFFFFF",
  mutedText: "#B3B3B3",
  glow: "0 0 20px rgba(162, 89, 255, 0.3)"
};

export default function IssueBoard() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({
    issues: { name: "Issues", items: [] },
    inProgress: { name: "Under Work", items: [] },
    completed: { name: "Completed", items: [] }
  });
  const [showForm, setShowForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", description: "", dueDate: "", status: "Low", assignee: "" });
  const [expandedItem, setExpandedItem] = useState(null);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const workspaceFeatures = [
    { id: 'chatroom', name: 'Chat Room', icon: MessageCircle, isActive: false, route: '/chat' },
    { id: 'code-editor', name: 'Code Editor', icon: Code, isActive: false, route: '/code' },
    { id: 'notes', name: 'Notes', icon: FileText, isActive: false, route: '/notes' },
    { id: 'issue-board', name: 'Issue Board', icon: CheckSquare, isActive: true, route: '/issues' },
    { id: 'git-commits', name: 'Git Commits', icon: GitBranch, isActive: false, route: '/git' },
    { id: 'whiteboard', name: 'Whiteboard', icon: PenTool, isActive: false, route: '/whiteboard' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWorkspaceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWorkspaceFeatureClick = (feature) => {
    if (!feature.isActive) navigate(feature.route);
    setShowWorkspaceDropdown(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  const handleAddIssue = () => {
    if (!newIssue.title.trim()) return;
    setColumns(prev => ({
      ...prev,
      issues: {
        ...prev.issues,
        items: [
          ...prev.issues.items,
          { id: Date.now().toString(), ...newIssue }
        ]
      }
    }));
    setNewIssue({ title: "", description: "", dueDate: "", status: "Low", assignee: "" });
    setShowForm(false);
  };

  return (
    <div style={{
      background: theme.background,
      color: theme.text,
      minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Top Navbar with dropdown next to brand */}
      <nav style={{
        background: 'linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(20,20,20,0.95) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        {/* Brand + Dropdown together */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ color: '#a855f7' }}>Colab</span>
            <span style={{ color: '#fff' }}>X</span>
          </div>
          <div ref={dropdownRef}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(168,85,247,0.3)',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <ChevronDown size={18} />
            </button>
            {showWorkspaceDropdown && (
              <div style={{
                position: 'absolute',
                marginTop: '8px',
                background: 'linear-gradient(135deg, rgba(13,13,13,0.98) 0%, rgba(26,26,26,0.98) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '12px',
                padding: '8px',
                width: '220px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                zIndex: 200
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, padding: '6px 10px', color: '#94a3b8' }}>Workspace Features</div>
                {workspaceFeatures.map(feature => {
                  const Icon = feature.icon;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => handleWorkspaceFeatureClick(feature)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        background: feature.isActive ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : 'transparent',
                        color: feature.isActive ? '#fff' : '#B3B3B3',
                        border: 'none',
                        textAlign: 'left',
                        cursor: feature.isActive ? 'default' : 'pointer'
                      }}
                    >
                      <Icon size={16} style={{ marginRight: '10px' }} />
                      {feature.name}
                      {feature.isActive && <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                        marginLeft: 'auto'
                      }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ fontSize: '14px', color: '#B3B3B3' }}>
          Collaborative Workspace Platform
        </div>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          margin: 0,
          filter: 'drop-shadow(0 0 10px rgba(162, 89, 255, 0.3))'
        }}>
          <span style={{ color: '#fff' }}>Issue</span>{" "}
          <span style={{
            background: 'linear-gradient(135deg, #A259FF 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Management
          </span>
        </h1>
        <div style={{
          width: '60px',
          height: '3px',
          background: theme.primary,
          margin: '16px auto',
          borderRadius: '2px',
          boxShadow: theme.glow
        }} />
      </div>

      {/* Add Issue Form */}
      {showForm && (
        <div style={{
          maxWidth: "400px",
          margin: "0 auto 32px auto",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(162, 89, 255, 0.2)",
          padding: "20px",
          borderRadius: "16px"
        }}>
          <h3 style={{ marginBottom: "12px" }}>Add New Issue</h3>
          <input style={inputStyle} placeholder="Issue Title" value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} />
          <textarea style={{ ...inputStyle, height: "80px" }} placeholder="Description" value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} />
          <input style={inputStyle} type="date" value={newIssue.dueDate} onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })} />
          <select style={selectStyle} value={newIssue.status} onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}>
            <option value="Low">🟢 Low Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="High">🔴 High Priority</option>
            <option value="Critical">⚡ Critical</option>
          </select>
          <input style={inputStyle} placeholder="Assigned to" value={newIssue.assignee} onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })} />
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ ...buttonStyle, background: "rgba(255,255,255,0.1)" }} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={buttonStyle} onClick={handleAddIssue}>Add Issue</button>
          </div>
        </div>
      )}

      {/* Drag & Drop Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", paddingBottom: "40px" }}>
          {Object.entries(columns).map(([id, column]) => (
            <Droppable droppableId={id} key={id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{
                  background: theme.card,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${theme.cardBorder}`,
                  padding: "20px",
                  width: 320,
                  minHeight: 500,
                  borderRadius: "16px"
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3>{column.name}</h3>
                    {id === "issues" && (
                      <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                          background: theme.primary,
                          border: 'none',
                          borderRadius: '50%',
                          padding: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          style={{
                            background: snapshot.isDragging ? 'linear-gradient(135deg, #A259FF 0%, #7C3AED 100%)' : 'rgba(255, 255, 255, 0.08)',
                            marginBottom: '12px', padding: '16px', borderRadius: '12px'
                          }}>
                          <strong>{item.title}</strong>
                          {expandedItem === item.id && <p>{item.description}</p>}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#FFFFFF",
  outline: "none"
};

const selectStyle = { ...inputStyle, cursor: "pointer" };

const buttonStyle = {
  background: "linear-gradient(135deg, #A259FF 0%, #7C3AED 100%)",
  color: "#FFFFFF",
  padding: "12px 16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  fontWeight: "600"
};
