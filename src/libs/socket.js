import {Server} from 'socket.io';
import http from 'http'
import express from 'express';
import jwt from 'jsonwebtoken'

const app = express()
const server = http.createServer(app);

const io = new Server(server,{ 
    cors: {
        origin: ["http://localhost:5173"],
        
    }
})

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const token = socket.handshake.auth?.token;
  if (!token) return;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    onlineUsers.set(userId, socket.id);

    io.emit("online-users", Array.from(onlineUsers.keys()));

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  } catch (error) {
    console.log("Socket auth error:", error.message);
  }
});

export { io, app, server}

