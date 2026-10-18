import { NextRequest, NextResponse } from 'next/server';
import { scanForLeads, ScanOptions } from '@/lib/services/discovery';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body: ScanOptions = await req.json().catch(() => ({}));
    const count = body.count ? Number(body.count) : 3;
    const market = body.market || 'ALL';
    const niche = body.niche || 'ALL';

    logger.info('Received lead scan request', { count, market, niche });

    const result = await scanForLeads({
      count,
      market,
      niche,
    });

    return NextResponse.json({
      success: true,
      message: `Scan complete: added ${result.addedCount} new qualified prospects.`,
      scannedCount: result.scannedCount,
      addedCount: result.addedCount,
      leads: result.leads,
    });
  } catch (err: unknown) {
    logger.error('Failed to run lead scan', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while scanning for leads.',
      },
      { status: 500 }
    );
  }
}
