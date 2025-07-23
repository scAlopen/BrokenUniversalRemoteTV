# TV Remote Control - Render Deployment

## 🚀 One-Click Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Manual Deployment Steps

### 1. Prerequisites
- GitHub repository with this code
- Render.com account (free tier available)

### 2. Database Setup (PostgreSQL)
1. In Render Dashboard: **New** → **PostgreSQL**
2. Settings:
   - **Name**: `tv-remote-db`
   - **Database**: `tv_remote_control` 
   - **User**: `tv_remote_user`
   - **Region**: Choose closest to your location
   - **Plan**: Free tier (0.1 GB storage)
3. Click **Create Database**
4. Copy the **External Database URL** (needed for step 4)

### 3. Web Service Setup
1. In Render Dashboard: **New** → **Web Service**
2. Connect your GitHub repository
3. Settings:
   - **Name**: `tv-remote-control`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Region**: Same as database
   - **Plan**: Free tier

### 4. Environment Variables
In the web service environment variables section, add:
```
NODE_ENV=production
DATABASE_URL=<paste-external-database-url-here>
```

### 5. Deploy
1. Click **Create Web Service**
2. Render will automatically build and deploy
3. Your app will be available at: `https://your-app-name.onrender.com`

## ✅ Production Features
- Universal TV remote control (Samsung, LG, Sony, TCL, Hisense, Vizio, Philips)
- Enhanced Samsung compatibility for first-generation 4K TVs
- Multiple IR code fallback system
- PostgreSQL database with persistent storage
- Bluetooth IR blaster support (Broadlink, SwitchBot)
- Mobile-responsive design
- Real-time TV scanning and detection
- RESTful API for TV control

## 🔧 Configuration Files Included
- `render.yaml` - Render service configuration
- `Dockerfile` - Container deployment option
- `.env.example` - Environment variable template
- `deploy-to-render.md` - Detailed deployment guide

## 📱 Features Ready for Production
✅ **TV Control**: Power, volume, channels, navigation, number pad  
✅ **Multi-Brand Support**: 7 major TV manufacturers  
✅ **Samsung Enhanced**: 3 IR codes per command for older models  
✅ **Database Storage**: Persistent TV detection and user preferences  
✅ **Bluetooth Ready**: External IR blaster connectivity  
✅ **Mobile Optimized**: Touch-friendly responsive design  

## 🆓 Free Tier Deployment
This app is designed for Render's free tier:
- **Database**: PostgreSQL 0.1GB (sufficient for TV data)
- **Web Service**: 512MB RAM, shared CPU
- **Auto-sleep**: Inactive after 15 minutes (normal for free tier)
- **Monthly limits**: 750 hours runtime

## 🛠️ After Deployment
1. Visit your app URL
2. Database will auto-initialize with TV brand IR codes
3. Click "Scan" to detect TVs in your area
4. Select your TV brand or detected device
5. Start controlling your TV!

## 💡 Troubleshooting
- **Database connection errors**: Verify DATABASE_URL is correctly set
- **App not loading**: Check build logs in Render dashboard
- **TV not responding**: Try different IR code attempts (Samsung auto-retries)
- **Bluetooth issues**: Ensure HTTPS is enabled (required for Web Bluetooth API)

Your universal TV remote is now ready for the world! 🎉