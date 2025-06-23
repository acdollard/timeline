import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

export const GET: APIRoute = async () => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0', // Update this with your app version
    checks: {
      database: 'unknown',
      environment: 'unknown'
    }
  };

  try {
    // Check database connection
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1);

    if (error) {
      healthCheck.checks.database = 'unhealthy';
      healthCheck.status = 'degraded';
      logger.error('Database health check failed', { error: error.message });
    } else {
      healthCheck.checks.database = 'healthy';
    }

    // Check environment variables
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    
    if (missingEnvVars.length > 0) {
      healthCheck.checks.environment = 'unhealthy';
      healthCheck.status = 'unhealthy';
      logger.error('Missing environment variables', { missing: missingEnvVars });
    } else {
      healthCheck.checks.environment = 'healthy';
    }

    // Determine overall status
    if (healthCheck.checks.database === 'unhealthy' || healthCheck.checks.environment === 'unhealthy') {
      healthCheck.status = 'unhealthy';
    } else if (healthCheck.checks.database === 'unknown' || healthCheck.checks.environment === 'unknown') {
      healthCheck.status = 'degraded';
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify(healthCheck), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    healthCheck.status = 'unhealthy';
    healthCheck.checks.database = 'unhealthy';
    
    return new Response(JSON.stringify(healthCheck), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}; 