import { World } from '../ecs/World';
import { PLAYER_ID } from '../config/Constants';
import { ARENA_FLOOR, FloorConfig } from '../config/FloorMap';
import { FLOOR_MAP_DATA, FLOOR_TILE_DATA, currentFloor, MAP_COLS, MAP_ROWS, NUM_FLOORS } from '../config/MapData';

// Vertex Shader Source - isometric transformation with cube extrusion
const VS_SOURCE = `#version 300 es
layout(location = 0) in vec4 a_vertex;      // For cube: (x, y, z, faceId), For floor: (x, y, 0, 0)
layout(location = 1) in vec2 a_pos;       // Entity position (px, py)
layout(location = 2) in vec2 a_size;      // Entity size (width, height)
layout(location = 3) in float a_height;   // Cube height (z-scale)
layout(location = 4) in float a_rotation; // Entity facing angle in radians
layout(location = 5) in float a_elevation; // Elevation offset for jumping

uniform vec2 u_resolution;
uniform float u_isoAngle;                 // Isometric rotation angle
uniform float u_isoScale;                 // Y scale for isometric projection (typically 0.5)
uniform vec2 u_cameraOffset;              // Camera offset for scrolling

out float v_faceId;
out vec2 v_uv;
out vec2 v_worldPos;  // Pass world position to fragment shader for tile calculation

void main() {
  // Step A: Rotate the local footprint around the entity center so the cube faces movement direction.
  vec2 halfSize = a_size * 0.5;
  vec2 localPos = (a_vertex.xy * a_size) - halfSize;
  float rotationCos = cos(a_rotation);
  float rotationSin = sin(a_rotation);
  vec2 rotatedLocalPos = vec2(
    localPos.x * rotationCos - localPos.y * rotationSin,
    localPos.x * rotationSin + localPos.y * rotationCos
  );
  vec2 worldPos = a_pos + halfSize + rotatedLocalPos;
  
  // Apply camera offset to get screen-relative position
  vec2 screenPos = worldPos - u_cameraOffset;
  
  // Center on screen
  vec2 centeredPos = screenPos - (u_resolution * 0.5);
  
  // Apply isometric transformation: rotate 45° and scale Y by 0.5
  float c = cos(u_isoAngle);
  float s = sin(u_isoAngle);
  vec2 isoPos;
  isoPos.x = centeredPos.x * c - centeredPos.y * s;
  isoPos.y = (centeredPos.x * s + centeredPos.y * c) * u_isoScale;
  
  // Step B: Screen-space height extrusion
  // Clip space Y is flipped (-clipSpace.y below). Add the height offset
  // to extrude the cube upwards in screen space (fix upside-down extrusion).
  float screenHeightOffset = a_vertex.z * a_height * u_isoScale;
  float elevationOffset = a_elevation * u_isoScale;
  isoPos.y += screenHeightOffset + elevationOffset;
  
  // Convert to WebGL clip space [-1, 1]
  vec2 zeroToOne = isoPos / (u_resolution * 0.5);
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  
  gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
  v_faceId = a_vertex.w;
  v_uv = a_vertex.xy;
  v_worldPos = worldPos;  // Pass world position for floor tile calculation
}
`;

