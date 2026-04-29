import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  CLIENT_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(1).default('fallback-access-token-secret-do-not-use-in-production-1'),
  REFRESH_TOKEN_SECRET: z.string().min(1).default('fallback-refresh-token-secret-do-not-use-in-production-2'),
  STORAGE_DRIVER: z.enum(['local', 'cloudinary', 's3']).default('local'),
  MAX_FILE_SIZE: z.string().default('10485760').transform(Number),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
