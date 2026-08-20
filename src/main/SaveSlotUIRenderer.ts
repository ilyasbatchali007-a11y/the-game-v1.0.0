import { SaveSlotManager } from '../serialization/SaveSlotManager';
import { World } from '../ecs/World';
import { SaveManager } from '../serialization/SaveManager';

/**
 * Manages the save slots UI display and interactions.
 * Handles rendering slot contents, empty states, and user actions.
 */
export class SaveSlotUIRenderer {
  private readonly NUM_SLOTS: number = 3;

  /**
   * Render all save slots in the container
   */
  render(
    slotsContainer: HTMLElement,
    slotsOverlay: HTMLElement | null,
    world: World | null,
    currentSlotId: number | null,
    onSaveLoad: (slotId: number) => void,
    onNewGame: (slotId: number) => void,
    onDelete: (slotId: number) => void
  ): void {
    // Clear existing slots but keep the overlay
    slotsContainer.innerHTML = '';
    if (slotsOverlay) {
      slotsContainer.appendChild(slotsOverlay);
    }

    for (let i = 0; i < this.NUM_SLOTS; i++) {
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
          onDelete(i);
        });

        slotEl.appendChild(infoDiv);
        slotEl.appendChild(deleteBtn);

        // Click on slot loads the game
        slotEl.addEventListener('click', () => {
          const buffer = SaveSlotManager.loadFromSlot(i);
          if (buffer && world) {
            SaveManager.loadWorld(world, buffer);
            console.log(`[UI] Loaded save slot ${i}`);
            onSaveLoad(i);
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
          onNewGame(i);
        });
      }

      slotsContainer.appendChild(slotEl);
    }

    // Re-append the overlay after slots
    if (slotsOverlay) {
      slotsContainer.appendChild(slotsOverlay);
    }
  }

  /**
   * Get the number of save slots
   */
  getSlotCount(): number {
    return this.NUM_SLOTS;
  }
}
