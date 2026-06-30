import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context'; 
import { API_BASE_URL } from '../api.index';

interface SocketContextType {
  socket: Socket | null;
  isOnline: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isOnline: false });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useAuth(); // Grab your authenticated user block

  useEffect(() => {
    // Only establish a connection instance if a valid logged-in user exists
    if (!user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection and append the critical handshake query parameters
    const socketInstance = io(API_BASE_URL, {
      query: { userId: user.id.toString() },
      transports: ['websocket'], // Forces WebSocket transport immediately for optimization
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsOnline(true);
      console.log('[Socket] Connected natively to backend gateway instance.');
    });

    socketInstance.on('disconnect', () => {
      setIsOnline(false);
      console.log('[Socket] Network connection terminated.');
    });

    setSocket(socketInstance);

    // Lifecycle Cleanup: Tear down the open connection port if the component unmounts or user logs out
    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook wrapper for quick extraction across mobile screens
export const useSocket = () => {
  return useContext(SocketContext);
};