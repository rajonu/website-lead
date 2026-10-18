import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;

    const recommendations = await LeadRepository.getDailyRecommendations(limit);
    return NextResponse.json({ success: true, count: recommendations.length, data: recommendations });
  } catch (err) {
    logger.error('API /recommendations error', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
