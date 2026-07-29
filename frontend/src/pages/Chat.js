import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get or create chat
      const response = await axios.get('/api/chat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const chat = response.data.data;
      setChatId(chat._id);
      
      // Load messages
      const messagesRes = await axios.get(`/api/chat/${chat._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messagesRes.data.data);

      // Connect socket with proper error handling
      const socketUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        // Get current user
        const user = JSON.parse(localStorage.getItem('user')) || {};
        // Join personal room to receive direct messages from admin
        if (user._id) {
          newSocket.emit('join', user._id);
        }
      });
      
      newSocket.on('connect_error', (error) => {
        // Attempt to reconnect with polling if websocket fails
        if (newSocket.io.opts.transports.indexOf('polling') === -1) {
          newSocket.io.opts.transports = ['polling'];
          newSocket.connect();
        }
      });

      // Test bidirectional communication
      newSocket.on('disconnect', () => {
        setTimeout(() => {
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, 3000);
      });

      // Add ping/pong for connection testing
      setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping', { timestamp: new Date().toISOString() });
        }
      }, 30000);

      newSocket.on('pong', (data) => {
      });

      newSocket.on('message', (data) => {
        // Standardized message format for consistency between admin and student
        const formattedMessage = {
          _id: data._id || Date.now().toString(),
          content: data.content,
          sender: {
            _id: data.sender?._id || data.from || 'unknown',
            name: data.sender?.name || data.senderName || (data.senderType === 'admin' ? 'Admin' : 'Student')
          },
          recipient: {
            _id: data.recipient?._id || data.to || 'unknown',
            name: data.recipient?.name || (data.to === 'admin' ? 'Admin' : 'Student')
          },
          timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
          isAdminMessage: data.senderType === 'admin' || (data.sender && data.sender._id === 'admin')
        };
        
        // Add new message to the list, avoiding duplicates
        setMessages(prev => {
          // Check if message with same ID already exists
          const exists = prev.some(msg => msg._id === formattedMessage._id);
          if (exists) return prev;
          return [...prev, formattedMessage];
        });
      });

      setSocket(newSocket);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      
      // Store message content before clearing input
      const messageContent = newMessage;
      
      // Create optimistic message for UI
      const optimisticMsg = {
        _id: Date.now().toString(),
        content: messageContent,
        sender: { _id: user._id, name: user.name },
        timestamp: new Date().toISOString()
      };
      
      // Add to UI immediately
      setMessages(prev => [...prev, optimisticMsg]);
      setNewMessage('');
      
      // Send via socket to admin with error handling
      if (socket.connected) {
        try {
          socket.emit('message', {
            from: user._id,
            to: 'admin',
            content: messageContent,
            senderName: user.name,
            senderType: 'student',
            timestamp: new Date().toISOString()
          });
        } catch (socketError) {
          alert('Failed to send message. Please check your connection and try again.');
          // Add the message back to the input field
          setNewMessage(messageContent);
        }
      } else {
        socket.connect();
        alert('Connection issue detected. Attempting to reconnect...');
        // Add the message back to the input field
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('An error occurred while sending your message.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return <div className="loading">Loading chat...</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat with Admin</h2>
        <span className="status-indicator">●  Online</span>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Start a conversation with the admin</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const isOwnMessage = msg.sender?._id === currentUser?._id;
            
            return (
              <div 
                key={index} 
                className={`message ${isOwnMessage ? 'own' : 'other'}`}
              >
                <div className="message-content">
                  {!isOwnMessage && (
                    <img 
                      src={msg.sender?.photo || '/default-avatar.jpg'} 
                      alt={msg.sender?.name}
                      className="sender-avatar"
                    />
                  )}
                  <div className="message-bubble">
                    {!isOwnMessage && <span className="sender-name">{msg.sender?.name}</span>}
                    <p>{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={2}
        />
        <button onClick={sendMessage} disabled={!newMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
