import type { Server as HTTPServer } from "http"
import { Server as WebSocketServer } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponse } from "next"

let io: WebSocketServer | null = null

export function initWebSocketServer(server: HTTPServer) {
  if (!io) {
    io = new WebSocketServer(server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join-room", (room) => {
        socket.join(room)
        console.log(`Socket ${socket.id} joined room: ${room}`)
      })

      socket.on("leave-room", (room) => {
        socket.leave(room)
        console.log(`Socket ${socket.id} left room: ${room}`)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })

    console.log("WebSocket server initialized")
  }

  return io
}

export function getWebSocketServer() {
  return io
}

export function emitToRoom(room: string, event: string, data: any) {
  if (io) {
    io.to(room).emit(event, data)
  }
}

export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data)
  }
}

// Middleware for Next.js API routes to handle WebSocket connections
export function webSocketMiddleware(req: NextApiRequest, res: NextApiResponse) {
  if (!io) {
    return res.status(500).json({ error: "WebSocket server not initialized" })
  }
  // Add WebSocket server to the request object
  ;(req as any).io = io

  return null
}

