import { io, Socket } from "socket.io-client";
import { API_URL } from "./api"; // Ensure this exports the base URL (e.g., http://192.168.0.103:5000)

// Extract base URL from API_URL (remove /api)
const BASE_URL = API_URL.replace('/api', '');

class SocketService {
  private socket: Socket | null = null;
  private listeners: Record<string, Function[]> = {};

  connect() {
    if (this.socket) return;

    this.socket = io(BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    this.socket.on("layout_updated", (data: any) => {
      console.log("Layout Updated Event:", data);
      this.notifyListeners("layout_updated", data);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  notifyListeners(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
