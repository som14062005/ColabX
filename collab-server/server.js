// server.js
// Collaborative Code Server (Express + ws) — cleaned & consolidated

const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

// If running behind a reverse proxy (NGINX, Render, etc.)
app.set('trust proxy', true);

// In-memory store: roomId -> { users: Map<userId, userInfo>, files: Map<filename, content> }
const rooms = new Map();

// HTTP server + WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  path: '/collab',
  clientTracking: true,
});

console.log('🚀 Starting Collaborative Code Server...');

let connectionSeq = 0;

/** ------------------------- Utilities ------------------------- **/

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function ensureRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      files: new Map([
        ['index.js', '// Welcome to collaborative coding!\nconsole.log("Hello, world!");\n'],
        ['README.md', '# Collaborative Workspace\n\nStart coding together!\n'],
      ]),
    });
    console.log(`🏠 Created new room: ${roomId}`);
  }
  return rooms.get(roomId);
}

// Broadcast to room. If senderWS === null => include sender, else exclude sender.
function broadcastToRoom(roomId, message, senderWS = undefined) {
  const room = rooms.get(roomId);
  if (!room) return;

  const payload = JSON.stringify(message);
  let count = 0;

  room.users.forEach((user) => {
    if (!user.ws || user.ws.readyState !== WebSocket.OPEN) return;
    if (senderWS !== null && senderWS && user.ws === senderWS) return;
    try {
      user.ws.send(payload);
      count++;
    } catch (err) {
      console.error(`❌ Failed to send to ${user.id}:`, err.message);
      room.users.delete(user.id);
    }
  });

  console.log(`📡 Broadcasted ${message.type} to ${count} users in room ${roomId}`);
}

// Apply text operation to server-side file content
function applyOperation(content, operation) {
  try {
    switch (operation.type) {
      case 'insert': {
        const lines = content.split('\n');
        const li = Math.max(0, Math.min(operation.position.lineNumber - 1, lines.length - 1));
        const ci = Math.max(0, Math.min(operation.position.column - 1, (lines[li] || '').length));
        lines[li] = (lines[li] || '').slice(0, ci) + (operation.text || '') + (lines[li] || '').slice(ci);
        return lines.join('\n');
      }
      case 'delete': {
        const lines = content.split('\n');
        const sL = Math.max(0, Math.min(operation.range.startLineNumber - 1, lines.length - 1));
        const eL = Math.max(0, Math.min(operation.range.endLineNumber - 1, lines.length - 1));
        const sC = Math.max(0, Math.min(operation.range.startColumn - 1, (lines[sL] || '').length));
        const eC = Math.max(0, Math.min(operation.range.endColumn - 1, (lines[eL] || '').length));

        if (sL === eL) {
          lines[sL] = (lines[sL] || '').slice(0, sC) + (lines[sL] || '').slice(eC);
        } else {
          lines[sL] = (lines[sL] || '').slice(0, sC) + (lines[eL] || '').slice(eC);
          lines.splice(sL + 1, eL - sL);
        }
        return lines.join('\n');
      }
      case 'replace': {
        const lines = content.split('\n');
        const sL = Math.max(0, Math.min(operation.range.startLineNumber - 1, lines.length - 1));
        const eL = Math.max(0, Math.min(operation.range.endLineNumber - 1, lines.length - 1));
        const sC = Math.max(0, Math.min(operation.range.startColumn - 1, (lines[sL] || '').length));
        const eC = Math.max(0, Math.min(operation.range.endColumn - 1, (lines[eL] || '').length));

        if (sL === eL) {
          lines[sL] = (lines[sL] || '').slice(0, sC) + (operation.text || '') + (lines[sL] || '').slice(eC);
        } else {
          const newText = String(operation.text || '').split('\n');
          lines[sL] = (lines[sL] || '').slice(0, sC) + newText[0];
          if (newText.length > 1) {
            lines.splice(sL + 1, eL - sL, ...newText.slice(1, -1));
            lines[sL + newText.length - 1] =
              newText[newText.length - 1] + (lines[eL] || '').slice(eC);
          } else {
            lines[sL] += (lines[eL] || '').slice(eC);
            lines.splice(sL + 1, eL - sL);
          }
        }
        return lines.join('\n');
      }
      default:
        return content;
    }
  } catch (e) {
    console.error('❌ Error applying operation:', e);
    return content;
  }
}

