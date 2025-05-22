
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { TikTokLiveConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

let connection = null;
let keyword = '';
let filteredComments = [];

io.on('connection', (socket) => {
  console.log('Socket connected');

  socket.on('start-connection', ({ username, keyword: userKeyword }) => {
    if (!username || !userKeyword) return;
    keyword = userKeyword.toLowerCase();
    filteredComments = [];

    if (connection) {
      connection.disconnect();
    }

    connection = new TikTokLiveConnection(username);

    connection.connect().then(() => {
      console.log('Connected to TikTok live');
    }).catch((err) => {
      console.error('Connection error:', err);
      socket.emit('error', 'Yayına bağlanılamadı.');
    });

    connection.on('chat', (data) => {
      const msg = data.comment;
      if (msg.toLowerCase().includes(keyword)) {
        const commentData = { uniqueId: data.uniqueId, comment: msg };
        filteredComments.push(commentData);
        socket.emit('filtered-comment', commentData);
      }
    });
  });

  socket.on('draw-winner', () => {
    if (filteredComments.length === 0) {
      socket.emit('winner', null);
    } else {
      const winner = filteredComments[Math.floor(Math.random() * filteredComments.length)];
      socket.emit('winner', winner);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
    if (connection) connection.disconnect();
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
