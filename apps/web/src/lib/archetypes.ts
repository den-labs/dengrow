/**
 * Plant Archetypes (Species)
 *
 * Each archetype defines:
 * - Unique visual style per stage
 * - SVG paths for each growth stage
 * - Color palette
 */

// ============================================================================
// ARCHETYPE DEFINITIONS
// ============================================================================

export const ARCHETYPES = [
  {
    id: 'flowering',
    name: 'Flowering Plant',
    rarity: 'common',
    description: 'A beautiful flowering plant',
    color: '#FF69B4', // Pink
  },
  {
    id: 'rose_bush',
    name: 'Rose Bush',
    rarity: 'uncommon',
    description: 'An elegant rose bush with thorns',
    color: '#DC143C', // Crimson
  },
  {
    id: 'pine_tree',
    name: 'Pine Tree',
    rarity: 'rare',
    description: 'A majestic evergreen pine',
    color: '#228B22', // Forest Green
  },
  {
    id: 'cactus',
    name: 'Desert Cactus',
    rarity: 'uncommon',
    description: 'A hardy desert survivor',
    color: '#32CD32', // Lime Green
  },
  {
    id: 'bonsai',
    name: 'Bonsai',
    rarity: 'legendary',
    description: 'An ancient miniature tree',
    color: '#8B4513', // Saddle Brown
  },
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

// ============================================================================
// SVG VISUALS PER ARCHETYPE + STAGE
// ============================================================================

/**
 * Get SVG elements for a specific archetype and stage
 * Each archetype has unique visuals for all 5 stages
 */
export function getArchetypeVisual(
  archetypeId: string,
  stage: number,
  flowerEmoji: string
): string {
  const visualFn = ARCHETYPE_VISUALS[archetypeId] || ARCHETYPE_VISUALS['flowering'];
  return visualFn(stage, flowerEmoji);
}

// Visual generators for each archetype
const ARCHETYPE_VISUALS: Record<string, (stage: number, flowerEmoji: string) => string> = {
  // ─────────────────────────────────────────────────────────────────────────
  // FLOWERING PLANT (Default) - Generic flowering plant
  // ─────────────────────────────────────────────────────────────────────────
  flowering: (stage: number, flowerEmoji: string) => {
    switch (stage) {
      case 0: // Seed
        return `
          <ellipse cx="200" cy="270" rx="8" ry="12" fill="#8B4513" />
          <path d="M 200 268 Q 205 260 200 250" stroke="#228B22" stroke-width="2" fill="none" />
        `;
      case 1: // Sprout
        return `
          <path d="M 200 270 L 200 230" stroke="#228B22" stroke-width="4" stroke-linecap="round" />
          <ellipse cx="190" cy="230" rx="15" ry="10" fill="#32CD32" transform="rotate(-30 190 230)" />
          <ellipse cx="210" cy="230" rx="15" ry="10" fill="#32CD32" transform="rotate(30 210 230)" />
        `;
      case 2: // Seedling
        return `
          <path d="M 200 270 L 200 180" stroke="#228B22" stroke-width="6" stroke-linecap="round" />
          <ellipse cx="175" cy="220" rx="25" ry="12" fill="#32CD32" transform="rotate(-40 175 220)" />
          <ellipse cx="225" cy="220" rx="25" ry="12" fill="#32CD32" transform="rotate(40 225 220)" />
          <ellipse cx="180" cy="190" rx="20" ry="10" fill="#3CB371" transform="rotate(-30 180 190)" />
          <ellipse cx="220" cy="190" rx="20" ry="10" fill="#3CB371" transform="rotate(30 220 190)" />
        `;
      case 3: // Vegetative
        return `
          <path d="M 200 270 L 200 140" stroke="#228B22" stroke-width="8" stroke-linecap="round" />
          <ellipse cx="160" cy="240" rx="30" ry="15" fill="#228B22" transform="rotate(-50 160 240)" />
          <ellipse cx="240" cy="240" rx="30" ry="15" fill="#228B22" transform="rotate(50 240 240)" />
          <ellipse cx="165" cy="200" rx="28" ry="14" fill="#32CD32" transform="rotate(-40 165 200)" />
          <ellipse cx="235" cy="200" rx="28" ry="14" fill="#32CD32" transform="rotate(40 235 200)" />
          <ellipse cx="170" cy="165" rx="25" ry="12" fill="#3CB371" transform="rotate(-35 170 165)" />
          <ellipse cx="230" cy="165" rx="25" ry="12" fill="#3CB371" transform="rotate(35 230 165)" />
          <text x="200" y="130" font-size="30" text-anchor="middle">${flowerEmoji}</text>
        `;
      case 4: // Tree (Mature)
        return `
          <path d="M 200 270 L 200 120" stroke="#228B22" stroke-width="10" stroke-linecap="round" />
          <circle cx="200" cy="100" r="50" fill="#32CD32" />
          <circle cx="160" cy="130" r="35" fill="#228B22" />
          <circle cx="240" cy="130" r="35" fill="#228B22" />
          <text x="200" y="90" font-size="40" text-anchor="middle">${flowerEmoji}</text>
          <text x="150" y="130" font-size="25" text-anchor="middle">${flowerEmoji}</text>
          <text x="250" y="130" font-size="25" text-anchor="middle">${flowerEmoji}</text>
        `;
      default:
        return '';
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ROSE BUSH - Elegant with thorns
  // ─────────────────────────────────────────────────────────────────────────
  rose_bush: (stage: number, _flowerEmoji: string) => {
    const roseEmoji = '🌹';
    switch (stage) {
      case 0: // Seed
        return `
          <ellipse cx="200" cy="270" rx="6" ry="10" fill="#8B0000" />
          <path d="M 200 268 Q 203 262 200 255" stroke="#2F4F2F" stroke-width="2" fill="none" />
        `;
      case 1: // Sprout
        return `
          <path d="M 200 270 L 200 235" stroke="#2F4F2F" stroke-width="3" stroke-linecap="round" />
          <!-- Thorns -->
          <line x1="200" y1="250" x2="195" y2="245" stroke="#2F4F2F" stroke-width="2" />
          <line x1="200" y1="260" x2="205" y2="255" stroke="#2F4F2F" stroke-width="2" />
          <!-- Leaves -->
          <ellipse cx="188" cy="235" rx="12" ry="8" fill="#2E8B57" transform="rotate(-40 188 235)" />
          <ellipse cx="212" cy="235" rx="12" ry="8" fill="#2E8B57" transform="rotate(40 212 235)" />
        `;
      case 2: // Seedling
        return `
          <path d="M 200 270 L 200 190" stroke="#2F4F2F" stroke-width="5" stroke-linecap="round" />
          <!-- Thorns -->
          <line x1="200" y1="220" x2="193" y2="213" stroke="#2F4F2F" stroke-width="2" />
          <line x1="200" y1="240" x2="207" y2="233" stroke="#2F4F2F" stroke-width="2" />
          <line x1="200" y1="260" x2="193" y2="253" stroke="#2F4F2F" stroke-width="2" />
          <!-- Compound leaves -->
          <g transform="translate(175, 210) rotate(-45)">
            <ellipse cx="0" cy="0" rx="15" ry="8" fill="#2E8B57" />
            <ellipse cx="-10" cy="-8" rx="10" ry="6" fill="#3CB371" />
            <ellipse cx="10" cy="-8" rx="10" ry="6" fill="#3CB371" />
          </g>
          <g transform="translate(225, 210) rotate(45)">
            <ellipse cx="0" cy="0" rx="15" ry="8" fill="#2E8B57" />
            <ellipse cx="-10" cy="-8" rx="10" ry="6" fill="#3CB371" />
            <ellipse cx="10" cy="-8" rx="10" ry="6" fill="#3CB371" />
          </g>
          <!-- Rose bud -->
          <circle cx="200" cy="180" r="12" fill="#DC143C" />
        `;
      case 3: // Vegetative
        return `
          <!-- Main stem -->
          <path d="M 200 270 L 200 140" stroke="#2F4F2F" stroke-width="6" stroke-linecap="round" />
          <!-- Branch left -->
          <path d="M 200 200 Q 170 180 150 160" stroke="#2F4F2F" stroke-width="4" fill="none" />
          <!-- Branch right -->
          <path d="M 200 180 Q 230 160 250 150" stroke="#2F4F2F" stroke-width="4" fill="none" />
          <!-- Thorns -->
          <line x1="200" y1="220" x2="193" y2="213" stroke="#2F4F2F" stroke-width="2" />
          <line x1="200" y1="250" x2="207" y2="243" stroke="#2F4F2F" stroke-width="2" />
          <!-- Leaves -->
          <ellipse cx="165" cy="175" rx="20" ry="10" fill="#2E8B57" transform="rotate(-50 165 175)" />
          <ellipse cx="235" cy="165" rx="20" ry="10" fill="#2E8B57" transform="rotate(50 235 165)" />
          <!-- Roses -->
          <text x="200" y="130" font-size="35" text-anchor="middle">${roseEmoji}</text>
          <text x="150" y="155" font-size="25" text-anchor="middle">${roseEmoji}</text>
        `;
      case 4: // Bush (Mature)
        return `
          <!-- Dense bush structure -->
          <path d="M 200 270 L 200 160" stroke="#2F4F2F" stroke-width="8" stroke-linecap="round" />
          <path d="M 200 220 Q 140 200 120 170" stroke="#2F4F2F" stroke-width="5" fill="none" />
          <path d="M 200 220 Q 260 200 280 170" stroke="#2F4F2F" stroke-width="5" fill="none" />
          <path d="M 200 180 Q 160 150 140 120" stroke="#2F4F2F" stroke-width="4" fill="none" />
          <path d="M 200 180 Q 240 150 260 120" stroke="#2F4F2F" stroke-width="4" fill="none" />
          <!-- Foliage mass -->
          <ellipse cx="200" cy="140" rx="80" ry="50" fill="#2E8B57" opacity="0.7" />
          <ellipse cx="150" cy="160" rx="40" ry="30" fill="#3CB371" opacity="0.6" />
          <ellipse cx="250" cy="160" rx="40" ry="30" fill="#3CB371" opacity="0.6" />
          <!-- Roses in bloom -->
          <text x="200" y="110" font-size="40" text-anchor="middle">${roseEmoji}</text>
          <text x="140" y="140" font-size="30" text-anchor="middle">${roseEmoji}</text>
          <text x="260" y="140" font-size="30" text-anchor="middle">${roseEmoji}</text>
          <text x="170" y="170" font-size="25" text-anchor="middle">${roseEmoji}</text>
          <text x="230" y="170" font-size="25" text-anchor="middle">${roseEmoji}</text>
        `;
      default:
        return '';
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PINE TREE - Evergreen conifer
  // ─────────────────────────────────────────────────────────────────────────
  pine_tree: (stage: number, _flowerEmoji: string) => {
    switch (stage) {
      case 0: // Seed (pine cone seed)
        return `
          <ellipse cx="200" cy="268" rx="5" ry="8" fill="#8B4513" />
          <path d="M 200 265 L 200 255" stroke="#228B22" stroke-width="2" />
          <path d="M 197 258 L 195 252" stroke="#228B22" stroke-width="1.5" />
          <path d="M 203 258 L 205 252" stroke="#228B22" stroke-width="1.5" />
        `;
      case 1: // Sprout (tiny pine)
        return `
          <line x1="200" y1="270" x2="200" y2="240" stroke="#8B4513" stroke-width="4" />
          <!-- Pine needles -->
          <polygon points="200,220 185,250 215,250" fill="#228B22" />
        `;
      case 2: // Seedling (small pine)
        return `
          <line x1="200" y1="270" x2="200" y2="200" stroke="#8B4513" stroke-width="5" />
          <!-- Tiered branches -->
          <polygon points="200,180 175,220 225,220" fill="#228B22" />
          <polygon points="200,200 165,250 235,250" fill="#2E8B57" />
        `;
      case 3: // Vegetative (medium pine)
        return `
          <line x1="200" y1="270" x2="200" y2="150" stroke="#8B4513" stroke-width="7" />
          <!-- Three tiers -->
          <polygon points="200,130 170,170 230,170" fill="#006400" />
          <polygon points="200,155 160,205 240,205" fill="#228B22" />
          <polygon points="200,185 150,250 250,250" fill="#2E8B57" />
        `;
      case 4: // Tree (full pine)
        return `
          <!-- Trunk -->
          <rect x="190" y="250" width="20" height="30" fill="#8B4513" />
          <!-- Pine tree tiers -->
          <polygon points="200,70 155,130 245,130" fill="#006400" />
          <polygon points="200,100 145,170 255,170" fill="#228B22" />
          <polygon points="200,140 135,220 265,220" fill="#2E8B57" />
          <polygon points="200,180 130,260 270,260" fill="#3CB371" />
          <!-- Star on top -->
          <text x="200" y="65" font-size="25" text-anchor="middle">⭐</text>
        `;
      default:
        return '';
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CACTUS - Desert plant
  // ─────────────────────────────────────────────────────────────────────────
  cactus: (stage: number, flowerEmoji: string) => {
    switch (stage) {
      case 0: // Seed
        return `
          <ellipse cx="200" cy="270" rx="6" ry="4" fill="#228B22" />
        `;
      case 1: // Sprout (tiny cactus)
        return `
          <ellipse cx="200" cy="255" rx="12" ry="20" fill="#32CD32" />
          <!-- Spines -->
          <line x1="188" y1="250" x2="183" y2="248" stroke="#8B8B00" stroke-width="1" />
          <line x1="212" y1="250" x2="217" y2="248" stroke="#8B8B00" stroke-width="1" />
          <line x1="188" y1="260" x2="183" y2="262" stroke="#8B8B00" stroke-width="1" />
          <line x1="212" y1="260" x2="217" y2="262" stroke="#8B8B00" stroke-width="1" />
        `;
      case 2: // Seedling
        return `
          <ellipse cx="200" cy="235" rx="18" ry="40" fill="#32CD32" />
          <!-- Ridges -->
          <line x1="190" y1="210" x2="190" y2="260" stroke="#228B22" stroke-width="2" />
          <line x1="200" y1="205" x2="200" y2="265" stroke="#228B22" stroke-width="2" />
          <line x1="210" y1="210" x2="210" y2="260" stroke="#228B22" stroke-width="2" />
          <!-- Spines -->
          <g stroke="#DAA520" stroke-width="1">
            <line x1="182" y1="220" x2="175" y2="218" />
            <line x1="218" y1="220" x2="225" y2="218" />
            <line x1="182" y1="240" x2="175" y2="242" />
            <line x1="218" y1="240" x2="225" y2="242" />
          </g>
        `;
      case 3: // Vegetative (arms starting)
        return `
          <!-- Main body -->
          <rect x="185" y="180" width="30" height="90" rx="15" fill="#32CD32" />
          <!-- Left arm -->
          <path d="M 185 220 Q 160 220 160 190 Q 160 170 165 160" stroke="#32CD32" stroke-width="20" fill="none" stroke-linecap="round" />
          <!-- Right arm starting -->
          <path d="M 215 230 Q 235 230 235 215" stroke="#32CD32" stroke-width="15" fill="none" stroke-linecap="round" />
          <!-- Ridges -->
          <line x1="195" y1="185" x2="195" y2="265" stroke="#228B22" stroke-width="2" />
          <line x1="205" y1="185" x2="205" y2="265" stroke="#228B22" stroke-width="2" />
          <!-- Spines -->
          <g stroke="#DAA520" stroke-width="1">
            <line x1="185" y1="200" x2="178" y2="198" />
            <line x1="215" y1="200" x2="222" y2="198" />
            <line x1="160" y1="180" x2="153" y2="178" />
          </g>
        `;
      case 4: // Full cactus with flower
        return `
          <!-- Main body -->
          <rect x="182" y="160" width="36" height="110" rx="18" fill="#32CD32" />
          <!-- Left arm -->
          <path d="M 182 210 Q 145 210 145 170 Q 145 130 155 110" stroke="#32CD32" stroke-width="24" fill="none" stroke-linecap="round" />
          <!-- Right arm -->
          <path d="M 218 200 Q 255 200 255 160 Q 255 130 245 115" stroke="#32CD32" stroke-width="24" fill="none" stroke-linecap="round" />
          <!-- Ridges on main body -->
          <line x1="192" y1="165" x2="192" y2="265" stroke="#228B22" stroke-width="2" />
          <line x1="200" y1="163" x2="200" y2="267" stroke="#228B22" stroke-width="2" />
          <line x1="208" y1="165" x2="208" y2="265" stroke="#228B22" stroke-width="2" />
          <!-- Flower on top -->
          <text x="200" y="155" font-size="35" text-anchor="middle">${flowerEmoji}</text>
          <!-- Small flowers on arms -->
          <text x="155" y="105" font-size="20" text-anchor="middle">🌸</text>
          <text x="245" y="110" font-size="20" text-anchor="middle">🌸</text>
        `;
      default:
        return '';
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BONSAI - Miniature artistic tree
  // ─────────────────────────────────────────────────────────────────────────
  bonsai: (stage: number, flowerEmoji: string) => {
    switch (stage) {
      case 0: // Seed
        return `
          <ellipse cx="200" cy="270" rx="5" ry="7" fill="#654321" />
          <path d="M 200 267 Q 202 263 200 258" stroke="#228B22" stroke-width="1.5" fill="none" />
        `;
      case 1: // Sprout
        return `
          <path d="M 200 270 Q 195 255 200 240" stroke="#8B4513" stroke-width="3" fill="none" />
          <circle cx="200" cy="235" r="10" fill="#228B22" />
        `;
      case 2: // Seedling
        return `
          <!-- Curved trunk -->
          <path d="M 200 270 Q 190 250 195 230 Q 200 210 210 200" stroke="#8B4513" stroke-width="5" fill="none" stroke-linecap="round" />
          <!-- Foliage pads -->
          <ellipse cx="210" cy="195" rx="20" ry="12" fill="#228B22" />
          <ellipse cx="195" cy="210" rx="15" ry="10" fill="#2E8B57" />
        `;
      case 3: // Vegetative
        return `
          <!-- Artistic curved trunk -->
          <path d="M 200 270 Q 180 250 185 220 Q 190 190 220 170 Q 235 160 230 145" stroke="#8B4513" stroke-width="7" fill="none" stroke-linecap="round" />
          <!-- Branch -->
          <path d="M 190 210 Q 160 200 150 185" stroke="#8B4513" stroke-width="4" fill="none" stroke-linecap="round" />
          <!-- Foliage pads -->
          <ellipse cx="230" cy="140" rx="25" ry="15" fill="#228B22" />
          <ellipse cx="150" cy="180" rx="20" ry="12" fill="#228B22" />
          <ellipse cx="200" cy="175" rx="18" ry="10" fill="#2E8B57" />
        `;
      case 4: // Mature Bonsai
        return `
          <!-- Dramatic curved trunk -->
          <path d="M 200 270 Q 170 250 175 210 Q 180 170 220 150 Q 250 135 240 110 Q 235 95 250 80"
                stroke="#8B4513" stroke-width="10" fill="none" stroke-linecap="round" />
          <!-- Branches -->
          <path d="M 180 200 Q 140 190 120 170" stroke="#8B4513" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M 220 150 Q 190 140 170 120" stroke="#8B4513" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M 240 120 Q 270 110 290 95" stroke="#8B4513" stroke-width="4" fill="none" stroke-linecap="round" />
          <!-- Foliage clouds -->
          <ellipse cx="250" cy="75" rx="30" ry="18" fill="#228B22" />
          <ellipse cx="170" cy="115" rx="25" ry="15" fill="#2E8B57" />
          <ellipse cx="120" cy="165" rx="28" ry="16" fill="#228B22" />
          <ellipse cx="290" cy="90" rx="22" ry="14" fill="#3CB371" />
          <!-- Accent flowers -->
          <text x="250" y="70" font-size="20" text-anchor="middle">${flowerEmoji}</text>
          <text x="120" y="160" font-size="15" text-anchor="middle">${flowerEmoji}</text>
        `;
      default:
        return '';
    }
  },
};
