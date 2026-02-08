# Deployment Guide

## Backend - Railway

1. Sign up at https://railway.app
2. Install CLI: `npm install -g @railway/cli`
3. Deploy:
```bash
cd backend
railway login
railway init
railway variables set DEEPGRAM_API_KEY=your_key
railway up
```
4. Note your backend URL (e.g., https://your-app.railway.app)

## Frontend - Vercel

1. Sign up at https://vercel.com
2. Update package.json proxy to your Railway URL
3. Deploy:
```bash
cd frontend
npm run build
vercel --prod
```

## Environment Variables
- Backend: `DEEPGRAM_API_KEY`, `PORT`, `NODE_ENV`
- Frontend: Update proxy in package.json to production backend URL
