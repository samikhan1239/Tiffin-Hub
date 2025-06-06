import { Server } from "socket.io";

let io = null;

export function getSocket() {
  if (!io) {
    console.warn("Socket.IO not initialized. Call initSocket first.");
  }
  return io;
}

export function initSocket(httpServer) {
  if (io) {
    console.log("Socket.IO already initialized");
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  console.log("Socket.IO initialized");
  return io;
}
