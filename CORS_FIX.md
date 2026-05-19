# CORS and NextAuth Fix

## Issues Fixed

1. **CORS Policy Error**: Changed from wildcard `*` to specific origins with credentials support
2. **NextAuth URL Mismatch**: Updated `NEXTAUTH_URL` to match production deployment
3. **Missing Credentials Header**: Added `Access-Control-Allow-Credentials: true`

## Changes Made

### 1. `next.config.ts`
- Changed `Access-Control-Allow-Origin` from `*` to environment-specific origins
- Added `Access-Control-Allow-Credentials: true`
- Added `Authorization` to allowed headers
- Now supports both local development (`http://localhost:5173`) and production (`https://quickdrop-web.vercel.app`)

### 2. `middleware.ts`
- Updated error responses to use specific origins instead of wildcard
- Added credentials support to CORS headers
- Dynamically selects origin based on request

### 3. `.env.local`
- Updated `NEXTAUTH_URL` from `http://localhost:3000` to `https://quickdrop-api.vercel.app`

## Deployment Steps

### For Vercel Deployment:

1. **Update Environment Variables on Vercel**:
   ```bash
   # Go to your Vercel dashboard
   # Project Settings > Environment Variables
   # Update NEXTAUTH_URL to: https://quickdrop-api.vercel.app
   ```

2. **Deploy the changes**:
   ```bash
   cd quickdrop-api
   git add .
   git commit -m "Fix CORS and NextAuth configuration"
   git push
   ```

3. **Verify the deployment**:
   - Check that the API is accessible at `https://quickdrop-api.vercel.app`
   - Test the auth endpoints: `https://quickdrop-api.vercel.app/api/auth/csrf`

### For Local Development:

1. **Update `.env.local` for local testing**:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Start the API server**:
   ```bash
   cd quickdrop-api
   npm run dev
   ```

3. **Update web app to use local API**:
   In `quickdrop-web/src/context/AuthContext.tsx`, temporarily change:
   ```typescript
   const API_URL = 'http://localhost:3000';
   ```

## Testing

After deployment, test the authentication flow:

1. Open the web app at `http://localhost:5173` (or your production URL)
2. Try to log in with test credentials
3. Check browser console - CORS errors should be gone
4. Verify that authentication succeeds

## Environment-Specific Configuration

The CORS configuration now automatically adapts:

- **Development**: Allows `http://localhost:5173`
- **Production**: Allows `https://quickdrop-web.vercel.app`

If you need to add more origins, update the `allowedOrigins` array in:
- `next.config.ts` (for the headers function)
- `middleware.ts` (for error responses)

## Troubleshooting

### Still seeing CORS errors?
1. Clear browser cache and cookies
2. Verify environment variables are set correctly on Vercel
3. Check that the deployment completed successfully
4. Ensure the web app is using the correct API URL

### 404 on auth endpoints?
1. Verify the API is deployed and accessible
2. Check that `NEXTAUTH_URL` matches your deployment URL
3. Ensure NextAuth routes are not being blocked by middleware

### Authentication not persisting?
1. Check that cookies are being set (look in browser DevTools > Application > Cookies)
2. Verify `Access-Control-Allow-Credentials: true` is in response headers
3. Ensure the web app is using `credentials: 'include'` in fetch requests
