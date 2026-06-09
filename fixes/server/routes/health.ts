/**
 * SALIS AUTO - Health Check Endpoint
 * 
 * FIXES APPLIED:
 * - [Production Readiness] Add GET /api/health returning DB connectivity + service status
 * - Provides uptime, memory usage, and dependency health
 */

import { Router, Request, Response } from 'express';
import { db } from '../db'; // Adjust import path to match your project
import { sql } from 'drizzle-orm';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: { status: string; latency?: number; error?: string };
    memory: { status: string; usage: NodeJS.MemoryUsage; heapUsedMB: number };
    websocket?: { status: string };
  };
}

router.get('/api/health', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = {
    database: { status: 'unknown' },
    memory: { status: 'unknown', usage: process.memoryUsage(), heapUsedMB: 0 },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - dbStart;
    checks.database = { status: 'healthy', latency: dbLatency };
  } catch (err: any) {
    checks.database = { status: 'unhealthy', error: err.message };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  checks.memory = {
    status: heapUsedMB < heapTotalMB * 0.9 ? 'healthy' : 'degraded',
    usage: memUsage,
    heapUsedMB,
  };

  // Determine overall status
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  const anyUnhealthy = Object.values(checks).some(c => c.status === 'unhealthy');

  const health: HealthStatus = {
    status: anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
  };

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

// Lightweight liveness probe (for load balancers)
router.get('/api/health/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Readiness probe (checks if app can serve traffic)
router.get('/api/health/ready', async (_req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'not_ready', timestamp: new Date().toISOString() });
  }
});

export default router;
