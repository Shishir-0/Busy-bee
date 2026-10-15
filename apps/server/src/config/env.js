import { z } from 'zod';
import dotenv from 'dotenv';
// Load .env if present
dotenv.config();
const EnvSchema = z.object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().trim().optional(),
    AGENT_BACKEND_TOKEN: z.string().trim().default('agent-negotiator-secret-2026'),
    LIVEKIT_URL: z.string().trim().optional(),
    LIVEKIT_API_KEY: z.string().trim().optional(),
    LIVEKIT_API_SECRET: z.string().trim().optional(),
    CORS_ORIGIN: z.string().trim().default('http://localhost:5173,http://localhost:3000'),
});
function parseEnv() {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
        console.error('Invalid environment configuration:', result.error.format());
        throw new Error('Environment configuration validation failed');
    }
    return result.data;
}
export const env = parseEnv();
//# sourceMappingURL=env.js.map