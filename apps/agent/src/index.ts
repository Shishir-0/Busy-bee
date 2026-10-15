import { loadConfig } from "./config.js";
import { MockNegotiationBackend } from "./test-server/mock-backend.js";
import { NegotiationBackendClient } from "./backend/client.js";
import { FallbackNegotiationRunner, DEMO_SCENARIO_MERCHANT_A, DEMO_SCENARIO_MERCHANT_B } from "./runtime/fallback-runner.js";
import { LiveKitNegotiationWorker } from "./runtime/livekit-worker.js";

async function main() {
  const args = process.argv.slice(2);
  const modeArg = args.find((a) => a.startsWith("--mode="))?.split("=")[1];
  const config = loadConfig(modeArg ? { AGENT_MODE: modeArg as any } : undefined);

  console.log("===============================================================");
  console.log("  THE NEGOTIATOR: Proof-First Procurement AI Engine");
  console.log("  CHAOS Hackathon | Team: Busy-bee | Owner: Friend C (AI/Voice)");
  console.log("===============================================================");
  console.log(`Mode: ${config.AGENT_MODE}`);
  console.log(`Zero-Spend Guard: ${config.ZERO_SPEND_ENFORCED ? "ACTIVE (₹0 new spend limit)" : "OFF"}`);
  console.log(`Max Session Duration: ${config.AGENT_SESSION_MAX_SECONDS}s`);
  console.log("---------------------------------------------------------------\n");

  // Initialize in-memory authoritative backend for local execution / tests
  const mockBackend = new MockNegotiationBackend();
  const backendClient = new NegotiationBackendClient({
    baseUrl: config.BACKEND_API_BASE_URL,
    mockBackend,
  });

  if (config.AGENT_MODE === "voice") {
    const worker = new LiveKitNegotiationWorker({
      config,
      backendClient,
    });
    const preflight = worker.validateCredentials();
    if (!preflight.ready) {
      console.warn(`[VOICE GATE] LiveKit/OpenAI credentials not detected in .env.`);
      console.log(`[VOICE GATE] Executing Fallback B (deterministic replay) instead...\n`);
      await runReplayDemo(backendClient, mockBackend);
    } else {
      await worker.startWorker();
    }
  } else {
    // Default or replay mode
    await runReplayDemo(backendClient, mockBackend);
  }
}

async function runReplayDemo(backendClient: NegotiationBackendClient, mockBackend: MockNegotiationBackend) {
  const runner = new FallbackNegotiationRunner(backendClient);

  console.log(">>> [STAGE 1] Running Session with Merchant A (Apex Supplies)...");
  await runner.runDeterministicReplay(
    "neg-demo-001",
    "sess-merchant-a",
    DEMO_SCENARIO_MERCHANT_A
  );

  console.log("\n>>> [STAGE 2] Running Session with Merchant B (Bharat Ergonomics)...");
  const runnerB = new FallbackNegotiationRunner(backendClient);
  await runnerB.runDeterministicReplay(
    "neg-demo-001",
    "sess-merchant-b",
    DEMO_SCENARIO_MERCHANT_B
  );

  console.log("\n>>> [STAGE 3] Querying Authoritative Recommendation from Backend...");
  const recommendation = mockBackend.generateRecommendation("neg-demo-001");
  console.log("===============================================================");
  console.log("  OFFER COMPARISON & EXPLAINABLE RECOMMENDATION");
  console.log("===============================================================");
  console.log(`Recommendation State: ${recommendation.recommendationState.toUpperCase()}`);
  console.log(`Selected Winner: ${recommendation.winnerMerchantName || "None"}`);
  console.log(`Justification: ${recommendation.justification}\n`);

  console.log("Rankings Breakdown:");
  for (const [index, rank] of recommendation.rankings.entries()) {
    console.log(
      `  #${index + 1} ${rank.merchantName} - Landed Cost: ₹${rank.calculation.totalLandedCost.toLocaleString()} | Eligible: ${rank.isEligible ? "YES" : "NO"} | Evidence Coverage: ${rank.verificationCoverage}%`
    );
    if (!rank.isEligible) {
      console.log(`     Exclusions: ${rank.exclusionReasons.join("; ")}`);
    }
  }
  console.log("===============================================================\n");
}

main().catch((err) => {
  console.error("Fatal Agent Error:", err);
  process.exit(1);
});
