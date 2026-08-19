// SRC/engine/dungeon-generator/DungeonRNG.ts
// Seeded PRNG (mulberry32) - deterministic random number generator for dungeon generation

/**
 * Creates a seeded random number generator that produces deterministic sequences
 * Same seed always produces the same sequence of random numbers
 */
export function createDungeonRNG(seed: number): () => number {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles an array using the provided RNG function
 */
export function shuffleArrayWithRNG<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
