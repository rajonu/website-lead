import { NextRequest, NextResponse } from 'next/server';
import { AutopilotService } from '@/lib/services/autopilot';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

async function handleRun(req: NextRequest) {
  try {
    logger.info('Autopilot direct run triggered');
    const result = await AutopilotService.runHourlyCycle();

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: unknown) {
    logger.error('Error in autopilot run route', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown execution error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handleRun(req);
}

export async function GET(req: NextRequest) {
  return handleRun(req);
}
