import { VectorProviderConfig } from '@/lib/services/multiProviderVectorService';

/**
 * Environment variable validation for production
 */
function validateEnvironmentVariables() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check MongoDB connection
  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required');
  }

  // Check if at least one vector provider is configured
  const hasVectorProvider = process.env.GROQ_API_KEY || 
                           process.env.GEMINI_API_KEY || 
                           process.env.OPENAI_API_KEY || 
                           process.env.OPENROUTER_API_KEY;

  if (!hasVectorProvider) {
    errors.push('At least one vector service provider API key is required');
  }

  // Validate API key formats
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith('gsk_')) {
    warnings.push('GROQ_API_KEY format appears invalid (should start with "gsk_")');
  }

  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AIza')) {
    warnings.push('GEMINI_API_KEY format appears invalid (should start with "AIza")');
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    warnings.push('OPENAI_API_KEY format appears invalid (should start with "sk-")');
  }

  if (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith('sk-or-')) {
    warnings.push('OPENROUTER_API_KEY format appears invalid (should start with "sk-or-")');
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      warnings.push('Gemini free tier is not recommended for production. Consider using Groq or OpenAI.');
    }

    if (!process.env.JWT_SECRET) {
      warnings.push('JWT_SECRET is recommended for production security');
    }
  }

  return { errors, warnings };
}

/**
 * Load vector service configuration from environment variables
 */
export function loadVectorConfig(): VectorProviderConfig {
  // Validate environment variables
  const validation = validateEnvironmentVariables();
  
  if (validation.errors.length > 0) {
    console.error('❌ Environment validation errors:', validation.errors);
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment validation warnings:', validation.warnings);
  }

  const config: VectorProviderConfig = {};

  // OpenAI Configuration
  if (process.env.OPENAI_API_KEY) {
    config.openai = {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'text-embedding-3-small'
    };
  }

  // Groq Configuration
  if (process.env.GROQ_API_KEY) {
    config.groq = {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama3-8b-8192'
    };
  }

  // Gemini Configuration
  if (process.env.GEMINI_API_KEY) {
    config.gemini = {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    };
  }

  // OpenRouter Configuration
  if (process.env.OPENROUTER_API_KEY) {
    config.openrouter = {
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'text-embedding-3-small',
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    };
  }

  return config;
}

/**
 * Get the recommended provider based on cost and performance
 */
export function getRecommendedProvider(): string {
  if (process.env.GROQ_API_KEY) {
    return 'Groq (Fastest & Most Cost-Effective)';
  }
  if (process.env.GEMINI_API_KEY) {
    return 'Gemini (Free Tier Available)';
  }
  if (process.env.OPENAI_API_KEY) {
    return 'OpenAI (Most Reliable)';
  }
  if (process.env.OPENROUTER_API_KEY) {
    return 'OpenRouter (Multiple Models)';
  }
  return 'None configured';
}

/**
 * Get provider cost comparison
 */
export function getProviderCostComparison() {
  return {
    groq: {
      name: 'Groq',
      cost: '$0.10 per 1M tokens',
      speed: '10-100x faster than OpenAI',
      bestFor: 'Production, high-speed search'
    },
    gemini: {
      name: 'Google Gemini',
      cost: 'Free tier: 15 req/min, 1500 req/day',
      speed: 'Fast and reliable',
      bestFor: 'Development, testing, low-budget'
    },
    openai: {
      name: 'OpenAI',
      cost: '$0.02 per 1M tokens',
      speed: 'Standard speed',
      bestFor: 'Production, reliability'
    },
    openrouter: {
      name: 'OpenRouter',
      cost: 'Varies by model, competitive',
      speed: 'Varies by model',
      bestFor: 'Model flexibility, cost optimization'
    }
  };
}

/**
 * Get environment configuration summary for production monitoring
 */
export function getEnvironmentSummary() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasMongoDB = !!process.env.MONGODB_URI;
  const hasVectorProvider = !!(process.env.GROQ_API_KEY || 
                              process.env.GEMINI_API_KEY || 
                              process.env.OPENAI_API_KEY || 
                              process.env.OPENROUTER_API_KEY);
  
  const activeProviders = [];
  if (process.env.GROQ_API_KEY) activeProviders.push('Groq');
  if (process.env.GEMINI_API_KEY) activeProviders.push('Gemini');
  if (process.env.OPENAI_API_KEY) activeProviders.push('OpenAI');
  if (process.env.OPENROUTER_API_KEY) activeProviders.push('OpenRouter');

  return {
    environment: process.env.NODE_ENV || 'development',
    isProduction,
    hasMongoDB,
    hasVectorProvider,
    activeProviders,
    totalProviders: activeProviders.length,
    validation: validateEnvironmentVariables()
  };
}

/**
 * Check if the current configuration is production-ready
 */
export function isProductionReady(): { ready: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Required for production
  if (!process.env.MONGODB_URI) {
    issues.push('MONGODB_URI is required');
  }
  
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    issues.push('Production requires a paid vector service provider (Groq, OpenAI, or OpenRouter)');
  }
  
  // Recommended for production
  if (!process.env.JWT_SECRET) {
    issues.push('JWT_SECRET is recommended for production security');
  }
  
  if (process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    issues.push('Gemini free tier is not suitable for production traffic');
  }

  return {
    ready: issues.length === 0,
    issues
  };
}
