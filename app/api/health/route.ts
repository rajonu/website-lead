import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  
  const healthData = {
    status: 'healthy',
    uptime: uptimeSeconds,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'website-lead-engine',
    version: '1.0.0',
    memoryUsage: process.memoryUsage ? {
      rssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
    } : undefined,
  };

  logger.debug('Health check probe received', { uptimeSeconds });

  return NextResponse.json(healthData, { status: 200 });
}
