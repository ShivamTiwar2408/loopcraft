# 🎵 LoopCraft

Craft custom audio loops with precision. A React app designed to handle hundreds of audio tracks with advanced browsing, searching, and loop creation capabilities.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your MP3 files to `public/assets/` (supports nested folders for organization)

3. Start the development server:
```bash
npm start
```

## How it works

- The app automatically scans `public/assets/` for MP3 files recursively
- Before each build, it generates a manifest with metadata (categories, file sizes, etc.)
- Advanced track browser with search, filtering, and pagination
- Each track gets its own player with segment controls
- You can set start/end times and repeat counts for segments
- The sequence loops infinitely when played

## Adding new tracks

1. Drop MP3 files into `public/assets/` or organized subfolders
2. Run `npm run build` or restart the dev server
3. New tracks will appear automatically with category organization

## Features

### 🎵 Audio Player
- ▶️ Standard audio controls with waveform visualization
- 🎯 Custom segment markers (start/end times)
- 🔁 Repeat counts per segment  
- 🔄 Infinite loop playback
- ⌨️ Keyboard shortcuts (Spacebar: play/stop, Ctrl+A: add segment, Escape: stop)
- 📊 Total loop duration calculation

### 📚 Track Management (Optimized for Hundreds of Tracks)
- 🔍 **Advanced Search**: Search by track name or category
- 📂 **Category Organization**: Automatic categorization based on folder structure
- 🔄 **Multiple Sort Options**: Name, category, file size, date added
- 📄 **Pagination**: Efficient browsing with 25 tracks per page
- 👁️ **View Modes**: List view and grid view
- 🏷️ **Category Filtering**: Quick filter by category with track counts
- 📱 **Responsive Design**: Works on desktop and mobile

### ⚡ Performance Features
- 🚀 **Virtual Scrolling**: Smooth performance with large track libraries
- 💾 **Lazy Loading**: Efficient memory usage
- 📊 **Performance Monitor**: Optional real-time performance tracking
- 🎯 **Optimized Rendering**: Memoized components for better performance

### 🎨 User Experience
- 📱 Responsive design with Tailwind CSS
- 🌙 Clean, modern interface
- ⚡ Fast search and filtering
- 🎯 Sticky player controls
- 📊 File size and metadata display

## Keyboard Shortcuts

- **Spacebar**: Play/Stop current loop
- **Ctrl/Cmd + A**: Add current segment
- **Escape**: Stop playback
- **Arrow Keys**: Navigate through tracks (when focused)

## Organization Tips for Large Libraries

1. **Use Folders**: Organize tracks in `public/assets/` subfolders by genre, artist, or project
2. **Naming Convention**: Use consistent naming for better search results
3. **Categories**: Folder names become categories automatically
4. **Performance**: Enable performance monitor in settings for large libraries (500+ tracks)

## Technical Details

- Built with React 18 and modern hooks
- Tailwind CSS for styling
- Automatic manifest generation with metadata
- Optimized for handling 500+ audio tracks
- Memory-efficient virtual scrolling
- Keyboard navigation support