// Fragment Shader Source - Atlas texture with static and random variation tiles
const FS_SOURCE = `#version 300 es
precision mediump float;

in float v_faceId;
in vec2 v_uv;
in vec2 v_worldPos;  // World position for floor tile calculation

uniform sampler2D u_texture;
uniform int u_renderMode;     // 0 = floor, 1 = entity
uniform vec4 u_entityColor;

// Atlas configuration uniforms
uniform int u_atlasTileCount;      // Number of tiles per row/column in atlas (32)
uniform float u_tileSizePixels;    // Size of each tile in pixels (64)
uniform float u_worldTileSize;     // Size of each game tile in pixels (64)
uniform int u_staticRangeStart;    // Start of static tile range
uniform int u_staticRangeEnd;      // End of static tile range
uniform int u_variationRangeStart; // Start of variation tile range
uniform int u_variationRangeEnd;   // End of variation tile range

// Map data texture for static/varying tile info
uniform sampler2D u_mapDataTexture;
uniform vec2 u_mapDimensions;      // Map dimensions in tiles (32, 32)
uniform float u_seed;              // Random seed for variation tiles (changes on reload)

out vec4 fragColor;

// Hash function for deterministic random selection based on tile coordinates and seed
float hash(vec2 p, float seed) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33 + seed);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  if (u_renderMode == 1) {
    // Apply per-face shading for cube entities
    float brightness = 1.0;
    
    // Face ID encoding:
    // 0 = Top, 1 = Front-Right, 2 = Front-Left, 3 = Back-Right, 4 = Back-Left, 5 = Bottom
    if (v_faceId < 0.5) {
      // Top face - full brightness
      brightness = 1.0;
    } else if (v_faceId < 1.5) {
      // Front-Right face - medium shadow
      brightness = 0.7;
    } else if (v_faceId < 2.5) {
      // Front-Left face - dark shadow
      brightness = 0.5;
    } else if (v_faceId < 3.5) {
      // Back-Right face - medium shadow
      brightness = 0.7;
    } else if (v_faceId < 4.5) {
      // Back-Left face - dark shadow  
      brightness = 0.5;
    } else {
      // Bottom face - darkest (usually not visible)
      brightness = 0.3;
    }
    
    fragColor = u_entityColor * brightness;
  } else {
    // FLOOR RENDERING: Calculate tile UVs from world position
    
    // Calculate which game tile we're in
    float tileX = floor(v_worldPos.x / u_worldTileSize);
    float tileY = floor(v_worldPos.y / u_worldTileSize);
    
    // Get local position within the tile [0, 1]
    float localX = fract(v_worldPos.x / u_worldTileSize);
    float localY = fract(v_worldPos.y / u_worldTileSize);
    vec2 localUV = vec2(localX, localY);
    
    // Determine tile ID from map data or hash
    float tileId = 0.0;
    
    // Sample map data texture to get tile info
    vec2 mapUV = (vec2(tileX, tileY) + 0.5) / u_mapDimensions;
    vec4 mapData = texture(u_mapDataTexture, mapUV);
    float baseTileId = mapData.r * 1024.0;  // Tile ID stored in R channel
    float isStatic = mapData.g;              // Static flag stored in G channel
    
    if (isStatic > 0.5) {
      // Static tile: use exact tile ID from map data
      tileId = baseTileId;
    } else {
      // Variation tile: use hash with seed to select random tile from variation range
      float hashVal = hash(vec2(tileX, tileY), u_seed);
      float variationCount = float(u_variationRangeEnd - u_variationRangeStart + 1);
      tileId = float(u_variationRangeStart) + floor(hashVal * variationCount);
    }
    
    // Convert tile ID to atlas UV coordinates
    float tilesPerRow = float(u_atlasTileCount);
    float tileCol = mod(tileId, tilesPerRow);
    float tileRow = floor(tileId / tilesPerRow);
    
    // Calculate base UV for this tile in atlas
    float tileUVSize = 1.0 / tilesPerRow;
    float baseU = tileCol * tileUVSize;
    float baseV = tileRow * tileUVSize;
    
    // Apply a small margin to prevent texture bleeding (chessboard lines)
    // This shrinks the UV sample area slightly away from the tile edges
    float margin = 1.0 / 2048.0; // ~1 pixel margin for a 2048 texture
    
    // Final UV: base tile position + local position within tile (with margin)
    vec2 clampedLocalUV = clamp(localUV, margin / tileUVSize, 1.0 - margin / tileUVSize);
    vec2 finalUV = vec2(baseU + clampedLocalUV.x * tileUVSize, baseV + clampedLocalUV.y * tileUVSize);
    
    // Sample the atlas texture
    fragColor = texture(u_texture, finalUV);
  }
}
`;