/** ------------------------- WebSocket Handlers ------------------------- **/

wss.on('connection', (ws, req) => {
  const connectionId = `conn-${++connectionSeq}`;
  const clientIP = getClientIP(req);
  console.log(`👤 New connection ${connectionId} from ${clientIP} - Active: ${wss.clients.size}`);

  let currentRoomId = null;
  let userId = null;

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
    // Optionally update lastSeen if we know user/room:
    if (currentRoomId && userId) {
      const room = rooms.get(currentRoomId);
      const user = room?.users.get(userId);
      if (user) user.lastSeen = Date.now();
    }
  });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (err) {
      console.error('❌ Bad JSON:', err.message);
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
      return;
    }

    const type = msg.type;
    const logInfo = { type, user: msg.userId || 'unknown', room: msg.roomId || currentRoomId };
    console.log('📨 Message:', logInfo);

    try {
      switch (type) {
        case 'join': {
          const { roomId, user } = msg;
          if (!roomId || !user?.id) {
            ws.send(JSON.stringify({ type: 'error', error: 'Missing roomId or user.id' }));
            return;
          }

          currentRoomId = roomId;
          userId = user.id;

          const room = ensureRoom(roomId);
          room.users.set(user.id, {
            ...user,
            id: user.id,
            ws,
            lastSeen: Date.now(),
          });

          // Send current users (without ws) to the joiner
          ws.send(JSON.stringify({
            type: 'users-list',
            users: Array.from(room.users.values()).map(u => ({
              id: u.id, name: u.name, color: u.color,
            })),
          }));

          // Send full file list + contents
          ws.send(JSON.stringify({
            type: 'file-list',
            files: Object.fromEntries(room.files),
          }));

          // Notify others
          broadcastToRoom(roomId, { type: 'user-joined', user }, ws);

          console.log(`✅ ${user.id} joined ${roomId}`);
          break;
        }

        case 'file-operation': {
          if (!currentRoomId) return;
          const { filename, operation, userId: senderId } = msg;
          if (!filename || !operation) return;

          const room = rooms.get(currentRoomId);
          if (!room) return;

          const existing = room.files.get(filename) ?? '';
          const updated = applyOperation(existing, operation);
          room.files.set(filename, updated);

          // Relay to others
          broadcastToRoom(currentRoomId, msg, ws);
          break;
        }

        case 'cursor-position': {
          if (!currentRoomId) return;
          // Just relay cursor info to others
          broadcastToRoom(currentRoomId, msg, ws);
          break;
        }

        case 'request-file-content': {
          if (!currentRoomId) return;
          const { filename, userId: requestUserId } = msg;
          if (!filename || !requestUserId) return;

          const room = rooms.get(currentRoomId);
          if (!room) return;

          const content = room.files.get(filename);
          const target = room.users.get(requestUserId);
          if (content !== undefined && target?.ws?.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({
              type: 'file-content',
              filename,
              content,
            }));
            console.log(`📄 Sent file content for ${filename} to ${requestUserId}`);
          }
          break;
        }

        case 'file-created': {
          if (!currentRoomId) return;
          const { filename, content, userId: sender } = msg;
          if (!filename) return;

          const room = rooms.get(currentRoomId);
          if (!room) return;

          room.files.set(filename, typeof content === 'string' ? content : '// New file\n');
          console.log(`📄 File created: ${filename} in ${currentRoomId} by ${sender || 'unknown'}`);

          // Broadcast to all (include sender so they confirm)
          broadcastToRoom(currentRoomId, {
            type: 'file-created',
            filename,
            content: room.files.get(filename),
            userId: sender,
          }, null);
          break;
        }

        case 'file-deleted': {
          if (!currentRoomId) return;
          const { filename, userId: sender } = msg;
          if (!filename) return;

          const room = rooms.get(currentRoomId);
          if (!room) return;

          room.files.delete(filename);
          console.log(`🗑️ File deleted: ${filename} from ${currentRoomId} by ${sender || 'unknown'}`);

          broadcastToRoom(currentRoomId, {
            type: 'file-deleted',
            filename,
            userId: sender,
          }, null);
          break;
        }

        case 'leave': {
          if (!currentRoomId || !msg.userId) return;
          const room = rooms.get(currentRoomId);
          if (!room) return;

          room.users.delete(msg.userId);
          broadcastToRoom(currentRoomId, { type: 'user-left', userId: msg.userId }, ws);

          // Clean up empty rooms
          if (room.users.size === 0) {
            rooms.delete(currentRoomId);
            console.log(`🧹 Cleaned empty room: ${currentRoomId}`);
          }
          break;
        }

        default:
          console.warn('⚠️ Unknown message type:', type);
          ws.send(JSON.stringify({ type: 'error', error: `Unknown type: ${type}` }));
      }
    } catch (err) {
      console.error('❌ Handler error:', err);
      ws.send(JSON.stringify({ type: 'error', error: 'Failed to process message' }));
    }
  });

  ws.on('close', (code) => {
    console.log(`👋 Connection ${connectionId} closed (code ${code}) - Active: ${wss.clients.size - 1}`);

    if (currentRoomId && userId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.users.delete(userId);
        broadcastToRoom(currentRoomId, { type: 'user-left', userId }, ws);

        if (room.users.size === 0) {
          rooms.delete(currentRoomId);
          console.log(`🧹 Cleaned empty room: ${currentRoomId}`);
        }
      }
    }
  });

  ws.on('error', (err) => {
    console.error(`❌ WebSocket error (${connectionId}):`, err.message);
  });
});

