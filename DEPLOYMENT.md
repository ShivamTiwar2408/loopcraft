# 🚀 Deploy LoopCraft to Vercel

## Quick Deploy (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - LoopCraft audio loop player"
   git branch -M main
   git remote add origin https://github.com/yourusername/loopcraft.git
   git push -u origin main
   ```

2. **Deploy with Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a React app
   - Click "Deploy"

## Manual Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Environment Setup

The app is configured with:
- ✅ Automatic manifest generation for MP3 files
- ✅ Static file caching for assets
- ✅ SPA routing support
- ✅ Optimized build process

## Adding Audio Files

After deployment:
1. Add MP3 files to `public/assets/`
2. Commit and push changes
3. Vercel will auto-redeploy with new audio files

## Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain

Your LoopCraft app will be live at: `https://your-project-name.vercel.app`