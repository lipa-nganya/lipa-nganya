# Google OAuth Setup Instructions

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:5173` (for local development)
   - `https://lipa-nganya.onrender.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:5173` (for local development)
   - `https://lipa-nganya.onrender.com` (for production)

## Step 3: Get Your Client ID

After creating the OAuth credentials, you'll get a Client ID that looks like:
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## Step 4: Update Environment Variables

### Frontend (.env file in webapps/customer/)
```
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

### Backend (.env file in backend/)
```
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

## Step 5: Install Backend Dependencies

```bash
cd backend
npm install google-auth-library
```

## Step 6: Test the Authentication

1. Start the backend: `npm start`
2. Start the frontend: `npm run dev`
3. Go to http://localhost:5173
4. Click "Login with Google"
5. You should see the real Google account selection modal

## Current Status

- ✅ Frontend is ready for real Google OAuth
- ✅ Backend has placeholder for Google token verification
- ⏳ Waiting for Google Client ID to complete setup

