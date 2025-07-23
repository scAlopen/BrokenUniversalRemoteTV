# Deploy TV Remote Control to Render.com

## Quick Setup Instructions

### 1. Create a Render Account
- Go to [render.com](https://render.com) and create a free account
- Connect your GitHub account to Render

### 2. Deploy the Database
1. In Render Dashboard, click "New" → "PostgreSQL"
2. Configure:
   - Name: `tv-remote-db`
   - Database: `tv_remote_control`
   - User: `tv_remote_user`
   - Plan: Free tier
3. Save the database and copy the "External Database URL"

### 3. Deploy the Web Service
1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `tv-remote-control`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free tier

### 4. Environment Variables
Add these environment variables in Render:
- `NODE_ENV`: `production`
- `DATABASE_URL`: (paste the External Database URL from step 2)

### 5. Auto-Deploy
Render will automatically deploy when you push to your main branch.

## Current Build Configuration
The app is already configured for production deployment:
- ✅ Build script: `npm run build` (builds both client and server)
- ✅ Start script: `npm start` (runs production server)
- ✅ Static files served from `dist/public`
- ✅ Database integration with PostgreSQL
- ✅ Environment variable support

## Features Ready for Deployment
- Universal TV remote with 7 major brands
- Samsung first-gen 4K compatibility with multiple IR codes
- PostgreSQL database with persistent data
- Bluetooth IR blaster support
- Mobile-responsive design
- TV scanning and detection
- Real-time device management

Your app will be available at: `https://your-app-name.onrender.com`