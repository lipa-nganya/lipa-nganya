#!/bin/bash

# Admin App Deployment Setup Script
# This script helps prepare the admin app for deployment on Render

echo "🚀 Setting up Admin App for Render Deployment..."

# Navigate to admin directory
cd webapps/admin

echo "📦 Installing dependencies..."
npm install

echo "🔧 Creating production environment file..."
cat > .env.production << EOF
# Production environment variables
VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com
VITE_APP_NAME=Lipa Nganya Admin
VITE_APP_VERSION=1.0.0
NODE_ENV=production
EOF

echo "🏗️ Building admin app for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output created in 'dist' directory"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to https://render.com"
    echo "2. Create new Static Site"
    echo "3. Connect your GitHub repository"
    echo "4. Set Root Directory to: webapps/admin"
    echo "5. Set Build Command to: npm install && npm run build"
    echo "6. Set Publish Directory to: dist"
    echo "7. Add environment variables from .env.production"
    echo ""
    echo "🌐 Your admin app will be available at:"
    echo "https://lipa-nganya-admin.onrender.com"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✨ Setup complete!"
