// src/render/ChessboardTexture.ts
// Procedural green chessboard texture generator for floors

export interface ChessboardConfig {
  width: number;           // Texture width in pixels
  height: number;          // Texture height in pixels
  checkerSize: number;     // Size of each checker square in pixels
  color1: [number, number, number];  // Light color RGB
  color2: [number, number, number];  // Dark color RGB
}

export class ChessboardTextureGenerator {
  /**
   * Generate a procedural chessboard texture
   */
  public static generate(config: ChessboardConfig): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    
    const checkerCountX = Math.floor(config.width / config.checkerSize);
    const checkerCountY = Math.floor(config.height / config.checkerSize);
    
    // Draw chessboard pattern
    for (let y = 0; y < checkerCountY; y++) {
      for (let x = 0; x < checkerCountX; x++) {
        const isEven = (x + y) % 2 === 0;
        const color = isEven ? config.color1 : config.color2;
        
        ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        ctx.fillRect(
          x * config.checkerSize,
          y * config.checkerSize,
          config.checkerSize,
          config.checkerSize
        );
      }
    }
    
    return canvas;
  }
  
  /**
   * Create WebGL texture from chessboard canvas
   */
  public static createWebGLTexture(
    gl: WebGL2RenderingContext,
    config: ChessboardConfig
  ): WebGLTexture {
    const canvas = this.generate(config);
    
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create WebGL texture');
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Upload canvas as texture
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas
    );
    
    // Set texture parameters for repeating pattern
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    return texture;
  }
  
  /**
   * Update existing texture with new chessboard configuration
   */
  public static updateTexture(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    config: ChessboardConfig
  ): void {
    const canvas = this.generate(config);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
