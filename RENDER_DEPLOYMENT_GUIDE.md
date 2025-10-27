# Lipa Nganya - Render Deployment Guide

## 🚀 Static Service Setup on Render

### Prerequisites
- GitHub repository: `lipa-nganya/lipa-nganya`
- Render account connected to GitHub
- Backend API already deployed at: `https://lipa-nganya-api.onrender.com`

### Customer App Deployment

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in with GitHub

2. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect GitHub repository: `lipa-nganya/lipa-nganya`

3. **Configure Settings**
   ```
   Name: lipa-nganya-customer
   Branch: main
   Root Directory: webapps/customer
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Environment Variables**
   ```
   VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com
   ```

5. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete (~2-3 minutes)
   - URL: `https://lipa-nganya-customer.onrender.com`

### Driver App Deployment

1. **Create Second Static Site**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Settings**
   ```
   Name: lipa-nganya-driver
   Branch: main
   Root Directory: webapps/driver
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Environment Variables**
   ```
   VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete
   - URL: `https://lipa-nganya-driver.onrender.com`

### Post-Deployment

#### Update Backend CORS (Already Done)
The backend CORS settings have been updated to include:
- `https://lipa-nganya-customer.onrender.com`
- `https://lipa-nganya-driver.onrender.com`

#### Test Your Apps
1. **Customer App**: https://lipa-nganya-customer.onrender.com
2. **Driver App**: https://lipa-nganya-driver.onrender.com

#### Features Available
- **Customer App**: Phone authentication, payment processing, profile management
- **Driver App**: Role-based authentication, wallet management, transaction history

### Troubleshooting

#### Build Failures
- Check that `package.json` exists in root directories
- Ensure `npm run build` works locally
- Check Render build logs for specific errors

#### CORS Issues
- Verify backend CORS settings include new domains
- Check browser console for CORS errors
- Ensure backend is deployed and accessible

#### Environment Variables
- Make sure `VITE_BACKEND_URL` is set correctly
- Check that backend URL is accessible
- Verify API endpoints are working

### Cost Information
- **Free Tier**: 750 hours/month per service
- **Customer App**: Free tier should be sufficient
- **Driver App**: Free tier should be sufficient
- **Total**: 2 static services on free tier

### Custom Domains (Optional)
- Can add custom domains in Render dashboard
- Requires DNS configuration
- Free SSL certificates included

## 🎉 Success!
Once deployed, you'll have:
- Customer app for passengers
- Driver app for matatu operators
- Complete role-based wallet system
- Real-time payment processing
- Mobile-responsive design
