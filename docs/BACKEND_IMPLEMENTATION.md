# The Negotiator: Backend Architecture, API Engineering & Policy Enforcement

**Project:** The Negotiator: Proof-First Procurement AI  
**Repository:** `Busy-bee`  
**Hackathon:** CHAOS  
**Lead Backend Architect & Engineer:** Shishir  
**Version:** 1.0.0  
**Date:** 15 October 2026  

---

## 1. Antigravity Awesome Skills Applied

The following installed skills from `~/.agents/skills` were read and rigorously applied during the design, implementation, and verification loops:

1. **`full-stack-orchestration-full-stack-feature`**:
   - Established the API-first canonical contract in `packages/shared/src/contracts.ts` before building routes.
   - Enforced contract-driven synchronization across Frontend (Friend B), AI Agent (Friend C), and Backend.
   - Designed clean architectural boundaries between validation, domain policy, calculation engine, and persistence.

2. **`agentic-actions-auditor`**:
   - Treated all tool-call payloads received from the LLM/Agent as completely untrusted inputs.
   - Enforced runtime Zod validation and business policy gates on every requested action (`/api/internal/sessions/:id/actions/authorize`).
   - Prevented model-generated instructions from bypassing budget, warranty, quantity, or deadline constraints.
   - Built strict idempotency checks using unique `eventId` indexing to eliminate duplicate mutations.
   - Protected internal endpoints via `AGENT_BACKEND_TOKEN` service authentication.

3. **`code-showcase-systematic-debugging` & `debugging-and-error-recovery`**:
   - Followed the "Stop-the-Line" rule and root-cause tracing: diagnosed module path resolution and parameter typing without guessing or masking symptoms.
   - Created deterministic regression and contract test suites before concluding loops.

4. **`ai-engineer`**:
   - Enforced structured inputs/outputs and clear demarcation: the LLM may propose an action or extract a turn, but only deterministic backend code can authorise it.
   - Ensured zero API keys or secrets are exposed in client-facing responses.

5. **`frontend-design`**:
   - Defined clear SSE live update envelopes and structured error contracts with field-level details to enable high-craft, explainable frontend state presentation.

---

## 2. Architecture Overview

The repository adopts a clean, modular structure:

```
Busy-bee/
├── packages/
│   └── shared/
│       └── src/
│           ├── contracts.ts          # Canonical TypeScript types, Enums, Zod Schemas
│           └── index.ts              # Shared barrel export
├── apps/
│   └── server/
│       ├── src/
│       │   ├── config/
│       │   │   ├── env.ts            # Environment validation (Zod)
│       │   │   └── database.ts       # Database lifecycle & fallback adapter
│       │   ├── policies/
│       │   │   ├── costEngine.ts     # Deterministic landed cost arithmetic
│       │   │   ├── stateMachine.ts   # Pure offer & session state transition rules
│       │   │   ├── negotiationGuard.ts # Hard constraint policy engine
│       │   │   ├── evidenceValidator.ts # Provenance & transcript turn verification
│       │   │   └── recommendationEngine.ts # Decision engine & ranking logic
│       │   ├── repositories/
│       │   │   ├── types.ts          # Repository interfaces
│       │   │   ├── inMemoryRepository.ts # Deterministic local/test repository
│       │   │   └── mongooseRepository.ts # Production MongoDB Atlas repository
│       │   ├── models/
│       │   │   └── schemas.ts        # Mongoose schemas & unique indexes
│       │   ├── services/
│       │   │   └── livekitService.ts # LiveKit room token issuance (real + sim)
│       │   ├── events/
│       │   │   └── eventBus.ts       # Server-Sent Events (SSE) publisher
│       │   ├── middleware/
│       │   │   ├── auth.ts           # Agent-to-backend token verification
│       │   │   ├── requestId.ts      # Request ID correlation
│       │   │   └── errorHandler.ts   # Standardized error envelopes
│       │   ├── controllers/
│       │   │   ├── negotiationController.ts # Buyer & session API handlers
│       │   │   └── internalAgentController.ts # Internal AI tool handlers
│       │   ├── routes/
│       │   │   ├── apiRoutes.ts      # Public & buyer-facing routes
│       │   │   └── internalRoutes.ts # Internal agent routes
│       │   ├── app.ts                # Express app configuration
│       │   └── server.ts             # Process startup & graceful shutdown
│       └── tests/
│           ├── policy.test.ts        # Negotiation Guard policy test suite
│           ├── cost.test.ts          # Landed cost arithmetic & ranking tests
│           ├── evidence.test.ts      # Evidence validation & idempotency tests
│           ├── stateMachine.test.ts  # State transition tests
│           └── api.test.ts           # End-to-end integration test suite
├── docs/
│   └── BACKEND_IMPLEMENTATION.md    # This technical specification
└── .env.example                      # Environment configuration template
```

