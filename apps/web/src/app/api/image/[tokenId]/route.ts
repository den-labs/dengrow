import { NextRequest, NextResponse } from 'next/server';
import { generateTraits, getStage } from '@/lib/traits';
import { getArchetypeVisual } from '@/lib/archetypes';

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
  species: { id: string; name: string };
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
  const { pot, background, flower, companion, species } = traits;

  // Plant visual based on archetype (species) and stage
  const plantVisuals = getArchetypeVisual(species.id, stage, flower.emoji);

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
