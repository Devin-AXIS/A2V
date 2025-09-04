import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 数据库配置
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5433),
  DB_USER: z.string().default('aino'),
  DB_PASSWORD: z.string().default('pass'),
  DB_NAME: z.string().default('aino'),
})

export const env = envSchema.parse(process.env)
