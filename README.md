# End-to-End Messaging App

A secure, real-time messaging application with end-to-end encryption using Django backend and React frontend.

## Features

- User authentication and registration
- Real-time messaging with WebSockets
- End-to-end encryption (NaCl)
- Message history
- Online/offline status
- User profiles
- Group chat support (coming soon)

## Tech Stack

### Backend
- Django 4.2+
- Django Channels for WebSocket support
- Django REST Framework
- PostgreSQL/SQLite
- PyNaCl for encryption

### Frontend
- React 18+
- Socket.io for real-time communication
- TweetNaCl.js for encryption
- Axios for API calls
- Tailwind CSS for styling

## Project Structure

```
e2e-messaging-app/
├── backend/          # Django application
├── frontend/         # React application
├── docker-compose.yml
└── README.md
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Docker Setup

```bash
docker-compose up
```

## API Endpoints

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/users/` - List all users
- `GET /api/messages/` - Get messages
- `WS /ws/chat/<conversation_id>/` - WebSocket connection

## Security

- All messages are encrypted end-to-end using NaCl
- Authentication via JWT tokens
- HTTPS/WSS in production
- CSRF protection
- Rate limiting on endpoints

## License

MIT
