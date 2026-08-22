/// src/config/Constants.ts

export const MAX_ENTITIES = 65536;
export const FIXED_DT = 1 / 60;
export const CELL_SIZE = 32;
export const PLAYER_ID = 1;
// World dimensions are now derived from FloorSystem to stay in sync
import { getCurrentWorldWidth, getCurrentWorldHeight } from '../systems/FloorSystem';
export const WORLD_WIDTH = getCurrentWorldWidth();
export const WORLD_HEIGHT = getCurrentWorldHeight();
