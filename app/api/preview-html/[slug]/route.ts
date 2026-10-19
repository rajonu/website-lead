import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { renderPublicSiteHtml } from '@/lib/services/site-renderer';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const lead = await LeadRepository.getLeadBySlug(slug);

    if (!lead) {
      return new NextResponse('Website preview not found', { status: 404 });
    }

    const html = renderPublicSiteHtml(lead);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (err: unknown) {
    return new NextResponse('Internal error rendering preview', { status: 500 });
  }
}
