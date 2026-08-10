import { World } from '../ecs/World';
import { SaveManager } from './SaveManager';

export interface SaveSlot {
  id: number;
  name: string;
  timestamp: number;
  data: ArrayBuffer;
}

export class SaveSlotManager {
  private static STORAGE_PREFIX = 'ecs_save_';
  private static MAX_SLOTS = 10;

  public static getSaveSlots(): SaveSlot[] {
    const slots: SaveSlot[] = [];
    
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const key = `${this.STORAGE_PREFIX}${i}`;
      const savedData = localStorage.getItem(key);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          const binaryString = atob(parsed.data);
          const buffer = new ArrayBuffer(binaryString.length);
          const view = new Uint8Array(buffer);
          
          for (let j = 0; j < binaryString.length; j++) {
            view[j] = binaryString.charCodeAt(j);
          }
          
          slots.push({
            id: i,
            name: parsed.name || `Save ${i + 1}`,
            timestamp: parsed.timestamp || 0,
            data: buffer
          });
        } catch (e) {
          console.warn(`Failed to load save slot ${i}:`, e);
          localStorage.removeItem(key);
        }
      }
    }
    
    return slots.sort((a, b) => b.timestamp - a.timestamp);
  }

  public static saveToSlot(world: World, slotId: number, name?: string): boolean {
    try {
      const buffer = SaveManager.saveWorld(world);
      const binaryString = String.fromCharCode(...new Uint8Array(buffer));
      const base64Data = btoa(binaryString);
      
      const saveData = {
        name: name || `Save ${slotId + 1}`,
        timestamp: Date.now(),
        data: base64Data
      };
      
      localStorage.setItem(`${this.STORAGE_PREFIX}${slotId}`, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Failed to save to slot:', e);
      return false;
    }
  }

  public static loadFromSlot(slotId: number): ArrayBuffer | null {
    const key = `${this.STORAGE_PREFIX}${slotId}`;
    const savedData = localStorage.getItem(key);
    
    if (!savedData) {
      return null;
    }
    
    try {
      const parsed = JSON.parse(savedData);
      const binaryString = atob(parsed.data);
      const buffer = new ArrayBuffer(binaryString.length);
      const view = new Uint8Array(buffer);
      
      for (let j = 0; j < binaryString.length; j++) {
        view[j] = binaryString.charCodeAt(j);
      }
      
      return buffer;
    } catch (e) {
      console.error('Failed to load from slot:', e);
      localStorage.removeItem(key);
      return null;
    }
  }

  public static deleteSlot(slotId: number): boolean {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${slotId}`);
      return true;
    } catch (e) {
      console.error('Failed to delete slot:', e);
      return false;
    }
  }

  public static formatDate(timestamp: number): string {
    if (!timestamp) return 'No date';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
