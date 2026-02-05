import { NextRequest, NextResponse } from 'next/server';
import { generateTraits, getStage, STAGES } from '@/lib/traits';

/**
 * GET /api/image/[tokenId]
 *
 * Generates a dynamic SVG image for a plant NFT
 * Shows stage, traits, and visual elements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = parseInt(params.tokenId, 10);

  // Validate token ID
  if (isNaN(tokenId) || tokenId < 1) {
    return new NextResponse('Invalid token ID', { status: 400 });
  }

  // Get stage from query param (default to 0)
  const stageParam = request.nextUrl.searchParams.get('stage');
  const stage = stageParam ? Math.min(Math.max(parseInt(stageParam, 10), 0), 4) : 0;

  // Generate traits for this token
  const traits = generateTraits(tokenId);
  const stageInfo = getStage(stage);

  // Generate SVG
  const svg = generatePlantSVG(tokenId, stage, traits, stageInfo);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

interface Traits {
  pot: { name: string; color: string };
  background: { name: string; color: string };
  flower: { emoji: string; name: string };
  companion: { emoji: string; id: string };
}

interface StageInfo {
  id: number;
  name: string;
  emoji: string;
}

function generatePlantSVG(
  tokenId: number,
  stage: number,
  traits: Traits,
  stageInfo: StageInfo
): string {
  const { pot, background, flower, companion } = traits;

  // Plant visual based on stage
  const plantVisuals = getPlantVisual(stage, flower.emoji);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${background.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(background.color, -30)};stop-opacity:1" />
    </linearGradient>

    <!-- Pot gradient -->
    <linearGradient id="pot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${adjustColor(pot.color, 20)};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(pot.color, -20)};stop-opacity:1" />
    </linearGradient>

    <!-- Subtle shadow -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg-gradient)" />

  <!-- Decorative circles -->
  <circle cx="50" cy="50" r="30" fill="${adjustColor(background.color, 20)}" opacity="0.3" />
  <circle cx="350" cy="80" r="20" fill="${adjustColor(background.color, 30)}" opacity="0.25" />
  <circle cx="380" cy="350" r="40" fill="${adjustColor(background.color, -10)}" opacity="0.2" />

  <!-- Plant container (pot) -->
  <g filter="url(#shadow)">
    <!-- Pot body -->
    <path d="M 130 280 L 140 350 Q 145 365 200 365 Q 255 365 260 350 L 270 280 Z"
          fill="url(#pot-gradient)" />
    <!-- Pot rim -->
    <ellipse cx="200" cy="280" rx="75" ry="12" fill="${adjustColor(pot.color, 10)}" />
    <!-- Pot soil -->
    <ellipse cx="200" cy="280" rx="65" ry="8" fill="#3d2817" />
  </g>

  <!-- Plant (changes based on stage) -->
  ${plantVisuals}

  <!-- Companion (if any) -->
  ${companion.id !== 'none' ? `
  <text x="320" y="180" font-size="40" text-anchor="middle">${companion.emoji}</text>
  ` : ''}

  <!-- Token ID badge -->
  <g transform="translate(340, 30)">
    <rect x="-30" y="-18" width="60" height="28" rx="14" fill="rgba(0,0,0,0.5)" />
    <text x="0" y="5" font-family="system-ui, sans-serif" font-size="14" fill="white" text-anchor="middle" font-weight="bold">#${tokenId}</text>
  </g>

  <!-- Stage badge -->
  <g transform="translate(60, 30)">
    <rect x="-45" y="-18" width="90" height="28" rx="14" fill="rgba(0,0,0,0.5)" />
    <text x="0" y="5" font-family="system-ui, sans-serif" font-size="12" fill="white" text-anchor="middle">${stageInfo.emoji} ${stageInfo.name}</text>
  </g>
</svg>`;
}

function getPlantVisual(stage: number, flowerEmoji: string): string {
  // Different plant visuals for each stage
  switch (stage) {
    case 0: // Seed
      return `
        <!-- Seed -->
        <ellipse cx="200" cy="270" rx="8" ry="12" fill="#8B4513" />
        <path d="M 200 268 Q 205 260 200 250" stroke="#228B22" stroke-width="2" fill="none" />
      `;
    case 1: // Sprout
      return `
        <!-- Sprout -->
        <path d="M 200 270 L 200 230" stroke="#228B22" stroke-width="4" stroke-linecap="round" />
        <ellipse cx="190" cy="230" rx="15" ry="10" fill="#32CD32" transform="rotate(-30 190 230)" />
        <ellipse cx="210" cy="230" rx="15" ry="10" fill="#32CD32" transform="rotate(30 210 230)" />
      `;
    case 2: // Seedling
      return `
        <!-- Seedling -->
        <path d="M 200 270 L 200 180" stroke="#228B22" stroke-width="6" stroke-linecap="round" />
        <!-- Leaves -->
        <ellipse cx="175" cy="220" rx="25" ry="12" fill="#32CD32" transform="rotate(-40 175 220)" />
        <ellipse cx="225" cy="220" rx="25" ry="12" fill="#32CD32" transform="rotate(40 225 220)" />
        <ellipse cx="180" cy="190" rx="20" ry="10" fill="#3CB371" transform="rotate(-30 180 190)" />
        <ellipse cx="220" cy="190" rx="20" ry="10" fill="#3CB371" transform="rotate(30 220 190)" />
      `;
    case 3: // Vegetative
      return `
        <!-- Vegetative (full plant) -->
        <path d="M 200 270 L 200 140" stroke="#228B22" stroke-width="8" stroke-linecap="round" />
        <!-- Multiple leaf layers -->
        <ellipse cx="160" cy="240" rx="30" ry="15" fill="#228B22" transform="rotate(-50 160 240)" />
        <ellipse cx="240" cy="240" rx="30" ry="15" fill="#228B22" transform="rotate(50 240 240)" />
        <ellipse cx="165" cy="200" rx="28" ry="14" fill="#32CD32" transform="rotate(-40 165 200)" />
        <ellipse cx="235" cy="200" rx="28" ry="14" fill="#32CD32" transform="rotate(40 235 200)" />
        <ellipse cx="170" cy="165" rx="25" ry="12" fill="#3CB371" transform="rotate(-35 170 165)" />
        <ellipse cx="230" cy="165" rx="25" ry="12" fill="#3CB371" transform="rotate(35 230 165)" />
        <ellipse cx="180" cy="140" rx="20" ry="10" fill="#90EE90" transform="rotate(-25 180 140)" />
        <ellipse cx="220" cy="140" rx="20" ry="10" fill="#90EE90" transform="rotate(25 220 140)" />
      `;
    case 4: // Tree (with flower)
      return `
        <!-- Tree trunk -->
        <path d="M 200 270 L 200 100" stroke="#8B4513" stroke-width="12" stroke-linecap="round" />
        <!-- Branches -->
        <path d="M 200 180 Q 150 160 130 140" stroke="#8B4513" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M 200 180 Q 250 160 270 140" stroke="#8B4513" stroke-width="6" fill="none" stroke-linecap="round" />
        <path d="M 200 140 Q 160 120 140 100" stroke="#8B4513" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M 200 140 Q 240 120 260 100" stroke="#8B4513" stroke-width="4" fill="none" stroke-linecap="round" />
        <!-- Foliage -->
        <circle cx="130" cy="130" r="35" fill="#228B22" />
        <circle cx="200" cy="90" r="40" fill="#32CD32" />
        <circle cx="270" cy="130" r="35" fill="#228B22" />
        <circle cx="160" cy="100" r="30" fill="#3CB371" />
        <circle cx="240" cy="100" r="30" fill="#3CB371" />
        <!-- Flower at top -->
        <text x="200" y="70" font-size="35" text-anchor="middle">${flowerEmoji}</text>
        <!-- Additional flowers -->
        <text x="140" cy="140" font-size="20" text-anchor="middle">${flowerEmoji}</text>
        <text x="260" cy="140" font-size="20" text-anchor="middle">${flowerEmoji}</text>
      `;
    default:
      return '';
  }
}

/**
 * Adjust color brightness
 * @param color - Hex color string
 * @param amount - Positive = lighter, Negative = darker
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
