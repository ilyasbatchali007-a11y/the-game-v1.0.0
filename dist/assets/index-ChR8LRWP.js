(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new Uint8Array(1024),t=new Float32Array(1024*2);function n(){e.fill(0);for(let n=0;n<32;n++)for(let r=0;r<32;r++){let i=n*32+r,a=i*2;n===0||n===31||r===0||r===31?(e[i]=2,t[a]=5,t[a+1]=1):(e[i]=0,t[a]=100,t[a+1]=0)}for(let n=1;n<31;n++){let r=512+n,i=r*2;e[r]=1,t[i]=10,t[i+1]=1}}function r(t,n){return t<0||t>=32||n<0||n>=32||e[n*32+t]===2}var i={width:2048,depth:2048,texturePath:`src/atlas pictures/atlas floor.jpg`,repeatX:32,repeatZ:32,useAtlas:!0,atlasTileCountX:32,atlasTileCountY:32,staticTileRangeStart:0,staticTileRangeEnd:99,variationTileRangeStart:100,variationTileRangeEnd:1023},a=class{constructor(e=i){this.floorConfig=e}getFloorData(e,t,n,r){return{x:0,y:0,width:this.floorConfig.width,height:this.floorConfig.depth,texturePath:this.floorConfig.texturePath,repeatX:this.floorConfig.repeatX,repeatZ:this.floorConfig.repeatZ}}getVisibleTileData(e,t,n,r){return{buffer:new Float32Array,count:0}}},o=65536,s=1/60,c=2048,l=2048,u=class{constructor(e=o){this.maxEntities=e,this.active=new Uint8Array(e),this.x=new Float32Array(e),this.y=new Float32Array(e),this.vx=new Float32Array(e),this.vy=new Float32Array(e),this.w=new Float32Array(e),this.h=new Float32Array(e),this.speed=new Float32Array(e),this.health=new Float32Array(e),this.deadFlag=new Uint8Array(e),this.rotation=new Float32Array(e),this.z=new Float32Array(e),this.vz=new Float32Array(e),this.grounded=new Uint8Array(e),this.px=this.x,this.py=this.y,this.width=this.w,this.height=this.h,this.set={count:0,dense:[]}}},d=class{update(e,t,n=0){if(!e.active[n])return;let r=e.vx[n]??0,i=e.vy[n]??0,a=this.moveAndSlide(e.x[n],e.y[n],r,i,e.w[n]||32,e.h[n]||32,t);e.x[n]=a.x,e.y[n]=a.y}moveAndSlide(e,t,n,i,a,o,s){let u=e+n*s,d=t+i*s;u=Math.max(0,Math.min(u,c-a)),d=Math.max(0,Math.min(d,l-o));let f=[{x:u+1,y:d+1},{x:u+a-1,y:d+1},{x:u+1,y:d+o-1},{x:u+a-1,y:d+o-1}],p=!1;for(let e of f)if(r(Math.floor(e.x/64),Math.floor(e.y/64))){p=!0;break}if(p){let n=!0,i=[{x:u+1,y:t+1},{x:u+a-1,y:t+1},{x:u+1,y:t+o-1},{x:u+a-1,y:t+o-1}];for(let e of i)if(r(Math.floor(e.x/64),Math.floor(e.y/64))){n=!1;break}if(n)return{x:u,y:t};let s=!0,c=[{x:e+1,y:d+1},{x:e+a-1,y:d+1},{x:e+1,y:d+o-1},{x:e+a-1,y:d+o-1}];for(let e of c)if(r(Math.floor(e.x/64),Math.floor(e.y/64))){s=!1;break}return s?{x:e,y:d}:{x:e,y:t}}return{x:u,y:d}}},f=class{constructor(){this.collisionSystem=new d,this.ROTATION_SPEED=5}update(e,t,n){let r=e;if(!r.active||!r.active[1])return;let i=0,a=0;(t.w||t.W||t.ArrowUp||t.arrowup)&&--a,(t.s||t.S||t.ArrowDown||t.arrowdown)&&(a+=1),(t.a||t.A||t.ArrowLeft||t.arrowleft)&&--i,(t.d||t.D||t.ArrowRight||t.arrowright)&&(i+=1);let o=Math.hypot(i,a);if(o>0&&(i/=o,a/=o,r.rotation)){let e=Math.atan2(a,i),t=r.rotation[1]||0,o=e-t;for(;o>Math.PI;)o-=2*Math.PI;for(;o<-Math.PI;)o+=2*Math.PI;let s=this.ROTATION_SPEED*n,c=Math.max(-s,Math.min(s,o));r.rotation[1]=t+c}let s=r.speed?r.speed[1]:200,c=i*s,l=a*s;r.vx&&(r.vx[1]=c),r.vy&&(r.vy[1]=l);let u=r.x?r.x[1]:0,d=r.y?r.y[1]:0,f=r.w?r.w[1]:32,p=r.h?r.h[1]:32,m=this.collisionSystem.moveAndSlide(u,d,c,l,f,p,n);r.x&&(r.x[1]=m.x),r.y&&(r.y[1]=m.y)}},p=`#version 300 es
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
`,m=`#version 300 es
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

out vec4 fragColor;

// Hash function for deterministic random selection based on tile coordinates
float hash(vec2 p) {
  vec3 p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
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
      // Variation tile: use hash to select random tile from variation range
      float hashVal = hash(vec2(tileX, tileY));
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
    
    // Final UV: base tile position + local position within tile
    vec2 finalUV = vec2(baseU + localX * tileUVSize, baseV + localY * tileUVSize);
    
    // Sample the atlas texture
    fragColor = texture(u_texture, finalUV);
  }
}
`,h=class{constructor(e,t){this.mapDataTexture=null,this.isoAngle=Math.PI/4,this.isoScale=.5,this.cameraOffsetX=0,this.cameraOffsetY=0,this.gl=e,this.instanceData=new Float32Array(t*7);let n=this.createShader(e.VERTEX_SHADER,p),r=this.createShader(e.FRAGMENT_SHADER,m);this.program=this.createProgram(n,r),this.resolutionLoc=e.getUniformLocation(this.program,`u_resolution`),this.isoAngleLoc=e.getUniformLocation(this.program,`u_isoAngle`),this.isoScaleLoc=e.getUniformLocation(this.program,`u_isoScale`),this.cameraOffsetLoc=e.getUniformLocation(this.program,`u_cameraOffset`),this.renderModeLoc=e.getUniformLocation(this.program,`u_renderMode`),this.entityColorLoc=e.getUniformLocation(this.program,`u_entityColor`),this.atlasTileCountLoc=e.getUniformLocation(this.program,`u_atlasTileCount`),this.tileSizePixelsLoc=e.getUniformLocation(this.program,`u_tileSizePixels`),this.worldTileSizeLoc=e.getUniformLocation(this.program,`u_worldTileSize`),this.staticRangeStartLoc=e.getUniformLocation(this.program,`u_staticRangeStart`),this.staticRangeEndLoc=e.getUniformLocation(this.program,`u_staticRangeEnd`),this.variationRangeStartLoc=e.getUniformLocation(this.program,`u_variationRangeStart`),this.variationRangeEndLoc=e.getUniformLocation(this.program,`u_variationRangeEnd`),this.mapDataTextureLoc=e.getUniformLocation(this.program,`u_mapDataTexture`),this.mapDimensionsLoc=e.getUniformLocation(this.program,`u_mapDimensions`),this.createMapDataTexture();let i=new Float32Array([0,0,1,0,1,0,1,0,0,1,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1,0,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,0,0,2,0,0,1,2,0,1,0,2,0,1,0,2,0,0,1,2,0,1,1,2,1,1,0,3,1,1,1,3,0,1,0,3,0,1,0,3,1,1,1,3,0,1,1,3,0,1,0,4,0,1,1,4,0,0,0,4,0,0,0,4,0,1,1,4,0,0,1,4,0,0,0,5,0,1,0,5,1,0,0,5,1,0,0,5,0,1,0,5,1,1,0,5]),a=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,i,e.STATIC_DRAW),this.cubeBuffer=a;let o=new Float32Array([0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0]),s=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,o,e.STATIC_DRAW),this.floorBuffer=s;let c=e.createBuffer();if(!c)throw Error(`Failed to create instance buffer`);this.instanceBuffer=c,e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.bufferData(e.ARRAY_BUFFER,this.instanceData.byteLength,e.DYNAMIC_DRAW);let l=e.createVertexArray();if(!l)throw Error(`Failed to create floor VAO`);this.floorVAO=l,e.bindVertexArray(l),e.bindBuffer(e.ARRAY_BUFFER,this.floorBuffer),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,16,0),e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,28,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,28,8),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,1,e.FLOAT,!1,28,16),e.vertexAttribDivisor(3,1),e.enableVertexAttribArray(4),e.vertexAttribPointer(4,1,e.FLOAT,!1,28,20),e.vertexAttribDivisor(4,1),e.enableVertexAttribArray(5),e.vertexAttribPointer(5,1,e.FLOAT,!1,28,24),e.vertexAttribDivisor(5,1),e.bindVertexArray(null);let u=e.createVertexArray();if(!u)throw Error(`Failed to create cube VAO`);this.cubeVAO=u,e.bindVertexArray(u),e.bindBuffer(e.ARRAY_BUFFER,this.cubeBuffer),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,4,e.FLOAT,!1,16,0),e.bindBuffer(e.ARRAY_BUFFER,this.instanceBuffer),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,28,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,28,8),e.vertexAttribDivisor(2,1),e.enableVertexAttribArray(3),e.vertexAttribPointer(3,1,e.FLOAT,!1,28,16),e.vertexAttribDivisor(3,1),e.enableVertexAttribArray(4),e.vertexAttribPointer(4,1,e.FLOAT,!1,28,20),e.vertexAttribDivisor(4,1),e.enableVertexAttribArray(5),e.vertexAttribPointer(5,1,e.FLOAT,!1,28,24),e.vertexAttribDivisor(5,1),e.bindVertexArray(null),e.bindVertexArray(null)}setIsometricView(e,t){this.isoAngle=e,this.isoScale=t}render(e,t,n,r,i=0,a=0){let o=this.gl,s=e;if(!s||!s.set)return;let c=s.set.count;if(!c||c===0)return;let l=s.set.dense;if(!l)return;let u=0;for(let e=0;e<c;e++){let t=l[e];this.instanceData[u++]=s.px[t],this.instanceData[u++]=s.py[t],this.instanceData[u++]=s.width[t],this.instanceData[u++]=s.height[t],this.instanceData[u++]=0,this.instanceData[u++]=0,this.instanceData[u++]=0}o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,c*7)),o.bindVertexArray(this.floorVAO),o.drawArraysInstanced(o.TRIANGLES,0,6,c),o.bindVertexArray(null)}renderPlayer(e,t,n,r,i=0,a=0){let o=this.gl,s=e;if(!s||!s.active||!s.active[1])return;let c=s.height&&s.height[1]?s.height[1]*2:64,l=s.z?s.z[1]:0;this.instanceData[0]=s.px[1],this.instanceData[1]=s.py[1],this.instanceData[2]=s.width[1],this.instanceData[3]=s.height[1],this.instanceData[4]=c,this.instanceData[5]=s.rotation?s.rotation[1]:0,this.instanceData[6]=l,o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.uniform1i(this.renderModeLoc,1),o.uniform4f(this.entityColorLoc,1,0,0,1),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,7)),o.disable(o.CULL_FACE),o.bindVertexArray(this.cubeVAO),o.drawArraysInstanced(o.TRIANGLES,0,36,1),o.bindVertexArray(null)}createMapDataTexture(){let e=this.gl,n=e.createTexture();if(!n){console.error(`Failed to create map data texture`);return}let r=new Uint8Array(1024*4);for(let e=0;e<1024;e++){let n=e*2,i=e*4,a=t[n],o=t[n+1];r[i]=Math.floor(a/1024*255),r[i+1]=o>.5?255:0,r[i+2]=0,r[i+3]=255}e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,32,32,0,e.RGBA,e.UNSIGNED_BYTE,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,null),this.mapDataTexture=n}createShader(e,t){let n=this.gl,r=n.createShader(e);if(!r)throw Error(`Failed to create shader`);if(n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS)){let e=n.getShaderInfoLog(r);throw n.deleteShader(r),Error(`Shader compilation failed: ${e}`)}return r}createProgram(e,t){let n=this.gl,r=n.createProgram();if(!r)throw Error(`Failed to create WebGL program`);if(n.attachShader(r,e),n.attachShader(r,t),n.linkProgram(r),!n.getProgramParameter(r,n.LINK_STATUS)){let e=n.getProgramInfoLog(r);throw n.deleteProgram(r),Error(`Program link failed: ${e}`)}return r}renderFloor(e,t,n,r,i=0,a=0){let o=this.gl;e!==null&&(this.instanceData[0]=e.x,this.instanceData[1]=e.y,this.instanceData[2]=e.width,this.instanceData[3]=e.height,this.instanceData[4]=0,this.instanceData[5]=0,this.instanceData[6]=0,o.bindBuffer(o.ARRAY_BUFFER,this.instanceBuffer),o.bufferSubData(o.ARRAY_BUFFER,0,this.instanceData.subarray(0,7))),o.disable(o.CULL_FACE),o.useProgram(this.program),o.uniform2f(this.resolutionLoc,t,n),o.uniform1f(this.isoAngleLoc,this.isoAngle),o.uniform1f(this.isoScaleLoc,this.isoScale),o.uniform2f(this.cameraOffsetLoc,i,a),o.uniform1i(this.renderModeLoc,0),o.uniform1i(this.atlasTileCountLoc,32),o.uniform1f(this.tileSizePixelsLoc,64),o.uniform1f(this.worldTileSizeLoc,64),o.uniform1i(this.staticRangeStartLoc,0),o.uniform1i(this.staticRangeEndLoc,99),o.uniform1i(this.variationRangeStartLoc,100),o.uniform1i(this.variationRangeEndLoc,1023),o.uniform2f(this.mapDimensionsLoc,32,32),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,r),o.activeTexture(o.TEXTURE1),this.mapDataTexture&&o.bindTexture(o.TEXTURE_2D,this.mapDataTexture),o.uniform1i(this.mapDataTextureLoc,1),o.bindVertexArray(this.floorVAO),o.drawArraysInstanced(o.TRIANGLES,0,6,1),o.bindVertexArray(null)}},g=class e{static async loadTexture(t,n){let r=await e.loadImage(n),i=t.createTexture();if(!i)throw Error(`Failed to create WebGL texture.`);return t.bindTexture(t.TEXTURE_2D,i),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,r),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),i}static loadImage(e){return new Promise((t,n)=>{let r=new Image;r.crossOrigin=`anonymous`,r.onload=()=>t(r),r.onerror=t=>n(Error(`Failed to load image at ${e}: ${t}`)),r.src=e})}},_=8,v=29,y=class{static saveWorld(e){let t=e,n=t.set.count,r=_+n*v,i=new ArrayBuffer(r),a=new DataView(i);a.setUint32(0,n,!0);let o=_,{dense:s}=t.set;for(let e=0;e<n;e++){let n=s[e];a.setFloat32(o+0,t.px[n],!0),a.setFloat32(o+4,t.py[n],!0),a.setFloat32(o+8,t.vx[n],!0),a.setFloat32(o+12,t.vy[n],!0),a.setFloat32(o+16,t.width[n],!0),a.setFloat32(o+20,t.height[n],!0),a.setFloat32(o+24,t.health[n],!0),a.setUint8(o+28,t.deadFlag[n]),o+=v}return i}static loadWorld(e,t){let n=new DataView(t),r=n.getUint32(0,!0),i=e;i.set.count=0;let a=_;for(let e=0;e<r;e++){let e=n.getFloat32(a+0,!0),t=n.getFloat32(a+4,!0),r=n.getFloat32(a+8,!0),o=n.getFloat32(a+12,!0),s=n.getFloat32(a+16,!0),c=n.getFloat32(a+20,!0),l=n.getFloat32(a+24,!0),u=n.getUint8(a+28),d=i.addEntity(e,t,s,c,l);i.vx[d]=r,i.vy[d]=o,i.deadFlag[d]=u,a+=v}}};function b(e,t,n){return e+(t-e)*n}function x(e,t,n){return e<t?t:e>n?n:e}var S=class{constructor(){this.x=0,this.y=0,this.zoom=1,this.rotation=0,this.target=null,this.smoothFactor=.1,this.lambda=-Math.log(.9),this.EPSILON=.01,this.offsetX=0,this.offsetY=0,this.viewportWidth=800,this.viewportHeight=600,this.mapWidth=c,this.mapHeight=l,this.isHalfWidth=64/2,this.isHalfHeight=64/4,this.viewProjectionMatrix=new Float32Array(16),this.viewMatrix=new Float32Array(16),this.projectionMatrix=new Float32Array(16),this.isMatrixDirty=!0}setTarget(e){this.target=e}setOffset(e,t){this.offsetX=e,this.offsetY=t,this.isMatrixDirty=!0}getOffset(){return{offsetX:this.offsetX,offsetY:this.offsetY}}clearTarget(){this.target=null}setSmoothFactor(e){this.smoothFactor=x(e,.01,1),this.lambda=-Math.log(1-this.smoothFactor)}getSmoothFactor(){return this.smoothFactor}setViewport(e,t){this.viewportWidth=e,this.viewportHeight=t,this.isMatrixDirty=!0}setMapBounds(e,t){this.mapWidth=e,this.mapHeight=t,this.isMatrixDirty=!0}update(e=1){if(!this.target)return!1;let t=this.target.x-this.viewportWidth/2+this.offsetX,n=this.target.y-this.viewportHeight/2+this.offsetY,r=t-this.x,i=n-this.y;if(Math.abs(r)<this.EPSILON&&Math.abs(i)<this.EPSILON)return this.x=t,this.y=n,this.isMatrixDirty=!1,!1;let a=1-Math.exp(-this.lambda*e);return this.x=b(this.x,t,a),this.y=b(this.y,n,a),this.isMatrixDirty=!0,!0}snapTo(e,t){this.x=e,this.y=t,this.isMatrixDirty=!0}snapToTarget(){this.target&&(this.x=this.target.x-this.viewportWidth/2+this.offsetX,this.y=this.target.y-this.viewportHeight/2+this.offsetY,this.isMatrixDirty=!0)}clampToBounds(){let e=Math.max(0,this.mapWidth-this.viewportWidth),t=Math.max(0,this.mapHeight-this.viewportHeight);this.x=x(this.x,0,e),this.y=x(this.y,0,t)}move(e,t){this.x+=e,this.y+=t,this.clampToBounds(),this.isMatrixDirty=!0}setZoom(e){this.zoom=x(e,.5,3),this.isMatrixDirty=!0}getZoom(){return this.zoom}setRotation(e){this.rotation=e}getX(){return this.x}getY(){return this.y}getState(){return{x:this.x,y:this.y,zoom:this.zoom,rotation:this.rotation}}worldToScreen(e,t,n){let r=n||{x:0,y:0};return r.x=e-this.x,r.y=t-this.y,r}screenToWorld(e,t,n){let r=n||{x:0,y:0};return r.x=e+this.x,r.y=t+this.y,r}tileToScreen(e,t){e*64,t*64;let n=(e-t)*this.isHalfWidth,r=(e+t)*this.isHalfHeight;return{x:n-this.x+this.viewportWidth/2,y:r-this.y+100}}isVisible(e,t,n=0){return e>=this.x-n&&e<=this.x+this.viewportWidth+n&&t>=this.y-n&&t<=this.y+this.viewportHeight+n}isTileVisible(e,t){let n=e*64,r=t*64;return this.isVisible(n,r,64)}getViewProjectionMatrix(){if(!this.isMatrixDirty)return this.viewProjectionMatrix;let e=this.x,t=this.x+this.viewportWidth,n=this.y,r=this.y+this.viewportHeight,i=1/(e-t),a=1/(r-n);return this.viewProjectionMatrix[0]=2*i,this.viewProjectionMatrix[1]=0,this.viewProjectionMatrix[2]=0,this.viewProjectionMatrix[3]=0,this.viewProjectionMatrix[4]=0,this.viewProjectionMatrix[5]=2*a,this.viewProjectionMatrix[6]=0,this.viewProjectionMatrix[7]=0,this.viewProjectionMatrix[8]=0,this.viewProjectionMatrix[9]=0,this.viewProjectionMatrix[10]=-1,this.viewProjectionMatrix[11]=0,this.viewProjectionMatrix[12]=(t+e)*i,this.viewProjectionMatrix[13]=(n+r)*a,this.viewProjectionMatrix[14]=0,this.viewProjectionMatrix[15]=1,this.isMatrixDirty=!1,this.viewProjectionMatrix}getViewMatrix(){return this.isMatrixDirty?(this.viewMatrix[0]=1,this.viewMatrix[1]=0,this.viewMatrix[2]=0,this.viewMatrix[3]=0,this.viewMatrix[4]=0,this.viewMatrix[5]=1,this.viewMatrix[6]=0,this.viewMatrix[7]=0,this.viewMatrix[8]=0,this.viewMatrix[9]=0,this.viewMatrix[10]=1,this.viewMatrix[11]=0,this.viewMatrix[12]=-this.x,this.viewMatrix[13]=-this.y,this.viewMatrix[14]=0,this.viewMatrix[15]=1,this.isMatrixDirty=!1,this.viewMatrix):this.viewMatrix}getProjectionMatrix(){if(!this.isMatrixDirty)return this.projectionMatrix;let e=this.viewportWidth,t=this.viewportHeight,n=1/(0-e),r=1/(t-0);return this.projectionMatrix[0]=2*n,this.projectionMatrix[1]=0,this.projectionMatrix[2]=0,this.projectionMatrix[3]=0,this.projectionMatrix[4]=0,this.projectionMatrix[5]=2*r,this.projectionMatrix[6]=0,this.projectionMatrix[7]=0,this.projectionMatrix[8]=0,this.projectionMatrix[9]=0,this.projectionMatrix[10]=-1,this.projectionMatrix[11]=0,this.projectionMatrix[12]=(e+0)*n,this.projectionMatrix[13]=(0+t)*r,this.projectionMatrix[14]=0,this.projectionMatrix[15]=1,this.isMatrixDirty=!1,this.projectionMatrix}getFrustumBounds(e=0){return{minX:this.x-e,minY:this.y-e,maxX:this.x+this.viewportWidth+e,maxY:this.y+this.viewportHeight+e}}getVisibleTileRange(){let e=this.getFrustumBounds(128);return{minCol:Math.max(0,Math.floor(e.minX/64)),minRow:Math.max(0,Math.floor(e.minY/64)),maxCol:Math.min(Math.ceil(this.mapWidth/64),Math.ceil(e.maxX/64)),maxRow:Math.min(Math.ceil(this.mapHeight/64),Math.ceil(e.maxY/64))}}};function C(e,t,n,r=.1,i=0,a=0){let o=new S;return o.setTarget(e),o.setViewport(t,n),o.setSmoothFactor(r),o.setOffset(i,a),o}var w=new a;async function T(){let t=document.getElementById(`canvas`);if(!t)throw Error(`Canvas not found`);t.width=window.innerWidth,t.height=window.innerHeight;let r=t.getContext(`webgl2`);if(!r)throw Error(`WebGL 2 is not supported.`);let i=r;i.viewport(0,0,t.width,t.height),i.clearColor(.1,.1,.12,1);let a=new u,p=new f,m=new d,_=new h(i,o);n(),console.log(`[Engine] Map generated, size:`,e.length,`tiles`);let v=c/2,b=l/2;a.active[1]=1,a.x[1]=v,a.y[1]=b,a.w[1]=32,a.h[1]=32,a.speed[1]=200,a.vx[1]=0,a.vy[1]=0,a.rotation[1]=0,a.set.count=1,a.set.dense[0]=1,_.setIsometricView(Math.PI/4,.5);let x=C({x:a.x[1],y:a.y[1]},t.width,t.height,1,-320,-100);x.snapToTarget();let S;try{S=await g.loadTexture(i,`src/atlas pictures/atlas floor.jpg`),console.log(`[Engine] Atlas texture loaded successfully`)}catch(e){console.warn(`[Engine] Failed to load atlas texture, using placeholder`,e),S=await g.loadTexture(i,`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`)}let T={};window.addEventListener(`keydown`,e=>{T[e.key]=!0}),window.addEventListener(`keyup`,e=>{T[e.key]=!1});let E=0,D=performance.now();function O(e){let n=(e-D)/1e3;for(D=e,E+=Math.min(n,.25);E>=s;)p.update(a,T,s),m.update(a,s,1),E-=s;x.setTarget({x:a.x[1],y:a.y[1]});let r=x.update(n);i.clear(i.COLOR_BUFFER_BIT);let o=x.getX(),c=x.getY();if(r||D===e){let e=w.getFloorData(o,c,t.width,t.height);_.renderFloor(e,t.width,t.height,S,o,c)}else _.renderFloor(null,t.width,t.height,S,o,c);_.renderPlayer(a,t.width,t.height,S,o,c),requestAnimationFrame(O)}let k=null;window.addEventListener(`keydown`,e=>{e.key===`s`||e.key===`S`?(k=y.saveWorld(a),console.log(`[Engine] World saved! Binary size: ${k.byteLength} bytes`)):(e.key===`l`||e.key===`L`)&&(k?(y.loadWorld(a,k),console.log(`[Engine] World state restored from binary buffer!`)):console.warn(`[Engine] No save data found! Press S to save first.`))}),window.addEventListener(`resize`,()=>{t.width=window.innerWidth,t.height=window.innerHeight,i.viewport(0,0,t.width,t.height),x.setViewport(t.width,t.height)}),requestAnimationFrame(O)}T().catch(console.error);