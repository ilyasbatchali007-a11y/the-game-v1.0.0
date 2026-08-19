// SRC/engine/MapInputHandler.ts
// Handles mouse and touch input for 3D map camera control

export interface MapCameraState {
  rotationX: number;
  rotationY: number;
  zoom: number;
  isDragging: boolean;
}

export type CameraChangeCallback = (state: MapCameraState) => void;

/**
 * Handles user input for controlling the 3D map camera
 * Supports mouse drag, scroll wheel, and touch gestures
 */
export class MapInputHandler {
  private canvas: HTMLCanvasElement;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private lastTouchY: number = 0; // For pinch zoom tracking
  
  // Camera state
  private rotationX: number = 0.3;
  private rotationY: number = 0;
  private zoom: number = -1.80;
  private readonly minZoom: number = -20.0;
  private readonly maxZoom: number = 5.0;
  
  // Callbacks
  private onChangeCallback: CameraChangeCallback | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  private handleMouseDown = (e: MouseEvent): void => {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;

    this.rotationY += deltaX * 0.01;
    this.rotationX += deltaY * 0.01;

    // Clamp vertical rotation to avoid flipping
    this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX));

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    
    this.notifyChange();
  };

  private handleMouseUp = (): void => {
    this.isDragging = false;
  };

  private handleMouseLeave = (): void => {
    this.isDragging = false;
  };

  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.5 : -0.5;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta));
    this.notifyChange();
  };

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // Pinch to zoom - track initial distance
      this.lastTouchY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length === 1 && this.isDragging) {
      const deltaX = e.touches[0].clientX - this.lastMouseX;
      const deltaY = e.touches[0].clientY - this.lastMouseY;

      this.rotationY += deltaX * 0.01;
      this.rotationX += deltaY * 0.01;
      this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX));

      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
      
      this.notifyChange();
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const currentDist = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
      const delta = this.lastTouchY - currentDist;

      if (this.lastTouchY > 0) {
        const zoomSpeed = 0.01;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta * zoomSpeed));
        this.lastTouchY = currentDist;
        this.notifyChange();
      }
    }
  };

  private handleTouchEnd = (): void => {
    this.isDragging = false;
  };

  /**
   * Register callback for camera state changes
   */
  setOnChangeCallback(callback: CameraChangeCallback): void {
    this.onChangeCallback = callback;
  }

  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback(this.getCameraState());
    }
  }

  /**
   * Get current camera state
   */
  getCameraState(): MapCameraState {
    return {
      rotationX: this.rotationX,
      rotationY: this.rotationY,
      zoom: this.zoom,
      isDragging: this.isDragging
    };
  }

  /**
   * Set camera state directly (for programmatic control)
   */
  setCameraState(state: Partial<MapCameraState>): void {
    if (state.rotationX !== undefined) {
      this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.rotationX));
    }
    if (state.rotationY !== undefined) {
      this.rotationY = state.rotationY;
    }
    if (state.zoom !== undefined) {
      this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, state.zoom));
    }
    if (state.isDragging !== undefined) {
      this.isDragging = state.isDragging;
    }
    this.notifyChange();
  }

  /**
   * Reset camera to default position
   */
  reset(): void {
    this.rotationX = 0.3;
    this.rotationY = 0;
    this.zoom = -1.80;
    this.isDragging = false;
    this.notifyChange();
  }

  /**
   * Clean up event listeners when handler is no longer needed
   */
  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}
