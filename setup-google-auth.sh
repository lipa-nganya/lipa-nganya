#!/bin/bash

echo "🔐 Setting up Google OAuth for Lipa Nganya"
echo "=========================================="
echo ""

# Get Client ID from user
read -p "Enter your Google OAuth Client ID: " CLIENT_ID

if [ -z "$CLIENT_ID" ]; then
    echo "❌ No Client ID provided. Exiting."
    exit 1
fi

echo ""
echo "📝 Creating frontend .env file..."
echo "REACT_APP_GOOGLE_CLIENT_ID=$CLIENT_ID" > webapps/customer/.env

echo "📝 Adding to backend .env file..."
echo "" >> backend/.env
echo "# Google OAuth Configuration" >> backend/.env
echo "GOOGLE_CLIENT_ID=$CLIENT_ID" >> backend/.env

echo ""
echo "✅ Google OAuth setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Restart your frontend: cd webapps/customer && npm run dev"
echo "2. Restart your backend: cd backend && npm start"
echo "3. Test the Google Sign-In button"
echo ""
echo "📱 Your app will now use real Google authentication!"

