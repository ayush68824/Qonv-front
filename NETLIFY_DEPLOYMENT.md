# Netlify Deployment Guide for Qonvoo Frontend

## Prerequisites
- GitHub repository: https://github.com/ayush68824/Qonv-front
- Netlify account (free tier available)

## Step 1: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your repository: `ayush68824/Qonv-front`

## Step 2: Configure Build Settings

### Build Settings in Netlify Dashboard:
- **Build command**: `npm run build`
- **Publish directory**: `out` (for static export)
- **Node version**: `18` (or latest LTS)

### Environment Variables (if needed):
```
NEXT_PUBLIC_BACKEND_URL=https://qonv-back.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://qonv-back.onrender.com
```

## Step 3: Deployment Configuration

The following files are already configured:

### `netlify.toml`
- Build command and publish directory
- Node version specification
- Redirects for client-side routing
- Security headers
- Cache headers for static assets

### `next.config.mjs`
- Static export enabled (`output: 'export'`)
- Image optimization disabled for static export
- Webpack configuration for client-side compatibility

### `_redirects`
- Client-side routing support
- API proxy to backend
- Static asset handling

## Step 4: Deploy

1. Click "Deploy site" in Netlify
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be available at a Netlify subdomain

## Step 5: Custom Domain (Optional)

1. Go to "Domain settings" in your Netlify dashboard
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Step 6: Environment Variables Setup

In Netlify Dashboard → Site settings → Environment variables:

```
NEXT_PUBLIC_BACKEND_URL=https://qonv-back.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://qonv-back.onrender.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_PEERJS_HOST=your_peerjs_host
NEXT_PUBLIC_PEERJS_PORT=443
NEXT_PUBLIC_PEERJS_SECURE=true
```

## Troubleshooting

### Common Issues:

1. **Build fails with "next export" error**
   - Solution: The `next.config.mjs` is already configured for static export

2. **Socket.IO connection issues**
   - Ensure your backend CORS settings include your Netlify domain
   - Check that `NEXT_PUBLIC_SOCKET_URL` is set correctly

3. **Images not loading**
   - Verify that `qonvoo-logo.png` is in the `public` folder
   - Check that image optimization is disabled in `next.config.mjs`

4. **Routing issues**
   - The `_redirects` file handles client-side routing
   - Ensure all routes redirect to `index.html`

### Build Logs:
- Check Netlify build logs for specific error messages
- Common build time: 2-5 minutes

## Post-Deployment

1. **Test all features**:
   - Login functionality
   - Real-time chat
   - Media uploads
   - Video calls
   - Dark/light mode toggle

2. **Performance optimization**:
   - Enable Netlify's CDN
   - Configure caching headers
   - Enable compression

3. **Monitoring**:
   - Set up Netlify Analytics (optional)
   - Monitor build status
   - Check for broken links

## Support

If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test locally with `npm run build && npm run export`
4. Check browser console for client-side errors

Your Qonvoo app should now be live on Netlify! 🚀 