/**
 * Main menu UI handlers
 * Manages start, settings, credits buttons and slot overlay visibility
 */

export interface MenuUIElements {
  startMenu: HTMLElement;
  slotsContainer: HTMLElement;
  slotsOverlay: HTMLElement;
  btnStart: HTMLButtonElement;
  btnSettings: HTMLButtonElement;
  btnCredits: HTMLButtonElement;
  btnCloseSlots: HTMLButtonElement;
}

/**
 * Show the save slots overlay with animation
 */
export function showSaveSlots(ui: MenuUIElements): void {
  // Hide the start button and other menu buttons
  ui.btnStart.classList.add('hidden');
  if (ui.btnSettings.parentElement) {
    ui.btnSettings.parentElement.classList.add('hidden');
  }
  // Show slots with animation and show overlay
  ui.slotsOverlay.classList.add('active');
  ui.slotsContainer.classList.add('visible');
}

/**
 * Hide the save slots overlay
 */
export function hideSaveSlots(ui: MenuUIElements): void {
  // Hide slots overlay
  ui.slotsOverlay.classList.remove('active');
  // Hide slots container
  ui.slotsContainer.classList.remove('visible');
  // Show start button and menu buttons again
  ui.btnStart.classList.remove('hidden');
  if (ui.btnSettings.parentElement) {
    ui.btnSettings.parentElement.classList.remove('hidden');
  }
}

/**
 * Hide the main start menu
 */
export function hideStartMenu(ui: MenuUIElements): void {
  ui.startMenu.classList.add('hidden');
}

/**
 * Show the main start menu
 */
export function showStartMenu(ui: MenuUIElements): void {
  ui.startMenu.classList.remove('hidden');
}
