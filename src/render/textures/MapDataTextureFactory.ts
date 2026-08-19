import { MAP_TILE_DATA, getCurrentMapCols, getCurrentMapRows } from '../../config/MapData';

/**
 * Creates and manages a WebGL texture that encodes map tile data.
 * Each pixel stores: R = tileId low byte, G = isStatic flag, B = tileId high byte
 */
export class MapDataTextureFactory {
  private gl: WebGL2RenderingContext;
  private texture: WebGLTexture | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.create();
  }

  /**
   * Create the map data texture from MAP_TILE_DATA
   */
  public create(): void {
    const texture = this.gl.createTexture();
    if (!texture) {
      console.error('Failed to create map data texture');
      return;
    }

    const cols = getCurrentMapCols();
    const rows = getCurrentMapRows();
    const textureData = new Uint8Array(cols * rows * 4);

    for (let i = 0; i < cols * rows; i++) {
      const srcIdx = i * 2;
      const dstIdx = i * 4;

      const tileId = MAP_TILE_DATA[srcIdx];
      const isStatic = MAP_TILE_DATA[srcIdx + 1];

      // Store tileId across R and B channels for precision (R = low byte, B = high byte)
      // This allows tile IDs up to 65535 (256 * 256)
      const lowByte = tileId & 0xFF;
      const highByte = Math.floor(tileId / 256) & 0xFF;

      textureData[dstIdx] = lowByte;           // R - low byte of tileId
      textureData[dstIdx + 1] = isStatic > 0.5 ? 255 : 0;  // G - isStatic flag
      textureData[dstIdx + 2] = highByte;      // B - high byte of tileId
      textureData[dstIdx + 3] = 255;           // A
    }

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Upload texture data - use NEAREST filtering for exact pixel values
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      cols,
      rows,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      textureData
    );

    // Use NEAREST filtering to avoid interpolation between tile data
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);

    this.texture = texture;
  }

  /**
   * Recreate the texture when map dimensions change
   */
  public recreate(): void {
    this.dispose();
    this.create();
  }

  /**
   * Get the texture for binding in rendering
   */
  public getTexture(): WebGLTexture | null {
    return this.texture;
  }

  /**
   * Dispose of the texture resources
   */
  public dispose(): void {
    if (this.texture) {
      this.gl.deleteTexture(this.texture);
      this.texture = null;
    }
  }
}
