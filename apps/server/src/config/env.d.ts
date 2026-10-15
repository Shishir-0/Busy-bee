import { z } from 'zod';
declare const EnvSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodNumber>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    MONGODB_URI: z.ZodOptional<z.ZodString>;
    AGENT_BACKEND_TOKEN: z.ZodDefault<z.ZodString>;
    LIVEKIT_URL: z.ZodOptional<z.ZodString>;
    LIVEKIT_API_KEY: z.ZodOptional<z.ZodString>;
    LIVEKIT_API_SECRET: z.ZodOptional<z.ZodString>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    AGENT_BACKEND_TOKEN: string;
    CORS_ORIGIN: string;
    MONGODB_URI?: string | undefined;
    LIVEKIT_URL?: string | undefined;
    LIVEKIT_API_KEY?: string | undefined;
    LIVEKIT_API_SECRET?: string | undefined;
}, {
    PORT?: number | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    MONGODB_URI?: string | undefined;
    AGENT_BACKEND_TOKEN?: string | undefined;
    LIVEKIT_URL?: string | undefined;
    LIVEKIT_API_KEY?: string | undefined;
    LIVEKIT_API_SECRET?: string | undefined;
    CORS_ORIGIN?: string | undefined;
}>;
export type EnvConfig = z.infer<typeof EnvSchema>;
export declare const env: {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    AGENT_BACKEND_TOKEN: string;
    CORS_ORIGIN: string;
    MONGODB_URI?: string | undefined;
    LIVEKIT_URL?: string | undefined;
    LIVEKIT_API_KEY?: string | undefined;
    LIVEKIT_API_SECRET?: string | undefined;
};
export {};
//# sourceMappingURL=env.d.ts.map