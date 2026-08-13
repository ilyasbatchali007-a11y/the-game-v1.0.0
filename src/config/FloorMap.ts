export interface FloorConfig {
  id: number;
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
  // For procedural textures (chessboard)
  isProcedural: boolean;
  proceduralColor1?: [number, number, number];
  proceduralColor2?: [number, number, number];
  tileSize?: number;
}

// Floor 1: Uses atlas texture
export const FLOOR_1: FloorConfig = {
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
  isProcedural: false,
};

// Floors 2-10: Green chessboard pattern (Smaller for testing: 20x20 tiles)
function createChessboardFloor(id: number, widthTiles: number, depthTiles: number): FloorConfig {
  const tileSize = 64;
  return {
    id,
    width: widthTiles * tileSize,
    depth: depthTiles * tileSize,
    texturePath: '',
    repeatX: widthTiles,
    repeatZ: depthTiles,
    useAtlas: false,
    atlasTileCountX: 0,
    atlasTileCountY: 0,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 0,
    variationTileRangeStart: 0,
    variationTileRangeEnd: 0,
    isProcedural: true,
    proceduralColor1: [34, 139, 34],   // Forest Green
    proceduralColor2: [144, 238, 144], // Light Green
    tileSize: tileSize,
  };
}

export const FLOORS: FloorConfig[] = [
  FLOOR_1,
  createChessboardFloor(1, 20, 20),  // Floor 2 (Small test size)
  createChessboardFloor(2, 20, 20),  // Floor 3
  createChessboardFloor(3, 20, 20),  // Floor 4
  createChessboardFloor(4, 20, 20),  // Floor 5
  createChessboardFloor(5, 20, 20),  // Floor 6
  createChessboardFloor(6, 20, 20),  // Floor 7
  createChessboardFloor(7, 20, 20),  // Floor 8
  createChessboardFloor(8, 20, 20),  // Floor 9
  createChessboardFloor(9, 20, 20),  // Floor 10
];
