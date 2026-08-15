// SRC/engine/OBJLoader.ts
// Simple OBJ file parser for loading 3D models

export interface OBJModel {
  vertices: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
  vertexCount: number;
}

export class OBJLoader {
  /**
   * Parse OBJ file content and extract geometry data
   */
  public static parseOBJ(content: string): OBJModel {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Temporary storage for face indices
    const posCache: [number, number, number][] = [];
    const cacheMap = new Map<string, number>();
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const parts = trimmed.split(/\s+/);
      const type = parts[0];
      
      switch (type) {
        case 'v': // Vertex position
          positions.push(parseFloat(parts[1]));
          positions.push(parseFloat(parts[2]));
          positions.push(parseFloat(parts[3]));
          break;
          
        case 'vn': // Vertex normal
          normals.push(parseFloat(parts[1]));
          normals.push(parseFloat(parts[2]));
          normals.push(parseFloat(parts[3]));
          break;
          
        case 'vt': // Texture coordinate
          uvs.push(parseFloat(parts[1]));
          uvs.push(parseFloat(parts[2]));
          break;
          
        case 'f': // Face
          // Parse face vertices (supports v, v/vt, v/vt/vn, v//vn formats)
          for (let i = 1; i < parts.length; i++) {
            const vertexStr = parts[i];
            
            // Check cache first
            let cachedIndex = cacheMap.get(vertexStr);
            if (cachedIndex !== undefined) {
              indices.push(cachedIndex);
              continue;
            }
            
            // Parse vertex indices (OBJ uses 1-based indexing)
            const indices_str = vertexStr.split('/');
            const posIdx = parseInt(indices_str[0]) - 1;
            const uvIdx = indices_str[1] ? parseInt(indices_str[1]) - 1 : -1;
            const normIdx = indices_str[2] ? parseInt(indices_str[2]) - 1 : -1;
            
            // Add position
            positions.push(
              positions[posIdx * 3],
              positions[posIdx * 3 + 1],
              positions[posIdx * 3 + 2]
            );
            
            // Add UV if available
            if (uvIdx >= 0 && uvIdx * 2 < uvs.length) {
              uvs.push(uvs[uvIdx * 2], uvs[uvIdx * 2 + 1]);
            } else {
              uvs.push(0, 0);
            }
            
            // Add normal if available
            if (normIdx >= 0 && normIdx * 3 < normals.length) {
              normals.push(
                normals[normIdx * 3],
                normals[normIdx * 3 + 1],
                normals[normIdx * 3 + 2]
              );
            } else {
              normals.push(0, 1, 0); // Default up normal
            }
            
            // Cache the new index
            const newIndex = Math.floor(positions.length / 3) - 1;
            cacheMap.set(vertexStr, newIndex);
            indices.push(newIndex);
          }
          break;
      }
    }
    
    return {
      vertices: new Float32Array(positions),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      indices: new Uint16Array(indices),
      vertexCount: Math.floor(positions.length / 3)
    };
  }
  
  /**
   * Load OBJ file from URL and parse it
   */
  public static async loadFromURL(url: string): Promise<OBJModel> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load OBJ file: ${response.statusText}`);
    }
    const content = await response.text();
    return this.parseOBJ(content);
  }
}
