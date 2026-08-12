(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=10240,t=10240,n=new Uint8Array(25600),r=new Float32Array(25600*2);function i(){n.fill(0),r.fill(0);for(let e=0;e<160;e++)for(let t=0;t<160;t++){let i=e*160+t,a=i*2,o=!1;if(e>=72&&e<88&&t>=72&&t<88){let n=e-72,r=t-72;o=!((n===1||n===2)&&(r===5||r===6||r===9||r===10)||(n===3||n===4)&&(r===2||r===3||r===12||r===13)||(n===5||n===6)&&r>=6&&r<=9||(n===9||n===10)&&(r===2||r===3||r===12||r===13)||(n===11||n===12)&&(r===6||r===7||r===9||r===10))}o?(n[i]=0,r[a]=100,r[a+1]=0):(n[i]=0,r[a]=0,r[a+1]=1)}}function a(e,t){return e<0||e>=160||t<0||t>=160||n[t*160+e]===2}var o={width:10240,depth:10240,texturePath:`src/atlas pictures/atlas floor.jpg`,repeatX:160,repeatZ:160,useAtlas:!0,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},s=class{constructor(e=o){this.floorConfig=e}getFloorData(e,t,n,r){return{x:0,y:0,width:this.floorConfig.width,height:this.floorConfig.depth,texturePath:this.floorConfig.texturePath,repeatX:this.floorConfig.repeatX,repeatZ:this.floorConfig.repeatZ}}getVisibleTileData(e,t,n,r){return{buffer:new Float32Array,count:0}}},c=65536,l=1/60,u=e,d=t,f=class{constructor(e=c){this.maxEntities=e,this.active=new Uint8Array(e),this.x=new Float32Array(e),this.y=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.w=new Float32Array(e),this.h=new Float32Array(e),this.speed=new Float32Array(e),this.health=new Float32Array(e),this.deadFlag=new Uint8Array(e),this.rotation=new Float32Array(e),this.z=new Float32Array(e),this.vz=new Float32Array(e),this.grounded=new Uint8Array(e),this.px=this.x,this.py=this.y,this.width=this.w,this.height=this.h,this.set={count:0,dense:[]}}addEntity(e,t,n,r,i){let a=this.set.count;if(a>=this.maxEntities)throw Error(`Maximum entities reached`);return this.active[a]=1,this.x[a]=e,this.y[a]=t,this.w[a]=n,this.h[a]=r,this.health[a]=i,this.vx[a]=0,this.vy[a]=0,this.deadFlag[a]=0,this.set.dense.push(a),this.set.count++,a}},p=class{update(e,t,n=0){if(!e.active[n])return;let r=e.vx[n]??0,i=e.vy[n]??0,a=this.moveAndSlide(e.x[n],e.y[n],r,i,e.w[n]||32,e.h[n]||32,t);e.x[n]=a.x,e.y[n]=a.y}moveAndSlide(e,t,n,r,i,o,s){let c=e+n*s,l=t+r*s;c=Math.max(0,Math.min(c,u-i)),l=Math.max(0,Math.min(l,d-o));let f=[{x:c+1,y:l+1},{x:c+i-1,y:l+1},{x:c+1,y:l+o-1},{x:c+i-1,y:l+o-1}],p=!1;for(let e of f)if(a(Math.floor(e.x/64),Math.floor(e.y/64))){p=!0;break}if(p){let n=!0,r=[{x:c+1,y:t+1},{x:c+i-1,y:t+1},{x:c+1,y:t+o-1},{x:c+i-1,y:t+o-1}];for(let e of r)if(a(Math.floor(e.x/64),Math.floor(e.y/64))){n=!1;break}if(n)return{x:c,y:t};let s=!0,u=[{x:e+1,y:l+1},{x:e+i-1,y:l+1},{x:e+1,y:l+o-1},{x:e+i-1,y:l+o-1}];for(let e of u)if(a(Math.floor(e.x/64),Math.floor(e.y/64))){s=!1;break}return s?{x:e,y:l}:{x:e,y:t}}return{x:c,y:l}}},m=class{constructor(){this.collisionSystem=new p,this.ROTATION_SPEED=5}update(e,t,n){let r=e;if(!r.active||!r.active[1])return;let i=0,a=0;(t.w||t.W||t.ArrowUp||t.arrowup)&&--a,(t.s||t.S||t.ArrowDown||t.arrowdown)&&(a+=1),(t.a||t.A||t.ArrowLeft||t.arrowleft)&&--i,(t.d||t.D||t.ArrowRight||t.arrowright)&&(i+=1);let o=Math.hypot(i,a);if(o>0&&(i/=o,a/=o,r.rotation)){let e=Math.atan2(a,i),t=r.rotation[1]||0,o=e-t;for(;o>Math.PI;)o-=2*Math.PI;for(;o<-Math.PI;)o+=2*Math.PI;let s=this.ROTATION_SPEED*n,c=Math.max(-s,Math.min(s,o));r.rotation[1]=t+c}let s=r.speed?r.speed[1]:200,c=i*s,l=a*s;r.vx&&(r.vx[1]=c),r.vy&&(r.vy[1]=l);let u=r.x?r.x[1]:0,d=r.y?r.y[1]:0,f=r.w?r.w[1]:32,p=r.h?r.h[1]:32,m=this.collisionSystem.moveAndSlide(u,d,c,l,f,p,n);r.x&&(r.x[1]=m.x),r.y&&(r.y[1]=m.y)}},ee=`#version 300 es
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
`,te=`#version 300 es
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
    
    // Void check: if tileId is 0 and isStatic, skip rendering (transparent)
    if (baseTileId < 0.5 && isStatic > 0.5) {
      discard; // Void tile - don't render anything
    }
    
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
`,h=class{constructor(e,t){this.mapDataTexture=null,this.sessionSeed=0,this.isoAngle=Math.PI/4,this.isoScale=.5,this.cameraOffsetX=0,this.cameraOffsetY=0,this.gl=e,this.instanceData=new Float32Array(t*7);let n=this.createShader(e.VERTEX_SHADER,ee),r=this.createShader(e.FRAGMENT_SHADER,te);this.program=this.createProgram(n,r),this.resolutionLoc=e.getUniformLocation(this.program,`u_resolution`),this.isoAngleLoc=e.getUniformLocation(this.program,`u_isoAngle`),this.isoScaleLoc=e.getUniformLocation(this.program,`u_isoScale`),this.cameraOffsetLoc=e.getUniformLocation(this.program,`u_cameraOffset`),this.renderModeLoc=e.getUniformLocation(this.program,`u_renderMode`),this.entityColorLoc=e.getUniformLocation(this.program,`u_entityColor`),this.atlasTileCountLoc=e.getUniformLocation(this.program,`u_atlasTileCount`),this.tileSizePixelsLoc=e.getUniformLocation(this.program,`u_tileSizePixels`),this.worldTileSizeLoc=e.getUniformLocation(this.program,`u_worldTileSize`),this.staticRangeStartLoc=e.getUniformLocation(this.program,`u_staticRangeStart`),this.staticRangeEndLoc=e.getUniformLocation(this.program,`u_staticRangeEnd`),this.variationRangeStartLoc=e.getUniformLocation(this.program,`u_variationRangeStart`),this.variationRangeEndLoc=e.getUniformLocation(this.program,`u_variationRangeEnd`),this.mapDataTextureLoc=e.getUniformLocation(this.program,`u_mapDataTexture`),this.mapDimensionsLoc=e.getUniformLocation(this.program,`u_mapDimensions`),this.seedLoc=e.getUniformLocation(this.program,`u_seed`),this.sessionSeed=Math.random()*1e4,this.createMapDataTexture();let i=new Float32Array([0,0,1,0,1,0,1,0,0,1,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1,0,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,0,0,2,0,0,1,2,0,1,0,2,0,1,0,2,0,0,1,2,0,1,1,2,1,1,0,3,1,1,1,3,0,1,0,3,0,1,0,3,1,1,1,3,0,1,1,3,0,1,0,4,0,1,1,4,0,0,0,4,0,0,0,4,0,1,1,4,0,0,1,4,0,0,0,5,0,1,0,5,1,0,0,5,1,0,0,5,0,1,0,5,1,1,0,5]),a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,i,e.STATIC_DRAW),this.cubeBuffer=a;let o=new Float32Array([0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0]),s=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW),this.floorBuffer=s;let c=e.createBuffer();if(!c)throw Error(`Failed to create instance buffer`);this.instanceBuffer=c,e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let l=e.createVertexArray();if(!l)throw Error(`Failed to create floor VAO`);this.floorVAO=l,e.bindVertexArray(l),e.bindBuffer(e.ARRAY_BUFFER,this.floorBuffer),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,16,0),e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,28,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,28,8),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,1,e.FLOAT,!1,28,16),e.vertexAttribDivisor(3,1),e.enableVertexAttribArray(4),e.vertexAttribPointer(4,1,e.FLOAT,!1,28,20),e.vertexAttribDivisor(4,1),e.enableVertexAttribArray(5),e.vertexAttribPointer(5,1,e.FLOAT,!1,28,24),e.vertexAttribDivisor(5,1),e.bindVertexArray(null);let u=e.createVertexArray();if(!u)throw Error(`Failed to create cube VAO`);this.cubeVAO=u,e.bindVertexArray(u),e.bindBuffer(e.ARRAY_BUFFER,this.cubeBuffer),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,16,0),e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,28,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,28,8),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,1,e.FLOAT,!1,28,16),e.vertexAttribDivisor(3,1),e.enableVertexAttribArray(4),e.vertexAttribPointer(4,1,e.FLOAT,!1,28,20),e.vertexAttribDivisor(4,1),e.enableVertexAttribArray(5),e.vertexAttribPointer(5,1,e.FLOAT,!1,28,24),e.vertexAttribDivisor(5,1),e.bindVertexArray(null),e.bindVertexArray(null)}setIsometricView(e,t){this.isoAngle=e,this.isoScale=t}render(e,t,n,r,i=0,a=0){let o=this.gl,s=e;if(!s||!s.set)return;let c=s.set.count;if(!c||c===0)return;let l=s.set.dense;if(!l)return;let u=0;for(let e=0;e<c;e++){let t=l[e];this.instanceData[u++]=s.px[t],this.instanceData[u++]=s.py[t],this.instanceData[u++]=s.width[t],this.instanceData[u++]=s.height[t],this.instanceData[u++]=0,this.instanceData[u++]=0,this.instanceData[u++]=0}o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,c*7)),o.bindVertexArray(this.floorVAO),o.drawArraysInstanced(o.TRIANGLES,0,6,c),o.bindVertexArray(null)}renderPlayer(e,t,n,r,i=0,a=0){let o=this.gl,s=e;if(!s||!s.active||!s.active[1])return;let c=s.height&&s.height[1]?s.height[1]*2:64,l=s.z?s.z[1]:0;this.instanceData[0]=s.px[1],this.instanceData[1]=s.py[1],this.instanceData[2]=s.width[1],this.instanceData[3]=s.height[1],this.instanceData[4]=c,this.instanceData[5]=s.rotation?s.rotation[1]:0,this.instanceData[6]=l,o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.uniform1i(this.renderModeLoc,1),o.uniform4f(this.entityColorLoc,1,0,0,1),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,7)),o.disable(o.CULL_FACE),o.bindVertexArray(this.cubeVAO),o.drawArraysInstanced(o.TRIANGLES,0,36,1),o.bindVertexArray(null)}createMapDataTexture(){let e=this.gl,t=e.createTexture();if(!t){console.error(`Failed to create map data texture`);return}let n=new Uint8Array(25600*4);for(let e=0;e<25600;e++){let t=e*2,i=e*4,a=r[t],o=r[t+1];n[i]=Math.floor(a/1024*255),n[i+1]=o>.5?255:0,n[i+2]=0,n[i+3]=255}e.bindTexture(e.TEXTURE_2D,t),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,160,160,0,e.RGBA,e.UNSIGNED_BYTE,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null),this.mapDataTexture=t}createShader(e,t){let n=this.gl,r=n.createShader(e);if(!r)throw Error(`Failed to create shader`);if(n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS)){let e=n.getShaderInfoLog(r);throw n.deleteShader(r),Error(`Shader compilation failed: ${e}`)}return r}createProgram(e,t){let n=this.gl,r=n.createProgram();if(!r)throw Error(`Failed to create WebGL program`);if(n.attachShader(r,e),n.attachShader(r,t),n.linkProgram(r),!n.getProgramParameter(r,n.LINK_STATUS)){let e=n.getProgramInfoLog(r);throw n.deleteProgram(r),Error(`Program link failed: ${e}`)}return r}renderFloor(e,t,n,r,i=0,a=0){let o=this.gl;e!==null&&(this.instanceData[0]=e.x,this.instanceData[1]=e.y,this.instanceData[2]=e.width,this.instanceData[3]=e.height,this.instanceData[4]=0,this.instanceData[5]=0,this.instanceData[6]=0,o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,7))),o.disable(o.CULL_FACE),o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.uniform1i(this.renderModeLoc,0),o.uniform1i(this.atlasTileCountLoc,32),o.uniform1f(this.tileSizePixelsLoc,64),o.uniform1f(this.worldTileSizeLoc,64),o.uniform1i(this.staticRangeStartLoc,0),o.uniform1i(this.staticRangeEndLoc,99),o.uniform1i(this.variationRangeStartLoc,100),o.uniform1i(this.variationRangeEndLoc,1023),o.uniform2f(this.mapDimensionsLoc,160,160),o.uniform1f(this.seedLoc,this.sessionSeed),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.activeTexture(o.TEXTURE1),this.mapDataTexture&&o.bindTexture(o.TEXTURE_2D,this.mapDataTexture),o.uniform1i(this.mapDataTextureLoc,1),o.bindVertexArray(this.floorVAO),o.drawArraysInstanced(o.TRIANGLES,0,6,1),o.bindVertexArray(null)}},g=class e{static async loadTexture(t,n){let r=await e.loadImage(n),i=t.createTexture();if(!i)throw Error(`Failed to create WebGL texture.`);return t.bindTexture(t.TEXTURE_2D,i),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),i}static loadImage(e){return new Promise((t,n)=>{let r=new Image;r.crossOrigin=`anonymous`,r.onload=()=>t(r),r.onerror=t=>n(Error(`Failed to load image at ${e}: ${t}`)),r.src=e})}},_=8,v=29,y=class{static saveWorld(e){let t=e,n=t.set.count,r=_+n*v,i=new ArrayBuffer(r),a=new DataView(i);a.setUint32(0,n,!0);let o=_,{dense:s}=t.set;for(let e=0;e<n;e++){let n=s[e];a.setFloat32(o+0,t.px[n],!0),a.setFloat32(o+4,t.py[n],!0),a.setFloat32(o+8,t.vx[n],!0),a.setFloat32(o+12,t.vy[n],!0),a.setFloat32(o+16,t.width[n],!0),a.setFloat32(o+20,t.height[n],!0),a.setFloat32(o+24,t.health[n],!0),a.setUint8(o+28,t.deadFlag[n]),o+=v}return i}static loadWorld(e,t){let n=new DataView(t),r=n.getUint32(0,!0),i=e;i.set.count=0;let a=_;for(let e=0;e<r;e++){let e=n.getFloat32(a+0,!0),t=n.getFloat32(a+4,!0),r=n.getFloat32(a+8,!0),o=n.getFloat32(a+12,!0),s=n.getFloat32(a+16,!0),c=n.getFloat32(a+20,!0),l=n.getFloat32(a+24,!0),u=n.getUint8(a+28),d=i.addEntity(e,t,s,c,l);i.vx[d]=r,i.vy[d]=o,i.deadFlag[d]=u,a+=v}}},b=class{static{this.STORAGE_PREFIX=`ecs_save_`}static{this.MAX_SLOTS=10}static getSaveSlots(){let e=[];for(let t=0;t<this.MAX_SLOTS;t++){let n=`${this.STORAGE_PREFIX}${t}`,r=localStorage.getItem(n);if(r)try{let n=JSON.parse(r),i=atob(n.data),a=new ArrayBuffer(i.length),o=new Uint8Array(a);for(let e=0;e<i.length;e++)o[e]=i.charCodeAt(e);e.push({id:t,name:n.name||`Save ${t+1}`,timestamp:n.timestamp||0,data:a})}catch(e){console.warn(`Failed to load save slot ${t}:`,e),localStorage.removeItem(n)}}return e.sort((e,t)=>t.timestamp-e.timestamp)}static saveToSlot(e,t,n){try{let r=y.saveWorld(e),i=String.fromCharCode(...new Uint8Array(r)),a=btoa(i),o={name:n||`Save ${t+1}`,timestamp:Date.now(),data:a};return localStorage.setItem(`${this.STORAGE_PREFIX}${t}`,JSON.stringify(o)),!0}catch(e){return console.error(`Failed to save to slot:`,e),!1}}static loadFromSlot(e){let t=`${this.STORAGE_PREFIX}${e}`,n=localStorage.getItem(t);if(!n)return null;try{let e=JSON.parse(n),t=atob(e.data),r=new ArrayBuffer(t.length),i=new Uint8Array(r);for(let e=0;e<t.length;e++)i[e]=t.charCodeAt(e);return r}catch(e){return console.error(`Failed to load from slot:`,e),localStorage.removeItem(t),null}}static deleteSlot(e){try{return localStorage.removeItem(`${this.STORAGE_PREFIX}${e}`),!0}catch(e){return console.error(`Failed to delete slot:`,e),!1}}static formatDate(e){return e?new Date(e).toLocaleString():`No date`}};function x(e,t,n){return e+(t-e)*n}function S(e,t,n){return e<t?t:e>n?n:e}var C=class{constructor(){this.x=0,this.y=0,this.zoom=1,this.rotation=0,this.target=null,this.smoothFactor=.1,this.lambda=-Math.log(.9),this.EPSILON=.01,this.offsetX=0,this.offsetY=0,this.viewportWidth=800,this.viewportHeight=600,this.mapWidth=u,this.mapHeight=d,this.isHalfWidth=64/2,this.isHalfHeight=64/4,this.viewProjectionMatrix=new Float32Array(16),this.viewMatrix=new Float32Array(16),this.projectionMatrix=new Float32Array(16),this.isMatrixDirty=!0}setTarget(e){this.target=e}setOffset(e,t){this.offsetX=e,this.offsetY=t,this.isMatrixDirty=!0}getOffset(){return{offsetX:this.offsetX,offsetY:this.offsetY}}clearTarget(){this.target=null}setSmoothFactor(e){this.smoothFactor=S(e,.01,1),this.lambda=-Math.log(1-this.smoothFactor)}getSmoothFactor(){return this.smoothFactor}setViewport(e,t){this.viewportWidth=e,this.viewportHeight=t,this.isMatrixDirty=!0}setMapBounds(e,t){this.mapWidth=e,this.mapHeight=t,this.isMatrixDirty=!0}update(e=1){if(!this.target)return!1;let t=this.target.x-this.viewportWidth/2+this.offsetX,n=this.target.y-this.viewportHeight/2+this.offsetY,r=t-this.x,i=n-this.y;if(Math.abs(r)<this.EPSILON&&Math.abs(i)<this.EPSILON)return this.x=t,this.y=n,this.isMatrixDirty=!1,!1;let a=1-Math.exp(-this.lambda*e);return this.x=x(this.x,t,a),this.y=x(this.y,n,a),this.isMatrixDirty=!0,!0}snapTo(e,t){this.x=e,this.y=t,this.isMatrixDirty=!0}snapToTarget(){this.target&&(this.x=this.target.x-this.viewportWidth/2+this.offsetX,this.y=this.target.y-this.viewportHeight/2+this.offsetY,this.isMatrixDirty=!0)}clampToBounds(){let e=Math.max(0,this.mapWidth-this.viewportWidth),t=Math.max(0,this.mapHeight-this.viewportHeight);this.x=S(this.x,0,e),this.y=S(this.y,0,t)}move(e,t){this.x+=e,this.y+=t,this.clampToBounds(),this.isMatrixDirty=!0}setZoom(e){this.zoom=S(e,.5,3),this.isMatrixDirty=!0}getZoom(){return this.zoom}setRotation(e){this.rotation=e}getX(){return this.x}getY(){return this.y}getState(){return{x:this.x,y:this.y,zoom:this.zoom,rotation:this.rotation}}worldToScreen(e,t,n){let r=n||{x:0,y:0};return r.x=e-this.x,r.y=t-this.y,r}screenToWorld(e,t,n){let r=n||{x:0,y:0};return r.x=e+this.x,r.y=t+this.y,r}tileToScreen(e,t){e*64,t*64;let n=(e-t)*this.isHalfWidth,r=(e+t)*this.isHalfHeight;return{x:n-this.x+this.viewportWidth/2,y:r-this.y+100}}isVisible(e,t,n=0){return e>=this.x-n&&e<=this.x+this.viewportWidth+n&&t>=this.y-n&&t<=this.y+this.viewportHeight+n}isTileVisible(e,t){let n=e*64,r=t*64;return this.isVisible(n,r,64)}getViewProjectionMatrix(){if(!this.isMatrixDirty)return this.viewProjectionMatrix;let e=this.x,t=this.x+this.viewportWidth,n=this.y,r=this.y+this.viewportHeight,i=1/(e-t),a=1/(r-n);return this.viewProjectionMatrix[0]=2*i,this.viewProjectionMatrix[1]=0,this.viewProjectionMatrix[2]=0,this.viewProjectionMatrix[3]=0,this.viewProjectionMatrix[4]=0,this.viewProjectionMatrix[5]=2*a,this.viewProjectionMatrix[6]=0,this.viewProjectionMatrix[7]=0,this.viewProjectionMatrix[8]=0,this.viewProjectionMatrix[9]=0,this.viewProjectionMatrix[10]=-1,this.viewProjectionMatrix[11]=0,this.viewProjectionMatrix[12]=(t+e)*i,this.viewProjectionMatrix[13]=(n+r)*a,this.viewProjectionMatrix[14]=0,this.viewProjectionMatrix[15]=1,this.isMatrixDirty=!1,this.viewProjectionMatrix}getViewMatrix(){return this.isMatrixDirty?(this.viewMatrix[0]=1,this.viewMatrix[1]=0,this.viewMatrix[2]=0,this.viewMatrix[3]=0,this.viewMatrix[4]=0,this.viewMatrix[5]=1,this.viewMatrix[6]=0,this.viewMatrix[7]=0,this.viewMatrix[8]=0,this.viewMatrix[9]=0,this.viewMatrix[10]=1,this.viewMatrix[11]=0,this.viewMatrix[12]=-this.x,this.viewMatrix[13]=-this.y,this.viewMatrix[14]=0,this.viewMatrix[15]=1,this.isMatrixDirty=!1,this.viewMatrix):this.viewMatrix}getProjectionMatrix(){if(!this.isMatrixDirty)return this.projectionMatrix;let e=this.viewportWidth,t=this.viewportHeight,n=1/(0-e),r=1/(t-0);return this.projectionMatrix[0]=2*n,this.projectionMatrix[1]=0,this.projectionMatrix[2]=0,this.projectionMatrix[3]=0,this.projectionMatrix[4]=0,this.projectionMatrix[5]=2*r,this.projectionMatrix[6]=0,this.projectionMatrix[7]=0,this.projectionMatrix[8]=0,this.projectionMatrix[9]=0,this.projectionMatrix[10]=-1,this.projectionMatrix[11]=0,this.projectionMatrix[12]=(e+0)*n,this.projectionMatrix[13]=(0+t)*r,this.projectionMatrix[14]=0,this.projectionMatrix[15]=1,this.isMatrixDirty=!1,this.projectionMatrix}getFrustumBounds(e=0){return{minX:this.x-e,minY:this.y-e,maxX:this.x+this.viewportWidth+e,maxY:this.y+this.viewportHeight+e}}getVisibleTileRange(){let e=this.getFrustumBounds(128);return{minCol:Math.max(0,Math.floor(e.minX/64)),minRow:Math.max(0,Math.floor(e.minY/64)),maxCol:Math.min(Math.ceil(this.mapWidth/64),Math.ceil(e.maxX/64)),maxRow:Math.min(Math.ceil(this.mapHeight/64),Math.ceil(e.maxY/64))}}};function w(e,t,n,r=.1,i=0,a=0){let o=new C;return o.setTarget(e),o.setViewport(t,n),o.setSmoothFactor(r),o.setOffset(i,a),o}var T=new s,E=!1,D=null,O=null,k=null,A=null,j=null,M=null,N=null,P=null,F=document.getElementById(`start-menu`),I=document.getElementById(`slots-container`),L=document.getElementById(`slots-overlay`),R=document.getElementById(`btn-start`),z=document.getElementById(`btn-settings`),B=document.getElementById(`btn-credits`),V=document.getElementById(`btn-close-slots`),H=document.getElementById(`link-1`),U=document.getElementById(`link-2`),W=document.getElementById(`link-3`),G=3,K=null;async function q(){if(j=document.getElementById(`canvas`),!j)throw Error(`Canvas not found`);j.width=window.innerWidth,j.height=window.innerHeight;let e=j.getContext(`webgl2`);if(!e)throw Error(`WebGL 2 is not supported.`);M=e,M.viewport(0,0,j.width,j.height),M.clearColor(.1,.1,.12,1),D=new f,N=new m,P=new p,O=new h(M,c),i(),console.log(`[Engine] Map generated, size:`,n.length,`tiles`);let t=u/2,r=d/2;D.active[1]=1,D.x[1]=t,D.y[1]=r,D.w[1]=32,D.h[1]=32,D.speed[1]=200,D.vx[1]=0,D.vy[1]=0,D.rotation[1]=0,D.set.count=1,D.set.dense[0]=1,O.setIsometricView(Math.PI/4,.5),k=w({x:D.x[1],y:D.y[1]},j.width,j.height,1,-320,-100),k.snapToTarget();try{A=await g.loadTexture(M,`src/atlas pictures/atlas floor.jpg`),console.log(`[Engine] Atlas texture loaded successfully`)}catch(e){console.warn(`[Engine] Failed to load atlas texture, using placeholder`,e),A=await g.loadTexture(M,`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`)}ne()}function J(){E=!0,F.classList.add(`hidden`),Z={}}function Y(){let e=document.getElementById(`slots-overlay`);I.innerHTML=``,e&&I.appendChild(e);for(let e=0;e<G;e++){let t=b.loadFromSlot(e),n=document.createElement(`div`);if(n.className=`save-slot`,t){let t=JSON.parse(localStorage.getItem(`ecs_save_${e}`)||`{}`),r=t.timestamp||0;n.classList.remove(`empty`);let i=document.createElement(`div`);i.className=`slot-info`;let a=document.createElement(`div`);a.className=`slot-name`,a.textContent=t.name||`Save ${e+1}`;let o=document.createElement(`div`);o.className=`slot-date`,o.textContent=b.formatDate(r),i.appendChild(a),i.appendChild(o);let s=document.createElement(`button`);s.className=`delete-btn`,s.textContent=`X`,s.addEventListener(`click`,t=>{t.stopPropagation(),b.deleteSlot(e),Y()}),n.appendChild(i),n.appendChild(s),n.addEventListener(`click`,()=>{let t=b.loadFromSlot(e);t&&D&&(y.loadWorld(D,t),K=e,console.log(`[UI] Loaded save slot ${e}`),J())})}else{n.classList.add(`empty`);let t=document.createElement(`div`);t.className=`slot-info`;let r=document.createElement(`div`);r.className=`slot-name`,r.textContent=`Empty Slot ${e+1}`;let i=document.createElement(`div`);i.className=`slot-date`,i.textContent=`Click to start New Game`,t.appendChild(r),t.appendChild(i),n.appendChild(t),n.addEventListener(`click`,()=>{K=e,X(),J()})}I.appendChild(n)}e&&I.appendChild(e)}function X(){if(O&&(O.sessionSeed=Math.random()*1e4),D){D=new f,i();let e=u/2,t=d/2;D.active[1]=1,D.x[1]=e,D.y[1]=t,D.w[1]=32,D.h[1]=32,D.speed[1]=200,D.vx[1]=0,D.vy[1]=0,D.rotation[1]=0,D.set.count=1,D.set.dense[0]=1,k&&(k.setTarget({x:e,y:t}),k.snapToTarget())}}var Z={},Q=0,$=performance.now();function ne(){$=performance.now(),Q=0;function e(t){if(!E||!D||!O||!k||!M||!j){requestAnimationFrame(e);return}let n=(t-$)/1e3;for($=t,Q+=Math.min(n,.25);Q>=l;)N.update(D,Z,l),P.update(D,l,1),Q-=l;k.setTarget({x:D.x[1],y:D.y[1]});let r=k.update(n);M.clear(M.COLOR_BUFFER_BIT);let i=k.getX(),a=k.getY();if(r||$===t){let e=T.getFloorData(i,a,j.width,j.height);O.renderFloor(e,j.width,j.height,A,i,a)}else O.renderFloor(null,j.width,j.height,A,i,a);O.renderPlayer(D,j.width,j.height,A,i,a),requestAnimationFrame(e)}requestAnimationFrame(e)}window.addEventListener(`keydown`,e=>{E&&(Z[e.key]=!0,e.ctrlKey&&(e.key===`s`||e.key===`S`)&&(e.preventDefault(),D&&K!==null&&(b.saveToSlot(D,K,`Save ${K+1}`),console.log(`[UI] Saved to slot ${K}!`))))}),window.addEventListener(`keyup`,e=>{E&&(Z[e.key]=!1)}),window.addEventListener(`resize`,()=>{!j||!M||!k||(j.width=window.innerWidth,j.height=window.innerHeight,M.viewport(0,0,j.width,j.height),k.setViewport(j.width,j.height))}),R.addEventListener(`click`,()=>{R.classList.add(`hidden`),z.parentElement&&z.parentElement.classList.add(`hidden`),L.classList.add(`active`),I.classList.add(`visible`),Y()}),V.addEventListener(`click`,()=>{L.classList.remove(`active`),I.classList.remove(`visible`),R.classList.remove(`hidden`),z.parentElement&&z.parentElement.classList.remove(`hidden`)}),z.addEventListener(`click`,()=>{console.log(`[UI] Settings button clicked`)}),B.addEventListener(`click`,()=>{console.log(`[UI] Credits button clicked`)}),H.addEventListener(`click`,e=>{e.preventDefault(),console.log(`[UI] Link 1 clicked`)}),U.addEventListener(`click`,e=>{e.preventDefault(),console.log(`[UI] Link 2 clicked`)}),W.addEventListener(`click`,e=>{e.preventDefault(),console.log(`[UI] Link 3 clicked`)}),I.classList.remove(`visible`),q().catch(console.error);