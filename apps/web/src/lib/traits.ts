/**
 * DenGrow Trait System
 *
 * Each plant has 4 deterministic traits based on its token ID.
 * Traits are assigned using a hash-based algorithm to ensure:
 * - Same token ID always produces same traits
 * - Even distribution across trait options
 * - Reproducible off-chain (no on-chain storage needed for MVP)
 */

// ============================================================================
// TRAIT DEFINITIONS
// ============================================================================

export const TRAIT_CATEGORIES = {
  POT: 'Pot',
  BACKGROUND: 'Background',
  FLOWER: 'Flower',
  COMPANION: 'Companion',
} as const;

export type TraitCategory = (typeof TRAIT_CATEGORIES)[keyof typeof TRAIT_CATEGORIES];

// Pot styles - the container for the plant
export const POT_TRAITS = [
  { id: 'terracotta', name: 'Terracotta', rarity: 'common', color: '#D2691E' },
  { id: 'ceramic_white', name: 'White Ceramic', rarity: 'common', color: '#F5F5F5' },
  { id: 'ceramic_blue', name: 'Blue Ceramic', rarity: 'uncommon', color: '#4169E1' },
  { id: 'wooden', name: 'Wooden Barrel', rarity: 'uncommon', color: '#8B4513' },
  { id: 'golden', name: 'Golden Pot', rarity: 'rare', color: '#FFD700' },
  { id: 'crystal', name: 'Crystal Vase', rarity: 'rare', color: '#E0FFFF' },
  { id: 'ancient', name: 'Ancient Urn', rarity: 'legendary', color: '#708090' },
] as const;

// Background colors/patterns
export const BACKGROUND_TRAITS = [
  { id: 'sky_blue', name: 'Sky Blue', rarity: 'common', color: '#87CEEB' },
  { id: 'sunset', name: 'Sunset Orange', rarity: 'common', color: '#FF7F50' },
  { id: 'forest', name: 'Forest Green', rarity: 'common', color: '#228B22' },
  { id: 'lavender', name: 'Lavender', rarity: 'uncommon', color: '#E6E6FA' },
  { id: 'coral', name: 'Coral Reef', rarity: 'uncommon', color: '#FF6B6B' },
  { id: 'midnight', name: 'Midnight', rarity: 'rare', color: '#191970' },
  { id: 'aurora', name: 'Aurora', rarity: 'legendary', color: '#7FFFD4' },
] as const;

// Flower types (visible at Bloom/Tree stage)
export const FLOWER_TRAITS = [
  { id: 'daisy', name: 'Daisy', rarity: 'common', emoji: '🌼' },
  { id: 'tulip', name: 'Tulip', rarity: 'common', emoji: '🌷' },
  { id: 'sunflower', name: 'Sunflower', rarity: 'uncommon', emoji: '🌻' },
  { id: 'rose', name: 'Rose', rarity: 'uncommon', emoji: '🌹' },
  { id: 'cherry_blossom', name: 'Cherry Blossom', rarity: 'rare', emoji: '🌸' },
  { id: 'hibiscus', name: 'Hibiscus', rarity: 'rare', emoji: '🌺' },
  { id: 'lotus', name: 'Lotus', rarity: 'legendary', emoji: '🪷' },
] as const;

// Companion creatures
export const COMPANION_TRAITS = [
  { id: 'none', name: 'None', rarity: 'common', emoji: '' },
  { id: 'butterfly', name: 'Butterfly', rarity: 'common', emoji: '🦋' },
  { id: 'ladybug', name: 'Ladybug', rarity: 'uncommon', emoji: '🐞' },
  { id: 'bee', name: 'Bee', rarity: 'uncommon', emoji: '🐝' },
  { id: 'hummingbird', name: 'Hummingbird', rarity: 'rare', emoji: '🐦' },
  { id: 'fairy', name: 'Garden Fairy', rarity: 'legendary', emoji: '🧚' },
] as const;

// Type definitions
export type PotTrait = (typeof POT_TRAITS)[number];
export type BackgroundTrait = (typeof BACKGROUND_TRAITS)[number];
export type FlowerTrait = (typeof FLOWER_TRAITS)[number];
export type CompanionTrait = (typeof COMPANION_TRAITS)[number];

// Species/Archetype - determines the plant's visual style
export const SPECIES_TRAITS = [
  { id: 'flowering', name: 'Flowering Plant', rarity: 'common' },
  { id: 'rose_bush', name: 'Rose Bush', rarity: 'uncommon' },
  { id: 'pine_tree', name: 'Pine Tree', rarity: 'rare' },
  { id: 'cactus', name: 'Desert Cactus', rarity: 'uncommon' },
  { id: 'bonsai', name: 'Bonsai', rarity: 'legendary' },
] as const;

export type SpeciesTrait = (typeof SPECIES_TRAITS)[number];

