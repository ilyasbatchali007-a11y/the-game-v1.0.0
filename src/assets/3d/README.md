# 3D Assets Directory

Place your 3D model files (e.g., `.obj`, `.gltf`, `.glb`) in this directory.

## Supported Formats
- **.obj**: Wavefront OBJ files (ensure accompanying `.mtl` and texture files are included if needed)
- **.gltf / .glb**: GL Transmission Format (preferred for web performance)
- **.fbx**: Filmbox (may require conversion for some loaders)

## Usage Example
Once you add your map model here (e.g., `building_map.glb`), you can load it in your code like this:

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/src/assets/3d/building_map.glb', (gltf) => {
    const model = gltf.scene;
    // Add x-ray material, floor logic, and red dot markers here
    scene.add(model);
});
```

## Next Steps
1. Add your 3D building/map file to this folder.
2. We will implement the X-ray shader/material.
3. Define floor bounding boxes for the red dot indicators.
4. Sync with existing floor logic.
