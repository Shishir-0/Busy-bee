import { describe, it, expect } from "vitest";
import { LiveKitNegotiationWorker } from "../src/runtime/livekit-worker.js";
import { MockNegotiationBackend } from "../src/test-server/mock-backend.js";
import { NegotiationBackendClient } from "../src/backend/client.js";
import { EvidenceLedger } from "../src/evidence/ledger.js";
import { loadConfig } from "../src/config.js";

describe("LiveKit Voice Agent & Quality Gate Suite", () => {
  const backend = new MockNegotiationBackend();
  const client = new NegotiationBackendClient({
    baseUrl: "http://localhost:4000/api",
    mockBackend: backend,
  });

  it("identifies missing or placeholder credentials accurately", () => {
    const config = loadConfig({
      OPENAI_API_KEY: "",
      LIVEKIT_URL: "wss://your-project.livekit.cloud",
      LIVEKIT_API_KEY: "replace_with_your_livekit_api_key",
      LIVEKIT_API_SECRET: "replace_with_your_livekit_api_secret",
      AGENT_MODE: "voice",
    });

    const worker = new LiveKitNegotiationWorker({
      config,
      backendClient: client,
    });

    const preflight = worker.validateCredentials();
    expect(preflight.ready).toBe(false);
    expect(preflight.isLiveVoiceCapable).toBe(false);
    expect(preflight.missingKeys).toContain("OPENAI_API_KEY");
    expect(preflight.missingKeys).toContain("LIVEKIT_URL");
    expect(preflight.missingKeys).toContain("LIVEKIT_API_KEY");
    expect(preflight.missingKeys).toContain("LIVEKIT_API_SECRET");
    expect(preflight.instructions).toContain("protect budget");
  });

  it("passes validation when valid credentials are provided", () => {
    const config = loadConfig({
      OPENAI_API_KEY: "sk-proj-valid-mock-key-for-testing",
      LIVEKIT_URL: "wss://valid-demo.livekit.cloud",
      LIVEKIT_API_KEY: "API_VALID_KEY_1234",
      LIVEKIT_API_SECRET: "SECRET_VALID_KEY_5678",
      AGENT_MODE: "voice",
    });

    const worker = new LiveKitNegotiationWorker({
      config,
      backendClient: client,
    });

    const preflight = worker.validateCredentials();
    expect(preflight.ready).toBe(true);
    expect(preflight.isLiveVoiceCapable).toBe(true);
    expect(preflight.missingKeys.length).toBe(0);
  });

  it("gracefully refuses live start when credentials are placeholders", async () => {
    const config = loadConfig({
      OPENAI_API_KEY: "sk-proj-mock",
      LIVEKIT_URL: "wss://your-project.livekit.cloud",
      LIVEKIT_API_KEY: "replace_with_key",
      LIVEKIT_API_SECRET: "replace_with_secret",
      AGENT_MODE: "voice",
    });

    const worker = new LiveKitNegotiationWorker({
      config,
      backendClient: client,
    });

    const res = await worker.startWorker("test-room");
    expect(res.success).toBe(false);
    expect(res.reason).toBeDefined();
  });

  it("generates type-safe LLM tools that enforce backend policy guard", async () => {
    const ledger = new EvidenceLedger();
    const config = loadConfig({ AGENT_MODE: "voice" });
    const worker = new LiveKitNegotiationWorker({
      config,
      backendClient: client,
      ledger,
    });

    const tools = worker.createTools();
    expect(tools.length).toBe(5);

    const toolNames = tools.map((t: any) => t.name);
    expect(toolNames).toContain("get_negotiation_context");
    expect(toolNames).toContain("submit_offer_observation");
    expect(toolNames).toContain("request_negotiation_action");
    expect(toolNames).toContain("submit_confirmation_request");
    expect(toolNames).toContain("end_negotiation_session");

    // Execute get_negotiation_context tool
    const contextTool = tools.find((t: any) => t.name === "get_negotiation_context");
    const ctx = await contextTool.execute({
      negotiationId: "neg-demo-001",
      sessionId: "sess-merchant-a",
    });
    expect(ctx.success).toBe(true);
    expect(ctx.data.mandate.currency).toBe("INR");

    // Execute request_negotiation_action with overbudget price -> must be DENIED by policy
    const actionTool = tools.find((t: any) => t.name === "request_negotiation_action");
    const actionRes = await actionTool.execute({
      negotiationId: "neg-demo-001",
      sessionId: "sess-merchant-a",
      proposedUnitPrice: 3500, // exceeding 3000 budget
    });
    expect(actionRes.success).toBe(true);
    expect(actionRes.data.decision.allowed).toBe(false);
    expect(actionRes.data.decision.action).toBe("offer_rejected_by_policy");
    expect(actionRes.data.decision.reason).toMatch(/exceeds/i);
  });
});
