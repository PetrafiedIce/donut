import { z } from 'zod'

const envSchema = z.object({
  DONUT_API_BASE: z.string().default('https://api.donutsmp.net'),
  DONUT_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  MOCK_MODE: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse({
  DONUT_API_BASE: process.env.DONUT_API_BASE,
  DONUT_API_KEY: process.env.DONUT_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  MOCK_MODE: process.env.MOCK_MODE,
})

export function isMockMode(): boolean {
  return String(env.MOCK_MODE).toLowerCase() === 'true'
}

