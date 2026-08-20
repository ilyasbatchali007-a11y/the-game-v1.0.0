/**
 * UIManager - Handles all start menu, save slot UI, and slot rendering logic
 * Separated from main.ts to isolate UI responsibilities
 */

import { SaveSlotManager } from '../../serialization/SaveSlotManager';
import { SaveManager } from '../../serialization/SaveManager';
import { World } from '../ecs/World';

const NUM_SLOTS = 3;

export interface UIManagerDependencies {
  world: World | null;
  initNewGameCallback: () => void;
  startGameCallback: () => void;
}

export class UIManager {
  private startMenu: HTMLElement;
  private slotsContainer: HTMLElement;
  private slotsOverlay: HTMLElement;
  private btnStart: HTMLButtonElement;
  private btnSettings: HTMLButtonElement;
  private btnCredits: HTMLButtonElement;
  private btnCloseSlots: HTMLButtonElement;
  private link1: HTMLAnchorElement;
  private link2: HTMLAnchorElement;
  private link3: HTMLAnchorElement;
  
  private currentSlotId: number | null = null;
  private dependencies: UIManagerDependencies;

  constructor(dependencies: UIManagerDependencies) {
    this.dependencies = dependencies;
    
    // Cache DOM elements
    this.startMenu = document.getElementById('start-menu') as HTMLElement;
    this.slotsContainer = document.getElementById('slots-container') as HTMLElement;
    this.slotsOverlay = document.getElementById('slots-overlay') as HTMLElement;
    this.btnStart = document.getElementById('btn-start') as HTMLButtonElement;
    this.btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;
    this.btnCredits = document.getElementById('btn-credits') as HTMLButtonElement;
    this.btnCloseSlots = document.getElementById('btn-close-slots') as HTMLButtonElement;
    this.link1 = document.getElementById('link-1') as HTMLAnchorElement;
    this.link2 = document.getElementById('link-2') as HTMLAnchorElement;
    this.link3 = document.getElementById('link-3') as HTMLAnchorElement;
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.btnStart.addEventListener('click', () => this.showSlots());
    this.btnSettings.addEventListener('click', () => this.showSettings());
    this.btnCredits.addEventListener('click', () => this.showCredits());
    this.btnCloseSlots.addEventListener('click', () => this.hideSlots());
  }

  private showSlots(): void {
    this.startMenu.classList.add('hidden');
    this.slotsOverlay.classList.remove('hidden');
    this.renderSlots();
  }

  private hideSlots(): void {
    this.slotsOverlay.classList.add('hidden');
    this.startMenu.classList.remove('hidden');
  }

  private showSettings(): void {
    console.log('[UI] Settings clicked');
  }

  private showCredits(): void {
    console.log('[UI] Credits clicked');
  }

  public renderSlots(): void {
    const overlay = document.getElementById('slots-overlay');
    this.slotsContainer.innerHTML = '';
    if (overlay) {
      this.slotsContainer.appendChild(overlay);
    }
    
    for (let i = 0; i < NUM_SLOTS; i++) {
      const slotData = SaveSlotManager.loadFromSlot(i);
      const slotEl = document.createElement('div');
      slotEl.className = 'save-slot';
      
      if (slotData) {
        this.renderOccupiedSlot(slotEl, i, slotData);
      } else {
        this.renderEmptySlot(slotEl, i);
      }
      
      this.slotsContainer.appendChild(slotEl);
    }
    
    if (overlay) {
      this.slotsContainer.appendChild(overlay);
    }
  }

  private renderOccupiedSlot(slotEl: HTMLElement, slotIndex: number, slotData: any): void {
    const parsed = JSON.parse(localStorage.getItem(`ecs_save_${slotIndex}`) || '{}');
    const timestamp = parsed.timestamp || 0;
    
    slotEl.classList.remove('empty');
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'slot-info';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'slot-name';
    nameDiv.textContent = parsed.name || `Save ${slotIndex + 1}`;
    
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
      SaveSlotManager.deleteSlot(slotIndex);
      this.renderSlots();
    });
    
    slotEl.appendChild(infoDiv);
    slotEl.appendChild(deleteBtn);
    
    slotEl.addEventListener('click', () => {
      const buffer = SaveSlotManager.loadFromSlot(slotIndex);
      if (buffer && this.dependencies.world) {
        SaveManager.loadWorld(this.dependencies.world, buffer);
        this.currentSlotId = slotIndex;
        console.log(`[UI] Loaded save slot ${slotIndex}`);
        this.dependencies.startGameCallback();
      }
    });
  }

  private renderEmptySlot(slotEl: HTMLElement, slotIndex: number): void {
    slotEl.classList.add('empty');
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'slot-info';
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'slot-name';
    nameDiv.textContent = `Empty Slot ${slotIndex + 1}`;
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'slot-date';
    dateDiv.textContent = 'Click to start New Game';
    
    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(dateDiv);
    
    slotEl.appendChild(infoDiv);
    
    slotEl.addEventListener('click', () => {
      this.currentSlotId = slotIndex;
      this.dependencies.initNewGameCallback();
      this.dependencies.startGameCallback();
    });
  }

  public getCurrentSlotId(): number | null {
    return this.currentSlotId;
  }

  public stopGame(): void {
    this.startMenu.classList.remove('hidden');
    this.renderSlots();
  }
}
