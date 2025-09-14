# 🎵 LoopCraft

Craft custom audio loops with precision. A React app for creating seamless audio loops with segment markers and repeat functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your MP3 files to `public/assets/`

3. Start the development server:
```bash
npm start
```

## How it works

- The app automatically scans `public/assets/` for MP3 files
- Before each build, it generates a manifest of available tracks
- Each track gets its own player with segment controls
- You can set start/end times and repeat counts for segments
- The sequence loops infinitely when played

## Adding new tracks

1. Drop MP3 files into `public/assets/`
2. Run `npm run build` or restart the dev server
3. New tracks will appear automatically

## Features

- ▶️ Standard audio controls
- 🎯 Custom segment markers (start/end times)
- 🔁 Repeat counts per segment  
- 🔄 Infinite loop playback
- 📱 Responsive design with Tailwind CSS