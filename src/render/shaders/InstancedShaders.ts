// Vertex Shader Source - isometric transformation with cube extrusion
export const VERTEX_SHADER_SOURCE = `#version 300 es
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

// Fragment Shader Source - Supports both atlas texture and simple chessboard pattern
export const FRAGMENT_SHADER_SOURCE = `#version 300 es
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
uniform int u_useAtlas;            // 0 = chessboard pattern, 1 = atlas texture

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
    
    // Check if we should use chessboard pattern (u_useAtlas == 0)
    
    // First, get tile ID from map data for portal check (works for both modes)
    // Tile ID is stored across R (low byte) and B (high byte) channels
    float tileId = 0.0;
    vec2 mapUV = (vec2(tileX, tileY) + 0.5) / u_mapDimensions;
    vec4 mapData = texture(u_mapDataTexture, mapUV);
    float lowByte = mapData.r * 255.0;   // R channel - low byte
    float highByte = mapData.b * 255.0;  // B channel - high byte
    float baseTileId = lowByte + (highByte * 256.0);  // Reconstruct full tile ID
    float isStatic = mapData.g;              // Static flag stored in G channel
    
    // Portal tile check: render special colors for portal tiles (BEFORE chessboard/atlas decision)
    if (baseTileId > 999.5) {
      // Portal tiles - use solid bright colors instead of atlas textures or chessboard
      if (baseTileId < 1000.5) {
        // Tile ID 1000: Next floor portal (Bright Red)
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
      } else {
        // Tile ID 1001: Previous floor portal (Bright Blue/Cyan)
        fragColor = vec4(0.0, 0.8, 1.0, 1.0);
        return;
      }
    }
    
    if (u_useAtlas == 0) {
      // Simple green chessboard pattern
      // Alternate colors based on tile coordinates
      float sumCoords = tileX + tileY;
      float isEven = mod(sumCoords, 2.0);
      
      // Light green (#4a7c23) and dark green (#2d5a1a)
      vec3 lightGreen = vec3(0.29, 0.486, 0.137);
      vec3 darkGreen = vec3(0.176, 0.353, 0.102);
      
      // Mix between light and dark green based on tile position
      vec3 color = mix(darkGreen, lightGreen, isEven);
      
      fragColor = vec4(color, 1.0);
    } else {
      // ATLAS MODE: Determine tile ID from map data or hash
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
}
`;
