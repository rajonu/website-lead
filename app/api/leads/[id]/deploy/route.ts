import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { CloudflareEdgeService } from '@/lib/services/cloudflare';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await LeadRepository.getLeadById(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found.' },
        { status: 404 }
      );
    }

    if (!lead.generatedSite) {
      return NextResponse.json(
        { success: false, error: 'Lead does not have a generated website to deploy.' },
        { status: 400 }
      );
    }

    logger.info('Triggering Cloudflare Edge deployment for lead', { id: lead.id, slug: lead.slug });

    const deployResult = await CloudflareEdgeService.deployLeadPreview(lead);

    const updatedLead = await LeadRepository.updateLead(lead.id, {
      cloudflareDeployment: {
        deployed: deployResult.success,
        edgeUrl: deployResult.edgeUrl,
        deployedAt: deployResult.deployedAt,
        status: deployResult.mode === 'cloudflare_edge' ? 'synced' : 'local_only',
        lastError: deployResult.error,
        customDomain: lead.customer?.customDomain,
      },
    });

    return NextResponse.json({
      success: deployResult.success,
      data: updatedLead,
      deployResult,
    });
  } catch (err: unknown) {
    logger.error('Error in /api/leads/[id]/deploy route', err);
    return NextResponse.json(
      { success: false, error: 'Failed to deploy preview site to Cloudflare Edge.' },
      { status: 500 }
    );
  }
}
