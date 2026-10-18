import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { LifecycleStage } from '@/lib/types/lead';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const market = searchParams.get('market') || undefined;
    const lifecycle = (searchParams.get('lifecycle') as LifecycleStage) || undefined;
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined;

    const leads = await LeadRepository.getAllLeads({ market, lifecycle, minScore });
    return NextResponse.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    logger.error('API /leads error', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ success: false, error: 'Business name and category are required' }, { status: 400 });
    }

    const saved = await LeadRepository.saveLead(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    logger.error('API POST /leads error', err);
    return NextResponse.json({ success: false, error: 'Failed to save lead' }, { status: 500 });
  }
}
