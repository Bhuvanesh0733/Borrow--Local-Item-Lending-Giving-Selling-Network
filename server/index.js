require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/items', require('./routes/items'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/notifications', require('./routes/notifications'));

// Socket.io auth + rooms
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join_chat', (requestId) => socket.join(requestId));
  socket.on('leave_chat', (requestId) => socket.leave(requestId));
  socket.on('join_user', () => socket.join(`user_${socket.user.id}`));
  socket.on('typing', ({ requestId }) => socket.to(requestId).emit('typing', { userId: socket.user.id }));
  socket.on('disconnect', () => {});
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