---

## 3. Authoritative Shared Contracts

### 3.1 Status Enums
- **OfferStatus:** `'proposed' | 'countered' | 'merchant_confirmed' | 'disputed' | 'incomplete' | 'rejected' | 'ready_for_buyer_review'`
- **SessionStatus:** `'created' | 'connecting' | 'active' | 'ended' | 'failed'`
- **EvidenceStatus:** `'unverified' | 'partially_verified' | 'verified' | 'disputed' | 'needs_review'`
- **RecommendationStatus:** `'not_ready' | 'provisional' | 'ready_for_review' | 'reviewed'`
- **PolicyDecision:** `'allowed' | 'denied' | 'needs_clarification' | 'needs_buyer_review' | 'session_not_active'`
- **SpeakerRole:** `'buyer' | 'merchant' | 'ai_agent'`

---

## 4. Deterministic Business Rules

### 4.1 Negotiation Guard
1. **Total Landed Cost Budget Ceiling:** Evaluated against `mandate.maxBudget`. If `totalLandedCost > maxBudget`, the backend rejects authorization with `POLICY_VIOLATION`.
2. **Unknown Shipping Rule:** Unknown shipping fees are **never assumed to be zero**. If shipping is unstated, the cost is marked provisional/incomplete, and deal acceptance is blocked until clarified.
3. **Quantity Enforcement:** Offered quantity must meet or exceed `mandate.quantity`.
4. **Delivery Deadline:** `terms.deliveryDays` must be $\le$ `mandate.deliveryDeadlineDays`.
5. **Warranty Requirement:** `terms.warrantyMonths` must be $\ge$ `mandate.minWarrantyMonths`.
6. **Mandatory Specifications:** Every item in `mandate.mandatorySpecifications` is checked against offered specs.

### 4.2 Deal Decision Engine & Landed Cost Arithmetic
$$\text{Total Landed Cost} = \text{Product Subtotal} + \text{Shipping Fee} + \text{Additional Fees} + \text{Excluded Taxes}$$
- **Merchant A Reference:** 50 chairs @ ₹2,850 + ₹4,000 shipping + included taxes = **₹146,500**.
- **Merchant B Reference:** 50 chairs @ ₹2,900 + free shipping included + included taxes = **₹145,000**.
- **Outcome:** Merchant B wins with lower landed cost. Both verified and compared transparently.

### 4.3 Evidence Provenance & Idempotency
- Extracted terms are verified against captured `sourceText` transcript turns.
- Untrusted `verificationStatus` claims sent by the LLM are evaluated and authorized by backend code.
- Replayed `eventId` values return the existing record without creating duplicate mutations.

---

## 5. API Reference

### 5.1 Buyer & Application Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Health status & persistence mode | Public |
| `POST` | `/api/negotiations` | Create buyer mandate | Public |
| `GET` | `/api/negotiations` | List negotiations | Public |
| `GET` | `/api/negotiations/:id` | Get negotiation details | Public |
| `POST` | `/api/negotiations/:id/sessions` | Start merchant session | Public |
| `POST` | `/api/sessions/:id/token` | Issue LiveKit room token | Public |
| `GET` | `/api/negotiations/:id/offers` | Get offers with cost breakdowns | Public |
| `GET` | `/api/negotiations/:id/evidence` | Get recorded evidence ledger | Public |
| `POST` | `/api/negotiations/:id/recommendation` | Calculate explainable recommendation | Public |
| `GET` | `/api/negotiations/:id/events` | SSE live event stream | Public |

### 5.2 Internal AI Agent Endpoints (Friend C)

Headers required: `x-agent-token: <AGENT_BACKEND_TOKEN>`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/internal/negotiations/:id/context` | Minimum authorized buyer mandate context |
| `POST` | `/api/internal/sessions/:id/observations` | Ingest extracted observation & source turn |
| `POST` | `/api/internal/sessions/:id/actions/authorize` | Deterministic policy evaluation for proposed action |
| `POST` | `/api/internal/sessions/:id/confirmations` | Confirm merchant offer against verified evidence |
| `POST` | `/api/internal/sessions/:id/end` | Close active session |

---

## 6. Integration Guide for Teammates

### 6.1 For Friend B (Frontend)
- **Base URL:** `http://localhost:4000/api`
- **SSE Stream:** Connect EventSource to `http://localhost:4000/api/negotiations/:id/events` to receive real-time events (`negotiation.created`, `evidence.recorded`, `offer.proposed`, `offer.revised`, `merchant.confirmed`, `policy.denied`, `recommendation.calculated`).
- **LiveKit Room Tokens:** Call `POST /api/sessions/:id/token` with `{ participantIdentity: "user-name", role: "merchant" }`. Connect to the returned `url` and `token`.

### 6.2 For Friend C (LiveKit AI Agent)
- **Base URL:** `http://localhost:4000/api/internal`
- **Header:** Include `x-agent-token: agent-negotiator-secret-2026` on all calls.
- **Workflow:**
  1. On session connect, call `GET /negotiations/:id/context` to load constraints.
  2. During conversation, call `POST /sessions/:id/observations` with extracted terms and the exact transcript turn `sourceText`.
  3. Before stating agreement or proposing counteroffers, call `POST /sessions/:id/actions/authorize`. If `isAllowed: false`, follow `permittedNextActions` (e.g. counteroffer).
  4. On explicit merchant verbal agreement, call `POST /sessions/:id/confirmations`.
  5. On session wrap-up, call `POST /sessions/:id/end`.

---

## 7. Automated Test Suite & Results

Execute the test suite at any time:

```bash
npm test
```

### Verified Test Results (30 / 30 Passing)
- **Policy Tests (7/7):**
  - Within-budget authorized offer passes.
  - Over-budget offer strictly denied (`POLICY_VIOLATION`).
  - Insufficient quantity rejected.
  - Short warranty rejected.
  - Delivery deadline exceeded rejected.
  - Missing shipping fee marked incomplete/provisional.
  - Inactive/ended session mutations blocked.
- **Cost Engine Tests (4/4):**
  - Merchant A exact landed cost: ₹146,500.
  - Merchant B exact landed cost: ₹145,000.
  - Unknown shipping is never treated as ₹0.
  - Deterministic ranking: Merchant B ranked 1st.
- **Evidence & Idempotency Tests (3/3):**
  - Corroborated numbers match transcript -> `verified`.
  - Empty transcript text -> rejected.
  - Replayed `eventId` -> idempotent replay, zero duplicates.
- **State Machine Tests (3/3):**
  - Valid transitions permitted.
  - Disallowed transitions blocked.
  - Session lifecycle and terminal states enforced.
- **End-to-End API Integration Tests (13/13):**
  - Health check returns 200.
  - Mandate creation and validation errors.
  - Session creation and LiveKit token generation.
  - Service authentication enforcement (401 without token, 200 with token).
  - Observation ingestion, offer revision, and idempotency.
  - Policy authorization and confirmation.
  - Explainable recommendation output.
  - Session termination.

---

## 8. Database Integration Policy & Fallback

- **MongoDB Atlas:** Ready to connect via `MONGODB_URI` environment variable.
- **Manual Infrastructure Boundary:** As mandated, cloud cluster administration is handled manually by Shishir.
- **Deterministic In-Memory Fallback:** If `MONGODB_URI` is unconfigured or cluster connectivity fails, the backend seamlessly operates with verified in-memory repositories.
- **Transparency:** `GET /api/health` accurately discloses the active persistence mode (`mongodb` vs `in_memory`).
