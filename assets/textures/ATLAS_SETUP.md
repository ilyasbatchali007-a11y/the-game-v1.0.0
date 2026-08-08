# Atlas Texture Setup Guide

## What You Need to Provide

### 1. Atlas Image File
Create a single image containing all your tile textures arranged in a grid.

**Requirements:**
- **Format**: PNG (recommended for development), JPG, WebP, or KTX2 (for production)
- **Dimensions**: Power of 2 (e.g., 512x512, 1024x1024, 2048x2048)
- **Layout**: Grid of tiles (e.g., 4x4 = 16 tiles, 8x8 = 64 tiles)
- **Tile Size**: All tiles must be the same size within the atlas

**Example 4x4 Atlas (16 tile types):**
```
+----+----+----+----+
| 0  | 1  | 2  | 3  |  <- Row 0 (grass, dirt, stone, water)
+----+----+----+----+
| 4  | 5  | 6  | 7  |  <- Row 1 (sand, snow, lava, etc.)
+----+----+----+----+
| 8  | 9  | 10 | 11 |  <- Row 2
+----+----+----+----+
| 12 | 13 | 14 | 15 |  <- Row 3
+----+----+----+----+
```

### 2. File Placement
Place your atlas image in: `/workspace/assets/textures/`

**Supported filenames:**
- `atlas.png` (default 4x4)
- `atlas_small.png` (2x2)
- `atlas_large.png` (8x8)
- Or any custom name (update config accordingly)

### 3. KTX2 Compression (Optional but Recommended)
For production builds, convert your PNG to KTX2 for better performance:

**Using basisu CLI:**
```bash
basisu -file assets/textures/atlas.png -output_file assets/textures/atlas.ktx2
```

**Using ktx2 CLI:**
```bash
ktx2 create --format R8G8B8A8_UNORM assets/textures/atlas.png assets/textures/atlas.ktx2
```

Then update `AtlasConfig.ts` to point to `.ktx2` file instead of `.png`.

## How to Use

### Step 1: Enable Atlas in FloorConfig
```typescript
import { ARENA_FLOOR } from './config/FloorMap';
import { DEFAULT_ATLAS } from './config/AtlasConfig';

ARENA_FLOOR.useAtlas = true;
ARENA_FLOOR.atlasConfig = DEFAULT_ATLAS;
ARENA_FLOOR.texturePath = DEFAULT_ATLAS.texturePath; // Point to atlas instead of single texture
```

### Step 2: Create Your Tile Map
```typescript
import { createTileMap, TileMapData } from './config/TileMapData';

// Define which tile type goes where (indices into atlas)
const tileGrid = [
  [0, 0, 0, 1],  // 0=grass, 1=dirt
  [0, 2, 2, 1],  // 2=stone
  [0, 2, 3, 1],  // 3=water
  [0, 0, 0, 0]
];

const myMap: TileMapData = createTileMap(tileGrid, 16); // 16 = total tiles in atlas
```

### Step 3: Update MapRenderer (Next Step)
The MapRenderer needs to be updated to:
1. Read the tile map data
2. Generate vertex UVs that map each tile to the correct atlas region
3. Still render as 1 draw call (single mesh with varied UVs)

## Tools to Create Atlas Images

**Free Tools:**
- **TexturePacker** (free version available)
- **Shoebox** (free, AIR-based)
- **GIMP/Photoshop** (manual grid layout)
- **Online**: https://www.codeandweb.com/free-online-texture-packer

**Command-line Tools:**
- **texture-packer-cli**: `npm install -g texture-packer-cli`
- **grunt-spritesmith**: For automated builds

## Next Steps

After you provide your atlas image:
1. Place it in `assets/textures/`
2. Update `AtlasConfig.ts` with your grid size (tilesX, tilesY)
3. I'll help you update `MapRenderer.ts` to use per-tile UV mapping
4. Create your tile map data defining the layout

**Still maintains 1 Draw Call!** 🚀
