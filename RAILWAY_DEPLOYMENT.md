# Railway Deployment Guide

## 🚂 **Deploy WishMaker Backend to Railway**

This guide will help you deploy your backend API to Railway's free tier for production use.

## 📋 **Prerequisites**

- [Railway CLI](https://docs.railway.app/develop/cli) installed
- GitHub account
- Your backend code ready for deployment

## 🛠️ **Step 1: Prepare Your Backend for Deployment**

### **1.1 Create Railway Configuration**

Create `railway.toml` in your backend directory:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "npm start"
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3

[env]
NODE_ENV = "production"
PORT = "${{ PORT }}"
```

### **1.2 Update Backend Dockerfile (if needed)**

Your existing Dockerfile should work, but ensure it has:

```dockerfile
# Expose port for Railway
EXPOSE $PORT

# Use production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
```

## 🚀 **Step 2: Deploy to Railway**

### **2.1 Login to Railway**

```bash
railway login
```

### **2.2 Initialize Railway Project**

```bash
cd backend
railway init
```

- Choose "Create new project"
- Name it: `wishmaker-backend`
- Select your team (or personal account)

### **2.3 Deploy Backend**

```bash
railway up
```

This will:
- Build your Docker container
- Deploy to Railway
- Provide you with a deployment URL

### **2.4 Set Environment Variables**

```bash
# Set production environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="CHANGE-THIS-TO-A-SECURE-64-CHARACTER-RANDOM-STRING-FOR-PRODUCTION"
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_SFILyp8qg5Yj@ep-muddy-sound-ah6wie43-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# CORS configuration
railway variables set CORS_ORIGIN="https://romcar.github.io"
railway variables set CORS_CREDENTIALS=true

# WebAuthn configuration
railway variables set RP_NAME="WishMaker"
railway variables set RP_ID="romcar.github.io"
railway variables set ORIGIN="https://romcar.github.io/WishMaker"

# Security settings
railway variables set RATE_LIMIT_WINDOW_MS=300000
railway variables set REQUEST_SIZE_LIMIT=1mb
railway variables set SESSION_TIMEOUT_MINUTES=60
```

## 🌐 **Step 3: Get Your Production API URL**

After deployment, Railway will give you a URL like:
```
https://wishmaker-backend-production-xxxx.up.railway.app
```

### **3.1 Custom Domain (Optional)**

If you want a cleaner URL:
1. Go to Railway dashboard
2. Select your project
3. Go to Settings → Domains
4. Add custom domain: `wishmaker-api.railway.app` (or your preference)

## 🔧 **Step 4: Update Your Environment Files**

### **4.1 Update `.env.production`**

Replace the placeholder API URL:

```bash
# Before
VITE_API_URL=https://wishmaker-api.railway.app

# After (use your actual Railway URL)
VITE_API_URL=https://wishmaker-backend-production-xxxx.up.railway.app
```

### **4.2 Test Your Deployment**

```bash
# Test the API endpoint
curl https://your-railway-url.up.railway.app/health

# Should return something like:
# {"status": "ok", "timestamp": "2024-10-26T16:00:00.000Z"}
```

## 📊 **Step 5: Monitor Your Deployment**

### **5.1 View Logs**

```bash
railway logs
```

### **5.2 Railway Dashboard**

Visit [railway.app](https://railway.app) to:
- Monitor resource usage
- View deployment history
- Check environment variables
- Scale your application

## 🔒 **Security Checklist**

- [ ] **Change JWT_SECRET** to a secure random string (64+ characters)
- [ ] **Verify CORS_ORIGIN** matches your GitHub Pages URL exactly
- [ ] **Check database connection** uses SSL (`sslmode=require`)
- [ ] **Test authentication flow** from your frontend
- [ ] **Monitor API usage** to stay within free tier limits

## 💰 **Railway Free Tier Limits**

- **$5 credit per month** (usually covers small apps)
- **500 hours of usage** per month
- **1GB RAM** per service
- **1GB disk** per service

Perfect for your WishMaker production deployment!

## 🛟 **Troubleshooting**

### **Build Failures**

```bash
# Check build logs
railway logs --deployment

# Redeploy
railway up --detach
```

### **Environment Variables**

```bash
# List all variables
railway variables

# Set missing variable
railway variables set KEY=VALUE
```

### **Database Connection Issues**

1. Verify Neon database URL is correct
2. Check if Neon database is active
3. Test connection from Railway logs

## 📝 **Next Steps After Deployment**

1. **Update frontend build** with new API URL
2. **Deploy frontend to GitHub Pages**
3. **Test full application flow**
4. **Set up monitoring and alerts**

Your WishMaker backend will be live at your Railway URL! 🎉