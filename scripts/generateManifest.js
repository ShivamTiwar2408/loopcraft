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
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
        const stats = fs.statSync(fullPath);
        const parsedName = path.parse(entry.name).name;
        
        // Extract category from folder structure
        const category = relativePath || "Uncategorized";
        
        items.push({
          name: parsedName,
          url: `/assets/${relativeFilePath.replace(/\\/g, '/')}`,
          category: category,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          // Generate a simple ID for consistent referencing
          id: Buffer.from(relativeFilePath).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
        });
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
  console.log(`✅ Manifest generated with ${manifest.length} tracks across ${categories.length} categories:`);
  categories.forEach(cat => {
    const count = manifest.filter(track => track.category === cat).length;
    console.log(`   📁 ${cat}: ${count} tracks`);
  });
}

generateManifest();