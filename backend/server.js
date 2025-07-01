import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// --- MongoDB Setup ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// --- Message Schema ---
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// --- Express Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- HTTP Server ---
const server = http.createServer(app);

// --- WebSocket Server ---
const wss = new WebSocketServer({ server });

/**
 * Each client connection will have:
 * - ws: the WebSocket connection
 * - username: set after client sends it
 */
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.username = null;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', async (data) => {
    try {
      const parsed = JSON.parse(data);

      // First message from client: { type: "join", username }
      if (parsed.type === 'join' && parsed.username) {
        ws.username = parsed.username;

        // Send last 50 messages
        const lastMessages = await Message.find({})
          .sort({ timestamp: -1 })
          .limit(50)
          .sort({ timestamp: 1 }); // oldest first

        ws.send(JSON.stringify({
          type: 'history',
          messages: lastMessages,
        }));
        return;
      }

      // New chat message: { type: "message", message }
      if (parsed.type === 'message' && ws.username && parsed.message) {
        const msg = new Message({
          username: ws.username,
          message: parsed.message,
          timestamp: new Date(),
        });
        await msg.save();

        // Broadcast to all clients
        const outMsg = {
          type: 'message',
          username: ws.username,
          message: parsed.message,
          timestamp: msg.timestamp,
        };
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(outMsg));
          }
        });
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Malformed data.' }));
    }
  });

  ws.on('close', () => {
    // No special cleanup needed for this simple app
  });
});

// --- Heartbeat to detect dead connections ---
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 