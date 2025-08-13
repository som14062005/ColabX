import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, MessageCircle, Code, FileText, CheckSquare, GitBranch, PenTool, Upload, Download, Edit3, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function ProjectNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [lastEditedBy, setLastEditedBy] = useState("");
  const [username, setUsername] = useState("");
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const workspaceFeatures = [
    { id: 'chatroom', name: 'Chat Room', icon: MessageCircle, isActive: false, route: '/chat' },
    { id: 'code-editor', name: 'Code Editor', icon: Code, isActive: false, route: '/code' },
    { id: 'notes', name: 'Notes', icon: FileText, isActive: true, route: '/notes' },
    { id: 'issue-board', name: 'Issue Board', icon: CheckSquare, isActive: false, route: '/issues' },
    { id: 'git-commits', name: 'Git Commits', icon: GitBranch, isActive: false, route: '/git' },
    { id: 'whiteboard', name: 'Whiteboard', icon: PenTool, isActive: false, route: '/whiteboard' }
  ];

  useEffect(() => {
    setNotes(localStorage.getItem("projectNotes") || "");
    setLastEditedBy(localStorage.getItem("lastEditedBy") || "");
  }, []);

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

  const handleSave = () => {
    localStorage.setItem("projectNotes", notes);
    localStorage.setItem("lastEditedBy", username || "Unknown");
    setLastEditedBy(username || "Unknown");
    setIsEditing(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = () => setNotes(reader.result);
      reader.readAsText(file);
    } else {
      alert("Only .md files allowed");
    }
  };

  const handleExport = () => {
    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ProjectNotes.md";
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0c0c0c, #1a1a1a 50%, #0f0f0f)', color: "#fff" }}>
      {/* Top Navbar */}
      <nav style={{
        background: 'linear-gradient(90deg, rgba(26,26,26,0.95), rgba(20,20,20,0.95))',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ color: '#a855f7' }}>Colab</span><span style={{ color: '#fff' }}>X</span>
          </div>
          {/* Workspace Dropdown button next to ColabX */}
          <div className="workspace-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(168,85,247,0.3)',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))',
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
                left: 0,
                width: '240px',
                background: 'linear-gradient(135deg, rgba(13,13,13,0.98), rgba(26,26,26,0.98))',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '12px',
                padding: '8px',
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
                        background: feature.isActive ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
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
        <div style={{ fontSize: '14px', color: '#B3B3B3' }}>Collaborative Workspace Platform</div>
      </nav>

      {/* Page Content */}
      <div className="notes-container flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-6xl w-full notes-content p-8" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.95), rgba(20,20,20,0.95))', borderRadius: '16px' }}>
          
          <div className="flex justify-end mb-6">
            <input
              type="text"
              placeholder="Your Name"
              style={{
                background: 'rgba(13,13,13,0.8)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                minWidth: '200px'
              }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Edit/View Mode */}
          {isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <textarea
                style={{
                  background: 'rgba(13,13,13,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  color: '#fff',
                  height: '500px'
                }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start writing your notes in Markdown..."
              />
              <div style={{
                background: 'rgba(13,13,13,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '20px',
                height: '500px',
                overflowY: 'auto'
              }}>
                <ReactMarkdown>{notes || "*Start writing to see preview*"}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="notes-display mb-6" style={{
              background: 'rgba(13,13,13,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '24px',
              minHeight: '400px'
            }}>
              {notes ? (
                <ReactMarkdown>{notes}</ReactMarkdown>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No notes yet</p>
                  <p className="text-sm">Click "Edit" to start writing</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            {isEditing ? (
              <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', padding: '12px 24px', borderRadius: '8px', color: '#fff' }}>
                <Save size={18} /> Save Changes
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', padding: '12px 24px', borderRadius: '8px', color: '#fff' }}>
                <Edit3 size={18} /> Edit Notes
              </button>
            )}
            <label style={{ background: 'linear-gradient(135deg, #059669, #047857)', padding: '12px 24px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
              <Upload size={18} /> Upload .md File
              <input type="file" accept=".md" onChange={handleFileUpload} className="hidden" />
            </label>
            <button onClick={handleExport} style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', padding: '12px 24px', borderRadius: '8px', color: '#fff' }}>
              <Download size={18} /> Export .md
            </button>
          </div>

          {lastEditedBy && (
            <div style={{ color: '#B3B3B3', fontSize: '14px', marginTop: '20px' }}>
              Last edited by <span style={{ color: '#a855f7' }}>{lastEditedBy}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
