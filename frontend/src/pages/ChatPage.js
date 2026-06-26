import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { messagesAPI } from '../api/client';
import io from 'socket.io-client';

const ChatPage = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    loadMessages();
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const response = await messagesAPI.getMessages(conversationId);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/ws/chat/${conversationId}/`;
    socketRef.current = io(wsUrl, { reconnection: true });

    socketRef.current.on('chat_message', (data) => {
      setMessages((prev) => [...prev, data.message]);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    try {
      await messagesAPI.sendMessage(conversationId, inputValue, 'test-iv');
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <p className="text-sm text-gray-600 font-bold">{msg.sender_username}</p>
            <p className="bg-gray-100 p-3 rounded-lg">{msg.encrypted_content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
