/**
 * SALIS AUTO - Environment Variable Validation
 * 
 * FIXES APPLIED:
 * - Validates all required env vars at boot (fail fast)
 * - Prevents runtime crashes from missing configuration
 * - Warns about insecure development settings
 */

import { z } from 'zod';

// ============================================================
// Environment Schema
// ============================================================
const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),

  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  AUTH_BYPASS: z.enum(['true', 'false']).default('false'),

  // Optional integrations
  STRIPE_SECRET_KEY: z.string().optional(),
  VITE_STRIPE_PUBLIC_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_INTEGRATIONS_OPENAI_API_KEY: z.string().optional(),

  // Google integrations
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),

  // PayPal
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// ============================================================
// Validation Function
// ============================================================
export function validateEnvironment(): Env {
  console.info('[ENV] Validating environment variables...');

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('🚨 Environment validation failed:');
    for (const issue of result.error.issues) {
      console.error(`   ❌ ${issue.path.join('.')}: ${issue.message}`);
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Cannot start in production with invalid environment. Exiting.');
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode with incomplete environment.');
    }
  }

  const env = result.data || (process.env as unknown as Env);

  // Security warnings
  if (env.AUTH_BYPASS === 'true') {
    console.warn('⚠️  AUTH_BYPASS is enabled. Authentication is disabled!');
  }

  if (env.NODE_ENV === 'development') {
    console.info('[ENV] Running in DEVELOPMENT mode');
  }

  // Map AI key compatibility
  if (!process.env.OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    console.info('[ENV] Mapped AI_INTEGRATIONS_OPENAI_API_KEY → OPENAI_API_KEY');
  }

  // Report integration status
  const integrations = {
    Stripe: !!env.STRIPE_SECRET_KEY,
    Twilio: !!env.TWILIO_ACCOUNT_SID,
    OpenAI: !!(env.OPENAI_API_KEY || env.AI_INTEGRATIONS_OPENAI_API_KEY),
    Google: !!env.GOOGLE_CLIENT_ID,
    PayPal: !!env.PAYPAL_CLIENT_ID,
  };

  console.info('[ENV] Integration status:', 
    Object.entries(integrations)
      .map(([k, v]) => `${k}: ${v ? '✅' : '❌'}`)
      .join(' | ')
  );

  return env as Env;
}

export default { validateEnvironment };
