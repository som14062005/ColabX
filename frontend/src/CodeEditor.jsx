import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Users, Plus, Upload, Trash2, Code, Wifi, WifiOff, Eye, Download, Settings, Terminal, AlertCircle, ChevronDown, MessageCircle, FileText, CheckSquare, GitBranch, PenTool } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function CollabWorkspace() {
  const navigate = useNavigate();
  const [files, setFiles] = useState(new Map([
    ["index.js", "// Welcome to the collaborative workspace\nconsole.log('Hello, collaborative world!');\n"],
    ["README.md", "# Collaborative Workspace\n\nStart coding together in real-time!\n"],
    ["styles.css", "/* Add your styles here */\nbody {\n  font-family: 'Inter', sans-serif;\n}\n"]
  ]));
  
  const [activeFile, setActiveFile] = useState("index.js");
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [username, setUsername] = useState(() => "User-" + Math.floor(Math.random() * 1000));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPresence, setShowPresence] = useState(true);
  const [roomId, setRoomId] = useState("demo-room");
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  
  // WebSocket and collaboration refs
  const wsRef = useRef(null);
  const editorRef = useRef(null);
  const isLocalChangeRef = useRef(false);
  const userColorRef = useRef(generateRandomColor());
  const reconnectTimeoutRef = useRef(null);
  const isUnmountingRef = useRef(false);
  const dropdownRef = useRef(null);
  
  // Operation queue for handling conflicts
  const operationQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  // Workspace features data
  const workspaceFeatures = [
    { id: 'chatroom', name: 'Chat Room', icon: MessageCircle, isActive: false, route: '/chat' },
    { id: 'code-editor', name: 'Code Editor', icon: Code, isActive: true, route: '/code' },
    { id: 'notes', name: 'Notes', icon: FileText, isActive: false, route: '/notes' },
    { id: 'issue-board', name: 'Issue Board', icon: CheckSquare, isActive: false, route: '/issues' },
    { id: 'git-commits', name: 'Git Commits', icon: GitBranch, isActive: false, route: '/git' },
    { id: 'whiteboard', name: 'Whiteboard', icon: PenTool, isActive: false, route: '/whiteboard' }
  ];

  // Generate a random color for the user
  function generateRandomColor() {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWorkspaceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWorkspaceFeatureClick = (feature) => {
    if (!feature.isActive) {
      // Navigate to the corresponding route
      navigate(feature.route);
    }
    setShowWorkspaceDropdown(false);
  };

  // WebSocket connection management with proper cleanup
  const connectWebSocket = useCallback(() => {
    // Prevent multiple connections
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('🔄 WebSocket already connected or connecting, skipping...');
      return;
    }

    // Don't connect if component is unmounting
    if (isUnmountingRef.current) {
      console.log('🛑 Component unmounting, aborting connection');
      return;
    }
    
    // Close and cleanup any existing connection
    if (wsRef.current) {
      console.log('🧹 Cleaning up existing connection');
      wsRef.current.close();
      wsRef.current = null;
    }
    
    try {
      const wsUrl = `ws://localhost:8080/collab`;
      console.log('🔌 Creating NEW WebSocket connection to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        if (isUnmountingRef.current) {
          ws.close();
          return;
        }
        
        setConnected(true);
        setConnectionError(null);
        console.log('✅ WebSocket connected successfully');
        
        // Send join message
        ws.send(JSON.stringify({
          type: 'join',
          user: {
            id: username,
            name: username,
            color: userColorRef.current
          },
          roomId
        }));
      };
      
      ws.onmessage = (event) => {
        if (isUnmountingRef.current) return;
        
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
        setConnected(false);
        setActiveUsers(new Map());
        
        // Clear reconnect timeout if exists
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Only attempt reconnect if not intentionally unmounting
        if (!isUnmountingRef.current && event.code !== 1000) {
          console.log('🔄 Attempting to reconnect in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmountingRef.current) {
              connectWebSocket();
            }
          }, 3000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionError('Connection failed - check if server is running');
      };
      
    } catch (error) {
      setConnectionError('Unable to establish WebSocket connection');
      console.error('❌ WebSocket connection error:', error);
    }
  }, [roomId, username]); // Only depend on roomId and username

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'user-joined':
        setActiveUsers(prev => new Map(prev.set(message.user.id, message.user)));
        break;
        
      case 'user-left':
        setActiveUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(message.userId);
          return newUsers;
        });
        break;
        
      case 'users-list':
        setActiveUsers(new Map(message.users.map(user => [user.id, user])));
        break;
        
      case 'file-operation':
        handleFileOperation(message);
        break;
        
      case 'cursor-position':
        handleCursorUpdate(message);
        break;
        
      case 'file-list':
        // Sync file list
        const newFiles = new Map();
        Object.entries(message.files).forEach(([filename, content]) => {
          newFiles.set(filename, content);
        });
        setFiles(newFiles);
        break;
        
      case 'error':
        console.error('Server error:', message.error);
        setConnectionError(message.error);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, []);

  // Handle file operations from other users
  const handleFileOperation = useCallback((message) => {
    if (message.userId === username) return; // Ignore own operations
    
    const { operation, filename } = message;
    
    if (filename !== activeFile) return; // Only apply to current file
    
    const editor = editorRef.current;
    if (!editor) return;
    
    isLocalChangeRef.current = true; // Prevent echoing changes
    
    try {
      switch (operation.type) {
        case 'insert':
          editor.executeEdits('collaboration', [{
            range: new window.monaco.Range(
              operation.position.lineNumber,
              operation.position.column,
              operation.position.lineNumber,
              operation.position.column
            ),
            text: operation.text
          }]);
          break;
          
        case 'delete':
          editor.executeEdits('collaboration', [{
            range: new window.monaco.Range(
              operation.range.startLineNumber,
              operation.range.startColumn,
              operation.range.endLineNumber,
              operation.range.endColumn
            ),
            text: ''
          }]);
          break;
          
        case 'replace':
          editor.executeEdits('collaboration', [{
            range: new window.monaco.Range(
              operation.range.startLineNumber,
              operation.range.startColumn,
              operation.range.endLineNumber,
              operation.range.endColumn
            ),
            text: operation.text
          }]);
          break;
      }
    } catch (error) {
      console.error('Failed to apply operation:', error);
    }
    
    setTimeout(() => {
      isLocalChangeRef.current = false;
    }, 100);
  }, [username, activeFile]);

  // Handle cursor position updates
  const handleCursorUpdate = useCallback((message) => {
    if (message.userId === username) return;
    
    setActiveUsers(prev => {
      const newUsers = new Map(prev);
      const user = newUsers.get(message.userId);
      if (user) {
        newUsers.set(message.userId, {
          ...user,
          cursor: message.position,
          filename: message.filename
        });
      }
      return newUsers;
    });
  }, [username]);

  // Handle room/username changes separately
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔄 Room or username changed, rejoining...');
      
      // Send new join message with updated info
      wsRef.current.send(JSON.stringify({
        type: 'join',
        user: {
          id: username,
          name: username,
          color: userColorRef.current
        },
        roomId
      }));
    }
  }, [roomId, username]); // Reconnect when room or username changes
  
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Send file operation to other users
  const sendFileOperation = useCallback((operation, filename) => {
    sendMessage({
      type: 'file-operation',
      operation,
      filename,
      userId: username,
      roomId
    });
  }, [sendMessage, username, roomId]);

  // Send cursor position to other users
  const sendCursorPosition = useCallback((position, filename) => {
    sendMessage({
      type: 'cursor-position',
      position,
      filename,
      userId: username,
      roomId
    });
  }, [sendMessage, username, roomId]);

  // Initialize WebSocket connection with proper cleanup
  useEffect(() => {
    // Mark component as mounted
    isUnmountingRef.current = false;
    
    console.log('🚀 Component mounted, setting up WebSocket...');
    
    // Small delay to prevent immediate reconnections in development
    const timeoutId = setTimeout(() => {
      if (!isUnmountingRef.current) {
        connectWebSocket();
      }
    }, 500);
    
    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      isUnmountingRef.current = true;
      
      clearTimeout(timeoutId);
      
      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Close WebSocket connection
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          // Send leave message before closing
          wsRef.current.send(JSON.stringify({
            type: 'leave',
            userId: username,
            roomId
          }));
        }
        wsRef.current.close(1000, 'Component unmounting'); // Normal closure
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once per mount

  // Handle editor changes
  const handleEditorChange = useCallback((value, event) => {
    if (isLocalChangeRef.current) return; // Ignore collaborative changes
    
    // Update local file content
    setFiles(prev => new Map(prev.set(activeFile, value || '')));
    
    // Convert Monaco change event to operations
    if (event?.changes) {
      event.changes.forEach(change => {
        const operation = {
          type: change.text ? 'replace' : 'delete',
          range: {
            startLineNumber: change.range.startLineNumber,
            startColumn: change.range.startColumn,
            endLineNumber: change.range.endLineNumber,
            endColumn: change.range.endColumn
          },
          text: change.text
        };
        
        sendFileOperation(operation, activeFile);
      });
    }
  }, [activeFile, sendFileOperation]);

  // Handle cursor position changes
  const handleCursorPositionChange = useCallback((event) => {
    if (!event?.position) return;
    
    sendCursorPosition({
      lineNumber: event.position.lineNumber,
      column: event.position.column
    }, activeFile);
  }, [sendCursorPosition, activeFile]);

  // Create new file
  const createNewFile = useCallback(() => {
    const base = "new-file";
    let i = 1;
    let name;
    do {
      name = `${base}-${i}.js`;
      i++;
    } while (files.has(name));

    const newContent = "// Start coding...\n";
    setFiles(prev => new Map(prev.set(name, newContent)));
    setActiveFile(name);
    
    // Notify other users
    sendMessage({
      type: 'file-created',
      filename: name,
      content: newContent,
      userId: username,
      roomId
    });
  }, [files, sendMessage, username, roomId]);

  // Delete file
  const deleteFile = useCallback((name) => {
    if (files.size <= 1) return;
    
    setFiles(prev => {
      const newFiles = new Map(prev);
      newFiles.delete(name);
      return newFiles;
    });
    
    if (name === activeFile) {
      const remainingFiles = Array.from(files.keys()).filter(f => f !== name);
      setActiveFile(remainingFiles[0]);
    }
    
    // Notify other users
    sendMessage({
      type: 'file-deleted',
      filename: name,
      userId: username,
      roomId
    });
  }, [files, activeFile, sendMessage, username, roomId]);

  // Download file
  const downloadFile = useCallback((name) => {
    const content = files.get(name) || "";
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

  // Handle file upload
  const handleFileUpload = useCallback((ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      setFiles(prev => new Map(prev.set(file.name, content)));
      setActiveFile(file.name);
      
      // Notify other users
      sendMessage({
        type: 'file-created',
        filename: file.name,
        content,
        userId: username,
        roomId
      });
    };
    reader.readAsText(file);
    ev.target.value = null;
  }, [sendMessage, username, roomId]);

  // Detect language from filename
  const detectLanguage = useCallback((filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const langMap = {
      js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
      json: "json", md: "markdown", py: "python", css: "css", html: "html",
      scss: "scss", less: "less", xml: "xml", yaml: "yaml", yml: "yaml"
    };
    return langMap[ext] || "plaintext";
  }, []);

  // Get file icon color
  const getFileIcon = useCallback((filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const colors = {
      js: "#f7df1e", jsx: "#61dafb", ts: "#3178c6", tsx: "#3178c6",
      json: "#000000", md: "#ffffff", py: "#3776ab", css: "#1572b6",
      html: "#e34f26", scss: "#cf649a"
    };
    return colors[ext] || "#6b7280";
  }, []);

  // Handle editor mount
  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    // Enhanced editor options
    editor.updateOptions({
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 14,
      lineHeight: 1.6,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      renderLineHighlight: 'gutter',
      selectOnLineNumbers: true,
      automaticLayout: true
    });

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition(handleCursorPositionChange);
    
    // Display collaborative cursors
    const updateCollaborativeCursors = () => {
      const decorations = [];
      activeUsers.forEach((user, userId) => {
        if (user.cursor && user.filename === activeFile && userId !== username) {
          decorations.push({
            range: new monaco.Range(
              user.cursor.lineNumber, 
              user.cursor.column, 
              user.cursor.lineNumber, 
              user.cursor.column
            ),
            options: {
              className: 'collaborative-cursor',
              hoverMessage: { value: `${user.name} is here` },
              beforeContentClassName: 'collaborative-cursor-label',
              before: {
                content: user.name,
                inlineClassName: 'collaborative-cursor-name',
                color: user.color
              }
            }
          });
        }
      });
      
      editor.deltaDecorations([], decorations);
    };

    // Update cursors when users change
    const interval = setInterval(updateCollaborativeCursors, 500);
    return () => clearInterval(interval);
  }, [handleCursorPositionChange, activeUsers, activeFile, username]);

  return (
    <div className="workspace-container">
      <style jsx>{`
        .workspace-container {
          display: flex;
          height: 100vh;
          background: #0a0e1a;
          font-family: 'Inter', system-ui, sans-serif;
          color: #e2e8f0;
        }
        
        .sidebar {
          width: ${sidebarCollapsed ? '60px' : '320px'};
          background: linear-gradient(180deg, #111827 0%, #0f1629 100%);
          border-right: 1px solid #1e293b;
          transition: width 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .sidebar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
          pointer-events: none;
        }
        
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #1e293b;
          position: relative;
          z-index: 5;
        }

        .workspace-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
        }

        .workspace-title-section {
          flex: 1;
          min-width: 0;
        }

        .workspace-title {
          font-size: 18px;
          font-weight: bold;
          color: white;
          margin-bottom: 4px;
          text-shadow: 0 2px 10px rgba(168,85,247,0.3);
          line-height: 1.2;
        }

        .workspace-subtitle {
          font-size: 14px;
          color: #B3B3B3;
          line-height: 1.2;
        }

        .workspace-dropdown {
          position: relative;
          flex-shrink: 0;
        }

        .workspace-dropdown-button {
          padding: 10px;
          border-radius: 12px;
          border: 1px solid rgba(168,85,247,0.3);
          background: linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          box-shadow: ${showWorkspaceDropdown 
            ? '0 8px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
            : '0 4px 20px rgba(168,85,247,0.2)'};
        }

        .workspace-dropdown-button:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(59,130,246,0.3) 100%);
        }

        .workspace-dropdown-button:active {
          transform: scale(0.95);
        }

        .workspace-dropdown-chevron {
          transition: all 0.3s ease;
          ${showWorkspaceDropdown ? 'transform: rotate(180deg); color: #a855f7;' : ''}
        }

        .workspace-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 240px;
          max-height: 400px;
          background: linear-gradient(135deg, rgba(13,13,13,0.98) 0%, rgba(26,26,26,0.98) 100%);
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.8), 0 12px 40px rgba(168,85,247,0.2);
          backdrop-filter: blur(24px);
          padding: 8px;
          z-index: 1000;
          animation: slideIn 0.2s ease-out;
          overflow: hidden;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .workspace-dropdown-header {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #94a3b8;
          padding: 12px 16px 8px;
          margin-bottom: 4px;
        }

        .workspace-dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: ${({ isActive }) => isActive ? '#FFFFFF' : '#B3B3B3'};
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          ${({ isActive }) => isActive 
            ? `background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
               box-shadow: 0 4px 20px rgba(124,58,237,0.4);`
            : ''
          }
        }

        .workspace-dropdown-item:not(.active):hover {
          background: linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(59,130,246,0.15) 100%);
          color: #FFFFFF;
          transform: scale(1.02);
        }

        .workspace-dropdown-item:not(.active):active {
          transform: scale(0.98);
        }

        .workspace-dropdown-item.active {
          cursor: default;
        }

        .workspace-dropdown-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .workspace-dropdown-item:not(.active):hover::before {
          opacity: 1;
        }

        .workspace-dropdown-icon {
          margin-right: 12px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .workspace-dropdown-text {
          font-size: 14px;
          font-weight: 500;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .workspace-dropdown-indicator {
          margin-left: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }
        
        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding: 8px 12px;
          border-radius: 8px;
          background: ${connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
          border: 1px solid ${connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${connected ? '#10b981' : '#ef4444'};
          animation: ${connected ? 'pulse 2s infinite' : 'none'};
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .connection-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .room-input {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 8px 12px;
          color: #e2e8f0;
          font-size: 14px;
          width: 100%;
          margin-bottom: 12px;
          transition: border-color 0.2s;
        }
        
        .room-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .username-input {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 8px 12px;
          color: #e2e8f0;
          font-size: 14px;
          width: 100%;
          transition: border-color 0.2s;
        }
        
        .username-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .sidebar-section {
          padding: 16px 20px;
          border-bottom: 1px solid #1e293b;
          position: relative;
          z-index: 3;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        
        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn:hover::before {
          left: 100%;
        }
        
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .file-list {
          flex: 1;
          overflow-y: auto;
          position: relative;
          z-index: 2;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }
        
        .file-item:hover {
          background: rgba(59, 130, 246, 0.1);
        }
        
        .file-item.active {
          background: rgba(59, 130, 246, 0.2);
          border-left-color: #3b82f6;
        }
        
        .file-icon {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        
        .file-name {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }
        
        .file-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .file-item:hover .file-actions {
          opacity: 1;
        }
        
        .icon-btn {
          background: none;
          border: none;
          color: #94a3b8;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .icon-btn:hover {
          color: #e2e8f0;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .presence-panel {
          padding: 16px 20px;
          border-top: 1px solid #1e293b;
          position: relative;
          z-index: 2;
        }
        
        .user-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .user-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.5);
        }
        
        .user-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
        }
        
        .user-info {
          flex: 1;
          font-size: 13px;
        }
        
        .user-cursor {
          font-size: 11px;
          color: #94a3b8;
        }
        
        .editor-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #0f172a;
        }
        
        .editor-header {
          padding: 12px 20px;
          background: linear-gradient(90deg, #1e293b, #334155);
          border-bottom: 1px solid #475569;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .editor-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }
        
        .language-tag {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .editor-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .toggle-btn {
          background: none;
          border: 1px solid #475569;
          color: #94a3b8;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .toggle-btn:hover,
        .toggle-btn.active {
          color: #3b82f6;
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .collapse-btn {
          position: absolute;
          top: 20px;
          right: -15px;
          width: 30px;
          height: 30px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 50%;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 100;
        }
        
        .collapse-btn:hover {
          background: #334155;
          color: #e2e8f0;
        }
        
        .hidden-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        
        .file-input-label {
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
        }
        
        .file-input-label:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
        }
        
        .collaborative-cursor {
          background-color: rgba(59, 130, 246, 0.3);
          border-left: 2px solid #3b82f6;
        }
        
        .collaborative-cursor-name {
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          position: absolute;
          top: -24px;
          left: -2px;
          white-space: nowrap;
          z-index: 1000;
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <button 
          className="collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>

        {!sidebarCollapsed && (
          <>
            <div className="sidebar-header">
              {/* Workspace Header with Dropdown */}
              <div className="workspace-header">
                <div className="workspace-title-section">
                  <h1 className="workspace-title">Code Editor</h1>
                  <p className="workspace-subtitle">Collaborative Workspace</p>
                </div>
                
                {/* Workspace Dropdown Button */}
                <div className="workspace-dropdown" ref={dropdownRef}>
                  <button
                    onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                    className="workspace-dropdown-button"
                  >
                    <ChevronDown size={18} className="workspace-dropdown-chevron" />
                  </button>

                  {/* Dropdown Menu */}
                  {showWorkspaceDropdown && (
                    <div className="workspace-dropdown-menu">
                      <div className="workspace-dropdown-header">
                        Workspace Features
                      </div>
                      {workspaceFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <button
                            key={feature.id}
                            onClick={() => handleWorkspaceFeatureClick(feature)}
                            className={`workspace-dropdown-item ${feature.isActive ? 'active' : ''}`}
                            style={{
                              background: feature.isActive 
                                ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                                : 'transparent',
                              color: feature.isActive ? '#FFFFFF' : '#B3B3B3',
                              boxShadow: feature.isActive ? '0 4px 20px rgba(124,58,237,0.4)' : 'none',
                              cursor: feature.isActive ? 'default' : 'pointer'
                            }}
                          >
                            <Icon size={18} className="workspace-dropdown-icon" />
                            <span className="workspace-dropdown-text">{feature.name}</span>
                            {feature.isActive && (
                              <div className="workspace-dropdown-indicator"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <input
                type="text"
                className="room-input"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
              />
              
              <div className="connection-status">
                <div className="status-dot"></div>
                {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {connected ? 'Connected' : 'Offline'}
                </span>
              </div>
              
              {connectionError && (
                <div className="connection-error">
                  <AlertCircle size={14} />
                  {connectionError}
                </div>
              )}
              
              <input
                type="text"
                className="username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>

            <div className="sidebar-section">
              <div className="section-title">Actions</div>
              <div className="action-buttons">
                <button onClick={createNewFile} className="btn">
                  <Plus size={14} />
                  New File
                </button>
                <label className="file-input-label">
                  <Upload size={14} />
                  Upload
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="hidden-input"
                  />
                </label>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="section-title">Files ({files.size})</div>
            </div>

            <div className="file-list">
              {Array.from(files.keys()).map((filename) => (
                <div 
                  key={filename}
                  className={`file-item ${filename === activeFile ? 'active' : ''}`}
                  onClick={() => setActiveFile(filename)}
                >
                  <div 
                    className="file-icon"
                    style={{ backgroundColor: getFileIcon(filename) }}
                  ></div>
                  <div className="file-name">{filename}</div>
                  <div className="file-actions">
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(filename);
                      }}
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(filename);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showPresence && (
              <div className="presence-panel">
                <div className="section-title">
                  <Users size={14} style={{ display: 'inline', marginRight: '8px' }} />
                  Active Users ({activeUsers.size + 1})
                </div>
                <div className="user-list">
                  <div className="user-item">
                    <div className="user-avatar" style={{ backgroundColor: userColorRef.current }}>
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div>{username} (You)</div>
                    </div>
                  </div>
                  {Array.from(activeUsers.values()).map((user) => (
                    <div key={user.id} className="user-item">
                      <div className="user-avatar" style={{ backgroundColor: user.color }}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="user-info">
                        <div>{user.name}</div>
                        {user.cursor && user.filename === activeFile && (
                          <div className="user-cursor">Line {user.cursor.lineNumber}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ 
              padding: '16px 20px', 
              background: 'rgba(15, 23, 42, 0.8)', 
              margin: '16px 20px', 
              borderRadius: '8px', 
              border: '1px solid #1e293b', 
              fontSize: '12px', 
              lineHeight: '1.5', 
              position: 'relative', 
              zIndex: 1 
            }}>
              <div><strong>Room:</strong> {roomId}</div>
            </div>
          </>
        )}
      </div>

      {/* Editor Area */}
      <div className="editor-area">
        <div className="editor-header">
          <div className="editor-title">
            <Code size={18} />
            <span>{activeFile}</span>
            <span className="language-tag">{detectLanguage(activeFile)}</span>
          </div>
          <div className="editor-actions">
            <button
              className={`toggle-btn ${showPresence ? 'active' : ''}`}
              onClick={() => setShowPresence(!showPresence)}
              title="Toggle user presence"
            >
              <Eye size={16} />
            </button>
            <button className="toggle-btn" title="Settings">
              <Settings size={16} />
            </button>
            <button className="toggle-btn" title="Terminal">
              <Terminal size={16} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language={detectLanguage(activeFile)}
            theme="vs-dark"
            value={files.get(activeFile) || "// Start coding..."}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            options={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: 14,
              lineHeight: 1.6,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              renderLineHighlight: 'gutter',
              selectOnLineNumbers: true,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 }
            }}
          />
        </div>
      </div>
    </div>
  );
}
