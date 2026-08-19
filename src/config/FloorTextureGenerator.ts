/**
 * Generates a green chessboard pattern as a base64 PNG data URL
 * Used as fallback texture for floors without atlas textures
 */
export function generateGreenChessboardTexture(): string {
  if (typeof document === 'undefined') {
    return '';
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '';
  }
  
  const halfSize = 32;
  ctx.fillStyle = '#4a7c23';
  ctx.fillRect(0, 0, halfSize, halfSize);
  ctx.fillRect(halfSize, halfSize, halfSize, halfSize);
  ctx.fillStyle = '#2d5a1a';
  ctx.fillRect(halfSize, 0, halfSize, halfSize);
  ctx.fillRect(0, halfSize, halfSize, halfSize);
  
  return canvas.toDataURL('image/png');
}