/** ------------------------- Heartbeat Sweep ------------------------- **/

// Single sweep that pings all clients; clients must respond with pong
const SWEEP_MS = 15000;
const heartbeatSweep = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log('💀 Terminating dead connection');
      return ws.terminate();
    }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  });
}, SWEEP_MS);

/** ------------------------- REST API ------------------------- **/

app.get('/api/rooms', (_req, res) => {
  const roomList = Array.from(rooms.entries()).map(([roomId, room]) => ({
    id: roomId,
    users: room.users.size,
    files: room.files.size,
  }));
  res.json({ rooms: roomList });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  res.json({
    id: req.params.roomId,
    users: Array.from(room.users.values()).map((u) => ({
      id: u.id, name: u.name, color: u.color, lastSeen: u.lastSeen,
    })),
    files: Object.fromEntries(room.files),
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    totalUsers: Array.from(rooms.values()).reduce((sum, r) => sum + r.users.size, 0),
  });
});

app.get('/', (_req, res) => {
  res.send(`
    <h1>Collaborative Code Server</h1>
    <p><strong>Status:</strong> Running</p>
    <p><strong>WebSocket URL:</strong> ws://localhost:${PORT}/collab</p>
    <p><strong>Active Rooms:</strong> ${rooms.size}</p>
    <p><strong>Total Users:</strong> ${Array.from(rooms.values()).reduce((s, r) => s + r.users.size, 0)}</p>
    <h2>API Endpoints:</h2>
    <ul>
      <li><a href="/health">GET /health</a></li>
      <li><a href="/api/rooms">GET /api/rooms</a></li>
      <li>GET /api/rooms/:roomId</li>
    </ul>
  `);
});

/** ------------------------- Startup & Shutdown ------------------------- **/

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket on ws://localhost:${PORT}/collab`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
});

function shutdown(signal) {
  console.log(`🛑 ${signal} received, shutting down gracefully`);
  clearInterval(heartbeatSweep);

  // Close all client sockets
  wss.clients.forEach((ws) => {
    try { ws.terminate(); } catch {}
  });

  // Close WS server then HTTP server
  wss.close(() => {
    server.close(() => {
      console.log('✅ HTTP & WS servers closed');
      process.exit(0);
    });
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { app, server, wss, rooms };
