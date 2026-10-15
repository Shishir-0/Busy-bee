import { voice, llm, initializeLogger } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { Room, RoomEvent } from "@livekit/rtc-node";
import { AccessToken } from "livekit-server-sdk";
import { z } from "zod";
import type { AgentConfig } from "../config.js";
import { buildSystemInstructions, INITIAL_DISCLOSURE_STATEMENT } from "../instructions.js";
import { AgentToolHandlers } from "../tools/handlers.js";
import { EvidenceLedger } from "../evidence/ledger.js";
import { NegotiationBackendClient } from "../backend/client.js";
import { SessionManager } from "./session-manager.js";

let isLoggerInitialized = false;

export interface LiveKitWorkerOptions {
  config: AgentConfig;
  backendClient: NegotiationBackendClient;
  ledger?: EvidenceLedger;
}

export interface CredentialValidationResult {
  ready: boolean;
  missingKeys: string[];
  selectedModel: string;
  instructions: string;
  isLiveVoiceCapable: boolean;
}

export class LiveKitNegotiationWorker {
  private config: AgentConfig;
  private backendClient: NegotiationBackendClient;
  private ledger: EvidenceLedger;
  private toolHandlers: AgentToolHandlers;
  private sessionManager: SessionManager;
  private activeRoom: Room | null = null;
  private activeSession: voice.AgentSession | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;

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
   * Preflight validation gate for LiveKit & OpenAI Realtime credentials.
   * Explicitly detects placeholders and missing keys to guarantee zero-spend and safe execution.
   */
  public validateCredentials(): CredentialValidationResult {
    const missing: string[] = [];

    const isApiKeyPlaceholder = (val?: string) =>
      !val || val.trim().length === 0 || val.includes("replace_with") || val.includes("your-");

    if (isApiKeyPlaceholder(this.config.OPENAI_API_KEY)) {
      missing.push("OPENAI_API_KEY");
    }
    if (isApiKeyPlaceholder(this.config.LIVEKIT_URL)) {
      missing.push("LIVEKIT_URL");
    }
    if (isApiKeyPlaceholder(this.config.LIVEKIT_API_KEY)) {
      missing.push("LIVEKIT_API_KEY");
    }
    if (isApiKeyPlaceholder(this.config.LIVEKIT_API_SECRET)) {
      missing.push("LIVEKIT_API_SECRET");
    }

    const ready = missing.length === 0;

    return {
      ready,
      missingKeys: missing,
      selectedModel: this.config.OPENAI_REALTIME_MODEL,
      isLiveVoiceCapable: ready,
      instructions: ready
        ? "All credentials configured for Realtime voice agent."
        : `Missing or placeholder credentials: ${missing.join(", ")}. Using Fallback Mode B (replay) to protect budget.`,
    };
  }

