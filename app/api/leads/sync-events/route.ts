import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const stats = await LeadRepository.syncBrevoDeliveryEvents();
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    logger.error('API /leads/sync-events error', err);
    return NextResponse.json({ success: false, error: 'Failed to sync Brevo delivery events' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const stats = await LeadRepository.syncBrevoDeliveryEvents();
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    logger.error('API /leads/sync-events error', err);
    return NextResponse.json({ success: false, error: 'Failed to sync Brevo delivery events' }, { status: 500 });
  }
}
