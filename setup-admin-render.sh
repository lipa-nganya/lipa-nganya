#!/bin/bash

# Admin Static Site Deployment Script for Render
# This script helps prepare the admin app for deployment

echo "🚀 Preparing Admin App for Render Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Navigate to admin app directory
cd webapps/admin

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building admin app for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Admin app built successfully!"
    echo "📁 Build files are in: webapps/admin/dist"
    echo ""
    echo "🌐 Next steps:"
    echo "1. Go to render.com and create a new Static Site"
    echo "2. Connect your GitHub repository"
    echo "3. Set Root Directory to: webapps/admin"
    echo "4. Set Build Command to: npm run build"
    echo "5. Set Publish Directory to: dist"
    echo "6. Add environment variable: VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com"
    echo ""
    echo "📋 Your admin dashboard will be available at:"
    echo "https://your-admin-site-name.onrender.com"
    echo ""
    echo "🔐 Login credentials:"
    echo "Username: admin"
    echo "Password: admin123"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi