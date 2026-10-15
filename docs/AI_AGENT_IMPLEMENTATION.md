# THE NEGOTIATOR: AI/ML, REALTIME VOICE & NEGOTIATION INTELLIGENCE ENGINE

## 1. Executive Summary & Core Principle

**Project:** The Negotiator: Proof-First Procurement AI  
**Repository:** `Busy-bee`  
**Team:** CHAOS Hackathon  
**Owner:** Friend C (AI/ML & Realtime Voice Workstream)  
**Core Architectural Axiom:**  
> **The model proposes; the backend authorises; the evidence establishes what was said.**

The AI Agent conducts structured, concise procurement negotiations via browser-based voice or text sessions. It has zero independent financial authority: every monetary counteroffer and binding commitment must be authorized by deterministic backend policy. Every extracted offer term must be anchored to an immutable, timestamped transcript source turn.

---

## 2. Installed Skills Read & Applied

In accordance with Section 1 of Master Prompt 02, the following skills installed at `C:\Users\SRUJAN\.agents\skills` were read and applied during implementation:

1. **`ai-engineer` (`SKILL.md`)**:
   - Production-ready agent architecture separating probabilistic LLM reasoning from deterministic business constraints.
   - Guardrails against prompt injection and unauthorized concessions.
   - Cost optimization strategies for finite $5 OpenAI API credits.
2. **`ai-engineering-toolkit` (`SKILL.md`)**:
   - 8-dimension prompt evaluation (Clarity, Specificity, Grounding, Safety, Robustness).
   - Structured context budget planning and token conservation.
3. **`agentic-actions-auditor` (`SKILL.md`)**:
   - Model tool calls treated strictly as untrusted requests.
   - Financial boundary enforcement, duplicate action protection (idempotency), and audit logging.
4. **`full-stack-orchestration-full-stack-feature` (`SKILL.md`)**:
   - Contract-first integration using shared TypeScript types and Zod schemas (`@busy-bee/contracts`).
   - Clear architectural boundaries between frontend (Friend B), backend/database (Shishir & Friend A), and AI agent (Friend C).
5. **`debugging-and-error-recovery` & `code-showcase-systematic-debugging` (`SKILL.md`)**:
   - Systematic hypothesize-isolate-fix loop.
   - Adding regression tests for every failure scenario (Scenarios A through O).
6. **`frontend-design` (`SKILL.md`)**:
   - Aesthetic direction and data contracts for explainable recommendation breakdown and evidence ledgering.

---

## 3. Realtime Model Selection & Voice Architecture

- **Primary Model Candidates:**
  - `gpt-4o-mini-realtime-preview` / `gpt-realtime-2.1-mini`: Low-latency speech-to-speech with function-calling capabilities.
- **Voice Transport:**
  - LiveKit WebRTC / LiveKit Agents Node.js Worker (`@livekit/agents` v1.9.3 + `@livekit/agents-plugin-openai` v1.9.3).
- **Session Duration & Cost Guardrails:**
  - `AGENT_SESSION_MAX_SECONDS=90`: Hard cutoff per voice session.
  - `AGENT_MAX_TEST_SESSIONS=5`: Session counter cap preventing credit depletion.
  - Zero auto-recharge and ₹0 new spend policy strictly enforced.

---

## 4. Shared API & Tool-Calling Contracts (`@busy-bee/contracts`)

The agent interacts with the application exclusively through 5 typed tool contracts:

### Tool 1: `get_negotiation_context`
- **Input:** `{ negotiationId: string, sessionId: string }`
- **Output:** Authorized buyer mandate (budget, required quantity, deadline, warranty, permitted concessions), session state, and current offer.

### Tool 2: `submit_offer_observation`
- **Input:** `{ negotiationId, sessionId, sourceTurnId, timestampMs, speaker, sourceText, extractedTerms, extractionStatus, idempotencyKey }`
- **Output:** Evidence event record, verification status, and updated offer state.
- **Rule:** Rejects observations whose `sourceTurnId` does not exist in captured transcript history (Scenario N).

### Tool 3: `request_negotiation_action`
- **Input:** `{ negotiationId, sessionId, merchantLatestStatement, proposedUnitPrice, proposedAction, idempotencyKey }`
- **Output:** `{ decision: { allowed: boolean, action: PolicyActionType, reason: string, maxPermittedCounter?: number, suggestedCounter?: number } }`
- **Rule:** Agent CANNOT communicate a numerical counteroffer without backend authorization.

### Tool 4: `submit_confirmation_request`
- **Input:** `{ negotiationId, sessionId, sourceTurnId, confirmedTerms, merchantConfirmationQuote, idempotencyKey }`
- **Output:** `{ success: boolean, confirmedTerms, unresolvedTerms, offerStatus, readyForReview }`
- **Rule:** Separates proposed from confirmed terms. If shipping or warranty is missing, offer remains `incomplete`.

### Tool 5: `end_negotiation_session`
- **Input:** `{ negotiationId, sessionId, reason, summary }`
- **Output:** Clean session shutdown. Preserves all verified evidence records.

---

## 5. Evidence Provenance & Ledger Discipline

1. **Immutable Source Turns:** Every audio turn received from LiveKit/OpenAI is registered with a unique `turnId`, `speaker`, `text`, and `timestampMs`.
2. **Missing is NOT Zero:** If shipping cost is unstated, it is recorded as `null` (`shippingCost: null`), NOT `0`. Total landed cost calculation is flagged `isComplete: false`.
3. **Ambiguity Detection:** Statements with hedge words ("should be fine", "around ₹3000") are marked `ambiguous` with term status `unknown` or `proposed`.
4. **Contradiction Handling:** Conflicting quotes are marked `disputed` rather than overwriting prior statements.

---

## 6. Deterministic Fallback Strategy (Section 16)

To guarantee 100% demo readiness without relying on live WebRTC or external API credits:
- **Fallback B (Deterministic Replay Driver):**
  - Runs authentic, scripted merchant dialogues (Merchant A & Merchant B) through the identical evidence extraction, tool execution, and backend policy authorization pipeline.
  - Clearly labelled in console and UI as `[REPLAY - FALLBACK B]`.
- **Fallback A (Text-Based AI Negotiation):**
  - Interactive or prompt-based text negotiation using the same tool contract and backend policy rules.

---

## 7. Automated Test Suite (Section 14 Scenarios)

The test suite in `apps/agent/tests/agent-scenarios.test.ts` executes all 15 required scenarios plus end-to-end replay with **100% pass rate (16/16 tests passing)**:

| Scenario | Description | Result |
|---|---|---|
| **Scenario A** | Basic price negotiation follows backend-authorized counteroffer rules | **PASSED** |
| **Scenario B** | Over-budget offer is strictly rejected by backend policy | **PASSED** |
| **Scenario C** | Missing shipping cost preserved as unknown, never assumed ₹0 | **PASSED** |
| **Scenario D** | Ambiguous warranty ('should be fine') flags as ambiguous/unknown | **PASSED** |
| **Scenario E** | Prompt injection cannot override backend policy or leak budget | **PASSED** |
| **Scenario F** | Instructions strictly forbid fabricating competing seller quotes | **PASSED** |
| **Scenario G** | Explicit confirmation separates confirmed vs provisional states | **PASSED** |
| **Scenario H** | Exceeding max negotiation rounds halts automated countering | **PASSED** |
| **Scenario I** | Declining consent ends session cleanly without retaining extra evidence | **PASSED** |
| **Scenario J** | Duplicate tool calls with same idempotencyKey return cached output | **PASSED** |
| **Scenario K** | Invalid tool arguments fail gracefully via Zod schema validation | **PASSED** |
| **Scenario L** | Backend failure or timeout fails safe without creating commitments | **PASSED** |
| **Scenario M** | Interruption preserves ledger state without contradictory transitions | **PASSED** |
| **Scenario N** | Reject observations referencing non-existent transcript turns | **PASSED** |
| **Scenario O** | SessionManager triggers clean timeout when time limit is reached | **PASSED** |
| **End-to-End** | Replay of Merchant A and Merchant B produces explainable correct winner | **PASSED** |

---

## 8. Exact Execution Commands

### Run Full Test Suite:
```powershell
npm test
```

### Run Replay Demonstration (Merchant A vs Merchant B + Recommendation):
```powershell
npm run agent:replay
```

### Run in Voice Mode (requires LiveKit + OpenAI API keys in `.env`):
```powershell
npm run agent:start -- --mode=voice
```

---

## 9. Deliverables Verification Checklist

- [x] Working AI agent implementation inside repository (`apps/agent/`).
- [x] Configured OpenAI Realtime integration & LiveKit worker (`apps/agent/src/runtime/livekit-worker.ts`).
- [x] Maintainable system-instructions module (`apps/agent/src/instructions.ts`).
- [x] Validated function/tool definitions (`apps/agent/src/tools/definitions.ts`).
- [x] Backend integration client aligned with shared contract (`apps/agent/src/backend/client.ts`).
- [x] Transcript and evidence event handling based on authentic turns (`apps/agent/src/evidence/ledger.ts`).
- [x] Error handling, 90-second duration caps, and bounded session controls (`apps/agent/src/runtime/session-manager.ts`).
- [x] AI-specific unit and integration tests covering Scenarios A-O (`apps/agent/tests/agent-scenarios.test.ts`).
- [x] `.env.example` with placeholders only.
- [x] `docs/AI_AGENT_IMPLEMENTATION.md` completed.
