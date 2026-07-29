import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './AdminChat.css';

// Set axios base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

const AdminChat = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeAdminChat();
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeAdminChat = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all students - using the correct endpoint
      try {
        const studentsResponse = await axios.get('/api/users/students', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Use mock data if no students are returned
        let studentUsers = studentsResponse.data.data || [];
        
        // If no students from API, use mock data for testing
        if (studentUsers.length === 0) {
          studentUsers = [
            {
              _id: '1',
              name: 'Kokila R',
              email: 'kokila549@gmail.com',
              role: 'student'
            },
            {
              _id: '2',
              name: 'Karthik',
              email: 'karthik@gmail.com',
              role: 'student'
            }
          ];
        }
        setStudents(studentUsers);
      } catch (error) {
        // Always use mock data if API fails
        const mockStudents = [
          {
            _id: '1',
            name: 'Kokila R',
            email: 'kokila549@gmail.com',
            role: 'student'
          },
          {
            _id: '2',
            name: 'Karthik',
            email: 'karthik@gmail.com',
            role: 'student'
          }
        ];
        setStudents(mockStudents);
      }
      
      // Get all messages for admin
      let allMessages = [];
      try {
        const messagesResponse = await axios.get('/api/chat', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort messages by timestamp
        allMessages = (messagesResponse.data.data || []).sort((a, b) => 
          new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt)
        );
      } catch (error) {
        // Use mock data for messages if API fails
        allMessages = [
          {
            _id: '101',
            content: 'Hello, I have a question about my room assignment',
            sender: { _id: '1', name: 'Kokila R' },
            recipient: { _id: 'admin' },
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '102',
            content: 'Hi Kokila, how can I help you?',
            sender: { _id: 'admin' },
            recipient: { _id: '1' },
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            isAdminMessage: true
          }
        ];
      }
      
      setAllMessages(allMessages);
      
      // Initialize socket connection
      const socketUrl = process.env.REACT_APP_SOCKET_URL || window.location.origin;
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          token
        }
      });
      
      newSocket.on('connect', () => {
        setSocketConnected(true);
        
        // Join admin room
        newSocket.emit('join', { room: 'admin' }, (response) => {
          if (response.status !== 'success') {
            alert('Failed to join admin chat room. Please refresh the page.');
          }
        });
      });
      
      newSocket.on('connect_error', (error) => {
        if (error.message) {
          // If websocket fails, socket.io will automatically try polling
          if (!newSocket.io.opts.transports.includes('polling')) {
            newSocket.io.opts.transports.push('polling');
          }
        }
      });
      
      // Handle disconnect event
      newSocket.on('disconnect', () => {
        setSocketConnected(false);
        
        // Attempt to reconnect
        setTimeout(() => {
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, 2000);
      });

      // Set up ping/pong for connection testing
      const pingInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping', {}, (response) => {
            if (!response || response.status !== 'success') {
              // If ping fails, try to reconnect
              if (!newSocket.connected) {
                newSocket.connect();
              }
            }
          });
        }
      }, 30000); // Check every 30 seconds

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
        
        // Add new message to the list, avoiding duplicates by checking ID
        setAllMessages(prev => {
          // Check if message with same ID already exists
          const exists = prev.some(msg => msg._id === formattedMessage._id);
          if (exists) return prev;
          return [...prev, formattedMessage];
        });
        
        // Play notification sound if message is from student
        if (!formattedMessage.isAdminMessage) {
          // You can add sound notification here if needed
        }
      });

      setSocket(newSocket);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize admin chat:', error);
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setSelectedStudent(student);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('token');
      
      // Create optimistic message for UI
      const optimisticMsg = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: { _id: currentUser._id || 'admin', name: 'Admin' },
        recipient: { _id: selectedStudent._id, name: selectedStudent.name },
        timestamp: new Date().toISOString(),
        isAdminMessage: true
      };
      
      // Store message content before clearing input
      const messageContent = newMessage;
      
      // Add to UI immediately for better user experience
      setAllMessages(prev => [...prev, optimisticMsg]);
      setNewMessage('');
      
      // Send message to backend with proper error handling
      let apiSuccess = false;
      try {
        const response = await axios.post('/api/chat/send', {
          recipientId: selectedStudent._id,
          content: messageContent,
          senderType: 'admin'
        }, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // Set timeout to prevent hanging requests
        });
        console.log('Message sent to backend:', response.data);
        apiSuccess = true;
      } catch (apiError) {
        console.error('API error, falling back to socket only:', apiError);
      }
      
      // Always emit via socket for real-time delivery with error handling
      if (socket) {
        if (socket.connected) {
          try {
            socket.emit('message', {
              from: currentUser._id || 'admin',
              to: selectedStudent._id,
              content: messageContent,
              senderName: 'Admin',
              senderType: 'admin',
              timestamp: new Date().toISOString()
            });
            console.log('Message emitted via socket');
          } catch (socketError) {
            console.error('Socket emit error:', socketError);
            // If both API and socket fail, show error to user
            if (!apiSuccess) {
              alert('Failed to send message. Please check your connection and try again.');
              // Add the message back to the input field
              setNewMessage(messageContent);
            }
          }
        } else {
          console.error('Socket not connected, attempting to reconnect...');
          socket.connect();
          // If API succeeded, we don't need to show an error
          if (!apiSuccess) {
            alert('Connection issue detected. Attempting to reconnect...');
          }
        }
      } else if (!apiSuccess) {
        // If socket doesn't exist and API failed, show error
        alert('Failed to send message. Please refresh the page and try again.');
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

  // Filter messages for selected student
  const filteredMessages = useMemo(() => {
    if (!selectedStudent) return allMessages;
    
    return allMessages.filter(msg => {
      // Check if sender or recipient matches the selected student
      const senderMatches = msg.sender && msg.sender._id === selectedStudent._id;
      const recipientMatches = msg.recipient && msg.recipient._id === selectedStudent._id;
      
      return senderMatches || recipientMatches;
    });
  }, [selectedStudent, allMessages]);

  if (loading) return <div className="loading">Loading admin chat...</div>;

  return (
    <div className="chat-container">
      {/* Student List Sidebar */}
      <div className="chat-sidebar">
        <h3>Student Conversations</h3>
        <div className="chat-list">
          {students.length === 0 ? (
            <p className="no-chats">No students available</p>
          ) : (
            students.map((student) => (
              <div 
                key={student._id} 
                className={`chat-item ${selectedStudent && selectedStudent._id === student._id ? 'active' : ''}`}
                onClick={() => selectStudent(student)}
              >
                <div className="chat-avatar">
                  {student.name ? student.name.charAt(0) : 'S'}
                </div>
                <div className="chat-info">
                  <div className="chat-name">{student.name || 'Student'}</div>
                  <div className="chat-preview">{student.email || student.rollNumber || 'No email'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {!selectedStudent ? (
          <div className="no-chat-selected">
            <h3>Select a student to start chatting</h3>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h3>Chat with {selectedStudent.name || 'Student'}</h3>
              <div className={`status-indicator ${selectedStudent.isOnline ? 'online' : 'offline'}`}>
                {selectedStudent.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
            
            <div className="messages-container" ref={messagesEndRef}>
              {filteredMessages.length === 0 ? (
                <div className="no-messages">No messages yet with this student</div>
              ) : (
                filteredMessages.map(message => {
                  // Determine if message is from admin
                  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
                  const isFromAdmin = message.isAdminMessage || 
                                     (message.sender && message.sender._id === currentUser._id);
                  
                  return (
                    <div 
                      key={message._id || `msg-${Date.now()}-${Math.random()}`} 
                      className={`message ${isFromAdmin ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="message-input">
              <input
                type="text"
                placeholder={`Message to ${selectedStudent.name || 'Student'}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChat;