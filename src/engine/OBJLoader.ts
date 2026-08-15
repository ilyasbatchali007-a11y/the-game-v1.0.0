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
    
    // Parse original vertices and normals from file
    const filePositions: number[] = [];
    const fileNormals: number[] = [];
    const fileUvs: number[] = [];
    
    const lines = content.split('\n');
    
    // First pass: collect all positions, normals, UVs
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const parts = trimmed.split(/\s+/);
      const type = parts[0];
      
      switch (type) {
        case 'v': // Vertex position
          filePositions.push(parseFloat(parts[1]));
          filePositions.push(parseFloat(parts[2]));
          filePositions.push(parseFloat(parts[3]));
          break;
          
        case 'vn': // Vertex normal
          fileNormals.push(parseFloat(parts[1]));
          fileNormals.push(parseFloat(parts[2]));
          fileNormals.push(parseFloat(parts[3]));
          break;
          
        case 'vt': // Texture coordinate
          fileUvs.push(parseFloat(parts[1]));
          fileUvs.push(parseFloat(parts[2]));
          break;
      }
    }
    
    // If no normals in file, we'll compute them later
    const hasNormals = fileNormals.length > 0;
    
    // Temporary storage for face indices
    const cacheMap = new Map<string, number>();
    
    // Second pass: process faces
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const parts = trimmed.split(/\s+/);
      const type = parts[0];
      
      if (type !== 'f') continue;
      
      // Parse face vertices (supports v, v/vt, v/vt/vn, v//vn formats)
      const faceIndices: number[] = [];
      
      for (let i = 1; i < parts.length; i++) {
        const vertexStr = parts[i];
        
        // Check cache first
        let cachedIndex = cacheMap.get(vertexStr);
        if (cachedIndex !== undefined) {
          faceIndices.push(cachedIndex);
          continue;
        }
        
        // Parse vertex indices (OBJ uses 1-based indexing)
        const indices_str = vertexStr.split('/');
        const posIdx = parseInt(indices_str[0]) - 1;
        const uvIdx = indices_str[1] ? parseInt(indices_str[1]) - 1 : -1;
        const normIdx = indices_str[2] ? parseInt(indices_str[2]) - 1 : -1;
        
        // Add position
        positions.push(
          filePositions[posIdx * 3],
          filePositions[posIdx * 3 + 1],
          filePositions[posIdx * 3 + 2]
        );
        
        // Add UV if available
        if (uvIdx >= 0 && uvIdx * 2 < fileUvs.length) {
          uvs.push(fileUvs[uvIdx * 2], fileUvs[uvIdx * 2 + 1]);
        } else {
          uvs.push(0, 0);
        }
        
        // Add normal if available in file
        if (hasNormals && normIdx >= 0 && normIdx * 3 < fileNormals.length) {
          normals.push(
            fileNormals[normIdx * 3],
            fileNormals[normIdx * 3 + 1],
            fileNormals[normIdx * 3 + 2]
          );
        } else {
          // Will be computed later for flat shading
          normals.push(0, 0, 0);
        }
        
        // Cache the new index
        const newIndex = Math.floor(positions.length / 3) - 1;
        cacheMap.set(vertexStr, newIndex);
        faceIndices.push(newIndex);
      }
      
      // Triangulate face (handle quads or n-gons)
      for (let i = 1; i < faceIndices.length - 1; i++) {
        indices.push(faceIndices[0], faceIndices[i], faceIndices[i + 1]);
      }
    }
    
    // If no normals in file, compute face normals for flat shading
    if (!hasNormals) {
      this.computeFaceNormals(positions, normals, indices);
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
   * Compute face normals for flat shading when OBJ has no normals
   */
  private static computeFaceNormals(positions: number[], normals: number[], indices: number[]): void {
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
      
      // Get triangle vertices
      const ax = positions[i0];
      const ay = positions[i0 + 1];
      const az = positions[i0 + 2];
      
      const bx = positions[i1];
      const by = positions[i1 + 1];
      const bz = positions[i1 + 2];
      
      const cx = positions[i2];
      const cy = positions[i2 + 1];
      const cz = positions[i2 + 2];
      
      // Compute edge vectors
      const ex = bx - ax;
      const ey = by - ay;
      const ez = bz - az;
      
      const fx = cx - ax;
      const fy = cy - ay;
      const fz = cz - az;
      
      // Compute cross product (face normal)
      let nx = ey * fz - ez * fy;
      let ny = ez * fx - ex * fz;
      let nz = ex * fy - ey * fx;
      
      // Normalize
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len > 0) {
        nx /= len;
        ny /= len;
        nz /= len;
      }
      
      // Assign same normal to all three vertices of the triangle (flat shading)
      normals[i0] = nx;
      normals[i0 + 1] = ny;
      normals[i0 + 2] = nz;
      
      normals[i1] = nx;
      normals[i1 + 1] = ny;
      normals[i1 + 2] = nz;
      
      normals[i2] = nx;
      normals[i2 + 1] = ny;
      normals[i2 + 2] = nz;
    }
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
