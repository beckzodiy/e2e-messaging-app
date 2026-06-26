# Deployment Guide

## Deploy on Render (Recommended - Easiest)

### Step 1: Deploy Backend to Render

1. Go to https://render.com
2. Sign up with GitHub (or login)
3. Click **"New +"** → **"Web Service"**
4. **Connect Repository**:
   - Search for: `e2e-messaging-app`
   - Click **"Connect"**

5. **Configure Service**:
   - **Name**: `e2e-messaging-backend`
   - **Environment**: `Python 3`
   - **Region**: `Oregon` (or closest to you)
   - **Branch**: `main`
   - **Build Command**:
     ```
     cd backend && pip install -r requirements.txt && python manage.py migrate
     ```
   - **Start Command**:
     ```
     cd backend && gunicorn config.wsgi:application
     ```

6. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   DEBUG=False
   SECRET_KEY=<generate-random-string-or-leave-auto>
   ALLOWED_HOSTS=*.onrender.com,localhost
   ```

7. **Create Database**:
   - Under "Databases", click **"Create New"** → **"PostgreSQL"**
   - Name: `e2e-messaging-db`
   - Leave defaults, click **"Create Database"**

8. Click **"Create Web Service"**

✅ Your backend will be live at: `https://e2e-messaging-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub (or login)
3. Click **"Add New Project"** → **"Import Git Repository"**
4. Select: `beckzodiy/e2e-messaging-app`
5. **Configure**:
   - **Framework**: `Create React App`
   - **Root Directory**: `frontend`

6. **Add Environment Variables**:
   ```
   REACT_APP_API_URL=https://e2e-messaging-backend.onrender.com/api
   REACT_APP_WS_URL=wss://e2e-messaging-backend.onrender.com
   ```

7. Click **"Deploy"**

✅ Your frontend will be live at: `https://e2e-messaging-frontend.vercel.app`

---

## Verify Deployment

### Check Backend
```bash
curl https://e2e-messaging-backend.onrender.com/api/users/
```

You should get an authentication error (401) - this is expected! It means the backend is working.

### Check Frontend
Visit: `https://e2e-messaging-frontend.vercel.app`

You should see the login page.

---

## Create Test Accounts

1. Visit your frontend URL
2. Click **"Register"**
3. Create two accounts:
   - **User 1**: alice / alice@test.com / SecurePass123
   - **User 2**: bob / bob@test.com / SecurePass123

4. Login as alice, go to **Contacts** → Add **bob**
5. Open another browser/tab, login as bob, add **alice**
6. Start messaging!

---

## Troubleshooting

### Backend not starting?
1. Check logs in Render dashboard
2. Verify database is created
3. Try rebuilding: Render dashboard → "Manual Deploy" → "Deploy latest commit"

### WebSocket connection failing?
1. Ensure backend URL uses `wss://` (secure WebSocket)
2. Check CORS settings in backend/config/settings.py
3. Verify frontend environment variables are correct

### Frontend showing 404?
1. Check Vercel deployment logs
2. Verify build was successful
3. Clear browser cache and reload

### Database connection errors?
1. In Render dashboard, verify PostgreSQL database is running
2. Copy the full DATABASE_URL from the database info
3. Add it as environment variable in your web service

---

## Important Notes

⚠️ **Free tier limitations**:
- Backend may spin down after 15 minutes of inactivity
- First request after sleep may take 30 seconds
- Limited to 0.5GB RAM
- Limited bandwidth

✅ **For production, consider upgrading to**:
- Render paid tier ($7/month)
- Railway ($5/month)
- Fly.io ($5/month)

---

## Keep Deployed App Alive

To prevent your backend from spinning down, add a "keep-alive" service:

1. Go to https://uptimerobot.com (free)
2. Create account
3. Add monitor:
   - URL: `https://e2e-messaging-backend.onrender.com/api/users/`
   - Interval: 5 minutes
   - This will ping your backend every 5 minutes to keep it awake!

---

## Deploy Updates

Every time you push to GitHub, Render and Vercel automatically redeploy! Just:

```bash
git add .
git commit -m "Update message"
git push
```

Your apps will rebuild and deploy automatically.

---

## Share Your App

📱 **Frontend URL**: https://e2e-messaging-frontend.vercel.app
📱 **Backend URL**: https://e2e-messaging-backend.onrender.com

Share the frontend URL with friends to test!
