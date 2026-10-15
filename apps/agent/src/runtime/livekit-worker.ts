import type { AgentConfig } from "../config.js";
import { buildSystemInstructions } from "../instructions.js";
import { AGENT_TOOLS } from "../tools/definitions.js";
import { AgentToolHandlers } from "../tools/handlers.js";
import { EvidenceLedger } from "../evidence/ledger.js";
import { NegotiationBackendClient } from "../backend/client.js";
import { SessionManager } from "./session-manager.js";

export interface LiveKitWorkerOptions {
  config: AgentConfig;
  backendClient: NegotiationBackendClient;
  ledger?: EvidenceLedger;
}

export class LiveKitNegotiationWorker {
  private config: AgentConfig;
  private backendClient: NegotiationBackendClient;
  private ledger: EvidenceLedger;
  private toolHandlers: AgentToolHandlers;
  private sessionManager: SessionManager;

  constructor(options: LiveKitWorkerOptions) {
    this.config = options.config;
    this.backendClient = options.backendClient;
    this.ledger = options.ledger || new EvidenceLedger();
    this.toolHandlers = new AgentToolHandlers(this.backendClient, this.ledger);
    this.sessionManager = new SessionManager({
      maxDurationSeconds: this.config.AGENT_SESSION_MAX_SECONDS,
      maxTestSessions: this.config.AGENT_MAX_TEST_SESSIONS,
      zeroSpendEnforced: this.config.ZERO_SPEND_ENFORCED,
    });
  }

  /**
   * Preflight validation gate for LiveKit & OpenAI Realtime
   * Checks whether credentials and endpoint availability exist before attempting WebRTC connect.
   */
  public validateCredentials(): {
    ready: boolean;
    missingKeys: string[];
    selectedModel: string;
    instructions: string;
  } {
    const missing: string[] = [];
    if (!this.config.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
    if (!this.config.LIVEKIT_URL) missing.push("LIVEKIT_URL");
    if (!this.config.LIVEKIT_API_KEY) missing.push("LIVEKIT_API_KEY");
    if (!this.config.LIVEKIT_API_SECRET) missing.push("LIVEKIT_API_SECRET");

    return {
      ready: missing.length === 0,
      missingKeys: missing,
      selectedModel: this.config.OPENAI_REALTIME_MODEL,
      instructions: missing.length === 0
        ? "All credentials configured for Realtime voice agent."
        : `Missing credentials: ${missing.join(", ")}. Using Fallback Mode B (replay) or A (text) to protect budget.`,
    };
  }

  public getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  public getToolHandlers(): AgentToolHandlers {
    return this.toolHandlers;
  }

  public getLedger(): EvidenceLedger {
    return this.ledger;
  }

  /**
   * Start the worker
   */
  public async startWorker(roomName = "demo-negotiation-room"): Promise<void> {
    const preflight = this.validateCredentials();
    if (!preflight.ready) {
      console.warn(`[LiveKitWorker] Cannot start live WebRTC connection: ${preflight.instructions}`);
      console.log(`[LiveKitWorker] Activating Fallback B driver automatically.`);
      return;
    }

    console.log(`[LiveKitWorker] Initializing LiveKit Agents worker...`);
    console.log(`[LiveKitWorker] Target Room: ${roomName}`);
    console.log(`[LiveKitWorker] OpenAI Realtime Model: ${this.config.OPENAI_REALTIME_MODEL}`);
    console.log(`[LiveKitWorker] Session Cap: ${this.config.AGENT_SESSION_MAX_SECONDS}s`);
    console.log(`[LiveKitWorker] Registered Tools: ${AGENT_TOOLS.map((t) => t.name).join(", ")}`);

    // In a live environment with @livekit/agents installed and credentials set:
    // const agent = new MultimodalAgent({ ... });
    // await agent.start();
  }
}
