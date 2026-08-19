/**
 * Main entry point - Game orchestration and UI event binding
 * Delegates responsibilities to specialized modules:
 * - Engine initialization: main/engine-init/WebGLEngineInitializer
 * - Game loop: main/game-loop/GameLoopOrchestrator
 * - Input handling: main/input-handlers/KeyboardInputHandler
 * - Menu UI: main/menu-ui/MenuUIHandlers, main/menu-ui/SaveSlotUIRenderer
 * - Dungeon map: main/dungeon-map/DungeonMapLoader
 */

import { initEngine, EngineComponents } from './main/engine-init/WebGLEngineInitializer';
import { 
  startGameLoop, 
  setGameRunning, 
  resetInputState, 
  getInputState,
  getFloorSwitchCooldown,
  setFloorSwitchCooldown
} from './main/game-loop/GameLoopOrchestrator';
import { initNewGame } from './main/game-loop/NewGameInitializer';
import {
  handleKeyDownEvent,
  handleKeyUpEvent,
  toggleMap,
  getDungeonMapState,
  setDungeonMapState,
  DungeonMapState
} from './main/input-handlers/KeyboardInputHandler';
import { handleWindowResize } from './main/input-handlers/WindowResizeHandler';
import {
  showSaveSlots,
  hideSaveSlots,
  hideStartMenu,
  MenuUIElements
} from './main/menu-ui/MenuUIHandlers';
import {
  renderSlots,
  handleSavedSlotClick,
  handleEmptySlotClick,
  SlotClickHandlers
} from './main/menu-ui/SaveSlotUIRenderer';
import { SaveSlotManager } from './serialization/SaveSlotManager';

// Game State
let gameRunning = false;
let currentSlotId: number | null = null; // The slot used for the current session
let engine: EngineComponents | null = null;
let stopGameLoop: (() => void) | null = null;

// UI Elements
const startMenu = document.getElementById('start-menu') as HTMLElement;
const slotsContainer = document.getElementById('slots-container') as HTMLElement;
const slotsOverlay = document.getElementById('slots-overlay') as HTMLElement;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;
const btnCredits = document.getElementById('btn-credits') as HTMLButtonElement;
const btnCloseSlots = document.getElementById('btn-close-slots') as HTMLButtonElement;
const link1 = document.getElementById('link-1') as HTMLAnchorElement;
const link2 = document.getElementById('link-2') as HTMLAnchorElement;
const link3 = document.getElementById('link-3') as HTMLAnchorElement;

const ui: MenuUIElements = {
  startMenu,
  slotsContainer,
  slotsOverlay,
  btnStart,
  btnSettings,
  btnCredits,
  btnCloseSlots
};

const NUM_SLOTS = 3;

function startGame(): void {
  gameRunning = true;
  setGameRunning(true);
  hideStartMenu(ui);
  
  // Reset input state
  resetInputState();
}

function stopGame(): void {
  gameRunning = false;
  setGameRunning(false);
  showStartMenu(ui);
  renderSlots(slotsContainer, getSlotClickHandlers()); // Re-render slots to update their state
}

function getSlotClickHandlers(): SlotClickHandlers {
  return {
    onEmptySlotClick: (slotId: number) => {
      currentSlotId = slotId;
      if (engine) {
        initNewGame(engine.world, engine.renderer, engine.camera);
      }
      startGame();
    },
    onSavedSlotClick: (slotId: number) => {
      const buffer = SaveSlotManager.loadFromSlot(slotId);
      if (buffer && engine?.world) {
        import('./serialization/SaveManager').then(({ SaveManager }) => {
          SaveManager.loadWorld(engine!.world, buffer);
          currentSlotId = slotId;
          console.log(`[UI] Loaded save slot ${slotId}`);
          startGame();
        });
      }
    }
  };
}

// Initialize engine and start game loop
async function bootstrap(): Promise<void> {
  try {
    engine = await initEngine();
    
    // Start the game loop
    stopGameLoop = startGameLoop(
      engine.world,
      engine.movementSystem,
      engine.collisionSystem,
      engine.renderer,
      engine.camera,
      engine.mapRenderer,
      engine.ctx,
      engine.canvas,
      engine.texture,
      (inputState) => { /* Input state is managed internally */ }
    );
    
    // Initial render of slots on page load (hidden by default)
    slotsContainer.classList.remove('visible');
  } catch (error) {
    console.error('[Bootstrap] Failed to initialize engine:', error);
  }
}

// Menu Button Handlers
btnStart.addEventListener('click', () => {
  showSaveSlots(ui);
  renderSlots(slotsContainer, getSlotClickHandlers());
});

// Close slots overlay handler
btnCloseSlots.addEventListener('click', () => {
  hideSaveSlots(ui);
});

// Settings and Credits button handlers (placeholder for now)
btnSettings.addEventListener('click', () => {
  console.log('[UI] Settings button clicked');
  // Add settings modal/functionality here
});

btnCredits.addEventListener('click', () => {
  console.log('[UI] Credits button clicked');
  // Add credits modal/functionality here
});

// Link box handlers (placeholder - replace # with actual URLs)
link1.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[UI] Link 1 clicked');
  // Replace with: window.open('YOUR_URL_1', '_blank');
});

link2.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[UI] Link 2 clicked');
  // Replace with: window.open('YOUR_URL_2', '_blank');
});

link3.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[UI] Link 3 clicked');
  // Replace with: window.open('YOUR_URL_3', '_blank');
});

// Keyboard event handlers
window.addEventListener('keydown', (e) => {
  if (engine) {
    handleKeyDownEvent(
      e,
      engine.world,
      engine.camera,
      engine.renderer,
      engine.mapRenderer,
      gameRunning,
      getInputState()
    );
  }
  
  // Quick save ONLY with Ctrl+S - saves to the slot used to start this session
  if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    if (engine?.world && currentSlotId !== null) {
      SaveSlotManager.saveToSlot(engine.world, currentSlotId, `Save ${currentSlotId + 1}`);
      console.log(`[UI] Saved to slot ${currentSlotId}!`);
    }
  }
});

window.addEventListener('keyup', (e) => {
  handleKeyUpEvent(e, gameRunning, getInputState());
});

// Handle window resize
window.addEventListener('resize', () => {
  if (engine) {
    handleWindowResize(engine.canvas, engine.ctx, engine.camera);
  }
});

// Start the application
bootstrap().catch(console.error);
