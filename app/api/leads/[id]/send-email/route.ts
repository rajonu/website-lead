import { NextRequest, NextResponse } from 'next/server';
import { LeadRepository } from '@/lib/db';
import { BrevoService } from '@/lib/services/brevo';
import { OutreachEvent } from '@/lib/types/lead';
import { logger } from '@/lib/logger';

interface SendEmailBody {
  to?: string;
  subject?: string;
  body?: string;
  confirmed?: boolean;
  dryRun?: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json: SendEmailBody = await req.json().catch(() => ({}));
    const { to, subject, body, confirmed, dryRun } = json;

    // 1. Mandatory human confirmation requirement
    if (confirmed !== true) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email send must be explicitly reviewed and confirmed by the operator.',
        },
        { status: 400 }
      );
    }

    // 2. Lead verification
    const lead = await LeadRepository.getLeadById(id);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found.' },
        { status: 404 }
      );
    }

    // 3. Check for outreach suppression
    if (lead.outreach?.suppressed) {
      return NextResponse.json(
        {
          success: false,
          error: `Outreach is suppressed for this prospect: ${
            lead.outreach.suppressionReason || 'Manual suppression flag active'
          }.`,
        },
        { status: 400 }
      );
    }

    // 4. Server-side validation of recipient email, subject, and body
    const validation = BrevoService.validate({
      toEmail: to || '',
      subject: subject || '',
      textContent: body || '',
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 5. Send single transactional email via Brevo
    const result = await BrevoService.sendTransactionalEmail({
      toEmail: to!,
      toName: lead.name,
      subject: subject!,
      textContent: body!,
      dryRun,
    });

    // 6. Record event in lead history
    if (!result.success) {
      const failureEvent: OutreachEvent = {
        channel: 'email',
        type: 'failed',
        at: new Date().toISOString(),
        notes: `Failed to send email via Brevo to ${to}: ${result.error}`,
      };

      await LeadRepository.updateLead(lead.id, {
        outreach: {
          ...lead.outreach,
          events: [...(lead.outreach?.events || []), failureEvent],
        },
      });

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 }
      );
    }

    // 7. On success: record sent event, advance lifecycle stage to 'contacted'
    const successEvent: OutreachEvent = {
      channel: 'email',
      type: 'sent',
      at: new Date().toISOString(),
      notes: `Sent transactional email via Brevo to ${to} (Subject: "${subject}"). Message ID: ${
        result.messageId
      }${result.dryRun ? ' [DRY RUN]' : ''}`,
    };

    const updatedLead = await LeadRepository.updateLead(lead.id, {
      lifecycle: 'contacted',
      sales: {
        ...lead.sales,
        stage: 'contacted',
        nextAction: 'Monitor prospect reply',
        nextActionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      outreach: {
        ...lead.outreach,
        draft: body,
        events: [...(lead.outreach?.events || []), successEvent],
      },
    });

    logger.info('Recorded email outreach event for lead', {
      leadId: lead.id,
      dryRun: result.dryRun,
      messageId: result.messageId,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      dryRun: result.dryRun,
      data: updatedLead,
    });
  } catch (err: unknown) {
    logger.error('Unexpected error in /api/leads/[id]/send-email', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected server error occurred while processing the email send request.',
      },
      { status: 500 }
    );
  }
}
