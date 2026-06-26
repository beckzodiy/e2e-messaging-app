# Installation & Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- Redis (for real-time messaging)
- Git

## Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/beckzodiy/e2e-messaging-app.git
cd e2e-messaging-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create initial migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at: `http://localhost:3000`

### 4. Redis Setup (Required for WebSockets)

#### macOS (using Homebrew):
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### Windows (using Docker):
```bash
docker run -p 6379:6379 redis:7
```

#### Or use Docker Compose (Recommended)

If you have Docker installed, run everything with one command:

```bash
docker-compose up
```

This will start:
- PostgreSQL database
- Redis cache
- Django backend (port 8000)
- React frontend (port 3000)

## Testing the App

### 1. Create Test Users

**User 1:**
- Username: `alice`
- Password: `SecurePass123`
- Email: `alice@example.com`

**User 2:**
- Username: `bob`
- Password: `SecurePass123`
- Email: `bob@example.com`

Visit `http://localhost:3000/register` to create accounts

### 2. Test Messaging

1. Open two browser windows (or use incognito)
2. Login as `alice` in one, `bob` in the other
3. In alice's window: Go to Contacts → Add contact → type "bob"
4. Start messaging in real-time!

## API Endpoints

### Authentication
```
POST /api/auth/token/              - Get JWT token
POST /api/auth/token/refresh/      - Refresh token
```

### Users
```
POST /api/users/register/register/ - Register new user
GET /api/users/profile/me/         - Get current user profile
PUT /api/users/profile/update_status/ - Update status (online/offline/away)
GET /api/users/contacts/           - List contacts
POST /api/users/contacts/add_contact/ - Add contact
DELETE /api/users/contacts/remove_contact/ - Remove contact
```

### Messages
```
GET /api/messages/conversations/   - Get all conversations
POST /api/messages/conversations/create_or_get/ - Create or get conversation
GET /api/messages/messages/        - Get messages (with ?conversation_id=)
POST /api/messages/messages/       - Send message
POST /api/messages/messages/{id}/mark_as_read/ - Mark message as read
```

### WebSocket
```
WS /ws/chat/<conversation_id>/     - Real-time chat connection
```

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3  # Or PostgreSQL for production
REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
```

## Troubleshooting

### WebSocket Connection Failed
- Make sure Redis is running: `redis-cli ping` should return `PONG`
- Check that backend is running on port 8000
- Verify CORS settings in `backend/config/settings.py`

### Database Errors
- Run migrations: `python manage.py migrate`
- Reset database (dev only): `rm db.sqlite3 && python manage.py migrate`

### Port Already in Use
- Backend: `python manage.py runserver 8001`
- Frontend: `PORT=3001 npm start`

### CORS Issues
Update `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`

## Production Deployment

1. Set `DEBUG=False`
2. Use strong `SECRET_KEY`
3. Configure PostgreSQL database
4. Use HTTPS/WSS
5. Deploy with Gunicorn + Daphne
6. Use environment variables for sensitive data
7. Set up proper logging and monitoring

## Project Structure

```
e2e-messaging-app/
├── backend/
│   ├── config/              # Django settings
│   ├── users/               # User authentication app
│   ├── messages/            # Messaging app
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # Encryption services
│   │   └── App.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Features

✅ User registration & authentication with JWT
✅ Real-time messaging with WebSockets
✅ End-to-end encryption (NaCl)
✅ Contact management
✅ Message read receipts
✅ User status (online/offline/away)
✅ Responsive UI with Tailwind CSS
✅ Docker support

## Next Steps

1. Improve encryption implementation
2. Add group messaging
3. Add message attachments
4. Add typing indicators
5. Add user search
6. Add message reactions
7. Add call functionality
8. Add message search

## Support

For issues, create a GitHub issue: https://github.com/beckzodiy/e2e-messaging-app/issues
