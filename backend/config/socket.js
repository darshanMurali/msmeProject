const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(socket.userId);
    
    // Join specific room (for admin/student direct messaging)
    socket.on('join', (room) => {
      console.log(`${socket.userId} joining room: ${room}`);
      socket.join(room);
    });
    
    // Handle direct messages between admin and students
    socket.on('message', (data) => {
      console.log('Message received:', data);
      
      // Ensure data has all required fields
      const messageData = {
        ...data,
        _id: data._id || Date.now().toString(),
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      // Forward message to recipient
      if (data.to) {
        // Send to specific recipient
        io.to(data.to).emit('message', messageData);
        
        // If sending to admin, also broadcast to admin room
        if (data.to === 'admin') {
          io.to('admin').emit('message', messageData);
        }
        
        // If admin is sending to a student, ensure it goes to the right room
        if (data.senderType === 'admin' && data.to !== 'admin') {
          io.to(data.to).emit('message', messageData);
        }
        
        // Log successful delivery
        console.log(`Message delivered to ${data.to}`);
      } else {
        // Broadcast to everyone if no specific recipient
        socket.broadcast.emit('message', messageData);
      }
    });

    // Join chat room
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Verify user is participant
        if (!chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        socket.join(chatId);
        socket.emit('joined_chat', { chatId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, attachments } = data;

        const chat = await Chat.findById(chatId);
        
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Add message to chat
        chat.messages.push({
          sender: socket.userId,
          content,
          attachments: attachments || [],
          timestamp: new Date()
        });

        await chat.save();
        await chat.populate('messages.sender', 'name photo');

        const newMessage = chat.messages[chat.messages.length - 1];

        // Emit to all participants in the chat
        io.to(chatId).emit('new_message', {
          chatId,
          message: newMessage
        });

        // Send notification to other participants
        chat.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            io.to(participantId.toString()).emit('message_notification', {
              chatId,
              message: newMessage
            });
          }
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        const { chatId } = data;

        const chat = await Chat.findById(chatId);
        
        if (!chat || !chat.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Mark all messages not sent by current user as read
        let updated = false;
        chat.messages.forEach(message => {
          if (message.sender.toString() !== socket.userId && !message.isRead) {
            message.isRead = true;
            updated = true;
          }
        });

        if (updated) {
          await chat.save();
          
          // Notify other participants
          chat.participants.forEach(participantId => {
            if (participantId.toString() !== socket.userId) {
              io.to(participantId.toString()).emit('messages_read', {
                chatId,
                readBy: socket.userId
              });
            }
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_typing', {
        chatId,
        userId: socket.userId
      });
    });

    socket.on('stop_typing', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user_stop_typing', {
        chatId,
        userId: socket.userId
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
