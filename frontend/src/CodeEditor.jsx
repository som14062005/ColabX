import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Users, Plus, Upload, Trash2, Code, Wifi, WifiOff, Eye, Download, Settings, Terminal, AlertCircle } from "lucide-react";

export default function CollabWorkspace() {
    const [files, setFiles] = useState(new Map([
        ["index.js", "// Welcome to the collaborative workspace\nconsole.log('Hello, collaborative world!');\n"],
        ["README.md", "# Collaborative Workspace\n\nStart coding together in real-time!\n"],
        ["styles.css", "/* Add your styles here */\nbody {\n font-family: 'Inter', sans-serif;\n}\n"]
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
    
    // Operation queue for handling conflicts
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
        // Prevent multiple connections
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
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
                // Sync file list
                const newFiles = new Map();
                Object.entries(message.files).forEach(([filename, content]) => {
                    newFiles.set(filename, content);
                });
                setFiles(newFiles);
                break;
                
            // Add proper handling for file-created
            case 'file-created':
                if (message.userId !== username) { // Only handle if from another user
                    setFiles(prev => new Map(prev.set(message.filename, message.content)));
                    console.log(`📄 File created by ${message.userId}: ${message.filename}`);
                }
                break;
                
            // Add proper handling for file-deleted  
            case 'file-deleted':
                if (message.userId !== username) { // Only handle if from another user
                    setFiles(prev => {
                        const newFiles = new Map(prev);
                        newFiles.delete(message.filename);
                        return newFiles;
                    });
                    // If deleted file was the active file, switch to another file
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
                
            case 'error':
                console.error('Server error:', message.error);
                setConnectionError(message.error);
                break;
                
            default:
                console.warn('Unknown message type:', message.type);
        }
    }, [username, activeFile]);

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
                    filename: message.filename // Store the filename
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
    }, [roomId, username]);

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
            filename, // Make sure filename is always sent
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
    }, []);

    // Notify when user switches files
    useEffect(() => {
        if (connected && editorRef.current) {
            // Send current cursor position with new filename
            const position = editorRef.current.getPosition();
            if (position) {
                sendCursorPosition({
                    lineNumber: position.lineNumber,
                    column: position.column
                }, activeFile);
            }
        }
    }, [activeFile, connected, sendCursorPosition]);

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

    // Enhanced handle editor mount with collaborative cursors
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

        // Display collaborative cursors with better styling
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
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-600" />
                        <h1 className="text-lg font-semibold text-gray-900">Collaborative Code Editor</h1>
                    </div>
                    
                    {/* Connection Status */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        connected 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {connected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                {/* Room and User Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Room:</span>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                            disabled={connected}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Username:</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                            disabled={connected}
                        />
                    </div>

                    {/* Active Users */}
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{activeUsers.size + 1}</span>
                        <button
                            onClick={() => setShowPresence(!showPresence)}
                            className="p-1 text-gray-500 hover:text-gray-700 rounded"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Connection Error */}
            {connectionError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3">
                    <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                        <span className="text-sm text-red-700">{connectionError}</span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
                    sidebarCollapsed ? 'w-12' : 'w-80'
                }`}>
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            {!sidebarCollapsed && (
                                <h2 className="text-sm font-medium text-gray-700">Files</h2>
                            )}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!sidebarCollapsed && (
                        <>
                            {/* File Actions */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex gap-2">
                                    <button
                                        onClick={createNewFile}
                                        className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        New
                                    </button>
                                    
                                    <label className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer">
                                        <Upload className="w-3 h-3" />
                                        Upload
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept=".js,.jsx,.ts,.tsx,.json,.md,.css,.html,.py,.xml,.yaml,.yml"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* File List */}
                            <div className="flex-1 overflow-y-auto">
                                {Array.from(files.keys()).map(filename => (
                                    <div
                                        key={filename}
                                        className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 group ${
                                            filename === activeFile ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                        }`}
                                        onClick={() => setActiveFile(filename)}
                                    >
                                        <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: getFileIcon(filename) }}
                                        />
                                        <span className="flex-1 truncate">{filename}</span>
                                        
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadFile(filename);
                                                }}
                                                className="p-1 text-gray-500 hover:text-blue-600 rounded"
                                                title="Download"
                                            >
                                                <Download className="w-3 h-3" />
                                            </button>
                                            
                                            {files.size > 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteFile(filename);
                                                    }}
                                                    className="p-1 text-gray-500 hover:text-red-600 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* User Presence */}
                            {showPresence && (
                                <div className="p-4 border-t border-gray-100">
                                    <h3 className="text-xs font-medium text-gray-700 mb-3">Active Users</h3>
                                    <div className="space-y-2">
                                        {/* Current user */}
                                        <div className="flex items-center gap-2 px-2 py-1 text-xs bg-blue-100 rounded">
                                            <div 
                                                className="w-2 h-2 rounded-full" 
                                                style={{ backgroundColor: userColorRef.current }}
                                            ></div>
                                            <span className="font-medium">{username} (You)</span>
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
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col">
                    {/* Editor Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: getFileIcon(activeFile) }}
                                />
                                <span className="text-sm font-medium text-gray-900">{activeFile}</span>
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                    {detectLanguage(activeFile)}
                                </span>
                            </div>
                        </div>

                        {/* Editor Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => downloadFile(activeFile)}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded transition-colors"
                                title="Download file"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            
                            <button className="p-2 text-gray-500 hover:text-gray-700 rounded transition-colors">
                                <Terminal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            language={detectLanguage(activeFile)}
                            value={files.get(activeFile) || ''}
                            onMount={handleEditorMount}
                            onChange={handleEditorChange}
                            theme="vs"
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
                                wordWrap: 'on',
                                tabSize: 2,
                                insertSpaces: true,
                                renderWhitespace: 'boundary'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Collaborative Cursor Styles */}
            <style jsx>{`
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
        </div>
    );
}
