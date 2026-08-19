/**
 * Save slot UI rendering and management
 * Handles display of save slots, empty slot creation, and delete functionality
 */

import { SaveSlotManager } from '../../serialization/SaveSlotManager';
import { SaveManager } from '../../serialization/SaveManager';
import { World } from '../../ecs/World';

const NUM_SLOTS = 3;

export interface SlotClickHandlers {
  onEmptySlotClick: (slotId: number) => void;
  onSavedSlotClick: (slotId: number) => void;
}

/**
 * Render all save slots in the container
 */
export function renderSlots(
  slotsContainer: HTMLElement,
  handlers: SlotClickHandlers
): void {
  // Clear existing slots but keep the overlay
  const overlay = document.getElementById('slots-overlay');
  slotsContainer.innerHTML = '';
  if (overlay) {
    slotsContainer.appendChild(overlay);
  }
  
  for (let i = 0; i < NUM_SLOTS; i++) {
    const slotData = SaveSlotManager.loadFromSlot(i);
    const slotEl = document.createElement('div');
    slotEl.className = 'save-slot';
    
    if (slotData) {
      // Slot has a save
      const parsed = JSON.parse(localStorage.getItem(`ecs_save_${i}`) || '{}');
      const timestamp = parsed.timestamp || 0;
      
      slotEl.classList.remove('empty');
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'slot-info';
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'slot-name';
      nameDiv.textContent = parsed.name || `Save ${i + 1}`;
      
      const dateDiv = document.createElement('div');
      dateDiv.className = 'slot-date';
      dateDiv.textContent = SaveSlotManager.formatDate(timestamp);
      
      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(dateDiv);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'X';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SaveSlotManager.deleteSlot(i);
        renderSlots(slotsContainer, handlers);
      });
      
      slotEl.appendChild(infoDiv);
      slotEl.appendChild(deleteBtn);
      
      // Click on slot loads the game
      slotEl.addEventListener('click', () => {
        const buffer = SaveSlotManager.loadFromSlot(i);
        if (buffer) {
          handlers.onSavedSlotClick(i);
        }
      });
    } else {
      // Slot is empty
      slotEl.classList.add('empty');
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'slot-info';
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'slot-name';
      nameDiv.textContent = `Empty Slot ${i + 1}`;
      
      const dateDiv = document.createElement('div');
      dateDiv.className = 'slot-date';
      dateDiv.textContent = 'Click to start New Game';
      
      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(dateDiv);
      
      slotEl.appendChild(infoDiv);
      
      // Click on empty slot starts new game
      slotEl.addEventListener('click', () => {
        handlers.onEmptySlotClick(i);
      });
    }
    
    slotsContainer.appendChild(slotEl);
  }
  
  // Re-append the overlay after slots
  if (overlay) {
    slotsContainer.appendChild(overlay);
  }
}

/**
 * Handle loading a saved game from a slot
 */
export function handleSavedSlotClick(
  slotId: number,
  world: World | null,
  onSlotLoaded: (slotId: number) => void
): void {
  const buffer = SaveSlotManager.loadFromSlot(slotId);
  if (buffer && world) {
    SaveManager.loadWorld(world, buffer);
    onSlotLoaded(slotId);
    console.log(`[UI] Loaded save slot ${slotId}`);
  }
}

/**
 * Handle creating a new game in an empty slot
 */
export function handleEmptySlotClick(
  slotId: number,
  onNewGameStarted: (slotId: number) => void
): void {
  onNewGameStarted(slotId);
}
