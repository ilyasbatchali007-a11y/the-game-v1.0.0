// Script to regenerate dungeon with CSG fusion and export files
import { generateDungeon, DEFAULT_DUNGEON_CONFIG } from './src/engine/DungeonGenerator.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Regenerating dungeon with CSG fusion...');
console.log('Config:', DEFAULT_DUNGEON_CONFIG);

// Generate dungeon
const result = generateDungeon('dungeon_fixed', DEFAULT_DUNGEON_CONFIG);

console.log(`Generated ${result.blocks.length} blocks`);

// Write OBJ file
const objPath = path.join(__dirname, 'public', '3d-objects', 'dungeon.obj');
fs.writeFileSync(objPath, result.objContent);
console.log(`Written OBJ to ${objPath}`);

// Write JSON file
const jsonPath = path.join(__dirname, 'public', '3d-objects', 'dungeon_blocks.json');
fs.writeFileSync(jsonPath, JSON.stringify(result.blocks, null, 2));
console.log(`Written JSON to ${jsonPath}`);

// Also copy to src/3d-objects for source control
const srcObjPath = path.join(__dirname, 'src', '3d-objects', 'dungeon.obj');
const srcJsonPath = path.join(__dirname, 'src', '3d-objects', 'dungeon_blocks.json');
fs.writeFileSync(srcObjPath, result.objContent);
fs.writeFileSync(srcJsonPath, JSON.stringify(result.blocks, null, 2));
console.log(`Copied to src/3d-objects/`);

// Print stats
const vertexCount = result.objContent.split('\n').filter(l => l.startsWith('v ')).length;
const faceCount = result.objContent.split('\n').filter(l => l.startsWith('f ')).length;
console.log(`\nFinal mesh stats:`);
console.log(`  Vertices: ${vertexCount}`);
console.log(`  Faces: ${faceCount}`);
console.log(`  Blocks: ${result.blocks.length}`);
console.log(`  Reduction: ${100 - (vertexCount / 800 * 100).toFixed(1)}% vs non-CSG (800 vertices)`);