export interface PlantTraits {
  pot: PotTrait;
  background: BackgroundTrait;
  flower: FlowerTrait;
  companion: CompanionTrait;
  species: SpeciesTrait;
}

// ============================================================================
// TRAIT GENERATION (Deterministic)
// ============================================================================

/**
 * Simple hash function for deterministic trait selection
 * Uses token ID and a salt to produce different values for each trait
 */
function hashTokenId(tokenId: number, salt: string): number {
  const str = `${tokenId}-${salt}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Select trait from array based on weighted rarity
 * Rarity weights: common=50, uncommon=30, rare=15, legendary=5
 */
function selectTraitByRarity<T extends { rarity: string }>(
  traits: readonly T[],
  hash: number
): T {
  const weights: Record<string, number> = {
    common: 50,
    uncommon: 30,
    rare: 15,
    legendary: 5,
  };

  // Calculate total weight
  const totalWeight = traits.reduce((sum, t) => sum + (weights[t.rarity] || 0), 0);

  // Select based on hash
  let target = hash % totalWeight;
  for (const trait of traits) {
    target -= weights[trait.rarity] || 0;
    if (target < 0) {
      return trait;
    }
  }

  return traits[0]; // Fallback
}

/**
 * Generate deterministic traits for a plant based on token ID
 * Same token ID will always produce the same traits
 */
export function generateTraits(tokenId: number): PlantTraits {
  return {
    pot: selectTraitByRarity(POT_TRAITS, hashTokenId(tokenId, 'pot')),
    background: selectTraitByRarity(BACKGROUND_TRAITS, hashTokenId(tokenId, 'background')),
    flower: selectTraitByRarity(FLOWER_TRAITS, hashTokenId(tokenId, 'flower')),
    companion: selectTraitByRarity(COMPANION_TRAITS, hashTokenId(tokenId, 'companion')),
    species: selectTraitByRarity(SPECIES_TRAITS, hashTokenId(tokenId, 'species')),
  };
}

// ============================================================================
// STAGE INFORMATION
// ============================================================================

export const STAGES = [
  {
    id: 0,
    name: 'Seed',
    emoji: '🌱',
    description: 'A tiny seed with big potential',
  },
  {
    id: 1,
    name: 'Sprout',
    emoji: '🌿',
    description: 'The first leaves emerge',
  },
  {
    id: 2,
    name: 'Seedling',
    emoji: '🪴',
    description: 'Growing stronger every day',
  },
  {
    id: 3,
    name: 'Vegetative',
    emoji: '🌳',
    description: 'Lush and full of life',
  },
  {
    id: 4,
    name: 'Tree',
    emoji: '🎄',
    description: 'Fully matured and ready for impact',
  },
] as const;

export type Stage = (typeof STAGES)[number];

export function getStage(stageId: number): Stage {
  return STAGES[stageId] || STAGES[0];
}

// ============================================================================
// METADATA HELPERS
// ============================================================================

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

/**
 * Generate NFT metadata for a plant
 */
export function generateMetadata(
  tokenId: number,
  stage: number,
  baseUrl: string
): NFTMetadata {
  const traits = generateTraits(tokenId);
  const stageInfo = getStage(stage);

  const attributes: Array<{ trait_type: string; value: string }> = [
    { trait_type: 'Stage', value: stageInfo.name },
    { trait_type: 'Pot', value: traits.pot.name },
    { trait_type: 'Background', value: traits.background.name },
    { trait_type: 'Flower', value: traits.flower.name },
    { trait_type: 'Pot Rarity', value: traits.pot.rarity },
    { trait_type: 'Background Rarity', value: traits.background.rarity },
    { trait_type: 'Flower Rarity', value: traits.flower.rarity },
  ];

  // Add companion if present
  if (traits.companion.id !== 'none') {
    attributes.push({ trait_type: 'Companion', value: traits.companion.name });
    attributes.push({ trait_type: 'Companion Rarity', value: traits.companion.rarity });
  }

  return {
    name: `DenGrow Plant #${tokenId}`,
    description: `${stageInfo.emoji} ${stageInfo.description}. A unique plant growing in a ${traits.pot.name.toLowerCase()} with a ${traits.background.name.toLowerCase()} background.${traits.companion.id !== 'none' ? ` Accompanied by a ${traits.companion.name.toLowerCase()}.` : ''}`,
    image: `${baseUrl}/api/image/${tokenId}`,
    external_url: `${baseUrl}/my-plants/${tokenId}`,
    attributes,
  };
}

/**
 * Calculate rarity score based on traits (0-100)
 */
export function calculateRarityScore(traits: PlantTraits): number {
  const rarityPoints: Record<string, number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    legendary: 100,
  };

  const scores = [
    rarityPoints[traits.pot.rarity] || 0,
    rarityPoints[traits.background.rarity] || 0,
    rarityPoints[traits.flower.rarity] || 0,
    rarityPoints[traits.companion.rarity] || 0,
  ];

  // Average score
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
