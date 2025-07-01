# Real-Time Chat Application (MERN + WebSocket)

A minimalist real-time chatroom using MongoDB, Express, React, Node.js, and the `ws` WebSocket library.

---

## 🚀 Features

- **Real-time chat** with multiple users
- **Persistent message history** (last 50 messages)
- **Minimalist, responsive UI**
- **No Socket.IO** — uses browser WebSocket API and `ws` on backend

---

## 🧱 Project Structure

```
/chat-app
  /backend    ← Express.js + ws + MongoDB (Mongoose)
  /frontend   ← React.js SPA
```

---

## 🖥️ Frontend

- React SPA
- Prompts for username, then connects to chat
- Shows last 50 messages, real-time updates
- Your messages are highlighted

### Run Frontend

```bash
cd frontend
npm install
npm start
```
App runs at [http://localhost:3000](http://localhost:3000)

---

## 🚀 Backend

- Express.js server
- WebSocket server (`ws`)
- MongoDB via Mongoose
- Stores messages, broadcasts in real time

### Run Backend

```bash
cd backend
npm install
npm start
```
Server runs at [http://localhost:5000](http://localhost:5000)

---

## 🗃️ Database

- MongoDB (local or Atlas)
- Collection: `messages`
  - `username`: string
  - `message`: string
  - `timestamp`: Date

---

## ⚙️ Architecture

- **WebSocket**: Browser connects to backend, sends username, receives last 50 messages, then sends/receives messages in real time.
- **Async/await**: All DB and network operations are non-blocking.
- **Single chatroom**: No private rooms.

---

## 📝 Design Decisions

- **50 message history**: To keep UI fast and DB queries light.
- **No authentication**: Simplicity for demo.
- **No extra libraries**: Only MERN + ws.

---

## 🌐 Deployment

- **Frontend**: Deploy to Netlify/Vercel
- **Backend**: Deploy to Render/Heroku
- **Set WS_URL in frontend to deployed backend WebSocket endpoint**

---

## 🧪 Evaluation

- Real-time, persistent, multi-user chat
- Async concurrency
- Clean, well-commented code
- Graceful error handling

---

## 🙋 Assumptions

- Single chatroom
- No private chat
- No authentication

---

## 📞 Contact

For questions, open an issue or contact the author. 