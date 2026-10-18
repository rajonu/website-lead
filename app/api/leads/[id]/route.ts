import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await LeadRepository.getLeadById(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: lead });
  } catch (err) {
    logger.error('API GET /leads/[id] error', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const updated = await LeadRepository.updateLead(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    logger.error('API PATCH /leads/[id] error', err);
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await LeadRepository.deleteLead(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lead and demo site deleted successfully' });
  } catch (err) {
    logger.error('API DELETE /leads/[id] error', err);
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
}

