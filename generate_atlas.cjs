// Simple script to generate a 2048x2048 atlas texture for testing
const { createCanvas } = require('canvas');

const canvas = createCanvas(2048, 2048);
const ctx = canvas.getContext('2d');

const tileSize = 64;
const gridResolution = 32;

// Generate tiles
for (let row = 0; row < gridResolution; row++) {
  for (let col = 0; col < gridResolution; col++) {
    const tileIndex = row * gridResolution + col;
    const x = col * tileSize;
    const y = row * tileSize;
    
    // Variation tiles (0-511): Different shades of green/brown for grass/dirt
    if (tileIndex < 512) {
      // Use tile index to create variation in color
      const hue = 80 + (tileIndex % 40);  // Green hues
      const lightness = 30 + Math.floor((tileIndex / 512) * 30);
      ctx.fillStyle = `hsl(${hue}, 60%, ${lightness}%)`;
      ctx.fillRect(x, y, tileSize, tileSize);
      
      // Add some noise/texture
      for (let i = 0; i < 50; i++) {
        const nx = x + Math.random() * tileSize;
        const ny = y + Math.random() * tileSize;
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
        ctx.fillRect(nx, ny, 2, 2);
      }
    } 
    // Static tiles (512-1023): Structures, paths, etc.
    else {
      const structureType = tileIndex - 512;
      
      if (structureType < 100) {
        // Stone path tiles (gray variations)
        ctx.fillStyle = `rgb(${100 + structureType}, ${100 + structureType}, ${100 + structureType})`;
        ctx.fillRect(x, y, tileSize, tileSize);
      } else if (structureType < 200) {
        // House base tiles (brown/red)
        ctx.fillStyle = `rgb(${139 + (structureType % 50)}, ${69 + (structureType % 30)}, ${19})`;
        ctx.fillRect(x, y, tileSize, tileSize);
      } else {
        // Water tiles (blue)
        ctx.fillStyle = `rgb(${30 + (structureType % 50)}, ${100 + (structureType % 50)}, ${180 + (structureType % 50)})`;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
    
    // Draw tile border for debugging (optional, remove for production)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(x, y, tileSize, tileSize);
  }
}

// Save the atlas
const fs = require('fs');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/workspace/src/atlas pictures/atlas floor.png', buffer);
console.log('Atlas texture generated: src/atlas pictures/atlas floor.png (2048x2048)');