  /**
   * Builds type-safe LLM tools using @livekit/agents framework.
   * Every action delegates to AgentToolHandlers which enforces backend Negotiation Guard policy.
   */
  public createTools(): any[] {
    return [
      llm.tool({
        name: "get_negotiation_context",
        description: "Retrieve authorized buyer mandate, current offer terms, and session state from the backend.",
        parameters: z.object({
          negotiationId: z.string().describe("Unique negotiation identifier."),
          sessionId: z.string().describe("Active merchant session identifier."),
        }),
        execute: async (args: any) => {
          return await this.toolHandlers.executeTool("get_negotiation_context", args);
        },
      }),

      llm.tool({
        name: "submit_offer_observation",
        description: "Submit newly stated merchant terms and their structured interpretation for backend evidence ledgering and validation.",
        parameters: z.object({
          negotiationId: z.string().describe("Negotiation identifier"),
          sessionId: z.string().describe("Session identifier"),
          sourceTurnId: z.string().describe("Identifier of the specific audio/transcript turn containing the merchant statement."),
          timestampMs: z.number().describe("Epoch millisecond timestamp of utterance."),
          speaker: z.enum(["merchant", "agent"]).describe("Speaker role"),
          sourceText: z.string().describe("Exact spoken transcript quote establishing the term."),
          extractedTerms: z.array(
            z.object({
              key: z.string().describe("Term key (e.g. unitPrice, shippingCost, warrantyMonths, deliveryDays)"),
              value: z.union([z.string(), z.number(), z.boolean()]).describe("Stated value"),
            })
          ).describe("Extracted commercial terms"),
          extractionStatus: z.enum(["clear", "ambiguous", "disputed"]).optional(),
          idempotencyKey: z.string().optional(),
        }),
        execute: async (args: any) => {
          return await this.toolHandlers.executeTool("submit_offer_observation", args);
        },
      }),

      llm.tool({
        name: "request_negotiation_action",
        description: "Request explicit permission from backend Negotiation Guard before proposing a counteroffer or concession.",
        parameters: z.object({
          negotiationId: z.string().describe("Negotiation ID"),
          sessionId: z.string().describe("Session ID"),
          merchantLatestStatement: z.string().optional().describe("Latest statement from merchant"),
          proposedUnitPrice: z.number().optional().describe("Proposed unit price counteroffer"),
          proposedAction: z.enum([
            "counteroffer",
            "clarify_shipping",
            "clarify_warranty",
            "confirm_deal",
            "reject_overbudget",
          ]).default("counteroffer"),
          proposedTerms: z.record(z.unknown()).optional().describe("Alternative proposed terms object"),
          idempotencyKey: z.string().optional(),
        }),
        execute: async (args: any) => {
          const unitPrice = args.proposedUnitPrice ?? (args.proposedTerms?.unitPrice as number | undefined);
          const mappedArgs = {
            ...args,
            proposedUnitPrice: unitPrice,
            merchantLatestStatement: args.merchantLatestStatement || "Merchant proposed quote",
          };
          return await this.toolHandlers.executeTool("request_negotiation_action", mappedArgs);
        },
      }),

      llm.tool({
        name: "submit_confirmation_request",
        description: "Record that the merchant explicitly agreed to all terms during the conversation.",
        parameters: z.object({
          negotiationId: z.string().describe("Negotiation ID"),
          sessionId: z.string().describe("Session ID"),
          confirmationTurnId: z.string().describe("Turn where merchant said yes"),
          transcriptExcerpt: z.string().describe("Quoted agreement text"),
        }),
        execute: async (args: any) => {
          return await this.toolHandlers.executeTool("submit_confirmation_request", args);
        },
      }),

      llm.tool({
        name: "end_negotiation_session",
        description: "Terminate the active negotiation session with a structured reason and outcome summary.",
        parameters: z.object({
          negotiationId: z.string().describe("Negotiation ID"),
          sessionId: z.string().describe("Session ID"),
          reason: z.enum([
            "agreement_reached",
            "consent_declined",
            "budget_exceeded",
            "merchant_withdrew",
            "time_limit_reached",
            "error",
          ]).describe("Terminal reason code"),
          summary: z.string().describe("Brief session summary"),
        }),
        execute: async (args: any) => {
          const res = await this.toolHandlers.executeTool("end_negotiation_session", args);
          // Gracefully shutdown session
          if (this.activeSession) {
            await this.stopWorker();
          }
          return res;
        },
      }),
    ];
  }

