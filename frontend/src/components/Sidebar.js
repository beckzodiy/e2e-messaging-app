import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsAPI, messagesAPI, authAPI } from '../api/client';

const Sidebar = ({ activeConversationContactId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadContacts();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setCurrentUser(response.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getContacts();
      setContacts(response.data);
    } catch (err) {
      console.error('Failed to load contacts', err);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!usernameToAdd.trim()) return;
    setLoading(true);
    setError('');
    try {
      await contactsAPI.addContact(usernameToAdd);
      setUsernameToAdd('');
      loadContacts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = async (contactUserId) => {
    try {
      const response = await messagesAPI.createOrGetConversation(contactUserId);
      navigate(`/chat/${response.data.id}`);
    } catch (err) {
      setError('Failed to open conversation');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="w-80 md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-100">
      {/* Current User Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-md ring-2 ring-indigo-500/20">
            {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-100">{currentUser?.username || 'Loading...'}</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800/60 transition duration-150"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Add Contact Form */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/20">
        <form onSubmit={handleAddContact} className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </span>
            <input
              type="text"
              value={usernameToAdd}
              onChange={(e) => setUsernameToAdd(e.target.value)}
              placeholder="Add contact by username..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-16 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
          {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
        </form>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Direct Messages
        </div>
        {contacts.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No contacts added yet. Add a user above to start chatting!
          </div>
        ) : (
          contacts.map((c) => {
            const isSelected = c.contact === activeConversationContactId;
            return (
              <div
                key={c.id}
                onClick={() => handleContactClick(c.contact)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150 group ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-100 border-l-4 border-indigo-500'
                    : 'hover:bg-slate-800/40 text-slate-300 hover:text-slate-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 shadow-sm border border-slate-700/50 group-hover:border-slate-600 transition">
                  {c.contact_username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{c.contact_username}</p>
                  <p className="text-xs text-slate-400 truncate">{c.contact_email}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
