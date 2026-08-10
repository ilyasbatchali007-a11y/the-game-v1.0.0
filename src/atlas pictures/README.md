# Atlas Texture Folder

This folder should contain the atlas texture file: **`atlas floor.png`** (note the space in the filename).

## Required Specifications

- **Filename**: `atlas floor.png` (must include the space)
- **Resolution**: 2048x2048 pixels
- **Grid Layout**: 32x32 tiles (64px per tile)
- **Total Tiles**: 1,024 unique tiles

## Tile Organization

### Static Tiles (IDs 0-255)
- First 8 rows of the atlas (rows 0-7)
- Used for houses, paths, structures, and other fixed elements
- These tiles are explicitly placed by map data

### Variation Tiles (IDs 256-1023)
- Remaining 24 rows (rows 8-31)
- Used for grass, dirt, forest, and other natural terrain
- Selected deterministically via shader hash based on tile coordinates
- Ensures no flickering - same coordinate always returns same tile

## Creating Your Atlas

You need to generate a 2048x2048 PNG image containing your tile set. Each tile should be exactly 64x64 pixels, arranged in a 32x32 grid.

Tools you can use:
- Aseprite
- Photoshop
- GIMP
- Tiled (map editor with export capabilities)
- Custom scripts (Python with PIL/Pillow)

Once created, place the file in this folder as `atlas floor.png`.
