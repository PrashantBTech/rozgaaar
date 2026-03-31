import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nearbyJobs, setNearbyJobs] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
      return;
    }
    const token = localStorage.getItem("accessToken");
    const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("new_job_nearby", (job) => setNearbyJobs((p) => [job, ...p].slice(0, 20)));
    socket.on("new_application", (d) => setNotifications((p) => [{ type: "application", ...d }, ...p]));
    socket.on("application_accepted", (d) => setNotifications((p) => [{ type: "accepted", ...d }, ...p]));
    socket.on("application_rejected", (d) => setNotifications((p) => [{ type: "rejected", ...d }, ...p]));
    socket.on("application_shortlisted", (d) => setNotifications((p) => [{ type: "shortlisted", ...d }, ...p]));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  const joinChat = (applicationId) => socketRef.current?.emit("join_chat", applicationId);
  const sendMessage = (d) => socketRef.current?.emit("send_message", d);
  const onMessage = (cb) => socketRef.current?.on("new_message", cb);
  const offMessage = (cb) => socketRef.current?.off("new_message", cb);
  const emitTyping = (applicationId) => socketRef.current?.emit("typing", { applicationId });
  const emitStopTyping = (applicationId) => socketRef.current?.emit("stop_typing", { applicationId });

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, isConnected,
      notifications, nearbyJobs, setNearbyJobs,
      joinChat, sendMessage, onMessage, offMessage,
      emitTyping, emitStopTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
