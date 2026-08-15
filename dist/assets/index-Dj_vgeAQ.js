(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=160,t=160;function n(){return e*64}function r(){return t*64}var i=10240,a=10240;function o(n,r){e=n,t=r}function s(){return e}function c(){return t}var l=new Uint8Array(25600),u=new Float32Array(25600*2);function d(e){let t=e?.cols||160,n=e?.rows||160,r=e?.useAtlas??!0;if(o(t,n),l=new Uint8Array(t*n),u=new Float32Array(t*n*2),r){l.fill(0),u.fill(0);for(let e=0;e<n;e++)for(let n=0;n<t;n++){let r=e*t+n,i=r*2;l[r]=0,u[i]=100,u[i+1]=0}let e=Math.floor(t/2),r=Math.floor(n/2),i=e+2,a=r;if(i<t&&a<n){let e=a*t+i;u[e*2]=1e3,u[e*2+1]=1}let o=e-2,s=r;if(o>=0&&s<n){let e=s*t+o;u[e*2]=1001,u[e*2+1]=1}}else{l.fill(0),u.fill(0);for(let e=0;e<n;e++)for(let n=0;n<t;n++){let r=e*t+n,i=r*2;l[r]=0,u[i]=0,u[i+1]=1}let e=Math.floor(t/2),r=Math.floor(n/2),i=e+2,a=r;if(i<t&&a<n){let e=a*t+i;u[e*2]=1e3,u[e*2+1]=1}let o=e-2,s=r;if(o>=0&&s<n){let e=s*t+o;u[e*2]=1001,u[e*2+1]=1}}}function f(e,t){return e<0||e>=s()||t<0||t>=c()||l[t*s()+e]===2}var p=``;if(typeof document<`u`){let e=document.createElement(`canvas`);e.width=64,e.height=64;let t=e.getContext(`2d`);t&&(t.fillStyle=`#4a7c23`,t.fillRect(0,0,32,32),t.fillRect(32,32,32,32),t.fillStyle=`#2d5a1a`,t.fillRect(32,0,32,32),t.fillRect(0,32,32,32),p=e.toDataURL(`image/png`))}var m={id:0,width:10240,depth:10240,texturePath:`/textures/atlas.png`,repeatX:160,repeatZ:160,useAtlas:!0,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},h=[{id:0,width:10240,depth:10240,texturePath:`/textures/atlas.png`,repeatX:160,repeatZ:160,useAtlas:!0,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:1,width:1536,depth:1536,texturePath:p,repeatX:24,repeatZ:24,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:2,width:3072,depth:3072,texturePath:p,repeatX:48,repeatZ:48,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:3,width:3072,depth:1536,texturePath:p,repeatX:48,repeatZ:24,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:4,width:1536,depth:3072,texturePath:p,repeatX:24,repeatZ:48,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:5,width:1920,depth:1920,texturePath:p,repeatX:30,repeatZ:30,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:6,width:2304,depth:2304,texturePath:p,repeatX:36,repeatZ:36,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:7,width:2880,depth:2880,texturePath:p,repeatX:45,repeatZ:45,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:8,width:3072,depth:1536,texturePath:p,repeatX:48,repeatZ:24,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:9,width:1792,depth:1792,texturePath:p,repeatX:28,repeatZ:28,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:10,width:2688,depth:1664,texturePath:p,repeatX:42,repeatZ:26,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:11,width:1664,depth:2688,texturePath:p,repeatX:26,repeatZ:42,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:12,width:2048,depth:2048,texturePath:p,repeatX:32,repeatZ:32,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:13,width:2560,depth:2560,texturePath:p,repeatX:40,repeatZ:40,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:14,width:3072,depth:3072,texturePath:p,repeatX:48,repeatZ:48,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:15,width:3072,depth:1536,texturePath:p,repeatX:48,repeatZ:24,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:16,width:1536,depth:3072,texturePath:p,repeatX:24,repeatZ:48,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:17,width:1536,depth:1536,texturePath:p,repeatX:24,repeatZ:24,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:18,width:2816,depth:2816,texturePath:p,repeatX:44,repeatZ:44,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},{id:19,width:2432,depth:1920,texturePath:p,repeatX:38,repeatZ:30,useAtlas:!1,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023}];function g(e){return e<0||e>=h.length?(console.warn(`Invalid floor ID: ${e}, using default floor 0`),h[0]):h[e]}function _(){return h.length}var ee=class{constructor(e=m){this.currentFloorId=0,this.floorConfig=e}switchFloor(e){if(e<0||e>=_())return console.warn(`Invalid floor ID: ${e}. Must be between 0 and ${_()-1}`),!1;this.currentFloorId=e,this.floorConfig=g(e);let t=Math.floor(this.floorConfig.width/64),n=Math.floor(this.floorConfig.depth/64);return d({cols:t,rows:n,useAtlas:this.floorConfig.useAtlas}),console.log(`[MapRenderer] Switched to Floor ${e} (${t}x${n} tiles, ${this.floorConfig.width}x${this.floorConfig.depth}px)`),!0}getCurrentFloorId(){return this.currentFloorId}getAvailableFloors(){return h}getFloorConfig(e){return e<0||e>=_()?null:g(e)}getFloorData(e,t,n,r){return{x:0,y:0,width:this.floorConfig.width,height:this.floorConfig.depth,texturePath:this.floorConfig.texturePath,repeatX:this.floorConfig.repeatX,repeatZ:this.floorConfig.repeatZ,floorId:this.currentFloorId,useAtlas:this.floorConfig.useAtlas}}getVisibleTileData(e,t,n,r){return{buffer:new Float32Array,count:0}}},v=65536,y=1/60,te=i,ne=a,b=class{constructor(e=v){this.maxEntities=e,this.active=new Uint8Array(e),this.x=new Float32Array(e),this.y=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.w=new Float32Array(e),this.h=new Float32Array(e),this.speed=new Float32Array(e),this.health=new Float32Array(e),this.deadFlag=new Uint8Array(e),this.rotation=new Float32Array(e),this.z=new Float32Array(e),this.vz=new Float32Array(e),this.grounded=new Uint8Array(e),this.px=this.x,this.py=this.y,this.width=this.w,this.height=this.h,this.set={count:0,dense:[]}}addEntity(e,t,n,r,i){let a=this.set.count;if(a>=this.maxEntities)throw Error(`Maximum entities reached`);return this.active[a]=1,this.x[a]=e,this.y[a]=t,this.w[a]=n,this.h[a]=r,this.health[a]=i,this.vx[a]=0,this.vy[a]=0,this.deadFlag[a]=0,this.set.dense.push(a),this.set.count++,a}},x=class{update(e,t,n=0){if(!e.active[n])return;let r=e.vx[n]??0,i=e.vy[n]??0,a=this.moveAndSlide(e.x[n],e.y[n],r,i,e.w[n]||32,e.h[n]||32,t);e.x[n]=a.x,e.y[n]=a.y}moveAndSlide(e,t,i,a,o,s,c){let l=e+i*c,u=t+a*c,d=n(),p=r();l=Math.max(0,Math.min(l,d-o)),u=Math.max(0,Math.min(u,p-s));let m=[{x:l+1,y:u+1},{x:l+o-1,y:u+1},{x:l+1,y:u+s-1},{x:l+o-1,y:u+s-1}],h=!1;for(let e of m)if(f(Math.floor(e.x/64),Math.floor(e.y/64))){h=!0;break}if(h){let n=!0,r=[{x:l+1,y:t+1},{x:l+o-1,y:t+1},{x:l+1,y:t+s-1},{x:l+o-1,y:t+s-1}];for(let e of r)if(f(Math.floor(e.x/64),Math.floor(e.y/64))){n=!1;break}if(n)return{x:l,y:t};let i=!0,a=[{x:e+1,y:u+1},{x:e+o-1,y:u+1},{x:e+1,y:u+s-1},{x:e+o-1,y:u+s-1}];for(let e of a)if(f(Math.floor(e.x/64),Math.floor(e.y/64))){i=!1;break}return i?{x:e,y:u}:{x:e,y:t}}return{x:l,y:u}}},re=class{constructor(){this.collisionSystem=new x,this.ROTATION_SPEED=5}update(e,t,n){let r=e;if(!r.active||!r.active[1])return;let i=0,a=0;(t.w||t.W||t.ArrowUp||t.arrowup)&&--a,(t.s||t.S||t.ArrowDown||t.arrowdown)&&(a+=1),(t.a||t.A||t.ArrowLeft||t.arrowleft)&&--i,(t.d||t.D||t.ArrowRight||t.arrowright)&&(i+=1);let o=Math.hypot(i,a);if(o>0&&(i/=o,a/=o,r.rotation)){let e=Math.atan2(a,i),t=r.rotation[1]||0,o=e-t;for(;o>Math.PI;)o-=2*Math.PI;for(;o<-Math.PI;)o+=2*Math.PI;let s=this.ROTATION_SPEED*n,c=Math.max(-s,Math.min(s,o));r.rotation[1]=t+c}let s=r.speed?r.speed[1]:200,c=i*s,l=a*s;r.vx&&(r.vx[1]=c),r.vy&&(r.vy[1]=l);let u=r.x?r.x[1]:0,d=r.y?r.y[1]:0,f=r.w?r.w[1]:32,p=r.h?r.h[1]:32,m=this.collisionSystem.moveAndSlide(u,d,c,l,f,p,n);r.x&&(r.x[1]=m.x),r.y&&(r.y[1]=m.y)}},ie=`#version 300 es
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
`,ae=`#version 300 es
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
`,oe=class{constructor(e,t){this.mapDataTexture=null,this.pendingUseAtlas=!1,this.sessionSeed=0,this.isoAngle=Math.PI/4,this.isoScale=.5,this.cameraOffsetX=0,this.cameraOffsetY=0,this.gl=e,this.instanceData=new Float32Array(t*7);let n=this.createShader(e.VERTEX_SHADER,ie),r=this.createShader(e.FRAGMENT_SHADER,ae);this.program=this.createProgram(n,r),this.resolutionLoc=e.getUniformLocation(this.program,`u_resolution`),this.isoAngleLoc=e.getUniformLocation(this.program,`u_isoAngle`),this.isoScaleLoc=e.getUniformLocation(this.program,`u_isoScale`),this.cameraOffsetLoc=e.getUniformLocation(this.program,`u_cameraOffset`),this.renderModeLoc=e.getUniformLocation(this.program,`u_renderMode`),this.entityColorLoc=e.getUniformLocation(this.program,`u_entityColor`),this.atlasTileCountLoc=e.getUniformLocation(this.program,`u_atlasTileCount`),this.tileSizePixelsLoc=e.getUniformLocation(this.program,`u_tileSizePixels`),this.worldTileSizeLoc=e.getUniformLocation(this.program,`u_worldTileSize`),this.staticRangeStartLoc=e.getUniformLocation(this.program,`u_staticRangeStart`),this.staticRangeEndLoc=e.getUniformLocation(this.program,`u_staticRangeEnd`),this.variationRangeStartLoc=e.getUniformLocation(this.program,`u_variationRangeStart`),this.variationRangeEndLoc=e.getUniformLocation(this.program,`u_variationRangeEnd`),this.useAtlasLoc=e.getUniformLocation(this.program,`u_useAtlas`),this.mapDataTextureLoc=e.getUniformLocation(this.program,`u_mapDataTexture`),this.mapDimensionsLoc=e.getUniformLocation(this.program,`u_mapDimensions`),this.seedLoc=e.getUniformLocation(this.program,`u_seed`),this.sessionSeed=Math.random()*1e4,this.createMapDataTexture();let i=new Float32Array([0,0,1,0,1,0,1,0,0,1,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1,0,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,0,0,2,0,0,1,2,0,1,0,2,0,1,0,2,0,0,1,2,0,1,1,2,1,1,0,3,1,1,1,3,0,1,0,3,0,1,0,3,1,1,1,3,0,1,1,3,0,1,0,4,0,1,1,4,0,0,0,4,0,0,0,4,0,1,1,4,0,0,1,4,0,0,0,5,0,1,0,5,1,0,0,5,1,0,0,5,0,1,0,5,1,1,0,5]),a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,i,e.STATIC_DRAW),this.cubeBuffer=a;let o=new Float32Array([0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0]),s=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW),this.floorBuffer=s;let c=e.createBuffer();if(!c)throw Error(`Failed to create instance buffer`);this.instanceBuffer=c,e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let l=e.createVertexArray();if(!l)throw Error(`Failed to create floor VAO`);this.floorVAO=l,e.bindVertexArray(l),e.bindBuffer(e.ARRAY_BUFFER,this.floorBuffer),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,16,0),e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,28,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,28,8),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,1,e.FLOAT,!1,28,16),e.vertexAttribDivisor(3,1),e.enableVertexAttribArray(4),e.vertexAttribPointer(4,1,e.FLOAT,!1,28,20),e.vertexAttribDivisor(4,1),e.enableVertexAttribArray(5),e.vertexAttribPointer(5,1,e.FLOAT,!1,28,24),e.vertexAttribDivisor(5,1),e.bindVertexArray(null);let u=e.createVertexArray();if(!u)throw Error(`Failed to create cube VAO`);this.cubeVAO=u,e.bindVertexArray(u),e.bindBuffer(e.ARRAY_BUFFER,this.cubeBuffer),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,16,0),e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,28,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,28,8),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,1,e.FLOAT,!1,28,16),e.vertexAttribDivisor(3,1),e.enableVertexAttribArray(4),e.vertexAttribPointer(4,1,e.FLOAT,!1,28,20),e.vertexAttribDivisor(4,1),e.enableVertexAttribArray(5),e.vertexAttribPointer(5,1,e.FLOAT,!1,28,24),e.vertexAttribDivisor(5,1),e.bindVertexArray(null),e.bindVertexArray(null)}setIsometricView(e,t){this.isoAngle=e,this.isoScale=t}render(e,t,n,r,i=0,a=0){let o=this.gl,s=e;if(!s||!s.set)return;let c=s.set.count;if(!c||c===0)return;let l=s.set.dense;if(!l)return;let u=0;for(let e=0;e<c;e++){let t=l[e];this.instanceData[u++]=s.px[t],this.instanceData[u++]=s.py[t],this.instanceData[u++]=s.width[t],this.instanceData[u++]=s.height[t],this.instanceData[u++]=0,this.instanceData[u++]=0,this.instanceData[u++]=0}o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,c*7)),o.bindVertexArray(this.floorVAO),o.drawArraysInstanced(o.TRIANGLES,0,6,c),o.bindVertexArray(null)}renderPlayer(e,t,n,r,i=0,a=0){let o=this.gl,s=e;if(!s||!s.active||!s.active[1])return;let c=s.height&&s.height[1]?s.height[1]*2:64,l=s.z?s.z[1]:0;this.instanceData[0]=s.px[1],this.instanceData[1]=s.py[1],this.instanceData[2]=s.width[1],this.instanceData[3]=s.height[1],this.instanceData[4]=c,this.instanceData[5]=s.rotation?s.rotation[1]:0,this.instanceData[6]=l,o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.uniform1i(this.renderModeLoc,1),o.uniform4f(this.entityColorLoc,1,0,0,1),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,7)),o.disable(o.CULL_FACE),o.bindVertexArray(this.cubeVAO),o.drawArraysInstanced(o.TRIANGLES,0,36,1),o.bindVertexArray(null)}createMapDataTexture(){let e=this.gl,t=e.createTexture();if(!t){console.error(`Failed to create map data texture`);return}let n=s(),r=c(),i=new Uint8Array(n*r*4);for(let e=0;e<n*r;e++){let t=e*2,n=e*4,r=u[t],a=u[t+1],o=r&255,s=Math.floor(r/256)&255;i[n]=o,i[n+1]=a>.5?255:0,i[n+2]=s,i[n+3]=255}e.bindTexture(e.TEXTURE_2D,t),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,n,r,0,e.RGBA,e.UNSIGNED_BYTE,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null),this.mapDataTexture=t}updateMapDataTexture(){this.mapDataTexture&&=(this.gl.deleteTexture(this.mapDataTexture),null),this.createMapDataTexture()}createShader(e,t){let n=this.gl,r=n.createShader(e);if(!r)throw Error(`Failed to create shader`);if(n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS)){let e=n.getShaderInfoLog(r);throw n.deleteShader(r),Error(`Shader compilation failed: ${e}`)}return r}createProgram(e,t){let n=this.gl,r=n.createProgram();if(!r)throw Error(`Failed to create WebGL program`);if(n.attachShader(r,e),n.attachShader(r,t),n.linkProgram(r),!n.getProgramParameter(r,n.LINK_STATUS)){let e=n.getProgramInfoLog(r);throw n.deleteProgram(r),Error(`Program link failed: ${e}`)}return r}renderFloor(e,t,n,r,i=0,a=0){let o=this.gl;e!==null&&(this.instanceData[0]=e.x,this.instanceData[1]=e.y,this.instanceData[2]=e.width,this.instanceData[3]=e.height,this.instanceData[4]=0,this.instanceData[5]=0,this.instanceData[6]=0,o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,7)),this.pendingUseAtlas=e.useAtlas!==void 0&&e.useAtlas),o.disable(o.CULL_FACE),o.useProgram(this.program),this.pendingUseAtlas!==void 0&&o.uniform1i(this.useAtlasLoc,+!!this.pendingUseAtlas),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.uniform1i(this.renderModeLoc,0),o.uniform1i(this.atlasTileCountLoc,32),o.uniform1f(this.tileSizePixelsLoc,64),o.uniform1f(this.worldTileSizeLoc,64),o.uniform1i(this.staticRangeStartLoc,0),o.uniform1i(this.staticRangeEndLoc,99),o.uniform1i(this.variationRangeStartLoc,100),o.uniform1i(this.variationRangeEndLoc,1023),o.uniform2f(this.mapDimensionsLoc,s(),c()),o.uniform1f(this.seedLoc,this.sessionSeed),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.activeTexture(o.TEXTURE1),this.mapDataTexture&&o.bindTexture(o.TEXTURE_2D,this.mapDataTexture),o.uniform1i(this.mapDataTextureLoc,1),o.bindVertexArray(this.floorVAO),o.drawArraysInstanced(o.TRIANGLES,0,6,1),o.bindVertexArray(null)}},S=class e{static async loadTexture(t,n){let r=await e.loadImage(n),i=t.createTexture();if(!i)throw Error(`Failed to create WebGL texture.`);return t.bindTexture(t.TEXTURE_2D,i),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),i}static loadImage(e){return new Promise((t,n)=>{let r=new Image;r.crossOrigin=`anonymous`,r.onload=()=>t(r),r.onerror=t=>n(Error(`Failed to load image at ${e}: ${t}`)),r.src=e})}},C=8,w=29,T=class{static saveWorld(e){let t=e,n=t.set.count,r=C+n*w,i=new ArrayBuffer(r),a=new DataView(i);a.setUint32(0,n,!0);let o=C,{dense:s}=t.set;for(let e=0;e<n;e++){let n=s[e];a.setFloat32(o+0,t.px[n],!0),a.setFloat32(o+4,t.py[n],!0),a.setFloat32(o+8,t.vx[n],!0),a.setFloat32(o+12,t.vy[n],!0),a.setFloat32(o+16,t.width[n],!0),a.setFloat32(o+20,t.height[n],!0),a.setFloat32(o+24,t.health[n],!0),a.setUint8(o+28,t.deadFlag[n]),o+=w}return i}static loadWorld(e,t){let n=new DataView(t),r=n.getUint32(0,!0),i=e;i.set.count=0;let a=C;for(let e=0;e<r;e++){let e=n.getFloat32(a+0,!0),t=n.getFloat32(a+4,!0),r=n.getFloat32(a+8,!0),o=n.getFloat32(a+12,!0),s=n.getFloat32(a+16,!0),c=n.getFloat32(a+20,!0),l=n.getFloat32(a+24,!0),u=n.getUint8(a+28),d=i.addEntity(e,t,s,c,l);i.vx[d]=r,i.vy[d]=o,i.deadFlag[d]=u,a+=w}}},E=class{static{this.STORAGE_PREFIX=`ecs_save_`}static{this.MAX_SLOTS=10}static getSaveSlots(){let e=[];for(let t=0;t<this.MAX_SLOTS;t++){let n=`${this.STORAGE_PREFIX}${t}`,r=localStorage.getItem(n);if(r)try{let n=JSON.parse(r),i=atob(n.data),a=new ArrayBuffer(i.length),o=new Uint8Array(a);for(let e=0;e<i.length;e++)o[e]=i.charCodeAt(e);e.push({id:t,name:n.name||`Save ${t+1}`,timestamp:n.timestamp||0,data:a})}catch(e){console.warn(`Failed to load save slot ${t}:`,e),localStorage.removeItem(n)}}return e.sort((e,t)=>t.timestamp-e.timestamp)}static saveToSlot(e,t,n){try{let r=T.saveWorld(e),i=String.fromCharCode(...new Uint8Array(r)),a=btoa(i),o={name:n||`Save ${t+1}`,timestamp:Date.now(),data:a};return localStorage.setItem(`${this.STORAGE_PREFIX}${t}`,JSON.stringify(o)),!0}catch(e){return console.error(`Failed to save to slot:`,e),!1}}static loadFromSlot(e){let t=`${this.STORAGE_PREFIX}${e}`,n=localStorage.getItem(t);if(!n)return null;try{let e=JSON.parse(n),t=atob(e.data),r=new ArrayBuffer(t.length),i=new Uint8Array(r);for(let e=0;e<t.length;e++)i[e]=t.charCodeAt(e);return r}catch(e){return console.error(`Failed to load from slot:`,e),localStorage.removeItem(t),null}}static deleteSlot(e){try{return localStorage.removeItem(`${this.STORAGE_PREFIX}${e}`),!0}catch(e){return console.error(`Failed to delete slot:`,e),!1}}static formatDate(e){return e?new Date(e).toLocaleString():`No date`}};function D(e,t,n){return e+(t-e)*n}function O(e,t,n){return e<t?t:e>n?n:e}var se=class{constructor(){this.x=0,this.y=0,this.zoom=1,this.rotation=0,this.target=null,this.smoothFactor=.1,this.lambda=-Math.log(.9),this.EPSILON=.01,this.offsetX=0,this.offsetY=0,this.viewportWidth=800,this.viewportHeight=600,this.mapWidth=te,this.mapHeight=ne,this.isHalfWidth=64/2,this.isHalfHeight=64/4,this.viewProjectionMatrix=new Float32Array(16),this.viewMatrix=new Float32Array(16),this.projectionMatrix=new Float32Array(16),this.isMatrixDirty=!0}setTarget(e){this.target=e}setOffset(e,t){this.offsetX=e,this.offsetY=t,this.isMatrixDirty=!0}getOffset(){return{offsetX:this.offsetX,offsetY:this.offsetY}}clearTarget(){this.target=null}setSmoothFactor(e){this.smoothFactor=O(e,.01,1),this.lambda=-Math.log(1-this.smoothFactor)}getSmoothFactor(){return this.smoothFactor}setViewport(e,t){this.viewportWidth=e,this.viewportHeight=t,this.isMatrixDirty=!0}setMapBounds(e,t){this.mapWidth=e,this.mapHeight=t,this.isMatrixDirty=!0}update(e=1){if(!this.target)return!1;let t=this.target.x-this.viewportWidth/2+this.offsetX,n=this.target.y-this.viewportHeight/2+this.offsetY,r=t-this.x,i=n-this.y;if(Math.abs(r)<this.EPSILON&&Math.abs(i)<this.EPSILON)return this.x=t,this.y=n,this.isMatrixDirty=!1,!1;let a=1-Math.exp(-this.lambda*e);return this.x=D(this.x,t,a),this.y=D(this.y,n,a),this.isMatrixDirty=!0,!0}snapTo(e,t){this.x=e,this.y=t,this.isMatrixDirty=!0}snapToTarget(){this.target&&(this.x=this.target.x-this.viewportWidth/2+this.offsetX,this.y=this.target.y-this.viewportHeight/2+this.offsetY,this.isMatrixDirty=!0)}clampToBounds(){let e=Math.max(0,this.mapWidth-this.viewportWidth),t=Math.max(0,this.mapHeight-this.viewportHeight);this.x=O(this.x,0,e),this.y=O(this.y,0,t)}move(e,t){this.x+=e,this.y+=t,this.clampToBounds(),this.isMatrixDirty=!0}setZoom(e){this.zoom=O(e,.5,3),this.isMatrixDirty=!0}getZoom(){return this.zoom}setRotation(e){this.rotation=e}getX(){return this.x}getY(){return this.y}getState(){return{x:this.x,y:this.y,zoom:this.zoom,rotation:this.rotation}}worldToScreen(e,t,n){let r=n||{x:0,y:0};return r.x=e-this.x,r.y=t-this.y,r}screenToWorld(e,t,n){let r=n||{x:0,y:0};return r.x=e+this.x,r.y=t+this.y,r}tileToScreen(e,t){e*64,t*64;let n=(e-t)*this.isHalfWidth,r=(e+t)*this.isHalfHeight;return{x:n-this.x+this.viewportWidth/2,y:r-this.y+100}}isVisible(e,t,n=0){return e>=this.x-n&&e<=this.x+this.viewportWidth+n&&t>=this.y-n&&t<=this.y+this.viewportHeight+n}isTileVisible(e,t){let n=e*64,r=t*64;return this.isVisible(n,r,64)}getViewProjectionMatrix(){if(!this.isMatrixDirty)return this.viewProjectionMatrix;let e=this.x,t=this.x+this.viewportWidth,n=this.y,r=this.y+this.viewportHeight,i=1/(e-t),a=1/(r-n);return this.viewProjectionMatrix[0]=2*i,this.viewProjectionMatrix[1]=0,this.viewProjectionMatrix[2]=0,this.viewProjectionMatrix[3]=0,this.viewProjectionMatrix[4]=0,this.viewProjectionMatrix[5]=2*a,this.viewProjectionMatrix[6]=0,this.viewProjectionMatrix[7]=0,this.viewProjectionMatrix[8]=0,this.viewProjectionMatrix[9]=0,this.viewProjectionMatrix[10]=-1,this.viewProjectionMatrix[11]=0,this.viewProjectionMatrix[12]=(t+e)*i,this.viewProjectionMatrix[13]=(n+r)*a,this.viewProjectionMatrix[14]=0,this.viewProjectionMatrix[15]=1,this.isMatrixDirty=!1,this.viewProjectionMatrix}getViewMatrix(){return this.isMatrixDirty?(this.viewMatrix[0]=1,this.viewMatrix[1]=0,this.viewMatrix[2]=0,this.viewMatrix[3]=0,this.viewMatrix[4]=0,this.viewMatrix[5]=1,this.viewMatrix[6]=0,this.viewMatrix[7]=0,this.viewMatrix[8]=0,this.viewMatrix[9]=0,this.viewMatrix[10]=1,this.viewMatrix[11]=0,this.viewMatrix[12]=-this.x,this.viewMatrix[13]=-this.y,this.viewMatrix[14]=0,this.viewMatrix[15]=1,this.isMatrixDirty=!1,this.viewMatrix):this.viewMatrix}getProjectionMatrix(){if(!this.isMatrixDirty)return this.projectionMatrix;let e=this.viewportWidth,t=this.viewportHeight,n=1/(0-e),r=1/(t-0);return this.projectionMatrix[0]=2*n,this.projectionMatrix[1]=0,this.projectionMatrix[2]=0,this.projectionMatrix[3]=0,this.projectionMatrix[4]=0,this.projectionMatrix[5]=2*r,this.projectionMatrix[6]=0,this.projectionMatrix[7]=0,this.projectionMatrix[8]=0,this.projectionMatrix[9]=0,this.projectionMatrix[10]=-1,this.projectionMatrix[11]=0,this.projectionMatrix[12]=(e+0)*n,this.projectionMatrix[13]=(0+t)*r,this.projectionMatrix[14]=0,this.projectionMatrix[15]=1,this.isMatrixDirty=!1,this.projectionMatrix}getFrustumBounds(e=0){return{minX:this.x-e,minY:this.y-e,maxX:this.x+this.viewportWidth+e,maxY:this.y+this.viewportHeight+e}}getVisibleTileRange(){let e=this.getFrustumBounds(128);return{minCol:Math.max(0,Math.floor(e.minX/64)),minRow:Math.max(0,Math.floor(e.minY/64)),maxCol:Math.min(Math.ceil(this.mapWidth/64),Math.ceil(e.maxX/64)),maxRow:Math.min(Math.ceil(this.mapHeight/64),Math.ceil(e.maxY/64))}}};function ce(e,t,n,r=.1,i=0,a=0){let o=new se;return o.setTarget(e),o.setViewport(t,n),o.setSmoothFactor(r),o.setOffset(i,a),o}var k=new ee;window.switchFloor=e=>k.switchFloor(e),window.getCurrentFloor=()=>k.getCurrentFloorId(),window.getAvailableFloors=()=>k.getAvailableFloors();var A=!1,j=null,M=null,N=null,P=null,F=null,I=null,L=null,R=null,le=document.getElementById(`start-menu`),z=document.getElementById(`slots-container`),B=document.getElementById(`slots-overlay`),V=document.getElementById(`btn-start`),H=document.getElementById(`btn-settings`),ue=document.getElementById(`btn-credits`),de=document.getElementById(`btn-close-slots`),fe=document.getElementById(`link-1`),pe=document.getElementById(`link-2`),me=document.getElementById(`link-3`),he=3,U=null;async function ge(){if(F=document.getElementById(`canvas`),!F)throw Error(`Canvas not found`);F.width=window.innerWidth,F.height=window.innerHeight;let e=F.getContext(`webgl2`);if(!e)throw Error(`WebGL 2 is not supported.`);I=e,I.viewport(0,0,F.width,F.height),I.clearColor(.1,.1,.12,1),j=new b,L=new re,R=new x,M=new oe(I,v),d(),console.log(`[Engine] Map generated, size:`,l.length,`tiles`),M.updateMapDataTexture();let t=n()/2,i=r()/2;j.active[1]=1,j.x[1]=t,j.y[1]=i,j.w[1]=32,j.h[1]=32,j.speed[1]=200,j.vx[1]=0,j.vy[1]=0,j.rotation[1]=0,j.set.count=1,j.set.dense[0]=1,M.setIsometricView(Math.PI/4,.5),N=ce({x:j.x[1],y:j.y[1]},F.width,F.height,1,-320,-100),N.snapToTarget();try{P=await S.loadTexture(I,`src/atlas pictures/atlas floor.jpg`),console.log(`[Engine] Atlas texture loaded successfully`)}catch(e){console.warn(`[Engine] Failed to load atlas texture, using placeholder`,e),P=await S.loadTexture(I,`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`)}ve()}function W(){A=!0,le.classList.add(`hidden`),K={}}function G(){let e=document.getElementById(`slots-overlay`);z.innerHTML=``,e&&z.appendChild(e);for(let e=0;e<he;e++){let t=E.loadFromSlot(e),n=document.createElement(`div`);if(n.className=`save-slot`,t){let t=JSON.parse(localStorage.getItem(`ecs_save_${e}`)||`{}`),r=t.timestamp||0;n.classList.remove(`empty`);let i=document.createElement(`div`);i.className=`slot-info`;let a=document.createElement(`div`);a.className=`slot-name`,a.textContent=t.name||`Save ${e+1}`;let o=document.createElement(`div`);o.className=`slot-date`,o.textContent=E.formatDate(r),i.appendChild(a),i.appendChild(o);let s=document.createElement(`button`);s.className=`delete-btn`,s.textContent=`X`,s.addEventListener(`click`,t=>{t.stopPropagation(),E.deleteSlot(e),G()}),n.appendChild(i),n.appendChild(s),n.addEventListener(`click`,()=>{let t=E.loadFromSlot(e);t&&j&&(T.loadWorld(j,t),U=e,console.log(`[UI] Loaded save slot ${e}`),W())})}else{n.classList.add(`empty`);let t=document.createElement(`div`);t.className=`slot-info`;let r=document.createElement(`div`);r.className=`slot-name`,r.textContent=`Empty Slot ${e+1}`;let i=document.createElement(`div`);i.className=`slot-date`,i.textContent=`Click to start New Game`,t.appendChild(r),t.appendChild(i),n.appendChild(t),n.addEventListener(`click`,()=>{U=e,_e(),W()})}z.appendChild(n)}e&&z.appendChild(e)}function _e(){if(M&&(M.sessionSeed=Math.random()*1e4),j){j=new b,d(),M&&M.updateMapDataTexture();let e=n()/2,t=r()/2;j.active[1]=1,j.x[1]=e,j.y[1]=t,j.w[1]=32,j.h[1]=32,j.speed[1]=200,j.vx[1]=0,j.vy[1]=0,j.rotation[1]=0,j.set.count=1,j.set.dense[0]=1,N&&(N.setTarget({x:e,y:t}),N.snapToTarget())}}var K={},q=0,J=performance.now();function ve(){J=performance.now(),q=0;function e(t){if(!A||!j||!M||!N||!I||!F){requestAnimationFrame(e);return}let n=(t-J)/1e3;for(J=t,q+=Math.min(n,.25);q>=y;)L.update(j,K,y),R.update(j,y,1),q-=y;N.setTarget({x:j.x[1],y:j.y[1]});let r=N.update(n);I.clear(I.COLOR_BUFFER_BIT);let i=N.getX(),a=N.getY();if(r||J===t){let e=k.getFloorData(i,a,F.width,F.height);M.renderFloor(e,F.width,F.height,P,i,a)}else M.renderFloor(null,F.width,F.height,P,i,a);M.renderPlayer(j,F.width,F.height,P,i,a),requestAnimationFrame(e)}requestAnimationFrame(e)}var Y=!1,X=document.getElementById(`map-container`),Z=document.getElementById(`map-canvas`),Q=null,$=!1;function ye(){if(!Z||!X)return;let e=window.innerHeight;Z.width=400,Z.height=Math.floor(e),Q=Z.getContext(`2d`),Q&&(Q.fillStyle=`#000000`,Q.fillRect(0,0,Z.width,Z.height))}function be(){$=!$,$?(X.classList.add(`visible`),ye()):X.classList.remove(`visible`)}window.addEventListener(`keydown`,e=>{if(A){if(e.key===`m`||e.key===`M`){be();return}if((e.key===`t`||e.key===`T`)&&!Y){Y=!0;let e=k.getCurrentFloorId(),t=e>0?e-1:_()-1;k.switchFloor(t),M&&M.updateMapDataTexture(),j&&(j.x[1]=n()/2,j.y[1]=r()/2,j.vx[1]=0,j.vy[1]=0,N&&(N.setTarget({x:j.x[1],y:j.y[1]}),N.snapToTarget())),setTimeout(()=>{Y=!1},200)}if((e.key===`g`||e.key===`G`)&&!Y){Y=!0;let e=k.getCurrentFloorId(),t=e<_()-1?e+1:0;k.switchFloor(t),M&&M.updateMapDataTexture(),j&&(j.x[1]=n()/2,j.y[1]=r()/2,j.vx[1]=0,j.vy[1]=0,N&&(N.setTarget({x:j.x[1],y:j.y[1]}),N.snapToTarget())),setTimeout(()=>{Y=!1},200)}if((e.key===`e`||e.key===`E`)&&!Y&&j){let e=Math.floor(j.x[1]/64),t=Math.floor(j.y[1]/64),i=!1;for(let a=-1;a<=1&&!i;a++)for(let o=-1;o<=1&&!i;o++){let l=e+o,d=t+a;if(l>=0&&l<s()&&d>=0&&d<c()){let e=u[(d*s()+l)*2];if(e===1e3||e===1001){Y=!0,i=!0;let t=k.getCurrentFloorId(),a;a=e===1e3?t<_()-1?t+1:0:t>0?t-1:_()-1,k.switchFloor(a),M&&M.updateMapDataTexture(),j.x[1]=n()/2,j.y[1]=r()/2,j.vx[1]=0,j.vy[1]=0,N&&(N.setTarget({x:j.x[1],y:j.y[1]}),N.snapToTarget()),console.log(`[Portal] Stepped on ${e===1e3?`NEXT`:`PREVIOUS`} floor portal, switched to floor ${a}`),setTimeout(()=>{Y=!1},300)}}}}K[e.key]=!0,e.ctrlKey&&(e.key===`s`||e.key===`S`)&&(e.preventDefault(),j&&U!==null&&(E.saveToSlot(j,U,`Save ${U+1}`),console.log(`[UI] Saved to slot ${U}!`)))}}),window.addEventListener(`keyup`,e=>{A&&(K[e.key]=!1)}),window.addEventListener(`resize`,()=>{!F||!I||!N||(F.width=window.innerWidth,F.height=window.innerHeight,I.viewport(0,0,F.width,F.height),N.setViewport(F.width,F.height))}),V.addEventListener(`click`,()=>{V.classList.add(`hidden`),H.parentElement&&H.parentElement.classList.add(`hidden`),B.classList.add(`active`),z.classList.add(`visible`),G()}),de.addEventListener(`click`,()=>{B.classList.remove(`active`),z.classList.remove(`visible`),V.classList.remove(`hidden`),H.parentElement&&H.parentElement.classList.remove(`hidden`)}),H.addEventListener(`click`,()=>{console.log(`[UI] Settings button clicked`)}),ue.addEventListener(`click`,()=>{console.log(`[UI] Credits button clicked`)}),fe.addEventListener(`click`,e=>{e.preventDefault(),console.log(`[UI] Link 1 clicked`)}),pe.addEventListener(`click`,e=>{e.preventDefault(),console.log(`[UI] Link 2 clicked`)}),me.addEventListener(`click`,e=>{e.preventDefault(),console.log(`[UI] Link 3 clicked`)}),z.classList.remove(`visible`),ge().catch(console.error);