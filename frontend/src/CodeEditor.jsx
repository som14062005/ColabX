import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Users, Plus, Upload, Trash2, Code, Wifi, WifiOff, Eye, Download, Settings, Terminal, AlertCircle, User, ChevronDown, MessageCircle, FileText, CheckSquare, GitBranch, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const operationQueueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const pendingFileSwitch = useRef(null);
  const lastSyncedContent = useRef(new Map());
  const dropdownRef = useRef(null);

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
      navigate(feature.route);
    }
    setShowWorkspaceDropdown(false);
  };

  // Queue operations to prevent race conditions
  const processOperationQueue = useCallback(() => {
    if (isProcessingRef.current || operationQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const operation = operationQueueRef.current.shift();
    
    try {
      operation();
    } catch (error) {
      console.error('Error processing queued operation:', error);
    } finally {
      isProcessingRef.current = false;
      // Process next operation after a short delay
      setTimeout(processOperationQueue, 10);
    }
  }, []);

  // Add operation to queue
  const queueOperation = useCallback((operation) => {
    operationQueueRef.current.push(operation);
    processOperationQueue();
  }, [processOperationQueue]);

  // WebSocket connection management with proper cleanup
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('🔄 WebSocket already connected or connecting, skipping...');
      return;
    }

    if (isUnmountingRef.current) {
      console.log('🛑 Component unmounting, aborting connection');
      return;
    }

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
          queueOperation(() => handleWebSocketMessage(message));
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
        setConnected(false);
        setActiveUsers(new Map());

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

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
  }, [roomId, username, queueOperation]);

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
        // Sync file list and update local files
        const newFiles = new Map();
        Object.entries(message.files).forEach(([filename, content]) => {
          newFiles.set(filename, content);
          lastSyncedContent.current.set(filename, content);
        });
        setFiles(newFiles);
        console.log('📄 Synced files from server:', Array.from(newFiles.keys()));
        
        // Handle pending file switch
        if (pendingFileSwitch.current && newFiles.has(pendingFileSwitch.current)) {
          const pendingFile = pendingFileSwitch.current;
          pendingFileSwitch.current = null;
          
          // Update editor content if needed
          if (editorRef.current && pendingFile === activeFile) {
            const content = newFiles.get(pendingFile);
            const currentContent = editorRef.current.getValue();
            if (content !== currentContent) {
              isLocalChangeRef.current = true;
              editorRef.current.setValue(content);
              setTimeout(() => { isLocalChangeRef.current = false; }, 100);
            }
          }
        }
        break;
        
      case 'file-created':
        if (message.userId !== username) {
          setFiles(prev => {
            const newFiles = new Map(prev);
            newFiles.set(message.filename, message.content);
            lastSyncedContent.current.set(message.filename, message.content);
            return newFiles;
          });
          console.log(`📄 File created by ${message.userId}: ${message.filename}`);
        }
        break;
        
      case 'file-deleted':
        if (message.userId !== username) {
          setFiles(prev => {
            const newFiles = new Map(prev);
            newFiles.delete(message.filename);
            lastSyncedContent.current.delete(message.filename);
            return newFiles;
          });
          
          if (message.filename === activeFile) {
            setFiles(currentFiles => {
              const remaining = Array.from(currentFiles.keys()).filter(f => f !== message.filename);
              if (remaining.length > 0) {
                setActiveFile(remaining[0]);
              }
              return currentFiles;
            });
          }
          console.log(`🗑️ File deleted by ${message.userId}: ${message.filename}`);
        }
        break;

      case 'file-content':
        if (message.filename && message.content !== undefined) {
          setFiles(prev => {
            const newFiles = new Map(prev);
            newFiles.set(message.filename, message.content);
            lastSyncedContent.current.set(message.filename, message.content);
            return newFiles;
          });
          
          // Update editor if this is the active file
          if (message.filename === activeFile && editorRef.current) {
            const currentContent = editorRef.current.getValue();
            if (message.content !== currentContent) {
              isLocalChangeRef.current = true;
              editorRef.current.setValue(message.content);
              setTimeout(() => { isLocalChangeRef.current = false; }, 100);
            }
          }
          
          console.log(`📄 File content synced: ${message.filename}`);
        }
        break;
        
      case 'error':
        console.error('Server error:', message.error);
        setConnectionError(message.error);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, [username, activeFile]);

  // Apply text operation to content
  const applyOperationToContent = useCallback((content, operation) => {
    try {
      const lines = content.split('\n');
      
      switch (operation.type) {
        case 'insert':
          const lineIndex = Math.max(0, Math.min(operation.position.lineNumber - 1, lines.length - 1));
          const columnIndex = Math.max(0, Math.min(operation.position.column - 1, lines[lineIndex]?.length || 0));
          
          if (lines[lineIndex] !== undefined) {
            lines[lineIndex] = lines[lineIndex].slice(0, columnIndex) + 
                              operation.text + 
                              lines[lineIndex].slice(columnIndex);
          }
          break;

        case 'delete':
          const startLine = Math.max(0, Math.min(operation.range.startLineNumber - 1, lines.length - 1));
          const endLine = Math.max(0, Math.min(operation.range.endLineNumber - 1, lines.length - 1));
          const startCol = Math.max(0, Math.min(operation.range.startColumn - 1, lines[startLine]?.length || 0));
          const endCol = Math.max(0, Math.min(operation.range.endColumn - 1, lines[endLine]?.length || 0));

          if (startLine === endLine && lines[startLine] !== undefined) {
            lines[startLine] = lines[startLine].slice(0, startCol) + 
                              lines[startLine].slice(endCol);
          } else if (lines[startLine] !== undefined && lines[endLine] !== undefined) {
            lines[startLine] = lines[startLine].slice(0, startCol) + 
                              lines[endLine].slice(endCol);
            lines.splice(startLine + 1, endLine - startLine);
          }
          break;

        case 'replace':
          const rStartLine = Math.max(0, Math.min(operation.range.startLineNumber - 1, lines.length - 1));
          const rEndLine = Math.max(0, Math.min(operation.range.endLineNumber - 1, lines.length - 1));
          const rStartCol = Math.max(0, Math.min(operation.range.startColumn - 1, lines[rStartLine]?.length || 0));
          const rEndCol = Math.max(0, Math.min(operation.range.endColumn - 1, lines[rEndLine]?.length || 0));

          if (rStartLine === rEndLine && lines[rStartLine] !== undefined) {
            lines[rStartLine] = lines[rStartLine].slice(0, rStartCol) + 
                              operation.text + 
                              lines[rStartLine].slice(rEndCol);
          } else if (lines[rStartLine] !== undefined && lines[rEndLine] !== undefined) {
            const newText = operation.text.split('\n');
            lines[rStartLine] = lines[rStartLine].slice(0, rStartCol) + newText[0];
            
            if (newText.length > 1) {
              lines.splice(rStartLine + 1, rEndLine - rStartLine, ...newText.slice(1, -1));
              if (lines[rStartLine + newText.length - 1] !== undefined) {
                lines[rStartLine + newText.length - 1] = newText[newText.length - 1] + 
                                                         lines[rEndLine].slice(rEndCol);
              }
            } else {
              lines[rStartLine] += lines[rEndLine].slice(rEndCol);
              lines.splice(rStartLine + 1, rEndLine - rStartLine);
            }
          }
          break;
      }
      
      return lines.join('\n');
    } catch (error) {
      console.error('Error applying operation:', error);
      return content; // Return original content if operation fails
    }
  }, []);

  // Handle file operations from other users
  const handleFileOperation = useCallback((message) => {
    if (message.userId === username) return;
    
    const { operation, filename } = message;
    
    // Update the file content in our local state
    setFiles(prev => {
      const currentContent = prev.get(filename) || '';
      const newContent = applyOperationToContent(currentContent, operation);
      
      const newFiles = new Map(prev);
      newFiles.set(filename, newContent);
      lastSyncedContent.current.set(filename, newContent);
      return newFiles;
    });

    // If this operation is for the currently active file, also apply it to the editor
    if (filename === activeFile && editorRef.current) {
      isLocalChangeRef.current = true;

      try {
        const monaco = window.monaco;
        switch (operation.type) {
          case 'insert':
            editorRef.current.executeEdits('collaboration', [{
              range: new monaco.Range(
                operation.position.lineNumber,
                operation.position.column,
                operation.position.lineNumber,
                operation.position.column
              ),
              text: operation.text
            }]);
            break;
            
          case 'delete':
            editorRef.current.executeEdits('collaboration', [{
              range: new monaco.Range(
                operation.range.startLineNumber,
                operation.range.startColumn,
                operation.range.endLineNumber,
                operation.range.endColumn
              ),
              text: ''
            }]);
            break;
            
          case 'replace':
            editorRef.current.executeEdits('collaboration', [{
              range: new monaco.Range(
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
        console.error('Failed to apply operation to editor:', error);
      }

      setTimeout(() => {
        isLocalChangeRef.current = false;
      }, 100);
    }
  }, [username, activeFile, applyOperationToContent]);

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

  // Send message helper
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
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

  // Request file content when switching files
  const requestFileContent = useCallback((filename) => {
    const success = sendMessage({
      type: 'request-file-content',
      filename,
      userId: username,
      roomId
    });
    
    if (success) {
      pendingFileSwitch.current = filename;
    }
  }, [sendMessage, username, roomId]);

  // Initialize WebSocket connection
  useEffect(() => {
    isUnmountingRef.current = false;
    console.log('🚀 Component mounted, setting up WebSocket...');

    const timeoutId = setTimeout(() => {
      if (!isUnmountingRef.current) {
        connectWebSocket();
      }
    }, 500);

    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      isUnmountingRef.current = true;
      clearTimeout(timeoutId);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'leave',
            userId: username,
            roomId
          }));
        }
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, []);

  // Handle room/username changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔄 Room or username changed, rejoining...');
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
  }, [roomId, username]);

  // Handle file switching with proper sync
  useEffect(() => {
    if (connected && activeFile) {
      // Request the latest file content from server
      requestFileContent(activeFile);
      
      // Send cursor position for the new file
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        if (position) {
          sendCursorPosition({
            lineNumber: position.lineNumber,
            column: position.column
          }, activeFile);
        }
      }
    }
  }, [activeFile, connected, sendCursorPosition, requestFileContent]);

  // Handle editor changes with debouncing
  const handleEditorChange = useCallback((value, event) => {
    if (isLocalChangeRef.current) return;

    // Update local state immediately
    setFiles(prev => new Map(prev.set(activeFile, value || '')));

    // Send operations to other users
    if (event?.changes && connected) {
      event.changes.forEach(change => {
        const operation = {
          type: change.text ? (change.rangeLength > 0 ? 'replace' : 'insert') : 'delete',
          range: change.rangeLength > 0 ? {
            startLineNumber: change.range.startLineNumber,
            startColumn: change.range.startColumn,
            endLineNumber: change.range.endLineNumber,
            endColumn: change.range.endColumn
          } : undefined,
          position: change.rangeLength === 0 ? {
            lineNumber: change.range.startLineNumber,
            column: change.range.startColumn
          } : undefined,
          text: change.text
        };
        
        sendFileOperation(operation, activeFile);
      });
    }
  }, [activeFile, sendFileOperation, connected]);

  // Handle cursor position changes
  const handleCursorPositionChange = useCallback((event) => {
    if (!event?.position || !connected) return;
    sendCursorPosition({
      lineNumber: event.position.lineNumber,
      column: event.position.column
    }, activeFile);
  }, [sendCursorPosition, activeFile, connected]);

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

    editor.onDidChangeCursorPosition(handleCursorPositionChange);

    let decorationIds = [];
    
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
              hoverMessage: { 
                value: `**${user.name}** is editing at line ${user.cursor.lineNumber}` 
              },
              beforeContentClassName: 'collaborative-cursor-before',
              before: {
                content: `${user.name}`,
                inlineClassName: 'collaborative-cursor-label',
                backgroundColor: user.color
              }
            }
          });
        }
      });

      decorationIds = editor.deltaDecorations(decorationIds, decorations);
    };

    const interval = setInterval(updateCollaborativeCursors, 500);
    
    return () => {
      clearInterval(interval);
      if (decorationIds.length > 0) {
        editor.deltaDecorations(decorationIds, []);
      }
    };
  }, [handleCursorPositionChange, activeUsers, activeFile, username]);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden flex-col">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white" style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            <span style={{ color: '#A259FF' }}>Colab</span>
            <span style={{ color: '#000000' }}>X</span>
          </h1>
          
          {/* Workspace Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                border: '1px solid rgba(168,85,247,0.3)'
              }}
            >
              <ChevronDown 
                size={18} 
                className={`transition-all duration-300 ${showWorkspaceDropdown ? 'rotate-180 text-purple-600' : 'text-gray-600'}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showWorkspaceDropdown && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 rounded-2xl overflow-hidden z-50 bg-white border shadow-xl"
                style={{
                  border: '1px solid rgba(168,85,247,0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                }}
              >
                <div className="p-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 py-2 mb-1">
                    Workspace Features
                  </div>
                  {workspaceFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <button
                        key={feature.id}
                        onClick={() => handleWorkspaceFeatureClick(feature)}
                        className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                          feature.isActive 
                            ? 'bg-purple-500 text-white cursor-default' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer'
                        }`}
                      >
                        <Icon size={18} className="mr-3" />
                        <span className="text-sm font-medium">{feature.name}</span>
                        {feature.isActive && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-green-400"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div style={{ fontSize: '14px', color: '#666' }}>
            Collaborative Workspace Platform
          </div>
          
          {/* Profile Navigation Button */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-[#A259FF] hover:bg-[#8B46FF] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#A259FF]/25"
            aria-label="Go to Profile"
          >
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* CSS Styles for collaborative cursors */}
        <style jsx global>{`
          .collaborative-cursor {
            background-color: transparent !important;
            border-left: 2px solid;
            position: relative;
          }

          .collaborative-cursor-before {
            position: relative;
          }

          .collaborative-cursor-label {
            position: absolute;
            top: -20px;
            left: -5px;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 500;
            color: white;
            white-space: nowrap;
            z-index: 1000;
          }

          .collaborative-cursor-label::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 6px;
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 4px solid;
            border-top-color: inherit;
          }
        `}</style>

        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-12' : 'w-80'
        }`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Workspace</h1>
                <p className="text-sm text-gray-500">Room: {roomId}</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Code size={16} />
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* Connection Status */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  {connected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Wifi size={16} />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <WifiOff size={16} />
                      <span className="text-sm font-medium">Disconnected</span>
                    </div>
                  )}
                </div>
                
                {connectionError && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg mb-3">
                    <AlertCircle size={14} />
                    <span className="text-xs">{connectionError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                    placeholder="Your name"
                  />
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 flex-1"
                    placeholder="Room ID"
                  />
                </div>
              </div>

              {/* Files List */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-semibold text-gray-700">Files</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={createNewFile}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="New File"
                    >
                      <Plus size={16} />
                    </button>
                    <label className="p-1 hover:bg-gray-100 rounded cursor-pointer" title="Upload File">
                      <Upload size={16} />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <ul className="space-y-1">
                  {Array.from(files.keys()).map((filename) => (
                    <li
                      key={filename}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        filename === activeFile
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveFile(filename)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getFileIcon(filename) }}
                        />
                        <span className="text-sm font-medium">{filename}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(filename);
                          }}
                          title="Download"
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(filename);
                          }}
                          title="Delete"
                          className="p-1 hover:bg-gray-200 rounded text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Users */}
              {showPresence && (
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">
                    Active Users
                  </h2>
                  <ul className="space-y-1">
                    {Array.from(activeUsers.values()).map((user) => (
                      <li key={user.id} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: user.color }}
                        />
                        <span className="text-sm">{user.name}</span>
                        {user.filename && (
                          <span className="text-xs text-gray-500">
                            ({user.filename} - line {user.cursor?.lineNumber || "?"})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={detectLanguage(activeFile)}
              value={files.get(activeFile)}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
