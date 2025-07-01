import React, { useState, useRef, useEffect } from 'react';

   const WS_URL = 'wss://chat-application-wm00.onrender.com';

function App() {
  const [username, setUsername] = useState('');
  const [entered, setEntered] = useState(false);
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle WebSocket connection
  useEffect(() => {
    if (!entered) return;
    const socket = new window.WebSocket(WS_URL);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', username }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'message') {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.onerror = () => {
      alert('WebSocket error. Please refresh.');
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [entered, username]);

  // Handle send message
  const sendMessage = () => {
    if (input.trim() && ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'message', message: input }));
      setInput('');
    }
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Username form
  if (!entered) {
    return (
      <div style={styles.centered}>
        <div style={styles.usernameBox}>
          <h2>Enter Username</h2>
          <input
            style={styles.input}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && username.trim()) setEntered(true); }}
            placeholder="Your name"
            autoFocus
          />
          <button
            style={styles.button}
            onClick={() => username.trim() && setEntered(true)}
          >Submit</button>
        </div>
      </div>
    );
  }

  // Main chat UI
  return (
    <div style={styles.container}>
      <div style={styles.header}>Real-Time Chat</div>
      <div style={styles.chatWindow}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              ...(msg.username === username ? styles.ownMessage : {}),
            }}
          >
            <span style={styles.timestamp}>
              [{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
            </span>
            <span style={msg.username === username ? styles.ownUser : styles.user}>
              {msg.username === username ? 'You' : msg.username}:
            </span>
            <span style={styles.text}>{msg.message}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Type your message here"
        />
        <button style={styles.button} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

// --- Minimalist Inline Styles ---
const styles = {
  centered: {
    display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7'
  },
  usernameBox: {
    background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px #0001', textAlign: 'center'
  },
  container: {
    maxWidth: 480, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', display: 'flex', flexDirection: 'column', height: '80vh'
  },
  header: {
    padding: 16, fontWeight: 'bold', fontSize: 22, borderBottom: '1px solid #eee', textAlign: 'center'
  },
  chatWindow: {
    flex: 1, overflowY: 'auto', padding: 16, background: '#f9f9f9', marginBottom: 8
  },
  message: {
    marginBottom: 8, padding: 8, borderRadius: 6, background: '#e6e6e6', display: 'flex', alignItems: 'center'
  },
  ownMessage: {
    background: '#d1e7dd', alignSelf: 'flex-end', fontWeight: 'bold'
  },
  timestamp: {
    color: '#888', fontSize: 12, marginRight: 8
  },
  user: {
    color: '#007bff', fontWeight: 500, marginRight: 6
  },
  ownUser: {
    color: '#198754', fontWeight: 700, marginRight: 6
  },
  text: {
    wordBreak: 'break-word'
  },
  inputRow: {
    display: 'flex', borderTop: '1px solid #eee', padding: 8, background: '#fafafa'
  },
  input: {
    flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc', marginRight: 8, fontSize: 16
  },
  button: {
    padding: '8px 16px', borderRadius: 4, border: 'none', background: '#007bff', color: '#fff', fontWeight: 600, cursor: 'pointer'
  }
};

export default App; 