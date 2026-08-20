import { InputStateTracker } from './InputStateTracker';
import { FloorSwitchManager } from './FloorSwitchManager';
import { DungeonMapVisualizer } from './DungeonMapVisualizer';
import { MapRenderer } from '../render/MapRenderer';
import { GLInstancedRenderer } from '../render/GLInstancedRenderer';
import { World } from '../ecs/World';
import { Camera } from '../engine/Camera';

/**
 * Handles all keyboard input for game controls, floor switching, and debug features.
 */
export class KeyboardInputHandler {
  private inputTracker: InputStateTracker;
  private floorSwitchManager: FloorSwitchManager;

  constructor(
    private mapRenderer: MapRenderer,
    private world: World | null,
    private camera: Camera | null,
    private renderer: GLInstancedRenderer | null,
    private dungeonVisualizer: DungeonMapVisualizer | null,
    private floorSwitchManager: FloorSwitchManager,
    private onQuickSave: (slotId: number) => void,
    private currentSlotId: number | null
  ) {
    this.inputTracker = new InputStateTracker();
  }

  /**
   * Register keyboard event listeners
   */
  registerListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  /**
   * Handle key down events
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Map toggle with M key - works only in game, not in menu
    if (e.key === 'm' || e.key === 'M') {
      const mapContainer = document.getElementById('map-container');
      const mapVisible = mapContainer?.classList.contains('visible');
      
      if (!mapVisible && this.world) {
        this.toggleMap();
      }
      return;
    }

    // Export dungeon files with X key
    if ((e.key === 'x' || e.key === 'X') && this.dungeonVisualizer) {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer?.classList.contains('visible')) {
        this.dungeonVisualizer.exportCurrentDungeon();
      }
      return;
    }

    // Delete current dungeon with D key
    if ((e.key === 'd' || e.key === 'D') && this.dungeonVisualizer) {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer?.classList.contains('visible')) {
        this.dungeonVisualizer.deleteCurrentDungeon();
      }
      return;
    }

    if (!isGameRunning()) return;

    // Floor switching with T (previous) and G (next)
    if ((e.key === 't' || e.key === 'T') && this.world && this.camera) {
      this.floorSwitchManager.switchToPreviousFloor(
        this.mapRenderer,
        this.world,
        this.camera,
        this.renderer
      );
      return;
    }

    if ((e.key === 'g' || e.key === 'G') && this.world && this.camera) {
      this.floorSwitchManager.switchToNextFloor(
        this.mapRenderer,
        this.world,
        this.camera,
        this.renderer
      );
      return;
    }

    // Portal interaction with E key
    if ((e.key === 'e' || e.key === 'E') && this.world && this.camera) {
      this.floorSwitchManager.handlePortalInteraction(
        this.mapRenderer,
        this.world,
        this.camera,
        this.renderer
      );
    }

    // Track input state for movement
    this.inputTracker.pressKey(e.key);

    // Quick save with Ctrl+S
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (this.world && this.currentSlotId !== null) {
        this.onQuickSave(this.currentSlotId);
      }
    }
  }

  /**
   * Handle key up events
   */
  private handleKeyUp(e: KeyboardEvent): void {
    this.inputTracker.releaseKey(e.key);
  }

  /**
   * Toggle map visibility
   */
  private toggleMap(): void {
    const mapContainer = document.getElementById('map-container');
    const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
    
    if (!mapContainer || !mapCanvas) return;

    mapContainer.classList.add('visible');
    
    // Initialize 3D renderer if needed
    if (this.dungeonVisualizer) {
      this.dungeonVisualizer.initialize(mapCanvas);
      this.dungeonVisualizer.loadDungeonFromFile();
    }
  }

  /**
   * Get current input state for movement system
   */
  getInputState(): Record<string, boolean> {
    return this.inputTracker.getState();
  }

  /**
   * Reset input state
   */
  resetInput(): void {
    this.inputTracker.reset();
  }
}

// Game running state - accessed from within the class
let gameRunning = false;

export function setGameRunning(value: boolean): void {
  gameRunning = value;
}

export function isGameRunning(): boolean {
  return gameRunning;
}
