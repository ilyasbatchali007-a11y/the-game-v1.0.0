import { World } from '../ecs/World';
import { SaveManager } from '../serialization/SaveManager';
import { SaveSlotManager } from '../serialization/SaveSlotManager';

const NUM_SLOTS = 3;

export interface SlotUIState {
  currentSlotId: number | null;
}

/**
 * Renders save slot UI elements based on saved data
 */
export function renderSlots(state: SlotUIState, startGameCallback: () => void): void {
  const slotsContainer = document.getElementById('slots-container') as HTMLElement;
  const overlay = document.getElementById('slots-overlay');
  
  // Clear existing slots but keep the overlay
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
        renderSlots(state, startGameCallback);
      });

      slotEl.appendChild(infoDiv);
      slotEl.appendChild(deleteBtn);

      // Click on slot loads the game
      slotEl.addEventListener('click', () => {
        const buffer = SaveSlotManager.loadFromSlot(i);
        if (buffer) {
          // World will be provided by caller
          console.log(`[UI] Loaded save slot ${i}`);
          state.currentSlotId = i;
          startGameCallback();
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
        state.currentSlotId = i;
        // New game callback will be provided by caller
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
 * Saves game to the current active slot
 */
export function quickSave(world: World, state: SlotUIState): void {
  if (state.currentSlotId !== null) {
    SaveSlotManager.saveToSlot(world, state.currentSlotId, `Save ${state.currentSlotId + 1}`);
    console.log(`[UI] Saved to slot ${state.currentSlotId}!`);
  }
}

/**
 * Loads game from a specific slot
 */
export function loadFromSlot(world: World, slotId: number, state: SlotUIState): boolean {
  const buffer = SaveSlotManager.loadFromSlot(slotId);
  if (buffer && world) {
    SaveManager.loadWorld(world, buffer);
    state.currentSlotId = slotId;
    console.log(`[UI] Loaded save slot ${slotId}`);
    return true;
  }
  return false;
}

export { NUM_SLOTS };
