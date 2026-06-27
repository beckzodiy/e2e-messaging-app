import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { messagesAPI, authAPI } from '../api/client';
import Sidebar from '../components/Sidebar';

const ChatPage = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    loadConversationDetails();
    loadMessages();
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const loadConversationDetails = async () => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/`);
      setConversation(response.data);
    } catch (err) {
      console.error('Failed to load conversation details', err);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await messagesAPI.getMessages(conversationId);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('access_token');
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/ws/chat/${conversationId}/?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.onclose = (e) => {
      console.log('WebSocket disconnected', e.reason);
    };

    socket.onerror = (err) => {
      console.error('WebSocket error', err);
    };
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat_message',
        encrypted_content: inputValue,
        iv: 'test-iv'
      }));
      setInputValue('');
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const groupMessagesByDate = (messagesList) => {
    const groups = {};
    messagesList.forEach((msg) => {
      const dateKey = formatMessageDate(msg.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const otherParticipant = conversation?.participants?.find(
    (p) => p.username !== currentUser?.username
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar on the Left */}
      <Sidebar activeConversationContactId={otherParticipant?.id} />

      {/* Chat Area on the Right */}
      <div className="flex-1 flex flex-col bg-slate-950 h-screen">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 shadow-sm border border-slate-700/50">
              {otherParticipant?.username ? otherParticipant.username.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-100">{otherParticipant?.username || 'Loading...'}</p>
              <div className="text-xs text-slate-400">
                {otherParticipant?.status === 'online' ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    online
                  </span>
                ) : otherParticipant?.status === 'away' ? (
                  <span className="text-amber-400 font-medium">away</span>
                ) : (
                  <span className="text-slate-400">offline</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 relative">
          {/* Subtle background decoration */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/2 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/2 rounded-full blur-[120px] pointer-events-none"></div>

          {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
            <div key={date} className="space-y-4 relative z-10">
              {/* Date Divider */}
              <div className="flex justify-center">
                <span className="bg-slate-850 text-slate-300 text-[11px] px-3 py-1 rounded-full shadow-sm font-semibold border border-slate-800">
                  {date}
                </span>
              </div>

              {/* Message Bubbles */}
              {msgs.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id || msg.sender_username === currentUser?.username;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] p-3 pb-5 rounded-2xl shadow-sm relative group flex flex-col ${
                        isMe
                          ? 'bg-indigo-650 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {!isMe && (
                        <span className="text-xs font-bold text-indigo-400 mb-1">
                          {msg.sender_username}
                        </span>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-12">
                        {msg.encrypted_content}
                      </p>
                      <span
                        className={`text-[9px] absolute bottom-1 right-2 font-light ${
                          isMe ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 z-10">
          <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-400 rounded-full px-5 py-3 text-sm border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-3 shadow-md hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition duration-150 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
