import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Assuming backend is on port 5000
    // In production, this should be an environment variable
    const newSocket = io('http://localhost:5001', {
        transports: ['websocket'], // Force websocket
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('error', (err) => {
        console.error('Socket error:', err);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
