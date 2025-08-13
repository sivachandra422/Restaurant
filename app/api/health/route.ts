import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { createVectorService } from '@/lib/services/multiProviderVectorService';
import { loadVectorConfig, getEnvironmentSummary, isProductionReady } from '@/lib/config/vectorConfig';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  error?: string;
  details?: any;
  provider?: string | null;
  test?: {
    status: 'healthy' | 'unhealthy';
    duration?: string;
    embeddingLength?: number;
    documentCount?: number;
    error?: string;
  };
}

export async function GET() {
  const startTime = Date.now();
  const healthChecks: Record<string, HealthCheck> = {};
  
  try {
    // 1. Environment Configuration Check
    try {
      const envSummary = getEnvironmentSummary();
      const productionReady = isProductionReady();
      
      healthChecks.environment = {
        status: 'healthy',
        details: {
          environment: envSummary.environment,
          isProduction: envSummary.isProduction,
          hasMongoDB: envSummary.hasMongoDB,
          hasVectorProvider: envSummary.hasVectorProvider,
          activeProviders: envSummary.activeProviders,
          totalProviders: envSummary.totalProviders,
          productionReady: productionReady.ready,
          issues: productionReady.issues
        }
      };
    } catch (error) {
      healthChecks.environment = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 2. Vector Service Health Check
    try {
      const vectorConfig = loadVectorConfig();
      const vectorService = createVectorService(vectorConfig);
      const vectorHealth = await vectorService.healthCheck();
      
      healthChecks.vectorService = {
        status: vectorHealth.status,
        provider: vectorHealth.provider,
        error: vectorHealth.error,
        details: vectorService.getProviderInfo()
      };
    } catch (error) {
      healthChecks.vectorService = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 3. Database Connection Check
    try {
      const { db } = await connectToDatabase();
      if (db) {
        // Test database connection with a simple query
        await db.admin().ping();
        
        healthChecks.database = {
          status: 'healthy',
          details: {
            connected: true,
            database: db.databaseName,
            collections: await db.listCollections().toArray().then(cols => cols.map(c => c.name))
          }
        };
      } else {
        healthChecks.database = {
          status: 'unhealthy',
          error: 'Database connection not available'
        };
      }
    } catch (error) {
      healthChecks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // 4. Overall Health Status
    const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy');
    const overallStatus = allHealthy ? 'healthy' : 'unhealthy';

    // 5. Performance Metrics
    const responseTime = Date.now() - startTime;
    
    // 6. System Information
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    };

    const response = {
      status: overallStatus,
      timestamp: systemInfo.timestamp,
      responseTime: `${responseTime}ms`,
      checks: healthChecks,
      system: systemInfo,
      summary: {
        totalChecks: Object.keys(healthChecks).length,
        healthyChecks: Object.values(healthChecks).filter(check => check.status === 'healthy').length,
        unhealthyChecks: Object.values(healthChecks).filter(check => check.status === 'unhealthy').length
      }
    };

    // Return appropriate HTTP status
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    // If the health check itself fails
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      checks: healthChecks,
      responseTime: `${Date.now() - startTime}ms`
    };

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// POST endpoint for detailed health check (useful for monitoring systems)
export async function POST(request: Request) {
  try {
    const { detailed = false, includeTests = false } = await request.json();
    
    if (detailed) {
      // Perform more comprehensive health checks
      const detailedChecks = await performDetailedHealthChecks(includeTests);
      return NextResponse.json(detailedChecks);
    }
    
    // Return basic GET response
    return GET();
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Invalid health check request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

async function performDetailedHealthChecks(includeTests: boolean) {
  const checks: Record<string, HealthCheck> = {};
  
  // Basic health checks (same as GET)
  try {
    const envSummary = getEnvironmentSummary();
    const productionReady = isProductionReady();
    
    checks.environment = {
      status: 'healthy',
      details: {
        environment: envSummary.environment,
        isProduction: envSummary.isProduction,
        hasMongoDB: envSummary.hasMongoDB,
        hasVectorProvider: envSummary.hasVectorProvider,
        activeProviders: envSummary.activeProviders,
        totalProviders: envSummary.totalProviders,
        productionReady: productionReady.ready,
        issues: productionReady.issues
      }
    };
  } catch (error) {
    checks.environment = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Vector service check
  try {
    const vectorConfig = loadVectorConfig();
    const vectorService = createVectorService(vectorConfig);
    const vectorHealth = await vectorService.healthCheck();
    
    checks.vectorService = {
      status: vectorHealth.status,
      provider: vectorHealth.provider,
      error: vectorHealth.error,
      details: vectorService.getProviderInfo()
    };

    // If includeTests is true, perform actual vector search test
    if (includeTests && vectorHealth.status === 'healthy') {
      try {
        const testStart = Date.now();
        const testEmbedding = await vectorService.generateEmbeddings('test health check');
        const testDuration = Date.now() - testStart;
        
        checks.vectorService.test = {
          status: 'healthy',
          duration: `${testDuration}ms`,
          embeddingLength: testEmbedding.length
        };
      } catch (testError) {
        checks.vectorService.test = {
          status: 'unhealthy',
          error: testError instanceof Error ? testError.message : 'Unknown error'
        };
      }
    }
  } catch (error) {
    checks.vectorService = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Database check
  try {
    const { db } = await connectToDatabase();
    if (db) {
      const pingStart = Date.now();
      await db.admin().ping();
      const pingDuration = Date.now() - pingStart;
      
      checks.database = {
        status: 'healthy',
        details: {
          connected: true,
          database: db.databaseName,
          pingDuration: `${pingDuration}ms`,
          collections: await db.listCollections().toArray().then(cols => cols.map(c => c.name))
        }
      };

      // If includeTests is true, perform actual database query test
      if (includeTests) {
        try {
          const queryStart = Date.now();
          const collection = db.collection('menuitems');
          const count = await collection.countDocuments({});
          const queryDuration = Date.now() - queryStart;
          
          checks.database.test = {
            status: 'healthy',
            duration: `${queryDuration}ms`,
            documentCount: count
          };
        } catch (testError) {
          checks.database.test = {
            status: 'unhealthy',
            error: testError instanceof Error ? testError.message : 'Unknown error'
          };
        }
      }
    } else {
      checks.database = {
        status: 'unhealthy',
        error: 'Database connection not available'
      };
    }
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Overall status
  const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      totalChecks: Object.keys(checks).length,
      healthyChecks: Object.values(checks).filter(check => check.status === 'healthy').length,
      unhealthyChecks: Object.values(checks).filter(check => check.status === 'unhealthy').length
    }
  };
}
