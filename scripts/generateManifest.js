const fs = require("fs");
const path = require("path");

const assetsDir = path.join(__dirname, "..", "public", "assets");
const manifestFile = path.join(__dirname, "..", "public", "manifest.json");

function generateManifest() {
  const files = fs.readdirSync(assetsDir).filter(f => f.endsWith(".mp3"));
  const manifest = files.map(file => ({
    name: path.parse(file).name,
    url: `/assets/${file}`
  }));
  
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  console.log("✅ Manifest generated with", manifest.length, "tracks.");
}

generateManifest();