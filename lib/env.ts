// Environment variable validation
export function validateEnv() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file or environment configuration.'
    );
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    console.warn(
      'Warning: JWT_SECRET is shorter than recommended 32 characters. ' +
      'Consider using a longer, more secure secret for production.'
    );
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI!;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://');
  }

  console.log('✅ Environment variables validated successfully');
}

// Export validated environment variables
export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  MONGODB_URI: process.env.MONGODB_URI!,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SIMSTUDIO_WEBHOOK_URL: process.env.SIMSTUDIO_WEBHOOK_URL,
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  ORDER_API_KEY: process.env.ORDER_API_KEY,
  ADMIN_ADMIN_PASSWORD_HASH: process.env.ADMIN_ADMIN_PASSWORD_HASH,
  ADMIN_MANAGER_PASSWORD_HASH: process.env.ADMIN_MANAGER_PASSWORD_HASH,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  EMAIL_SERVICE_ID: process.env.EMAIL_SERVICE_ID,
  EMAIL_TEMPLATE_ID: process.env.EMAIL_TEMPLATE_ID,
  EMAIL_PUBLIC_KEY: process.env.EMAIL_PUBLIC_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
} as const;
