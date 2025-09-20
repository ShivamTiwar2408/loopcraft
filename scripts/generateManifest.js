const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "..", "public", "assets");
const manifestFile = path.join(__dirname, "..", "public", "manifest.json");

function generateManifest() {
  if (!fs.existsSync(assetsDir)) {
    console.log("⚠️  Assets directory not found, creating empty manifest");
    fs.writeFileSync(manifestFile, JSON.stringify([], null, 2));
    return;
  }

  function scanDirectory(dir, relativePath = "") {
    const items = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        items.push(...scanDirectory(fullPath, relativeFilePath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const supportedFormats = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.mov', '.avi'];
        
        if (supportedFormats.includes(ext)) {
          const stats = fs.statSync(fullPath);
          const parsedName = path.parse(entry.name).name;
          
          // Extract category from folder structure
          const category = relativePath || "Uncategorized";
          
          // Determine media type
          const audioFormats = ['.mp3', '.wav', '.m4a'];
          const videoFormats = ['.mp4', '.webm', '.mov', '.avi'];
          const mediaType = audioFormats.includes(ext) ? 'audio' : 'video';
          
          items.push({
            name: parsedName,
            url: `/assets/${relativeFilePath.replace(/\\/g, '/')}`,
            category: category,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            mediaType: mediaType,
            format: ext.substring(1), // Remove the dot
            // Generate a simple ID for consistent referencing
            id: Buffer.from(relativeFilePath).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
          });
        }
      }
    }
    
    return items;
  }

  const manifest = scanDirectory(assetsDir);
  
  // Sort by category, then by name
  manifest.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
  
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  
  const categories = [...new Set(manifest.map(track => track.category))];
  const audioCount = manifest.filter(item => item.mediaType === 'audio').length;
  const videoCount = manifest.filter(item => item.mediaType === 'video').length;
  
  console.log(`✅ Manifest generated with ${manifest.length} media files (${audioCount} audio, ${videoCount} video) across ${categories.length} categories:`);
  categories.forEach(cat => {
    const count = manifest.filter(item => item.category === cat).length;
    const audioInCat = manifest.filter(item => item.category === cat && item.mediaType === 'audio').length;
    const videoInCat = manifest.filter(item => item.category === cat && item.mediaType === 'video').length;
    console.log(`   📁 ${cat}: ${count} files (${audioInCat} audio, ${videoInCat} video)`);
  });
}

generateManifest();