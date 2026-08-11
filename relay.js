/**
 * Call and Response — optional distance relay
 * Room name is the entire security model.
 * Carries presence, live pads, remote calls, and grades between two phones.
 *
 * Usage:  npm install && npm start
 * Env:    PORT=8787  MAX_BUFFER=200  HEARTBEAT_MS=25000
 *
 * In Call-and-Response.html CONFIG set:
 *   relay: "ws://YOUR-IP:8787"   (or wss:// when hosted)
 *   room:  "cr-anubhab-smrutii"   (same string on both phones)
 */
'use strict';

const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 8787;
const MAX_BUFFER = Number(process.env.MAX_BUFFER) || 80;
const HEARTBEAT_MS = Number(process.env.HEARTBEAT_MS) || 25000;

/** @type {Map<string, Set<import('ws').WebSocket>>} */
const rooms = new Map();
/** @type {Map<string, object[]>} */
const buffers = new Map();

function roomOf(ws) {
  return ws._room || '';
}

function joinRoom(ws, room) {
  leaveRoom(ws);
  const r = String(room || '').slice(0, 120);
  if (!r) return;
  ws._room = r;
  if (!rooms.has(r)) rooms.set(r, new Set());
  rooms.get(r).add(ws);
  if (!buffers.has(r)) buffers.set(r, []);
}

function leaveRoom(ws) {
  const r = roomOf(ws);
  if (!r) return;
  const set = rooms.get(r);
  if (set) {
    set.delete(ws);
    if (set.size === 0) rooms.delete(r);
  }
  ws._room = '';
}

function broadcast(room, payload, except) {
  const set = rooms.get(room);
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const client of set) {
    if (client !== except && client.readyState === 1) {
      try { client.send(data); } catch (_) { /* ignore */ }
    }
  }
}

function bufferPush(room, msg) {
  /* only durable duet events — not live pads (those are realtime-only) */
  const buf = buffers.get(room) || [];
  buf.push(msg);
  while (buf.length > MAX_BUFFER) buf.shift();
  buffers.set(room, buf);
}

function presenceCount(room) {
  const set = rooms.get(room);
  return set ? set.size : 0;
}

function sendPresence(room) {
  broadcast(room, {
    type: 'presence',
    count: presenceCount(room),
    at: Date.now()
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Call and Response relay ok\n');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws._room = '';
  ws._side = '';
  ws._name = '';
  ws._role = '';

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (!msg || typeof msg !== 'object') return;

    const type = msg.type;

    if (type === 'join') {
      joinRoom(ws, msg.room);
      ws._side = String(msg.side || msg.role || '').slice(0, 16);
      ws._role = String(msg.role || msg.side || '').slice(0, 16);
      ws._name = String(msg.name || '').slice(0, 40);
      const buf = buffers.get(roomOf(ws)) || [];
      for (const m of buf) {
        try { ws.send(JSON.stringify(m)); } catch (_) { /* ignore */ }
      }
      sendPresence(roomOf(ws));
      return;
    }

    if (type === 'ping') {
      try {
        ws.send(JSON.stringify({ type: 'pong', at: Date.now(), t: msg.t }));
      } catch (_) { /* ignore */ }
      return;
    }

    const room = roomOf(ws);
    if (!room) return;

    if (msg.role) ws._role = String(msg.role).slice(0, 16);
    if (msg.side) ws._side = String(msg.side).slice(0, 16);
    if (msg.name) ws._name = String(msg.name).slice(0, 40);

    const out = {
      ...msg,
      room,
      fromSide: ws._side || ws._role,
      fromRole: ws._role || msg.fromRole || msg.role,
      fromName: ws._name,
      relayAt: Date.now()
    };

    /* store-and-forward structured duet events (not live pad stream) */
    if (
      type === 'remote-call' ||
      type === 'remote-grade' ||
      type === 'remote-ready'
    ) {
      bufferPush(room, out);
    }

    broadcast(room, out, ws);

    if (type === 'hello' || type === 'heartbeat') {
      broadcast(room, {
        type: 'peer',
        role: ws._role || ws._side,
        side: ws._side || ws._role,
        name: ws._name,
        at: Date.now()
      }, null);
    }
  });

  ws.on('close', () => {
    const room = roomOf(ws);
    leaveRoom(ws);
    if (room) sendPresence(room);
  });

  ws.on('error', () => {
    try { ws.close(); } catch (_) { /* ignore */ }
  });
});

const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      leaveRoom(ws);
      try { ws.terminate(); } catch (_) { /* ignore */ }
      continue;
    }
    ws.isAlive = false;
    try { ws.ping(); } catch (_) { /* ignore */ }
  }
}, HEARTBEAT_MS);

wss.on('close', () => clearInterval(interval));

server.listen(PORT, () => {
  console.log('Call and Response relay on :' + PORT);
  console.log('In CONFIG set relay: "ws://localhost:' + PORT + '" (or your public host)');
  console.log('Same room string on both phones.');
});