export class GLInstancedRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private floorVAO: WebGLVertexArrayObject;    // VAO for floor rendering
  private cubeVAO: WebGLVertexArrayObject;     // VAO for cube rendering
  private cubeBuffer: WebGLBuffer;             // Static cube geometry buffer
  private floorBuffer: WebGLBuffer;            // Static floor quad buffer
  private instanceBuffer: WebGLBuffer;
  private mapDataTexture: WebGLTexture | null = null;  // Texture for map tile data

  private instanceData: Float32Array;
  private resolutionLoc: WebGLUniformLocation | null;
  private isoAngleLoc: WebGLUniformLocation | null;
  private isoScaleLoc: WebGLUniformLocation | null;
  private cameraOffsetLoc: WebGLUniformLocation | null;
  private renderModeLoc: WebGLUniformLocation | null;
  private entityColorLoc: WebGLUniformLocation | null;
  
  // Atlas texture uniforms
  private atlasTileCountLoc: WebGLUniformLocation | null;
  private tileSizePixelsLoc: WebGLUniformLocation | null;
  private worldTileSizeLoc: WebGLUniformLocation | null;
  private staticRangeStartLoc: WebGLUniformLocation | null;
  private staticRangeEndLoc: WebGLUniformLocation | null;
  private variationRangeStartLoc: WebGLUniformLocation | null;
  private variationRangeEndLoc: WebGLUniformLocation | null;
  private mapDataTextureLoc: WebGLUniformLocation | null;
  private mapDimensionsLoc: WebGLUniformLocation | null;
  private seedLoc: WebGLUniformLocation | null;
  private sessionSeed: number = 0; // Store seed for the entire session
  
  // Isometric view defaults
  private isoAngle: number = Math.PI / 4;  // 45 degrees
  private isoScale: number = 0.5;          // Y compression for isometric
  private cameraOffsetX: number = 0;
  private cameraOffsetY: number = 0;

  constructor(gl: WebGL2RenderingContext, maxEntities: number) {
    this.gl = gl;
    // 7 floats per instance: px, py, width, height, cubeHeight, rotation, elevation
    this.instanceData = new Float32Array(maxEntities * 7);

    const vs = this.createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = this.createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    this.program = this.createProgram(vs, fs);

    this.resolutionLoc = gl.getUniformLocation(this.program, 'u_resolution');
    this.isoAngleLoc = gl.getUniformLocation(this.program, 'u_isoAngle');
    this.isoScaleLoc = gl.getUniformLocation(this.program, 'u_isoScale');
    this.cameraOffsetLoc = gl.getUniformLocation(this.program, 'u_cameraOffset');
    this.renderModeLoc = gl.getUniformLocation(this.program, 'u_renderMode');
    this.entityColorLoc = gl.getUniformLocation(this.program, 'u_entityColor');
    
    // Atlas uniform locations
    this.atlasTileCountLoc = gl.getUniformLocation(this.program, 'u_atlasTileCount');
    this.tileSizePixelsLoc = gl.getUniformLocation(this.program, 'u_tileSizePixels');
    this.worldTileSizeLoc = gl.getUniformLocation(this.program, 'u_worldTileSize');
    this.staticRangeStartLoc = gl.getUniformLocation(this.program, 'u_staticRangeStart');
    this.staticRangeEndLoc = gl.getUniformLocation(this.program, 'u_staticRangeEnd');
    this.variationRangeStartLoc = gl.getUniformLocation(this.program, 'u_variationRangeStart');
    this.variationRangeEndLoc = gl.getUniformLocation(this.program, 'u_variationRangeEnd');
    this.mapDataTextureLoc = gl.getUniformLocation(this.program, 'u_mapDataTexture');
    this.mapDimensionsLoc = gl.getUniformLocation(this.program, 'u_mapDimensions');
    this.seedLoc = gl.getUniformLocation(this.program, 'u_seed');
    
    // Generate initial random seed for this session (changes only on reload/new game)
    this.sessionSeed = Math.random() * 10000.0;
    
    // Create map data texture from MAP_TILE_DATA
    this.createMapDataTexture();

    // 1. Static Cube Buffer (36 vertices: 6 vertices / 2 triangles per face × 6 faces)
    // Each vertex: x, y, z (local [0..1]), faceId (float) packed into vec4
    // Face IDs: 0=Top, 1=Front-Right, 2=Front-Left, 3=Back-Right, 4=Back-Left, 5=Bottom
    const cubeVertices = new Float32Array([
      // Top face (faceId=0) - CCW when viewed from above
      0, 0, 1, 0,   1, 0, 1, 0,   0, 1, 1, 0,
      0, 1, 1, 0,   1, 0, 1, 0,   1, 1, 1, 0,
      
      // Front-Right face (faceId=1) - CCW when viewed from front-right
      1, 0, 0, 1,   1, 1, 0, 1,   1, 0, 1, 1,
      1, 0, 1, 1,   1, 1, 0, 1,   1, 1, 1, 1,
      
      // Front-Left face (faceId=2) - CCW when viewed from front-left
      0, 0, 0, 2,   0, 0, 1, 2,   0, 1, 0, 2,
      0, 1, 0, 2,   0, 0, 1, 2,   0, 1, 1, 2,
      
      // Back-Right face (faceId=3) - CCW when viewed from back-right
      1, 1, 0, 3,   1, 1, 1, 3,   0, 1, 0, 3,
      0, 1, 0, 3,   1, 1, 1, 3,   0, 1, 1, 3,
      
      // Back-Left face (faceId=4) - CCW when viewed from back-left
      0, 1, 0, 4,   0, 1, 1, 4,   0, 0, 0, 4,
      0, 0, 0, 4,   0, 1, 1, 4,   0, 0, 1, 4,
      
      // Bottom face (faceId=5) - CCW when viewed from below
      0, 0, 0, 5,   0, 1, 0, 5,   1, 0, 0, 5,
      1, 0, 0, 5,   0, 1, 0, 5,   1, 1, 0, 5,
    ]);
    const cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    this.cubeBuffer = cubeBuffer;

    // 2. Static Floor Quad Buffer (6 vertices for a single quad)
    // Each vertex: x, y, z=0, faceId=0 packed into vec4
    const floorVertices = new Float32Array([
      // Single quad covering [0,0] to [1,1]
      0, 0, 0, 0,   1, 0, 0, 0,   0, 1, 0, 0,
      0, 1, 0, 0,   1, 0, 0, 0,   1, 1, 0, 0,
    ]);
    const floorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);
    this.floorBuffer = floorBuffer;

    // 3. Dynamic Instance Buffer (pos, size, height)
    const instBuffer = gl.createBuffer();
    if (!instBuffer) throw new Error('Failed to create instance buffer');
    this.instanceBuffer = instBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceData.byteLength, gl.DYNAMIC_DRAW);

    // Stride: 7 floats × 4 bytes = 28 bytes
    const stride = 28;

    // ============================================
    // Create FLOOR VAO
    // ============================================
    const floorVAO = gl.createVertexArray();
    if (!floorVAO) throw new Error('Failed to create floor VAO');
    this.floorVAO = floorVAO;
    gl.bindVertexArray(floorVAO);

    // Bind floor buffer for attribute 0
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);

    // Attribute 1: Position (px, py)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);

    // Attribute 2: Size (width, height)
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 8);
    gl.vertexAttribDivisor(2, 1);

    // Attribute 3: Height (not used for floor, but set up)
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 16);
    gl.vertexAttribDivisor(3, 1);

    // Attribute 4: Rotation (unused for floor, defaults to 0)
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 20);
    gl.vertexAttribDivisor(4, 1);

    // Attribute 5: Elevation offset (unused for floor, defaults to 0)
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 24);
    gl.vertexAttribDivisor(5, 1);

    gl.bindVertexArray(null);

    // ============================================
    // Create CUBE VAO
    // ============================================
    const cubeVAO = gl.createVertexArray();
    if (!cubeVAO) throw new Error('Failed to create cube VAO');
    this.cubeVAO = cubeVAO;
    gl.bindVertexArray(cubeVAO);

    // Bind cube buffer for attribute 0
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);

    // Attribute 1: Position (px, py)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);

    // Attribute 2: Size (width, height)
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 8);
    gl.vertexAttribDivisor(2, 1);

    // Attribute 3: Height (cube height/z-scale)
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 16);
    gl.vertexAttribDivisor(3, 1);

    // Attribute 4: Rotation
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 20);
    gl.vertexAttribDivisor(4, 1);

    // Attribute 5: Elevation offset for jump rendering
    gl.enableVertexAttribArray(5);
    gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 24);
    gl.vertexAttribDivisor(5, 1);

    gl.bindVertexArray(null);

    gl.bindVertexArray(null);
  }
  
  /**
   * Set isometric view parameters
   */
  public setIsometricView(angleRadians: number, scaleY: number): void {
    this.isoAngle = angleRadians;
    this.isoScale = scaleY;
  }
  public render(world: World, width: number, height: number, texture: WebGLTexture, 
                cameraX: number = 0, cameraY: number = 0): void {
    const gl = this.gl;
    const worldAny = world as any;
    
    // SAFE CHECK: Return early if world or world.set is not ready
    if (!worldAny || !worldAny.set) return;
    
    const count = worldAny.set.count;
    if (!count || count === 0) return;

    // Pack entity transform data into contiguous array
    const dense = worldAny.set.dense;
    if (!dense) return;

    let offset = 0;
    for (let i = 0; i < count; i++) {
      const id = dense[i];
      this.instanceData[offset++] = worldAny.px[id];
      this.instanceData[offset++] = worldAny.py[id];
      this.instanceData[offset++] = worldAny.width[id];
      this.instanceData[offset++] = worldAny.height[id];
      this.instanceData[offset++] = 0.0; // cubeHeight = 0 for flat entities
      this.instanceData[offset++] = 0.0; // rotation = 0 for flat entities
      this.instanceData[offset++] = 0.0; // elevation = 0 for floor/flat entities
    }

    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionLoc, width, height);
    gl.uniform1f(this.isoAngleLoc, this.isoAngle);
    gl.uniform1f(this.isoScaleLoc, this.isoScale);
    gl.uniform2f(this.cameraOffsetLoc, cameraX, cameraY);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceData.subarray(0, count * 7));

    // Use the floor VAO for flat entities (quad = 6 vertices)
    gl.bindVertexArray(this.floorVAO);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
    gl.bindVertexArray(null);
  }
  
  /**
   * Render player entity as a 3D cube with red color and per-face shading
   */
  public renderPlayer(world: World, width: number, height: number, texture: WebGLTexture,
                      cameraX: number = 0, cameraY: number = 0): void {
    const gl = this.gl;
    const worldAny = world as any;
    
    if (!worldAny || !worldAny.active || !worldAny.active[PLAYER_ID]) return;
    
    // Pack single player entity: px, py, width, height, cubeHeight, rotation, elevation
    const cubeHeight = (worldAny.height && worldAny.height[PLAYER_ID]) ? worldAny.height[PLAYER_ID] * 2.0 : 64.0;
    const elevation = worldAny.z ? worldAny.z[PLAYER_ID] : 0.0;
    this.instanceData[0] = worldAny.px[PLAYER_ID];
    this.instanceData[1] = worldAny.py[PLAYER_ID];
    this.instanceData[2] = worldAny.width[PLAYER_ID];
    this.instanceData[3] = worldAny.height[PLAYER_ID];
    this.instanceData[4] = cubeHeight;
    this.instanceData[5] = worldAny.rotation ? worldAny.rotation[PLAYER_ID] : 0;
    this.instanceData[6] = elevation;

    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionLoc, width, height);
    gl.uniform1f(this.isoAngleLoc, this.isoAngle);
    gl.uniform1f(this.isoScaleLoc, this.isoScale);
    gl.uniform2f(this.cameraOffsetLoc, cameraX, cameraY);
    gl.uniform1i(this.renderModeLoc, 1);  // Entity mode
    gl.uniform4f(this.entityColorLoc, 1.0, 0.0, 0.0, 1.0);  // Red color

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceData.subarray(0, 7));

    // Disable face culling so all cube faces are always rendered.
    // This ensures no faces are accidentally omitted due to winding/flip.
    gl.disable(gl.CULL_FACE);
    
    gl.bindVertexArray(this.cubeVAO);
    // Draw 36 vertices (6 vertices per face × 6 faces) for the cube
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, 1);
    gl.bindVertexArray(null);
    // Leave culling disabled while the cube is drawn; other draws re-enable as needed
  }

  /**
   * Create a texture from FLOOR_TILE_DATA for the fragment shader to sample
   * Each pixel stores: R = tileId/1024, G = isStatic (0 or 1)
   */
  private createMapDataTexture(): void {
    const gl = this.gl;
    
    // Use fixed map dimensions
    const cols = MAP_COLS;
    const rows = MAP_ROWS;
    
    // Create a texture with dimensions matching the current floor
    const texture = gl.createTexture();
    if (!texture) {
      console.error('Failed to create map data texture');
      return;
    }
    
    // Convert current floor's FLOOR_TILE_DATA to RGBA format for texture
    // R channel: tileId / 1024 (normalized)
    // G channel: isStatic (0 or 1)
    // B and A channels: unused (set to 0)
    const textureData = new Uint8Array(cols * rows * 4);
    
    // Use the current floor's tile data
    const floorTileData = FLOOR_TILE_DATA[currentFloor];
    
    for (let i = 0; i < cols * rows; i++) {
      const srcIdx = i * 2;
      const dstIdx = i * 4;
      
      const tileId = floorTileData[srcIdx];
      const isStatic = floorTileData[srcIdx + 1];
      
      // Normalize tileId to [0, 1] range (max 1024 tiles)
      textureData[dstIdx] = Math.floor((tileId / 1024.0) * 255.0);  // R
      textureData[dstIdx + 1] = isStatic > 0.5 ? 255 : 0;           // G
      textureData[dstIdx + 2] = 0;                                   // B
      textureData[dstIdx + 3] = 255;                                 // A
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Upload texture data - use NEAREST filtering for exact pixel values
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      cols,
      rows,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      textureData
    );
    
    // Use NEAREST filtering to avoid interpolation between tile data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    this.mapDataTexture = texture;
  }
  
  // Public method to update floor texture when changing floors
  public updateFloorTexture(): void {
    this.createMapDataTexture();
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${info}`);
    }
    return shader;
  }

  private createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
    const gl = this.gl;
    const prog = gl.createProgram();
    if (!prog) throw new Error('Failed to create WebGL program');
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error(`Program link failed: ${info}`);
    }
    return prog;
  }

  public renderFloor(
    floorData: { x: number; y: number; width: number; height: number } | null,
    width: number,
    height: number,
    texture: WebGLTexture,
    cameraX: number = 0,
    cameraY: number = 0
  ): void {
    const gl = this.gl;

    // Only update floor data if provided (camera moved)
    if (floorData !== null) {
      // Pack floor data: x, y, width, height, height=0
      this.instanceData[0] = floorData.x;
      this.instanceData[1] = floorData.y;
      this.instanceData[2] = floorData.width;
      this.instanceData[3] = floorData.height;
      this.instanceData[4] = 0.0; // cubeHeight = 0 for floor
      this.instanceData[5] = 0.0; // rotation = 0 for floor
      this.instanceData[6] = 0.0; // elevation = 0 for floor

      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceData.subarray(0, 7));
    }

    // Disable culling for floor rendering
    gl.disable(gl.CULL_FACE);

    // Draw single quad for the entire floor
    gl.useProgram(this.program);
    gl.uniform2f(this.resolutionLoc, width, height);
    gl.uniform1f(this.isoAngleLoc, this.isoAngle);
    gl.uniform1f(this.isoScaleLoc, this.isoScale);
    gl.uniform2f(this.cameraOffsetLoc, cameraX, cameraY);
    gl.uniform1i(this.renderModeLoc, 0);  // Floor mode
    
    // Set atlas configuration uniforms
    gl.uniform1i(this.atlasTileCountLoc, 32);           // 32x32 tiles in atlas
    gl.uniform1f(this.tileSizePixelsLoc, 64.0);         // 64px per tile in atlas
    gl.uniform1f(this.worldTileSizeLoc, 64.0);          // 64px per game tile
    gl.uniform1i(this.staticRangeStartLoc, 0);          // Static tiles: 0-99
    gl.uniform1i(this.staticRangeEndLoc, 99);
    gl.uniform1i(this.variationRangeStartLoc, 100);     // Variation tiles: 100-1023
    gl.uniform1i(this.variationRangeEndLoc, 1023);
    
    // Use fixed map dimensions
    gl.uniform2f(this.mapDimensionsLoc, MAP_COLS, MAP_ROWS);
    // Use the stored session seed (consistent throughout gameplay, changes on reload)
    gl.uniform1f(this.seedLoc, this.sessionSeed);

    // Bind atlas texture to TEXTURE0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Bind map data texture to TEXTURE1
    gl.activeTexture(gl.TEXTURE1);
    if (this.mapDataTexture) {
      gl.bindTexture(gl.TEXTURE_2D, this.mapDataTexture);
    }
    // Tell shader which texture unit to use for map data
    gl.uniform1i(this.mapDataTextureLoc, 1);

    gl.bindVertexArray(this.floorVAO);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1); // Draw 1 instance (the floor)
    gl.bindVertexArray(null);
  }
}
