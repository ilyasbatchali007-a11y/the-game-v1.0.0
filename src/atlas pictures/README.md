# Atlas Texture Setup Guide

## Quick Start

1. **Create your atlas image:**
   - Create a 2048×2048 pixel PNG image
   - Name it exactly: `atlas floor.png`
   - Place it in: `/workspace/src/atlas pictures/`

2. **Design your atlas grid:**
   - The atlas is divided into a 32×32 grid (1024 tiles total)
   - Each tile is 64×64 pixels
   - Grid layout: Left-to-Right, Top-to-Bottom
   
   ```
   Row 0: [Static tiles - house floors, paths, bridges]
   Rows 1-8: Grass variations (256 tiles)
   Rows 9-16: Dirt variations (256 tiles)
   Rows 17-20: Sand variations (128 tiles)
   Rows 21-24: Snow variations (128 tiles)
   Rows 25-28: Forest floor variations (128 tiles)
   Rows 29-30: Swamp variations (64 tiles)
   Row 31: Rock variations (32 tiles)
   ```

3. **Configure tile mappings (optional):**
   - Edit `/workspace/src/config/AtlasConfig.ts`
   - Modify the `FLOOR_ATLAS.tiles` object to match your design
   - Static tiles (`isStatic: true`) always use the same UV coordinates
   - Random tiles (`isStatic: false`) will vary based on world position

## How It Works

### Static Tiles
Used for structures like houses, paths, bridges where consistency matters.
Example: All house wood floors look identical.

```typescript
'house_floor_wood': {
  id: 'house_floor_wood',
  col: 0,  // Column 0 (leftmost)
  row: 0,  // Row 0 (topmost)
  isStatic: true,  // Always uses this exact tile
}
```

### Random Variation Tiles
Used for natural terrain like grass, dirt, forest where variety prevents repetition.
The game automatically picks different variations based on world coordinates.

```typescript
'grass_1': {
  id: 'grass_1',
  col: 0,
  row: 1,
  isStatic: false,  // Will randomly select from grass_1 to grass_256
  variations: ['grass_2', 'grass_3', ..., 'grass_256']
}
```

## Shader Integration

The fragment shader now uses procedural random tiling with deterministic hash-based variation:

```glsl
// Calculate tiled UV coordinates
vec2 tiledUV = v_uv * u_tileRepeat;

// Get the fractional part (which tile we're in) and integer part (tile index)
vec2 tileIndex = floor(tiledUV);
vec2 tileUV = fract(tiledUV);

// Use deterministic randomness based on tile position
float hash = fract(sin(dot(tileIndex, vec2(12.9898, 78.233))) * 43758.5453);

// For a 32x32 grid, each tile is 1/32 of the atlas
float gridScale = 1.0 / 32.0;

// Pick a random column and row based on the hash
float randomCol = floor(hash * 32.0);
float randomRow = floor(fract(hash * 100.0) * 32.0);

// Calculate final UV: offset to the random tile + local UV within that tile
vec2 atlasUV = vec2(randomCol * gridScale, randomRow * gridScale) + (tileUV * gridScale);

vec4 texColor = texture(u_texture, atlasUV);
```

Where `u_tileRepeat` = `(width/32, height/32)` - number of tiles across the map.

## Code Usage Example

```typescript
import { GLInstancedRenderer } from './render/GLInstancedRenderer';
import { MapRenderer } from './render/MapRenderer';

// Create renderers
const mapRenderer = new MapRenderer();
const renderer = new GLInstancedRenderer(gl, MAX_ENTITIES);

// Load your atlas texture
const texture = await AssetLoader.loadTexture(gl, 'src/atlas pictures/atlas floor.png');

// In your render loop:
const floorData = mapRenderer.getFloorData(cameraX, cameraY, canvas.width, canvas.height);

renderer.renderFloor(
  floorData,
  canvas.width,
  canvas.height,
  texture,
  cameraX,
  cameraY
);
```

**Note:** The current implementation uses automatic random variation for all tiles. Future updates will add support for static tiles via the AtlasConfig system.

## File Structure

```
/workspace/src/
├── atlas pictures/
│   └── atlas floor.png    ← PLACE YOUR IMAGE HERE
├── config/
│   ├── AtlasConfig.ts     ← Tile definitions and helpers
│   └── FloorMap.ts        ← Floor configuration
└── render/
    └── GLInstancedRenderer.ts  ← Updated with atlas support
```

## Tips

1. **Start simple:** Fill only the first few tiles and test
2. **Use transparency:** PNG with alpha channel works best
3. **Test variations:** Make sure random tiles look different enough
4. **Performance:** 2048×2048 is optimal for most devices
5. **Future expansion:** You can add more atlases (e.g., `atlas_decorations.png`)

## Troubleshooting

- **Black screen?** Check that the image path matches exactly
- **Wrong tiles displayed?** Verify column/row numbers in config
- **Repeating patterns?** Add more variation tiles to your atlas
- **Blurry textures?** Ensure your source image is exactly 2048×2048
