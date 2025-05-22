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
  console.log('✅ Yeni kullanıcı bağlı');

  socket.on('start-connection', ({ username, keyword: userKeyword }) => {
    try {
      if (!username || !userKeyword) return;
      keyword = userKeyword.toLowerCase();
      filteredComments = [];

      if (connection) {
        connection.disconnect();
      }

      connection = new TikTokLiveConnection(username);

      connection.connect().then(() => {
        console.log('📡 TikTok yayınına bağlandı');
      }).catch((err) => {
        console.error('❌ Bağlantı hatası:', err.message);
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
    } catch (e) {
      console.error('🔥 start-connection hatası:', e.message);
    }
  });

  socket.on('draw-winner', () => {
    try {
      if (filteredComments.length === 0) {
        socket.emit('winner', null);
      } else {
        const winner = filteredComments[Math.floor(Math.random() * filteredComments.length)];
        socket.emit('winner', winner);
      }
    } catch (e) {
      console.error('🔥 draw-winner hatası:', e.message);
    }
  });

  socket.on('disconnect', () => {
    console.log("🔌 Socket bağlantısı kapandı");
    if (connection) connection.disconnect();
  });
});

server.listen(3000, () => {
  console.log('🚀 Sunucu 3000 portunda çalışıyor');
});
