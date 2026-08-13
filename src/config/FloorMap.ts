export interface FloorConfig {
  id: number;  // Unique floor identifier (0-19)
  width: number;
  depth: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  // Atlas texture settings
  useAtlas: boolean;
  atlasTileCountX: number;
  atlasTileCountY: number;
  staticTileRangeStart: number;
  staticTileRangeEnd: number;
  variationTileRangeStart: number;
  variationTileRangeEnd: number;
}

// Default floor dimensions match the world size (160 tiles x 64px = 10240px)
export const ARENA_FLOOR: FloorConfig = {
  id: 0,
  width: 10240.0,
  depth: 10240.0,
  texturePath: 'src/atlas pictures/atlas floor.jpg',
  repeatX: 160.0,
  repeatZ: 160.0,
  // Atlas configuration
  useAtlas: true,
  atlasTileCountX: 32,  // 32x32 grid in atlas
  atlasTileCountY: 32,
  staticTileRangeStart: 0,    // IDs 0-99 for static tiles (houses, paths)
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100, // IDs 100-1023 for random variations (grass, dirt)
  variationTileRangeEnd: 1023,
};

// Generate 20 independent floor configurations with customized sizes
export const FLOORS: FloorConfig[] = [
  // Floor 0 - Original Arena (160x160 tiles)
  {
    id: 0,
    width: 10240.0,
    depth: 10240.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 160.0,
    repeatZ: 160.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 1 - Small Arena (80x80 tiles)
  {
    id: 1,
    width: 5120.0,
    depth: 5120.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 80.0,
    repeatZ: 80.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 2 - Large Arena (200x200 tiles)
  {
    id: 2,
    width: 12800.0,
    depth: 12800.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 200.0,
    repeatZ: 200.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 3 - Wide Rectangle (200x100 tiles)
  {
    id: 3,
    width: 12800.0,
    depth: 6400.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 200.0,
    repeatZ: 100.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 4 - Tall Rectangle (100x200 tiles)
  {
    id: 4,
    width: 6400.0,
    depth: 12800.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 100.0,
    repeatZ: 200.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 5 - Tiny Arena (40x40 tiles)
  {
    id: 5,
    width: 2560.0,
    depth: 2560.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 40.0,
    repeatZ: 40.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 6 - Medium Arena (120x120 tiles)
  {
    id: 6,
    width: 7680.0,
    depth: 7680.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 120.0,
    repeatZ: 120.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 7 - Extra Large (240x240 tiles)
  {
    id: 7,
    width: 15360.0,
    depth: 15360.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 240.0,
    repeatZ: 240.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 8 - Long Corridor (300x50 tiles)
  {
    id: 8,
    width: 19200.0,
    depth: 3200.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 300.0,
    repeatZ: 50.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 9 - Square Small (60x60 tiles)
  {
    id: 9,
    width: 3840.0,
    depth: 3840.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 60.0,
    repeatZ: 60.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 10 - Irregular Wide (180x90 tiles)
  {
    id: 10,
    width: 11520.0,
    depth: 5760.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 180.0,
    repeatZ: 90.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 11 - Irregular Tall (90x180 tiles)
  {
    id: 11,
    width: 5760.0,
    depth: 11520.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 90.0,
    repeatZ: 180.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 12 - Compact (50x50 tiles)
  {
    id: 12,
    width: 3200.0,
    depth: 3200.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 50.0,
    repeatZ: 50.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 13 - Extended (140x140 tiles)
  {
    id: 13,
    width: 8960.0,
    depth: 8960.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 140.0,
    repeatZ: 140.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 14 - Massive (280x280 tiles)
  {
    id: 14,
    width: 17920.0,
    depth: 17920.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 280.0,
    repeatZ: 280.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 15 - Ultra Wide (256x64 tiles)
  {
    id: 15,
    width: 16384.0,
    depth: 4096.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 256.0,
    repeatZ: 64.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 16 - Ultra Tall (64x256 tiles)
  {
    id: 16,
    width: 4096.0,
    depth: 16384.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 64.0,
    repeatZ: 256.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 17 - Mini (32x32 tiles)
  {
    id: 17,
    width: 2048.0,
    depth: 2048.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 32.0,
    repeatZ: 32.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 18 - Jumbo (192x192 tiles)
  {
    id: 18,
    width: 12288.0,
    depth: 12288.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 192.0,
    repeatZ: 192.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 19 - Custom Asymmetric (170x110 tiles)
  {
    id: 19,
    width: 10880.0,
    depth: 7040.0,
    texturePath: 'src/atlas pictures/atlas floor.jpg',
    repeatX: 170.0,
    repeatZ: 110.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
];

// Get floor by ID (0-19)
export function getFloorById(id: number): FloorConfig {
  if (id < 0 || id >= FLOORS.length) {
    console.warn(`Invalid floor ID: ${id}, using default floor 0`);
    return FLOORS[0];
  }
  return FLOORS[id];
}

// Get total number of available floors
export function getFloorCount(): number {
  return FLOORS.length;
}
