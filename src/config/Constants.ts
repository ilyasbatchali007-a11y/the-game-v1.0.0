/// src/config/Constants.ts

import { TILE_SIZE } from './MapData';

export const MAX_ENTITIES = 65536;
export const FIXED_DT = 1 / 60;
export const CELL_SIZE = TILE_SIZE; // Sync with MapData TILE_SIZE (64)
export const PLAYER_ID = 1;
// World dimensions are now derived from MapData to stay in sync
import { WORLD_WIDTH as MAP_WORLD_WIDTH, WORLD_HEIGHT as MAP_WORLD_HEIGHT } from './MapData';
export const WORLD_WIDTH = MAP_WORLD_WIDTH;
export const WORLD_HEIGHT = MAP_WORLD_HEIGHT;
