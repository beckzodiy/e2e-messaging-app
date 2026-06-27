import React from 'react';
import Sidebar from '../components/Sidebar';

const ContactsPage = () => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar on the Left */}
      <Sidebar activeConversationContactId={null} />

      {/* Main Panel Placeholder on the Right */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 text-center relative select-none">
        {/* Subtle decorative background gradient */}
        <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Telegram-style placeholder card */}
        <div className="max-w-sm flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
            <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Select a chat</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Choose a contact from the sidebar or add a new one to start exchanging encrypted messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
