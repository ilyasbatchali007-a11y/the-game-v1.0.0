// SRC/engine/dungeon-generator/OBJMeshExporter.ts
// Converts fused mesh data to OBJ format string for 3D model export

/**
 * Convert fused mesh data to OBJ format string
 */
export function meshToOBJ(
  vertices: Float32Array, 
  indices: Uint16Array, 
  mapId: string
): string {
  let obj = `# Dungeon Map: ${mapId}\n`;
  obj += `# Generated: ${new Date().toISOString()}\n`;
  obj += `# Vertices: ${vertices.length / 3}, Faces: ${indices.length / 3}\n\n`;

  // Write vertices
  for (let i = 0; i < vertices.length; i += 3) {
    obj += `v ${vertices[i].toFixed(6)} ${vertices[i + 1].toFixed(6)} ${vertices[i + 2].toFixed(6)}\n`;
  }

  obj += `\n# Faces\n`;

  // Write faces (OBJ uses 1-based indexing)
  for (let i = 0; i < indices.length; i += 3) {
    obj += `f ${indices[i] + 1} ${indices[i + 1] + 1} ${indices[i + 2] + 1}\n`;
  }

  return obj;
}
