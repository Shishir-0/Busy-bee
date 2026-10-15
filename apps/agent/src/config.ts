import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_REALTIME_MODEL: z.string().default("gpt-4o-mini-realtime-preview"),
  LIVEKIT_URL: z.string().optional().default(""),
  LIVEKIT_API_KEY: z.string().optional().default(""),
  LIVEKIT_API_SECRET: z.string().optional().default(""),
  BACKEND_API_BASE_URL: z.string().default("http://localhost:4000/api"),
  AGENT_SESSION_MAX_SECONDS: z.coerce.number().positive().default(90),
  AGENT_MAX_TEST_SESSIONS: z.coerce.number().positive().default(5),
  AGENT_MODE: z.enum(["voice", "text", "replay", "test"]).default("replay"),
  ZERO_SPEND_ENFORCED: z.coerce.boolean().default(true),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type AgentConfig = z.infer<typeof EnvSchema>;

export function loadConfig(overrides?: Partial<AgentConfig>): AgentConfig {
  const parsed = EnvSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_REALTIME_MODEL: process.env.OPENAI_REALTIME_MODEL,
    LIVEKIT_URL: process.env.LIVEKIT_URL,
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    BACKEND_API_BASE_URL: process.env.BACKEND_API_BASE_URL,
    AGENT_SESSION_MAX_SECONDS: process.env.AGENT_SESSION_MAX_SECONDS,
    AGENT_MAX_TEST_SESSIONS: process.env.AGENT_MAX_TEST_SESSIONS,
    AGENT_MODE: process.env.AGENT_MODE,
    ZERO_SPEND_ENFORCED: process.env.ZERO_SPEND_ENFORCED,
    LOG_LEVEL: process.env.LOG_LEVEL,
    ...overrides,
  });

  return parsed;
}
