# Admin Static Site Deployment on Render

This guide will walk you through deploying the Lipa Nganya Admin Dashboard as a static site on Render.

## Prerequisites

- Admin app built and ready for deployment
- Render account (free tier available)
- GitHub repository with admin app code

## Step 1: Prepare Admin App for Production

### 1.1 Update Environment Variables

Create a `.env.production` file in `webapps/admin/`:

```bash
# Production environment variables
VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com
VITE_APP_NAME=Lipa Nganya Admin
VITE_APP_VERSION=1.0.0
```

### 1.2 Update Vite Configuration

Ensure `webapps/admin/vite.config.js` is configured for production:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          admin: ['./src/App.jsx']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})
```

### 1.3 Update Package.json Scripts

Ensure `webapps/admin/package.json` has proper build scripts:

```json
{
  "scripts": {
    "dev": "vite --port 5176 --host",
    "build": "vite build",
    "preview": "vite preview --port 5176",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## Step 2: Build Admin App Locally (Optional Test)

```bash
# Navigate to admin directory
cd webapps/admin

# Install dependencies
npm install

# Build for production
npm run build

# Test the build locally
npm run preview
```

## Step 3: Deploy to Render

### 3.1 Create New Static Site

1. **Login to Render Dashboard**
   - Go to [render.com](https://render.com)
   - Sign in to your account

2. **Create New Static Site**
   - Click "New +" button
   - Select "Static Site"

3. **Connect Repository**
   - Choose "Build and deploy from a Git repository"
   - Connect your GitHub account if not already connected
   - Select your `lipa-nganya` repository

### 3.2 Configure Build Settings

**Basic Settings:**
- **Name**: `lipa-nganya-admin`
- **Branch**: `main`
- **Root Directory**: `webapps/admin`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Advanced Settings:**
- **Node Version**: `18` (or latest LTS)
- **Environment**: `Production`

### 3.3 Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com
VITE_APP_NAME=Lipa Nganya Admin
VITE_APP_VERSION=1.0.0
```

### 3.4 Custom Headers (Optional)

Add custom headers for security:

```json
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

## Step 4: Configure CORS on Backend

Update your backend CORS settings to include the admin site:

```javascript
// In backend/src/index.js
const corsOptions = {
  origin: [
    "http://localhost:5173",           // Customer app local
    "http://localhost:5174",           // Driver app local
    "http://localhost:5176",           // Admin app local
    "https://lipa-nganya.onrender.com", // Customer app production
    "https://lipa-nganya-driver.onrender.com", // Driver app production
    "https://lipa-nganya-admin.onrender.com"  // Admin app production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Step 5: Deploy and Test

### 5.1 Deploy
1. Click "Create Static Site" in Render
2. Wait for build to complete (usually 2-5 minutes)
3. Note the generated URL (e.g., `https://lipa-nganya-admin.onrender.com`)

### 5.2 Test Deployment
1. **Access Admin Dashboard**: Visit the generated URL
2. **Test Login**: Use admin credentials to login
3. **Test Features**: Verify all admin functions work
4. **Test API Connection**: Ensure backend communication works

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain
1. In Render dashboard, go to your static site
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `admin.lipa-nganya.com`)
4. Follow DNS configuration instructions

### 6.2 SSL Certificate
- Render automatically provides SSL certificates
- Custom domains get automatic SSL via Let's Encrypt

## Step 7: Monitoring and Maintenance

### 7.1 Monitor Performance
- Check Render dashboard for build logs
- Monitor site performance and uptime
- Set up alerts for build failures

### 7.2 Update Deployment
- Push changes to `main` branch
- Render automatically rebuilds and deploys
- Monitor build logs for any issues

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **API Connection Issues**
   - Verify CORS settings on backend
   - Check environment variables
   - Ensure backend URL is correct

3. **Static Assets Not Loading**
   - Check base URL configuration
   - Verify asset paths in build output
   - Check for case sensitivity issues

4. **Authentication Issues**
   - Verify admin credentials in database
   - Check API endpoints are working
   - Ensure proper error handling

### Debug Commands:

```bash
# Check build output
npm run build

# Test production build locally
npm run preview

# Check for linting issues
npm run lint

# Verify environment variables
echo $VITE_BACKEND_URL
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to repository
2. **API Keys**: Store securely in Render environment variables
3. **CORS**: Restrict origins to known domains only
4. **Headers**: Use security headers for protection
5. **HTTPS**: Always use HTTPS in production

## Performance Optimization

1. **Build Optimization**: Use code splitting and lazy loading
2. **Asset Optimization**: Compress images and assets
3. **Caching**: Configure proper cache headers
4. **CDN**: Consider using Render's CDN features

## Backup and Recovery

1. **Code Backup**: Keep repository backed up
2. **Database Backup**: Ensure backend database is backed up
3. **Configuration Backup**: Document all environment variables
4. **Recovery Plan**: Have a rollback strategy ready

## Support and Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)
- **React Documentation**: [react.dev](https://react.dev)

## Final Checklist

- [ ] Admin app builds successfully locally
- [ ] Environment variables configured
- [ ] CORS settings updated on backend
- [ ] Static site deployed on Render
- [ ] Admin login functionality tested
- [ ] All admin features working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Performance monitoring set up
- [ ] Documentation updated

Your admin dashboard should now be live and accessible at your Render URL!