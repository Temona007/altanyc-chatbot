# 🚀 Alta New York Chatbot - Deployment Guide

## 📋 **Deployment Options Comparison**

| Feature | Netlify | Render |
|---------|---------|--------|
| **Full-Stack Support** | ❌ Frontend only | ✅ Frontend + Backend |
| **Node.js Backend** | ❌ No | ✅ Yes |
| **Environment Variables** | ✅ Yes | ✅ Yes |
| **Database Support** | ❌ Limited | ✅ Full support |
| **Free Tier** | ✅ Yes | ✅ Yes |
| **Pinecone Integration** | ❌ No backend | ✅ Full support |
| **API Routes** | ❌ No | ✅ Yes |

## 🎯 **Recommended: Render Deployment**

### **Why Render is Better:**
- ✅ **Full-stack deployment** (frontend + backend)
- ✅ **Pinecone vector database** support
- ✅ **OpenAI API** integration
- ✅ **File upload** functionality
- ✅ **Real-time API** endpoints
- ✅ **Environment variables** management

---

## 🚀 **Step-by-Step Render Deployment**

### **Step 1: Prepare Repository**
1. Push your code to GitHub
2. Ensure all environment variables are documented
3. Test the build process locally

### **Step 2: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### **Step 3: Deploy Backend Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `alta-ny-chatbot-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### **Step 4: Set Environment Variables**
Add these environment variables in Render dashboard:
```
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_openai_key_here
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX_NAME=altanewyork
RAPIDAPI_KEY=your_rapidapi_key_here
```

### **Step 5: Deploy Frontend Service**
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `alta-ny-chatbot-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### **Step 6: Update Frontend API URLs**
The frontend will automatically use the Render backend URL.

---

## 🔧 **Alternative: Netlify + Separate Backend**

If you prefer Netlify for frontend:

### **Netlify Frontend Only:**
- ✅ Great for static React apps
- ✅ Fast CDN and edge functions
- ❌ No backend support
- ❌ No Pinecone integration
- ❌ No file upload functionality

### **Backend Options for Netlify:**
1. **Railway** - Similar to Render
2. **Heroku** - More expensive
3. **Vercel** - Good for serverless
4. **AWS/GCP** - Enterprise level

---

## 📊 **Cost Comparison**

### **Render (Recommended):**
- **Free Tier**: 750 hours/month
- **Backend**: $7/month after free tier
- **Frontend**: Free
- **Total**: $7/month for full-stack

### **Netlify + Railway:**
- **Netlify**: Free for frontend
- **Railway**: $5/month for backend
- **Total**: $5/month but more complex setup

---

## 🎯 **Final Recommendation**

**Use Render** for your Alta New York chatbot because:

1. **Simpler Setup** - One platform for everything
2. **Better Integration** - Full-stack support
3. **Pinecone Support** - Vector database works perfectly
4. **File Upload** - Your upload functionality will work
5. **API Routes** - All your backend routes will work
6. **Environment Variables** - Easy to manage secrets
7. **Scaling** - Can handle your real estate data load

---

## 🚀 **Quick Start Commands**

```bash
# 1. Test build locally
npm run build

# 2. Test production server
cd server && npm start

# 3. Push to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# 4. Deploy on Render
# Follow the steps above in Render dashboard
```

---

## 🔍 **Post-Deployment Checklist**

- [ ] Backend service is running
- [ ] Frontend is accessible
- [ ] Environment variables are set
- [ ] Pinecone connection works
- [ ] OpenAI API is responding
- [ ] File upload functionality works
- [ ] Chat interface is functional
- [ ] Central Park properties are loading

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **Environment Variables** - Double-check all keys are set
2. **Build Failures** - Check Node.js version compatibility
3. **API Errors** - Verify backend URL in frontend
4. **Database Issues** - Confirm Pinecone index exists

### **Support:**
- Render Documentation: [render.com/docs](https://render.com/docs)
- Render Community: [community.render.com](https://community.render.com)

