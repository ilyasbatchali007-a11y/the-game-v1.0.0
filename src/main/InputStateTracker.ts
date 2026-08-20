/**
 * Manages keyboard input state for game controls.
 * Tracks which keys are currently pressed/released.
 */
export class InputStateTracker {
  private state: Record<string, boolean> = {};

  /**
   * Mark a key as pressed
   */
  pressKey(key: string): void {
    this.state[key] = true;
  }

  /**
   * Mark a key as released
   */
  releaseKey(key: string): void {
    this.state[key] = false;
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.state[key] === true;
  }

  /**
   * Get the full input state object for systems that expect it
   */
  getState(): Record<string, boolean> {
    return { ...this.state };
  }

  /**
   * Reset all input state
   */
  reset(): void {
    this.state = {};
  }
}
