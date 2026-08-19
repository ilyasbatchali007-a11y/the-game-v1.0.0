/**
 * Window resize handler for canvas and camera viewport
 */

import { Camera } from '../../engine/Camera';

/**
 * Handle window resize events to update canvas and camera
 */
export function handleWindowResize(
  canvas: HTMLCanvasElement | null,
  ctx: WebGL2RenderingContext | null,
  camera: Camera | null
): void {
  if (!canvas || !ctx || !camera) return;
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.viewport(0, 0, canvas.width, canvas.height);
  camera.setViewport(canvas.width, canvas.height);
}
