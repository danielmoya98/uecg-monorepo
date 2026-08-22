import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z
  .object({
    PORT: z
      .union([z.string(), z.number()])
      .default(4000)
      .transform((val) => (typeof val === 'string' ? Number(val) : val)),
    DATABASE_URL: z
      .string()
      .default(
        'postgresql://postgres:postgres@localhost:5432/uecg_db?schema=public',
      ),
  })
  .passthrough();

type envType = z.infer<typeof envSchema>;

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Config validation error:', envParsed.error.format());
  throw new Error('Invalid environment variables');
}

export const envs: envType = {
  PORT: envParsed.data.PORT,
  DATABASE_URL: envParsed.data.DATABASE_URL,
};
