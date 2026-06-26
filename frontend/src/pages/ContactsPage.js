import React, { useState, useEffect } from 'react';
import { contactsAPI } from '../api/client';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getContacts();
      setContacts(response.data);
    } catch (err) {
      setError('Failed to load contacts');
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactsAPI.addContact(username);
      setUsername('');
      loadContacts();
    } catch (err) {
      setError('Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <form onSubmit={handleAddContact} className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Add contact by username"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <p className="font-bold text-gray-800">{contact.contact_username}</p>
              <p className="text-sm text-gray-600">{contact.contact_email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
