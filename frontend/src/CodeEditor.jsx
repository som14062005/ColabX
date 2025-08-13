import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Users, Plus, Upload, Trash2, Code, Wifi, WifiOff, Eye, Download, Settings, Terminal, AlertCircle } from "lucide-react";

export default function CollabWorkspace() {
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

  // WebSocket and collaboration refs
  const wsRef = useRef(null);
  const editorRef = useRef(null);
  const isLocalChangeRef = useRef(false);
  const userColorRef = useRef(generateRandomColor());
  const reconnectTimeoutRef = useRef(null);
  const isUnmountingRef = useRef(false);
  const operationQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  // Generate a random color for the user
  function generateRandomColor() {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

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
          handleWebSocketMessage(message);
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
  }, [roomId, username]);

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
        });
        setFiles(newFiles);
        console.log('📄 Synced files from server:', Array.from(newFiles.keys()));
        break;
        
      case 'file-created':
        if (message.userId !== username) {
          setFiles(prev => new Map(prev.set(message.filename, message.content)));
          console.log(`📄 File created by ${message.userId}: ${message.filename}`);
        }
        break;
        
      case 'file-deleted':
        if (message.userId !== username) {
          setFiles(prev => {
            const newFiles = new Map(prev);
            newFiles.delete(message.filename);
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

      // Add file content sync when switching files
      case 'file-content':
        if (message.filename && message.content !== undefined) {
          setFiles(prev => new Map(prev.set(message.filename, message.content)));
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

  // FIXED: Handle file operations from other users - now works for ALL files
  const handleFileOperation = useCallback((message) => {
    if (message.userId === username) return;
    
    const { operation, filename } = message;
    
    // Update the file content in our local state regardless of which file is active
    setFiles(prev => {
      const currentContent = prev.get(filename) || '';
      let newContent = currentContent;
      
      try {
        switch (operation.type) {
          case 'insert':
            const lines = currentContent.split('\n');
            const lineIndex = operation.position.lineNumber - 1;
            const columnIndex = operation.position.column - 1;
            
            if (lines[lineIndex] !== undefined) {
              lines[lineIndex] = lines[lineIndex].slice(0, columnIndex) + 
                                operation.text + 
                                lines[lineIndex].slice(columnIndex);
            }
            newContent = lines.join('\n');
            break;

          case 'delete':
            const deleteLines = currentContent.split('\n');
            const startLine = operation.range.startLineNumber - 1;
            const endLine = operation.range.endLineNumber - 1;
            const startCol = operation.range.startColumn - 1;
            const endCol = operation.range.endColumn - 1;

            if (startLine === endLine && deleteLines[startLine]) {
              deleteLines[startLine] = deleteLines[startLine].slice(0, startCol) + 
                                      deleteLines[startLine].slice(endCol);
            } else if (deleteLines[startLine] && deleteLines[endLine]) {
              deleteLines[startLine] = deleteLines[startLine].slice(0, startCol) + 
                                      deleteLines[endLine].slice(endCol);
              deleteLines.splice(startLine + 1, endLine - startLine);
            }
            newContent = deleteLines.join('\n');
            break;

          case 'replace':
            const replaceLines = currentContent.split('\n');
            const rStartLine = operation.range.startLineNumber - 1;
            const rEndLine = operation.range.endLineNumber - 1;
            const rStartCol = operation.range.startColumn - 1;
            const rEndCol = operation.range.endColumn - 1;

            if (rStartLine === rEndLine && replaceLines[rStartLine]) {
              replaceLines[rStartLine] = replaceLines[rStartLine].slice(0, rStartCol) + 
                                        operation.text + 
                                        replaceLines[rStartLine].slice(rEndCol);
            } else if (replaceLines[rStartLine] && replaceLines[rEndLine]) {
              const newText = operation.text.split('\n');
              replaceLines[rStartLine] = replaceLines[rStartLine].slice(0, rStartCol) + newText[0];
              
              if (newText.length > 1) {
                replaceLines.splice(rStartLine + 1, rEndLine - rStartLine, ...newText.slice(1, -1));
                if (replaceLines[rStartLine + newText.length - 1]) {
                  replaceLines[rStartLine + newText.length - 1] = newText[newText.length - 1] + 
                                                                 replaceLines[rEndLine].slice(rEndCol);
                }
              } else {
                replaceLines[rStartLine] += replaceLines[rEndLine].slice(rEndCol);
                replaceLines.splice(rStartLine + 1, rEndLine - rStartLine);
              }
            }
            newContent = replaceLines.join('\n');
            break;
        }
      } catch (error) {
        console.error('Failed to apply operation to file content:', error);
        return prev; // Return unchanged if operation fails
      }

      const newFiles = new Map(prev);
      newFiles.set(filename, newContent);
      return newFiles;
    });

    // If this operation is for the currently active file, also apply it to the editor
    if (filename === activeFile && editorRef.current) {
      isLocalChangeRef.current = true;

      try {
        switch (operation.type) {
          case 'insert':
            editorRef.current.executeEdits('collaboration', [{
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
            editorRef.current.executeEdits('collaboration', [{
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
            editorRef.current.executeEdits('collaboration', [{
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
        console.error('Failed to apply operation to editor:', error);
      }

      setTimeout(() => {
        isLocalChangeRef.current = false;
      }, 100);
    }
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

  // Send message helper
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

  // FIXED: Request file content when switching files
  const requestFileContent = useCallback((filename) => {
    sendMessage({
      type: 'request-file-content',
      filename,
      userId: username,
      roomId
    });
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

  // FIXED: Notify when user switches files and request latest content
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

  // Handle editor changes
  const handleEditorChange = useCallback((value, event) => {
    if (isLocalChangeRef.current) return;

    setFiles(prev => new Map(prev.set(activeFile, value || '')));

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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
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
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
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

            {/* Active Users */}
            {showPresence && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Active Users ({activeUsers.size})</h3>
                  <button
                    onClick={() => setShowPresence(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Eye size={14} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {/* Current user */}
                  <div className="flex items-center gap-2 px-2 py-1 text-xs bg-blue-50 rounded">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: userColorRef.current }}
                    ></div>
                    <span className="font-medium">{username} (you)</span>
                    <span className="text-gray-500">in {activeFile}</span>
                  </div>
                  
                  {/* Other users */}
                  {Array.from(activeUsers.values())
                    .filter(user => user.id !== username)
                    .map(user => (
                      <div key={user.id} className="flex items-center gap-2 px-2 py-1 text-xs bg-gray-100 rounded">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: user.color }}
                        ></div>
                        <span className="font-medium">{user.name}</span>
                        {user.filename && (
                          <span className="text-gray-500">
                            in {user.filename}
                            {user.cursor && ` (L${user.cursor.lineNumber})`}
                          </span>
                        )}
                      </div>
                    ))
                  }
                </div>
                
                {activeUsers.size === 1 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Share the room ID to collaborate with others
                  </p>
                )}
              </div>
            )}

            {/* File Explorer */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Files</h3>
                <div className="flex gap-1">
                  <button
                    onClick={createNewFile}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="New File"
                  >
                    <Plus size={14} />
                  </button>
                  <label className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer" title="Upload File">
                    <Upload size={14} />
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".js,.jsx,.ts,.tsx,.json,.md,.css,.html,.py,.txt"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                {Array.from(files.keys()).map((filename) => (
                  <div
                    key={filename}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      filename === activeFile 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: getFileIcon(filename) }}
                    />
                    <span
                      className="text-sm flex-1 truncate"
                      onClick={() => setActiveFile(filename)}
                    >
                      {filename}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={() => downloadFile(filename)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Download"
                      >
                        <Download size={12} />
                      </button>
                      {files.size > 1 && (
                        <button
                          onClick={() => deleteFile(filename)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getFileIcon(activeFile) }}
            />
            <span className="font-medium text-gray-900">{activeFile}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {detectLanguage(activeFile)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {connected && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={detectLanguage(activeFile)}
            value={files.get(activeFile) || ""}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-light"
            options={{
              wordWrap: "on",
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderLineHighlight: "gutter",
              selectOnLineNumbers: true,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: false,
              folding: true,
              foldingHighlight: true,
              showFoldingControls: "mouseover",
              matchBrackets: "always",
              bracketPairColorization: { enabled: true }
            }}
          />
        </div>
      </div>
    </div>
  );
}
