/**
 * Creates and manages WebGL texture for map tile data
 * Encodes tile IDs and static flags into RGBA texture for GPU access
 */
import { MAP_TILE_DATA, getCurrentMapCols, getCurrentMapRows } from '../config/MapData';

export interface MapDataTextureInfo {
  texture: WebGLTexture;
  width: number;
  height: number;
}

/**
 * Creates a WebGL texture from MAP_TILE_DATA for efficient GPU access
 * Tile ID encoded across R (low byte) and B (high byte) channels
 * Static flag stored in G channel
 */
export function createMapDataTexture(gl: WebGL2RenderingContext): MapDataTextureInfo {
  const cols = getCurrentMapCols();
  const rows = getCurrentMapRows();
  
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Failed to create map data texture');
  }
  
  // Prepare pixel data: RGBA for each tile
  // R = low byte of tile ID, G = static flag, B = high byte of tile ID, A = unused
  const pixels = new Uint8Array(cols * rows * 4);
  
  for (let i = 0; i < cols * rows; i++) {
    const tileId = MAP_TILE_DATA[i];
    const isStatic = tileId < 1000 ? 1 : 0; // Tiles >= 1000 are portals (dynamic)
    
    // Split tile ID into low and high bytes
    const lowByte = tileId & 0xFF;
    const highByte = (tileId >> 8) & 0xFF;
    
    const offset = i * 4;
    pixels[offset] = lowByte;        // R channel - low byte
    pixels[offset + 1] = isStatic;   // G channel - static flag (0 or 1)
    pixels[offset + 2] = highByte;   // B channel - high byte
    pixels[offset + 3] = 255;        // A channel - unused (set to 1.0)
  }
  
  // Bind and configure texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Set texture parameters for pixel-perfect sampling
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  // Upload pixel data
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    cols,
    rows,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels
  );
  
  return {
    texture,
    width: cols,
    height: rows,
  };
}

/**
 * Updates existing map data texture with current MAP_TILE_DATA
 * Call this when the map changes (e.g., floor transitions)
 */
export function updateMapDataTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture
): void {
  const cols = getCurrentMapCols();
  const rows = getCurrentMapRows();
  
  // Prepare updated pixel data
  const pixels = new Uint8Array(cols * rows * 4);
  
  for (let i = 0; i < cols * rows; i++) {
    const tileId = MAP_TILE_DATA[i];
    const isStatic = tileId < 1000 ? 1 : 0;
    
    const lowByte = tileId & 0xFF;
    const highByte = (tileId >> 8) & 0xFF;
    
    const offset = i * 4;
    pixels[offset] = lowByte;
    pixels[offset + 1] = isStatic;
    pixels[offset + 2] = highByte;
    pixels[offset + 3] = 255;
  }
  
  // Re-upload texture data
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    cols,
    rows,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels
  );
}
