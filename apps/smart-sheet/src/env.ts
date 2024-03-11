import { z } from 'zod';

export const env = z
  .object({
    ELBA_API_KEY: z.string().min(1),
    ELBA_API_BASE_URL: z.string().url(),
    ELBA_REDIRECT_URL: z.string().url(),
    ELBA_SOURCE_ID: z.string().uuid(),
    ELBA_WEBHOOK_SECRET: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(1),
    POSTGRES_URL: z.string().min(1),
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PORT: z.coerce.number().int().positive(),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DATABASE: z.string().min(1),
    POSTGRES_PROXY_PORT: z.coerce.number().int().positive(),
    VERCEL_PREFERRED_REGION: z.string().min(1),
    VERCEL_ENV: z.string().min(1).optional(),
    SMART_SHEET_LOGIN_URL: z.string().min(1),
    SMART_SHEET_CLIENT_KEY: z.string().min(1),
    SMART_SHEET_CLIENT_SECRET: z.string().min(1),
    SMART_SHEET_REDIRECT_URL: z.string().min(1),
    SMART_SHEET_TOKEN_URL: z.string().min(1),
    SMART_SHEET_API_URL: z.string().min(1),
    USERS_SYNC_CRON: z.string().min(1),
    TOKEN_REFRESH_CRON: z.string().min(1),
  })
  .parse(process.env);
