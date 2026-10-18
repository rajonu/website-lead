import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const market = searchParams.get('market') || undefined;

    const metrics = await LeadRepository.getFunnelMetrics(market);
    return NextResponse.json({ success: true, data: metrics });
  } catch (err) {
    logger.error('API /metrics error', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
