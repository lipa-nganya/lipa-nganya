# Admin Static Site Deployment on Render

This guide will help you deploy the Lipa Nganya Admin Dashboard as a static site on Render.

## Prerequisites

- Render account (free tier available)
- Admin app built and ready for deployment
- Backend API already deployed on Render

## Step 1: Build the Admin App

First, let's build the admin app for production:

```bash
cd webapps/admin
npm run build
```

This will create a `dist` folder with the production-ready files.

## Step 2: Create Static Site on Render

1. **Log into Render Dashboard**
   - Go to [render.com](https://render.com)
   - Sign in to your account

2. **Create New Static Site**
   - Click "New +" button
   - Select "Static Site"

3. **Connect Repository**
   - Choose "Build and deploy from a Git repository"
   - Connect your GitHub repository
   - Select the repository containing your project

## Step 3: Configure Build Settings

### Basic Configuration:
- **Name**: `lipa-nganya-admin`
- **Branch**: `main`
- **Root Directory**: `webapps/admin`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Environment Variables:
Add these environment variables in the Render dashboard:

```
VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com
```

## Step 4: Advanced Configuration

### Build Command:
```bash
npm install && npm run build
```

### Node Version:
Set Node.js version to `18` or `20` in the environment variables:
```
NODE_VERSION=18
```

## Step 5: Custom Headers (Optional)

Add custom headers for better security:

```json
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## Step 6: Deploy

1. **Save Configuration**
   - Review all settings
   - Click "Create Static Site"

2. **Monitor Deployment**
   - Watch the build logs
   - Wait for deployment to complete

3. **Access Your Site**
   - Render will provide a URL like: `https://lipa-nganya-admin.onrender.com`
   - Test the admin dashboard

## Step 7: Custom Domain (Optional)

If you want a custom domain:

1. **Add Custom Domain**
   - Go to your static site settings
   - Click "Custom Domains"
   - Add your domain

2. **Configure DNS**
   - Add CNAME record pointing to your Render URL
   - Wait for SSL certificate to be issued

## Step 8: Environment Configuration

### Production Environment Variables:
```
VITE_BACKEND_URL=https://lipa-nganya-api.onrender.com
```

### Development vs Production:
- **Development**: `http://localhost:7070`
- **Production**: `https://lipa-nganya-api.onrender.com`

## Step 9: Testing the Deployment

1. **Access Admin Dashboard**
   - Go to your Render URL
   - Should load the admin login page

2. **Test Login**
   - Username: `admin`
   - Password: `admin123`

3. **Test Features**
   - Dashboard statistics
   - Wallet recalculation
   - Data management

## Step 10: Monitoring and Maintenance

### Build Logs:
- Monitor build logs for any errors
- Check for successful deployment

### Performance:
- Static sites on Render are fast and reliable
- Automatic SSL certificates
- Global CDN distribution

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build command syntax

2. **Environment Variables**
   - Ensure VITE_BACKEND_URL is set correctly
   - Verify backend API is accessible

3. **CORS Issues**
   - Backend should allow your Render domain
   - Check CORS configuration in backend

4. **API Connection**
   - Test backend API endpoints
   - Verify database connectivity

### Debug Commands:

```bash
# Test backend API
curl https://lipa-nganya-api.onrender.com/api/admin/dashboard

# Test admin site
curl https://lipa-nganya-admin.onrender.com
```

## Security Considerations

1. **Admin Credentials**
   - Change default admin password in production
   - Use environment variables for credentials

2. **API Security**
   - Ensure backend has proper authentication
   - Use HTTPS for all communications

3. **Access Control**
   - Consider IP restrictions for admin access
   - Implement proper session management

## Cost Information

- **Free Tier**: 750 hours/month
- **Static sites**: Usually stay within free limits
- **Custom domains**: Free
- **SSL certificates**: Free and automatic

## Next Steps

1. **Set up monitoring** for the admin dashboard
2. **Configure backups** for important data
3. **Set up alerts** for any issues
4. **Document admin procedures** for team members

## Support

If you encounter issues:
1. Check Render documentation
2. Review build logs
3. Test locally first
4. Contact Render support if needed

---

**Your admin dashboard will be available at:**
`https://lipa-nganya-admin.onrender.com`

**Login credentials:**
- Username: `admin`
- Password: `admin123`