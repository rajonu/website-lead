import { NextRequest, NextResponse } from 'next/server';
import { AutopilotService } from '@/lib/services/autopilot';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = AutopilotService.getStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (err: unknown) {
    logger.error('Failed to get autopilot status', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve autopilot status.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, enabled, dryRun } = body;

    logger.info('Received autopilot API request', { action, enabled, dryRun });

    if (action === 'run_cycle' || action === 'run_now') {
      const result = await AutopilotService.runHourlyCycle();
      return NextResponse.json({
        success: result.success,
        message: result.success
          ? `Autopilot cycle executed for ${result.market}: ${result.action}`
          : `Autopilot cycle did not complete: ${result.error || result.action}`,
        data: result,
      });
    }

    if (action === 'run_daily_batch' || action === 'run_dhaka_batch') {
      const count = body.count ? Number(body.count) : 5;
      const result = await AutopilotService.runDailyDhakaBatch(count);
      return NextResponse.json({
        success: result.success,
        message: result.details,
        data: result,
      });
    }

    if (action === 'toggle' || enabled !== undefined) {
      const current = AutopilotService.getStatus();
      const newEnabled = enabled !== undefined ? Boolean(enabled) : !current.enabled;
      const updated = AutopilotService.updateConfig({ enabled: newEnabled });
      return NextResponse.json({
        success: true,
        message: `Autopilot is now ${newEnabled ? 'ACTIVE' : 'PAUSED'}.`,
        data: updated,
      });
    }

    if (action === 'toggle_dry_run' || dryRun !== undefined) {
      const current = AutopilotService.getStatus();
      const newDryRun = dryRun !== undefined ? Boolean(dryRun) : !current.dryRun;
      const updated = AutopilotService.updateConfig({ dryRun: newDryRun });
      return NextResponse.json({
        success: true,
        message: `Autopilot dry-run mode is now ${newDryRun ? 'ENABLED' : 'DISABLED'}.`,
        data: updated,
      });
    }

    // Default status return
    const status = AutopilotService.getStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (err: unknown) {
    logger.error('Error handling autopilot POST request', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