  /**
   * Starts the genuine LiveKit agent worker.
   * If credentials are valid, connects directly to LiveKit Room, attaches OpenAI Realtime model,
   * publishes voice, and starts listening for merchant turns.
   */
  public async startWorker(roomName = "demo-negotiation-room"): Promise<{ success: boolean; reason?: string }> {
    const preflight = this.validateCredentials();
    if (!preflight.ready) {
      console.warn(`\n[LiveKitWorker:DIAGNOSTICS] Cannot start live WebRTC connection.`);
      console.warn(`[LiveKitWorker:DIAGNOSTICS] Missing or placeholder credentials: ${preflight.missingKeys.join(", ")}`);
      console.warn(`[LiveKitWorker:DIAGNOSTICS] Reason: LiveKit Cloud credentials required for live media routing.`);
      console.log(`[LiveKitWorker:DIAGNOSTICS] Automatically protecting session budget via Fallback B (deterministic replay).\n`);
      return { success: false, reason: preflight.instructions };
    }

    try {
      if (!isLoggerInitialized) {
        initializeLogger({ pretty: true });
        isLoggerInitialized = true;
      }

      console.log(`\n===============================================================`);
      console.log(`[LiveKitWorker] STARTING LIVE VOICE NEGOTIATION WORKER`);
      console.log(`[LiveKitWorker] Target Room: ${roomName}`);
      console.log(`[LiveKitWorker] OpenAI Realtime Model: ${this.config.OPENAI_REALTIME_MODEL}`);
      console.log(`[LiveKitWorker] LiveKit Server URL: ${this.config.LIVEKIT_URL}`);
      console.log(`[LiveKitWorker] Session Max Duration: ${this.config.AGENT_SESSION_MAX_SECONDS}s`);
      console.log(`===============================================================\n`);

      // 1. Generate short-lived agent room token
      const at = new AccessToken(this.config.LIVEKIT_API_KEY, this.config.LIVEKIT_API_SECRET, {
        identity: "agent-the-negotiator",
        name: "The Negotiator (AI Agent)",
        ttl: this.config.AGENT_SESSION_MAX_SECONDS + 120,
      });
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });
      const agentJwt = await at.toJwt();

      // 2. Initialize OpenAI Realtime Model
      const model = new openai.realtime.RealtimeModel({
        apiKey: this.config.OPENAI_API_KEY,
        model: this.config.OPENAI_REALTIME_MODEL,
        modalities: ["text", "audio"],
      });

      // 3. Create Agent with strict procurement instructions and policy tools
      const agent = new voice.Agent({
        instructions: buildSystemInstructions(),
        llm: model,
        tools: this.createTools(),
      });

      // 4. Connect to WebRTC Room
      this.activeRoom = new Room();
      
      this.activeRoom.on(RoomEvent.Disconnected, () => {
        console.log(`[LiveKitWorker] Disconnected from room ${roomName}.`);
        this.cleanup();
      });

      await this.activeRoom.connect(this.config.LIVEKIT_URL, agentJwt);
      console.log(`[LiveKitWorker] Connected to LiveKit room: ${roomName} successfully.`);

      // 5. Start Voice Agent Session
      this.activeSession = new voice.AgentSession();
      await this.activeSession.start(agent, this.activeRoom);

      // 6. Greet user with ethical disclosure statement
      await this.activeSession.generateReply({
        instructions: `Deliver the mandatory initial disclosure statement clearly: "${INITIAL_DISCLOSURE_STATEMENT}"`,
      });

      // 7. Enforce maximum session duration ceiling
      this.sessionTimer = setTimeout(async () => {
        console.warn(`[LiveKitWorker] Session reached ${this.config.AGENT_SESSION_MAX_SECONDS}s limit. Enforcing clean shutdown.`);
        await this.stopWorker();
      }, this.config.AGENT_SESSION_MAX_SECONDS * 1000);

      return { success: true };
    } catch (err: any) {
      console.error(`[LiveKitWorker] Live worker startup failed:`, err?.message || err);
      this.cleanup();
      return { success: false, reason: err?.message || "Unknown worker error" };
    }
  }

  /**
   * Stop active session and room connection cleanly
   */
  public async stopWorker(): Promise<void> {
    console.log(`[LiveKitWorker] Stopping active voice worker cleanly...`);
    if (this.activeSession) {
      try {
        await this.activeSession.close();
      } catch (e) {
        // ignore close errors
      }
      this.activeSession = null;
    }
    if (this.activeRoom) {
      try {
        await this.activeRoom.disconnect();
      } catch (e) {
        // ignore disconnect errors
      }
      this.activeRoom = null;
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
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
}
