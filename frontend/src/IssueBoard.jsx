import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";

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
  const [columns, setColumns] = useState({
    issues: { name: "Issues", items: [] },
    inProgress: { name: "Under Work", items: [] },
    completed: { name: "Completed", items: [] }
  });

  const [showForm, setShowForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", description: "", dueDate: "", status: "Low", assignee: "" });
  const [expandedItem, setExpandedItem] = useState(null);

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

    setColumns((prev) => ({
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
    <div
      style={{
        background: theme.background,
        color: theme.text,
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ 
  fontSize: "2.5rem",
  fontWeight: "700",
  margin: "0",
  filter: "drop-shadow(0 0 10px rgba(162, 89, 255, 0.3))"
}}>
  <span style={{ color: "#FFFFFF" }}>Issue</span>{" "}
  <span style={{
    background: "linear-gradient(135deg, #A259FF 0%, #7C3AED 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  }}>
    Management
  </span>
</h1>

        <div style={{ 
          width: "60px", 
          height: "3px", 
          background: theme.primary,
          margin: "16px auto",
          borderRadius: "2px",
          boxShadow: theme.glow
        }} />
      </div>

      {/* Add Issue Form - Moved to top */}
      {showForm && (
        <div style={{
          maxWidth: "400px",
          margin: "0 auto 32px auto",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(162, 89, 255, 0.2)",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", color: theme.text, fontSize: "1.2rem" }}>Add New Issue</h3>
          <input
            style={inputStyle}
            placeholder="Issue Title"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
          />
          <textarea
            style={{ ...inputStyle, height: "80px", resize: "none" }}
            placeholder="Description"
            value={newIssue.description}
            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
          />
          <input
            style={inputStyle}
            type="date"
            placeholder="Due Date"
            value={newIssue.dueDate}
            onChange={(e) => setNewIssue({ ...newIssue, dueDate: e.target.value })}
          />
          <select
            style={selectStyle}
            value={newIssue.status}
            onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}
          >
            <option style={{background: "#1A1A1A", color: "#FFFFFF"}} value="Low">🟢 Low Priority</option>
            <option style={{background: "#1A1A1A", color: "#FFFFFF"}} value="Medium">🟡 Medium Priority</option>
            <option style={{background: "#1A1A1A", color: "#FFFFFF"}} value="High">🔴 High Priority</option>
            <option style={{background: "#1A1A1A", color: "#FFFFFF"}} value="Critical">⚡ Critical</option>
          </select>
          <input
            style={inputStyle}
            placeholder="Assigned to"
            value={newIssue.assignee}
            onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
          />
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              style={{ ...buttonStyle, background: "rgba(255, 255, 255, 0.1)" }}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button 
              style={buttonStyle} 
              onClick={handleAddIssue}
            >
              Add Issue
            </button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          {Object.entries(columns).map(([id, column]) => (
            <Droppable droppableId={id} key={id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    background: theme.card,
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${theme.cardBorder}`,
                    padding: "20px",
                    width: 320,
                    minHeight: 500,
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ 
                      color: theme.text,
                      fontSize: "1.2rem",
                      fontWeight: "600",
                      margin: "0"
                    }}>
                      {column.name}
                    </h3>
                    {id === "issues" && (
                      <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                          background: theme.primary,
                          border: "none",
                          borderRadius: "50%",
                          padding: "8px",
                          cursor: "pointer",
                          boxShadow: theme.glow,
                          transition: "all 0.2s ease",
                          transform: showForm ? "rotate(45deg)" : "rotate(0deg)"
                        }}
                        onMouseEnter={e => e.target.style.transform = showForm ? "rotate(45deg) scale(1.1)" : "rotate(0deg) scale(1.1)"}
                        onMouseLeave={e => e.target.style.transform = showForm ? "rotate(45deg)" : "rotate(0deg)"}
                      >
                        <Plus size={18} color={theme.text} />
                      </button>
                    )}
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                            style={{
                              background: snapshot.isDragging ? 
                                "linear-gradient(135deg, #A259FF 0%, #7C3AED 100%)" :
                                "rgba(255, 255, 255, 0.08)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: theme.text,
                              padding: "16px",
                              marginBottom: snapshot.isDragging ? "0" : "12px",
                              borderRadius: "12px",
                              boxShadow: snapshot.isDragging ? 
                                "0 10px 40px rgba(162, 89, 255, 0.4)" :
                                "0 4px 16px rgba(0, 0, 0, 0.2)",
                              cursor: snapshot.isDragging ? "grabbing" : "pointer",
                              transform: provided.draggableProps.style?.transform || "none",
                              transition: expandedItem === item.id ? "none" : "all 0.2s ease"
                            }}
                          >
                            <strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                              {item.title}
                            </strong>
                            
                            {/* Always visible status and assignee */}
                            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                              <div style={{ 
                                fontSize: "11px",
                                color: item.status === "Critical" ? "#FF4444" : 
                                        item.status === "High" ? "#FF8800" :
                                        item.status === "Medium" ? "#FFAA00" : "#44FF44",
                                background: "rgba(255, 255, 255, 0.1)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                display: "inline-block"
                              }}>
                                {item.status === "Critical" ? "⚡" : 
                                  item.status === "High" ? "🔴" :
                                  item.status === "Medium" ? "🟡" : "🟢"} {item.status}
                              </div>
                              {item.assignee && (
                                <div style={{ 
                                  fontSize: "11px",
                                  color: "#A259FF",
                                  background: "rgba(162, 89, 255, 0.1)",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  display: "inline-block"
                                }}>
                                  👤 {item.assignee}
                                </div>
                              )}
                            </div>

                            {/* Expandable description */}
                            {item.description && expandedItem === item.id && (
                              <p style={{ 
                                fontSize: "12px", 
                                color: theme.mutedText,
                                margin: "0 0 8px 0",
                                lineHeight: "1.4",
                                background: "rgba(255, 255, 255, 0.05)",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                maxHeight: "120px",
                                overflow: "auto"
                              }}>
                                {item.description}
                              </p>
                            )}

                            {/* Description indicator */}
                            {item.description && expandedItem !== item.id && (
                              <p style={{ 
                                fontSize: "11px", 
                                color: theme.mutedText,
                                margin: "0 0 8px 0",
                                fontStyle: "italic"
                              }}>
                                📄 Click to view description
                              </p>
                            )}

                            {item.dueDate && (
                              <div style={{ 
                                fontSize: "11px",
                                color: "#A259FF",
                                background: "rgba(162, 89, 255, 0.1)",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                display: "inline-block"
                              }}>
                                📅 Due: {new Date(item.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
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
  fontSize: "14px",
  outline: "none",
  backdropFilter: "blur(10px)",
  transition: "all 0.2s ease"
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
  backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23FFFFFF\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "16px"
};

const buttonStyle = {
  background: "linear-gradient(135deg, #A259FF 0%, #7C3AED 100%)",
  color: "#FFFFFF",
  padding: "12px 16px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "100%",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 4px 16px rgba(162, 89, 255, 0.3)",
  transition: "all 0.2s ease"
};