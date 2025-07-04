// src/hooks/useWebSocket.js
import { useEffect, useState } from "react";

export default function useCryptoWebSocket(url) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!url) return;

    // Create WebSocket connection with a string URL
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      console.log("Message from server:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [url]);

  return messages;
}
