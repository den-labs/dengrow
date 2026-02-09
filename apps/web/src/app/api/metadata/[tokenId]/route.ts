import { NextRequest, NextResponse } from 'next/server';
import { generateMetadata, generateTraits, getStage } from '@/lib/traits';

/**
 * GET /api/metadata/[tokenId]
 *
 * Returns NFT metadata in standard format (ERC-721 compatible)
 * Includes traits, stage info, and image URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = parseInt(params.tokenId, 10);

  // Validate token ID
  if (isNaN(tokenId) || tokenId < 1) {
    return NextResponse.json(
      { error: 'Invalid token ID' },
      { status: 400 }
    );
  }

  // Get base URL from request or environment
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  // For now, we'll default to stage 0 (Seed) since we can't query on-chain
  // In production, this could query the blockchain for actual stage
  // Or accept stage as a query parameter for dynamic metadata
  const stageParam = request.nextUrl.searchParams.get('stage');
  const stage = stageParam ? parseInt(stageParam, 10) : 0;

  // Optional tier parameter (1=Basic, 2=Premium, 3=Impact)
  const tierParam = request.nextUrl.searchParams.get('tier');
  const tier = tierParam ? parseInt(tierParam, 10) : null;

  // Generate metadata
  const metadata = generateMetadata(tokenId, stage, baseUrl);

  // Add tier attribute if provided
  if (tier && tier >= 1 && tier <= 3) {
    const tierNames: Record<number, string> = { 1: 'Basic', 2: 'Premium', 3: 'Impact' };
    metadata.attributes.push({ trait_type: 'Mint Tier', value: tierNames[tier] });
  }

  // Return with appropriate headers for NFT platforms
  return NextResponse.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
    },
  });
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
