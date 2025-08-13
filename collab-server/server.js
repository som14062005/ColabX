const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store rooms data: roomId -> { users: Map, files: Map }
const rooms = new Map();

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/collab',
  clientTracking: true
});

console.log('🚀 Starting Collaborative Code Server...');

// Track connection count
let connectionCount = 0;

wss.on('connection', (ws, req) => {
  connectionCount++;
  const connectionId = `conn-${connectionCount}`;
  const clientIP = req.socket.remoteAddress;
  
  console.log(`👤 New connection ${connectionId} from ${clientIP} - Active: ${wss.clients.size}`);
  
  let currentRoom = null;
  let userId = null;
  let userInfo = null;
  let heartbeatInterval;
  let isAlive = true;

  // Heartbeat to detect dead connections
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
    if (userInfo) {
      userInfo.lastSeen = Date.now();
    }
  });

  // Start heartbeat immediately
  heartbeatInterval = setInterval(() => {
    if (!ws.isAlive) {
      console.log(`💀 Connection ${connectionId} appears dead, terminating...`);
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  }, 10000); // Check every 10 seconds

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received message:', { type: message.type, user: message.userId || 'unknown' });
      
      switch (message.type) {
        case 'join':
          handleUserJoin(ws, message);
          break;
          
        case 'file-operation':
          handleFileOperation(message);
          break;
          
        case 'cursor-position':
          broadcastToRoom(message, ws);
          break;
          
        case 'file-created':
          handleFileCreated(message);
          break;
          
        case 'file-deleted':
          handleFileDeleted(message);
          break;
          
        case 'leave':
          handleUserLeave(message);
          break;
          
        default:
          console.warn('⚠️ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process message'
      }));
    }
  });

  // Handle user leaving
  function handleUserLeave(message) {
    console.log(`👋 User ${message.userId} explicitly leaving room ${currentRoom}`);
    if (currentRoom && message.userId) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(message.userId);
        broadcastToRoom({
          type: 'user-left',
          userId: message.userId
        }, ws);
      }
    }
  }

  // Handle user joining a room
  function handleUserJoin(ws, message) {
    try {
      currentRoom = message.roomId;
      userId = message.user.id;
      userInfo = { ...message.user, ws, lastSeen: Date.now() };
      
      console.log(`👋 User ${userId} joining room ${currentRoom}`);
      
      // Create room if it doesn't exist
      if (!rooms.has(currentRoom)) {
        rooms.set(currentRoom, { 
          users: new Map(), 
          files: new Map([
            ['index.js', '// Welcome to collaborative coding!\nconsole.log("Hello, world!");\n'],
            ['README.md', '# Collaborative Workspace\n\nStart coding together!\n']
          ])
        });
        console.log(`🏠 Created new room: ${currentRoom}`);
      }
      
      const room = rooms.get(currentRoom);
      room.users.set(userId, userInfo);
      
      // Send current state to new user
      ws.send(JSON.stringify({
        type: 'users-list',
        users: Array.from(room.users.values()).map(u => ({
          id: u.id,
          name: u.name,
          color: u.color
        }))
      }));
      
      ws.send(JSON.stringify({
        type: 'file-list',
        files: Object.fromEntries(room.files)
      }));
      
      // Notify other users about new user
      broadcastToRoom({
        type: 'user-joined',
        user: message.user
      }, ws);
      
      console.log(`✅ User ${userId} successfully joined room ${currentRoom}`);
      
    } catch (error) {
      console.error('❌ Error in handleUserJoin:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to join room'
      }));
    }
  }

  // Handle file operations (insert, delete, replace)
  function handleFileOperation(message) {
    try {
      const { operation, filename, userId: senderId } = message;
      
      if (!currentRoom) return;
      
      const room = rooms.get(currentRoom);
      if (!room) return;
      
      // Apply operation to server-side file content
      let content = room.files.get(filename) || '';
      
      switch (operation.type) {
        case 'insert':
          const lines = content.split('\n');
          const lineIndex = operation.position.lineNumber - 1;
          const columnIndex = operation.position.column - 1;
          
          if (lines[lineIndex]) {
            lines[lineIndex] = 
              lines[lineIndex].slice(0, columnIndex) + 
              operation.text + 
              lines[lineIndex].slice(columnIndex);
          }
          content = lines.join('\n');
          break;
          
        case 'delete':
          const deleteLines = content.split('\n');
          const startLine = operation.range.startLineNumber - 1;
          const endLine = operation.range.endLineNumber - 1;
          const startCol = operation.range.startColumn - 1;
          const endCol = operation.range.endColumn - 1;
          
          if (startLine === endLine) {
            deleteLines[startLine] = 
              deleteLines[startLine].slice(0, startCol) + 
              deleteLines[startLine].slice(endCol);
          } else {
            deleteLines[startLine] = deleteLines[startLine].slice(0, startCol);
            deleteLines.splice(startLine + 1, endLine - startLine);
          }
          content = deleteLines.join('\n');
          break;
          
        case 'replace':
          const replaceLines = content.split('\n');
          const rStartLine = operation.range.startLineNumber - 1;
          const rEndLine = operation.range.endLineNumber - 1;
          const rStartCol = operation.range.startColumn - 1;
          const rEndCol = operation.range.endColumn - 1;
          
          if (rStartLine === rEndLine) {
            replaceLines[rStartLine] = 
              replaceLines[rStartLine].slice(0, rStartCol) + 
              operation.text + 
              replaceLines[rStartLine].slice(rEndCol);
          }
          content = replaceLines.join('\n');
          break;
      }
      
      // Update server-side content
      room.files.set(filename, content);
      
      // Broadcast to other users
      broadcastToRoom(message, ws);
      
    } catch (error) {
      console.error('❌ Error in handleFileOperation:', error);
    }
  }

  // Handle new file creation
  function handleFileCreated(message) {
    try {
      const { filename, content } = message;
      
      if (!currentRoom) return;
      
      const room = rooms.get(currentRoom);
      if (!room) return;
      
      room.files.set(filename, content || '// New file\n');
      
      console.log(`📄 File created: ${filename} in room ${currentRoom}`);
      
      // Broadcast to all users in room
      broadcastToRoom(message, null); // null means broadcast to all
      
    } catch (error) {
      console.error('❌ Error in handleFileCreated:', error);
    }
  }

  // Handle file deletion
  function handleFileDeleted(message) {
    try {
      const { filename } = message;
      
      if (!currentRoom) return;
      
      const room = rooms.get(currentRoom);
      if (!room) return;
      
      room.files.delete(filename);
      
      console.log(`🗑️ File deleted: ${filename} from room ${currentRoom}`);
      
      // Broadcast to all users in room
      broadcastToRoom(message, null);
      
    } catch (error) {
      console.error('❌ Error in handleFileDeleted:', error);
    }
  }

  // Broadcast message to all users in current room except sender
  function broadcastToRoom(message, sender) {
    if (!currentRoom) return;
    
    const room = rooms.get(currentRoom);
    if (!room) return;
    
    let broadcastCount = 0;
    
    room.users.forEach((user, id) => {
      if (user.ws && user.ws !== sender && user.ws.readyState === WebSocket.OPEN) {
        try {
          user.ws.send(JSON.stringify(message));
          broadcastCount++;
        } catch (error) {
          console.error(`❌ Failed to send to user ${id}:`, error);
          // Remove dead connection
          room.users.delete(id);
        }
      }
    });
    
    if (sender === null) { // Broadcast to all including sender
      room.users.forEach((user, id) => {
        if (user.ws && user.ws.readyState === WebSocket.OPEN) {
          try {
            user.ws.send(JSON.stringify(message));
            broadcastCount++;
          } catch (error) {
            console.error(`❌ Failed to send to user ${id}:`, error);
            room.users.delete(id);
          }
        }
      });
    }
    
    console.log(`📡 Broadcasted ${message.type} to ${broadcastCount} users in room ${currentRoom}`);
  }

  // Handle connection close
  ws.on('close', (code, reason) => {
    console.log(`👋 Connection ${connectionId} closed - Code: ${code}, Active: ${wss.clients.size - 1}`);
    
    clearInterval(heartbeatInterval);
    
    if (currentRoom && userId) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(userId);
        
        // Notify other users
        broadcastToRoom({
          type: 'user-left',
          userId
        }, ws);
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(currentRoom);
          console.log(`🧹 Cleaned up empty room: ${currentRoom}`);
        }
      }
    }
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error (${connectionId}):`, error.message);
  });
});

// REST API endpoints for room management
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.keys()).map(roomId => ({
    id: roomId,
    users: rooms.get(roomId).users.size,
    files: rooms.get(roomId).files.size
  }));
  
  res.json({ rooms: roomList });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    id: roomId,
    users: Array.from(room.users.values()).map(u => ({
      id: u.id,
      name: u.name,
      color: u.color,
      lastSeen: u.lastSeen
    })),
    files: Object.fromEntries(room.files)
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    totalUsers: Array.from(rooms.values()).reduce((sum, room) => sum + room.users.size, 0)
  });
});

// Serve static files for testing
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 Collaborative Code Server</h1>
    <p><strong>Status:</strong> Running</p>
    <p><strong>WebSocket URL:</strong> ws://localhost:8080/collab</p>
    <p><strong>Active Rooms:</strong> ${rooms.size}</p>
    <p><strong>Total Users:</strong> ${Array.from(rooms.values()).reduce((sum, room) => sum + room.users.size, 0)}</p>
    <br>
    <h3>API Endpoints:</h3>
    <ul>
      <li><a href="/api/rooms">GET /api/rooms</a> - List all rooms</li>
      <li><a href="/health">GET /health</a> - Health check</li>
    </ul>
  `);
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to collaboration server',
    connectionId
  }));
});

// Clean up dead connections every 30 seconds
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log('💀 Terminating dead connection');
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  rooms.forEach((room, roomId) => {
    // Remove inactive users
    room.users.forEach((user, userId) => {
      if (now - user.lastSeen > fiveMinutes) {
        room.users.delete(userId);
        console.log(`🧹 Removed inactive user ${userId} from room ${roomId}`);
      }
    });
    
    // Remove empty rooms
    if (room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`🧹 Removed empty room ${roomId}`);
    }
  });
}, 5 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`
🎉 Collaborative Code Server is running!
📡 WebSocket: ws://localhost:${PORT}/collab
🌐 HTTP: http://localhost:${PORT}
🏠 Rooms: ${rooms.size}
👥 Users: 0

Ready for collaborative coding! 🚀
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server...');
  
  // Close all WebSocket connections
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'server-shutdown',
        message: 'Server is shutting down'
      }));
      client.close();
    }
  });
  
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

module.exports = { app, server, wss };