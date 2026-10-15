# BUSY-BEE | THE NEGOTIATOR
### Proof-First Procurement AI Platform & Real-Time Voice Negotiation Engine

[![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Runtime: Node.js](https://img.shields.io/badge/Runtime-Node.js%2020+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Frontend: React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Backend: Express](https://img.shields.io/badge/Backend-Express%204.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Voice: LiveKit](https://img.shields.io/badge/Voice%20Transport-LiveKit%20WebRTC-FF4F00?logo=livekit&logoColor=white)](https://livekit.io/)
[![Intelligence: OpenAI Realtime](https://img.shields.io/badge/AI%20Engine-OpenAI%20Realtime-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Database: MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20%7C%20In--Memory-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tests: 55 Passed](https://img.shields.io/badge/Tests-55%20Passed%20(100%25)-brightgreen?logo=vitest&logoColor=white)](https://vitest.dev/)

---

## Executive Summary

**The Negotiator (Busy-bee)** is an evidence-driven, proof-first AI procurement platform engineered to bridge conversational intelligence with deterministic commercial governance. It conducts structured supplier negotiations, captures verified audio/transcript evidence, evaluates total landed costs, enforces strict commercial policies, and provides explainable deal recommendations with human-in-the-loop sign-off.

Autonomous procurement agents cannot be allowed to make unconstrained financial commitments. In Busy-bee, **conversational AI proposes, deterministic backend policy authorizes, and the evidence ledger proves what was said.**

```
                     THE CORE ARCHITECTURAL AXIOM
   ┌─────────────────────────────────────────────────────────────────┐
   │  "The model proposes; the backend authorizes; the evidence      │
   │                    establishes what was said."                  │
   └─────────────────────────────────────────────────────────────────┘
```

---

## Quick Navigation

- [1. The Procurement Problem](#1-the-procurement-problem)
- [2. The Busy-bee Solution & Innovation](#2-the-busy-bee-solution--innovation)
- [3. System Architecture](#3-system-architecture)
- [4. Core Engineering Principles](#4-core-engineering-principles)
- [5. Feature Matrix](#5-feature-matrix)
- [6. Technology Stack](#6-technology-stack)
- [7. Repository Structure](#7-repository-structure)
- [8. Negotiation Lifecycle & Data Flow](#8-negotiation-lifecycle--data-flow)
- [9. Negotiation Guard & Policy Engine](#9-negotiation-guard--policy-engine)
- [10. Evidence Ledger & Provenance](#10-evidence-ledger--provenance)
- [11. Landed Cost Engine & Benchmark Scenarios](#11-landed-cost-engine--benchmark-scenarios)
- [12. Realtime Voice Architecture](#12-realtime-voice-architecture)
- [13. Installation & Quick Start](#13-installation--quick-start)
- [14. Environment Variables Reference](#14-environment-variables-reference)
- [15. Application Execution Modes](#15-application-execution-modes)
- [16. REST API Reference](#16-rest-api-reference)
- [17. Database & Persistence Layer](#17-database--persistence-layer)
- [18. Testing & Quality Assurance](#18-testing--quality-assurance)
- [19. Security, Governance & Responsible AI](#19-security-governance--responsible-ai)
- [20. Troubleshooting Guide](#20-troubleshooting-guide)
- [21. Product Roadmap](#21-product-roadmap)
- [22. Documentation & Contributing](#22-documentation--contributing)

---

## 1. The Procurement Problem

Enterprise and SME procurement teams spend thousands of hours conducting repetitive commercial negotiations across fragmented communication channels (phone calls, emails, messaging apps). This creates severe operational vulnerabilities:

1. **Misleading Headline Pricing:** A supplier quotes ₹2,800/unit, but excludes shipping (₹3,000), taxes (18% GST), and delivery surcharges. A seemingly higher quote of ₹2,850/unit with all-inclusive shipping and an 18-month warranty actually represents a superior commercial deal.
2. **Ghost Concessions & Unverifiable Claims:** Verbal agreements made during calls frequently get lost, misremembered, or disputed upon invoice arrival. Traditional procurement tools offer no provenance linking final contract terms to exact spoken utterances.
3. **Runaway Autonomous AI Concessions:** Autonomous LLM agents deployed without strict governance hallucinate discounts, accept price increases under merchant pressure, or compromise on delivery timeframes.
4. **Opaque Multi-Vendor Recommendations:** Procurement software frequently outputs a single "recommended vendor" without breaking down the mathematical formula, penalty weights, or compliance checks behind the score.

---

## 2. The Busy-bee Solution & Innovation

Busy-bee resolves these failures through a **multi-tiered, deterministic architecture**:

- **Dual-Boundary Defense:** Large Language Models are treated as untrusted conversational sensors. Every counteroffer, concession, or formal acceptance requires explicit pre-authorization from the deterministic backend `NegotiationGuard`.
- **Immutable Evidence Provenance:** Spoken terms are extracted with sub-second latency and bound to exact, timestamped transcript source turn IDs (`sourceTurnId`). Untraceable or fabricated terms cannot enter the offer record.
- **Strict Landed Cost Arithmetic:** Mathematical calculation of landed costs ensures that unknown shipping fees are **never assumed to be zero**. An offer with unquoted logistics is explicitly marked `incomplete`, preventing premature acceptance.
- **Explainable Multi-Vendor Ranking:** The platform computes normalized scores across landed cost, delivery lead time, and warranty duration, generating audit-ready rationale tables.
- **Human-in-the-Loop Sign-Off:** Automated actions stop at recommendation; formal procurement commitments require an authorized procurement officer's sign-off.

---

## 3. System Architecture

Busy-bee is organized as an `npm workspaces` monorepo containing three core operational zones: the React 18 Frontend, the Express Backend with Dual-Persistence, and the Headless AI Voice Agent.

```mermaid
flowchart TB
    subgraph ClientLayer ["Client & Interface Layer"]
        User["Procurement Operator"]
        UI["React 18 Dashboard<br/>(Vite + TailwindCSS)"]
        BrowserMic["Browser Audio / Mic<br/>(WebRTC MediaStream)"]
    end

    subgraph TransportLayer ["Real-Time Voice Transport"]
        LiveKitRoom["LiveKit WebRTC Cloud<br/>(Room & Audio Routing)"]
    end

    subgraph AgentLayer ["AI Voice Worker (@busy-bee/agent)"]
        AgentWorker["LiveKit Agent Worker<br/>(Node.js RTC Participant)"]
        OpenAIRealtime["OpenAI Realtime API<br/>(gpt-4o-mini-realtime)"]
        ToolHandlers["Agent Tool Handlers<br/>(5 Type-Safe Functions)"]
        LocalLedger["Local Transcript Ledger<br/>(Turn Verification)"]
    end

    subgraph BackendLayer ["Authoritative Backend (@busy-bee/server)"]
        ExpressRouter["Express REST & SSE API<br/>(Port 4000)"]
        GuardEngine["Negotiation Guard<br/>(Deterministic Policy Engine)"]
        CostEngine["Landed Cost Engine<br/>(Exact Rupee Arithmetic)"]
        RecEngine["Recommendation Engine<br/>(Multi-Vendor Ranking)"]
        EventBus["SSE Event Bus<br/>(Real-Time State Push)"]
    end

    subgraph PersistenceLayer ["Persistence Layer"]
        DualRepo["Dual Repository Adapter"]
        MongoAtlas[("MongoDB Atlas<br/>Production Store")]
        InMemoryDB[("In-Memory Store<br/>Zero-Dependency Test Mode")]
    end

    User -->|Defines Mandates & Reviews Offers| UI
    BrowserMic <-->|WebRTC Bidirectional Audio| LiveKitRoom
    UI -->|REST Queries & Action Approval| ExpressRouter
    ExpressRouter -->|SSE Real-Time Updates| UI

    LiveKitRoom <-->|WebRTC Media Protocol| AgentWorker
    AgentWorker <-->|WebSocket Realtime Protocol| OpenAIRealtime
    AgentWorker -->|Execute Tool Calls| ToolHandlers
    ToolHandlers -->|Validate Provenance| LocalLedger
    ToolHandlers -->|x-agent-token Auth| ExpressRouter

    ExpressRouter --> GuardEngine
    ExpressRouter --> CostEngine
    ExpressRouter --> RecEngine
    ExpressRouter --> EventBus
    ExpressRouter --> DualRepo
    DualRepo --> MongoAtlas
    DualRepo --> InMemoryDB
```

---

## 4. Core Engineering Principles

| Principle | Meaning in Busy-bee | Practical Implementation |
|---|---|---|
| **Evidence Over Assumptions** | No commercial claim is valid without an identifiable source. | Every extracted term must point to a timestamped `sourceTurnId` in the conversation ledger. |
| **Deterministic Rules Over Unconstrained Models** | Consequential business decisions must be coded in deterministic software, not left to probabilistic LLM weights. | The `NegotiationGuard` enforces hard maximum budget caps and delivery deadlines in TypeScript. |
| **Total Commercial Value Over Headline Price** | Headline quotes are meaningless without logistics, taxes, and warranty costs. | The `costEngine` computes complete landed costs and refuses to assume unquoted shipping is free. |
| **Traceability Over Opaque Recommendations** | Reviewers must understand the mathematical reasoning behind every vendor recommendation. | Recommendations include full formula explanations and ineligible offer disqualification reasons. |
| **Human Oversight Over Automatic Commitment** | An AI agent recommends; a human procurement officer approves and signs. | The `POST /api/negotiations/:id/recommendation/approve` endpoint enforces an audit trail before purchase commitment. |

---

## 5. Feature Matrix

| Domain | Capability | Description | Verification Status |
|---|---|---|---|
| **Voice Agent** | Headless LiveKit Worker | Connects to LiveKit rooms using `@livekit/agents` and `@livekit/agents-plugin-openai`. | Fully Implemented & Tested |
| **Voice Agent** | Structured LLM Tools | 5 type-safe tool definitions (`get_negotiation_context`, `submit_offer_observation`, etc.). | Verified in Test Suite (Scenario N) |
| **Voice Agent** | Resilient Startup Preflight | Validates credentials, prevents invalid API calls, and automatically triggers replay fallback. | Verified in Unit Tests |
| **Voice Agent** | Session Budget & Timer Guard | Bounds continuous conversations to 90 seconds to prevent credit depletion. | Verified in Scenario O |
| **Voice Agent** | Replay Negotiation Runner | Fully deterministic replay mode executing realistic multi-merchant scenarios. | Active Default Mode |
| **Backend** | Negotiation Guard Engine | Enforces price caps, quantity thresholds, delivery deadlines, and warranty minimums. | 7 Dedicated Policy Tests Passing |
| **Backend** | Deterministic Cost Engine | Computes exact Rupee landed cost; strictly flags unquoted shipping as `incomplete`. | Verified on Benchmark Scenarios |
| **Backend** | Recommendation Engine | Evaluates competing vendors and ranks them by lowest compliant landed cost. | Verified (Merchant B wins over A) |
| **Backend** | Evidence Ledger | Persists structured terms, timestamp, speaker, and raw spoken quote with unique `eventId`. | Idempotent insertion verified |
| **Backend** | LiveKit Token Service | Issues short-lived, signed JWTs with explicit participant identities and permissions. | Verified on E2E API Route |
| **Backend** | Server-Sent Events (SSE) | Broadcasts live transcript turns, term extractions, and violations to the browser. | Active on `/api/negotiations/:id/events` |
| **Persistence** | Dual-Mode Storage | Switches between MongoDB Atlas and In-Memory storage without configuration changes. | 100% Schema & CRUD Verified |
| **Frontend** | Active Session Workspace | Real-time audio visualizer, live transcript stream, and active speaker highlighting. | Production Vite Build Verified |
| **Frontend** | Real-Time Guardrail Panel | Visual budget utilization bar, constraint checklist, and policy violation alerts. | Fully Integrated |
| **Frontend** | Browser WebRTC Client | Connects microphone, plays remote agent speech, and detects active speaker status. | Implemented via `livekit-client` |
| **Frontend** | Offer Comparison Matrix | Side-by-side comparison of merchant quotes, breakdown lines, and compliance status. | Fully Integrated |
| **Frontend** | Evidence Ledger Page | Searchable, chronological table of every piece of captured conversational proof. | Fully Integrated |

---

## 6. Technology Stack

### Core Monorepo & Language
- **Language:** TypeScript 5.7.3 (Strict typing across packages)
- **Runtime:** Node.js v20.0.0+ (ES Modules via `"type": "module"`)
- **Package Management:** `npm workspaces` (Monorepo coordinating `@busy-bee/agent`, `@busy-bee/server`, `@busy-bee/contracts`)
- **Execution & Hot-Reloading:** `tsx` 4.19.2 for live TypeScript server execution

### Backend Service (`apps/server`)
- **Web Framework:** Express 4.21.2
- **Schema Validation:** Zod 3.24.1 (Validating all incoming REST bodies and environment variables)
- **Security:** Helmet 8.0.0, CORS 2.8.5
- **Token Generation:** `livekit-server-sdk` 2.10.1 (Cryptographically signed short-lived JWT access tokens)
- **Database & ODM:** Mongoose 8.9.5 (MongoDB Atlas with connection health checks)
- **Identifiers:** `uuid` 11.0.5 (Unique RFC-4122 event and session identifiers)

### AI Voice Agent (`apps/agent`)
- **Agent Framework:** `@livekit/agents` 1.9.3 (Official Node.js agent runtime)
- **Voice Plugin:** `@livekit/agents-plugin-openai` 1.9.3 (OpenAI Realtime WebSocket integration)
- **RTC Node Client:** `@livekit/rtc-node` (Direct headless WebRTC room subscription and audio publishing)
- **AI Model:** `gpt-4o-mini-realtime-preview` (Fast speech-to-speech with low conversational latency)

### Frontend Dashboard (`src/`)
- **UI Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.2
- **Styling:** TailwindCSS 3.4.11 with custom procurement theme tokens
- **WebRTC Client:** `livekit-client` 2.22.4 (Microphone track publishing and remote audio track attachment)
- **Icons:** `lucide-react` 1.16.0

### Quality Assurance & Testing
- **Test Runners:** Node.js Native Test Runner (`node --test`), Vitest 2.1.9, Vitest 3.2.7
- **HTTP Assertions:** `supertest` 7.0.0

---

## 7. Repository Structure

```
Busy-bee/
├── .env.example                       # Documented environment variable template
├── .gitignore                         # Git exclusion rules (Secrets, build outputs, node_modules)
├── CONTRIBUTING.md                    # Engineering guidelines, branching model & PR checklist
├── SECURITY.md                        # Security policy, threat mitigation & responsible disclosure
├── README.md                          # Master evaluator-ready project documentation
├── package.json                       # Monorepo root package manifest with workspace scripts
├── package-lock.json                  # Canonical deterministic lockfile
├── tsconfig.json                      # Root TypeScript composite project configuration
├── vite.config.ts                     # Vite bundler configuration with React plugin
├── index.html                         # Single-page application root entrypoint
│
├── apps/
│   ├── agent/                         # AI Voice Agent Workspace (@busy-bee/agent)
│   │   ├── package.json               # Agent dependencies (@livekit/agents, OpenAI plugin)
│   │   ├── tsconfig.json              # Agent TypeScript compiler options
│   │   ├── vitest.config.ts           # Vitest configuration for agent unit/scenario tests
│   │   ├── src/
│   │   │   ├── index.ts               # CLI Entry point with mode routing & fallback orchestration
│   │   │   ├── config.ts              # Agent environment schema and zero-spend limits
│   │   │   ├── instructions.ts        # Procurement prompt engineering & mandatory disclosures
│   │   │   ├── backend/
│   │   │   │   └── client.ts          # Authenticated REST client communicating with Backend
│   │   │   ├── evidence/
│   │   │   │   └── ledger.ts          # Local audio turn capture and provenance ledger
│   │   │   ├── runtime/
│   │   │   │   ├── fallback-runner.ts # Deterministic multi-merchant replay engine
│   │   │   │   ├── livekit-worker.ts  # Real LiveKit WebRTC Worker with OpenAI Realtime
│   │   │   │   └── session-manager.ts # Session governor enforcing max duration & call bounds
│   │   │   ├── test-server/
│   │   │   │   └── mock-backend.ts    # In-process mock backend for isolated agent tests
│   │   │   └── tools/
│   │   │       ├── definitions.ts     # 5 Type-safe LLM function schemas for OpenAI Realtime
│   │   │       └── handlers.ts        # Execution handlers linking LLM calls to Backend Client
│   │   └── tests/
│   │       ├── agent-scenarios.test.ts # 16 comprehensive behavioral & quality gate tests
│   │       └── livekit-worker.test.ts  # 4 LiveKit worker credential, tool & policy tests
│   │
│   └── server/                        # Core Backend API & Persistence Service
│       ├── src/
│       │   ├── app.ts                 # Express application factory with middleware & error handling
│       │   ├── server.ts              # Server lifecycle listener connecting to DB & Port 4000
│       │   ├── config/
│       │   │   ├── database.ts        # MongoDB Atlas connection manager & health checks
│       │   │   └── env.ts             # Zod environment validation schema
│       │   ├── controllers/
│       │   │   ├── internalAgentController.ts # Endpoints called by AI Agent (Observations, Authorizations)
│       │   │   └── negotiationController.ts   # Buyer-facing endpoints (Mandates, Sessions, Approvals)
│       │   ├── events/
│       │   │   └── eventBus.ts        # In-memory SSE pub/sub event bus
│       │   ├── middleware/
│       │   │   ├── auth.ts            # x-agent-token authentication guard
│       │   │   └── errorHandler.ts    # Standardized JSON error response envelope
│       │   ├── models/
│       │   │   └── schemas.ts         # Mongoose schemas (Negotiation, Session, Offer, Evidence, Rec)
│       │   ├── policies/
│       │   │   ├── costEngine.ts      # Landed cost arithmetic & unknown shipping policy
│       │   │   ├── evidenceValidator.ts # Turn quote cross-referencing & verification
│       │   │   ├── negotiationGuard.ts# Deterministic policy enforcement (Budget, Delivery, Warranty)
│       │   │   ├── recommendationEngine.ts # Multi-vendor ranking & explainable rationale
│       │   │   └── stateMachine.ts    # Strict offer and session state transitions
│       │   ├── repositories/
│       │   │   ├── inMemoryRepository.ts # Lightning-fast memory repository for testing/fallback
│       │   │   ├── mongoRepository.ts    # Mongoose production repository with index checks
│       │   │   └── repository.ts         # Universal repository interface
│       │   ├── routes/
│       │   │   ├── apiRoutes.ts       # Public buyer REST routes
│       │   │   └── internalRoutes.ts  # Authenticated agent REST routes
│       │   ├── schemas/
│       │   │   └── validationSchemas.ts # Request payload validation schemas
│       │   └── services/
│       │       └── livekitService.ts  # JWT room token generation with fallback detection
│       └── tests/
│           ├── api.test.ts            # 13 End-to-end REST API integration tests
│           ├── cost.test.ts           # 4 Landed cost arithmetic & scenario tests
│           ├── evidence.test.ts       # 3 Evidence validation & idempotency tests
│           ├── policy.test.ts         # 7 Negotiation Guard constraint rejection tests
│           └── stateMachine.test.ts   # 3 State transition lifecycle tests
│
├── packages/
│   └── shared/                        # Shared Types & Contracts (@busy-bee/contracts)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── contracts.ts           # Canonical data contracts, enums & Zod schemas
│           └── index.ts
│
├── src/                               # Frontend Single-Page Application (React 18)
│   ├── App.tsx                        # Main view router & shell
│   ├── main.tsx                       # React DOM entrypoint
│   ├── index.css                      # Tailwind styling & custom animation rules
│   ├── components/                    # Modular UI components
│   │   ├── common/                    # Navigation header & StatusBadge badges
│   │   ├── evidence/                  # Evidence timeline & detail inspection modal
│   │   ├── offers/                    # Offer comparison table
│   │   ├── recommendation/            # Decision engine breakdown & approval cards
│   │   └── session/                   # AudioVisualizer, LiveTranscript, NegotiationGuardPanel
│   ├── context/
│   │   └── NegotiationContext.tsx     # Centralized React Context coordinating API & state
│   ├── pages/                         # Core view pages
│   │   ├── ActiveSessionPage.tsx      # Live voice session workspace with audio & transcript
│   │   ├── CommandCentrePage.tsx      # Executive procurement dashboard
│   │   ├── EvidenceLedgerPage.tsx     # Full evidence provenance audit log
│   │   ├── MandateSetupPage.tsx       # Buyer mandate creation form
│   │   ├── MerchantBrowserPage.tsx    # Vendor session launcher
│   │   ├── OfferComparisonPage.tsx    # Multi-vendor side-by-side comparison
│   │   └── RecommendationPage.tsx     # Explainable winner view & sign-off workflow
│   ├── services/
│   │   ├── api.ts                     # Frontend HTTP client communicating with backend
│   │   ├── livekitVoiceService.ts     # Browser WebRTC client connecting to LiveKit
│   │   └── mockData.ts                # Initial mock demonstration data
│   ├── types/
│   │   └── negotiation.ts             # Frontend TypeScript interfaces
│   └── utils/
│       ├── calculations.ts            # Client-side landed cost & metric formatters
│       ├── calculations.test.ts       # 5 Frontend calculation unit tests
│       └── formatters.ts              # Currency & date formatters
│
└── docs/                              # Deep-Dive Engineering Documentation
    ├── ARCHITECTURE.md                # System boundaries, data contracts & sequence flows
    ├── AI_AGENT_IMPLEMENTATION.md     # Agent prompt design & tool engineering report
    ├── BACKEND_IMPLEMENTATION.md      # API engineering & policy enforcement report
    └── FRONTEND_IMPLEMENTATION.md     # UI/UX design tokens & visual components report
```

---

## 8. Negotiation Lifecycle & Data Flow

Every procurement deal follows a strict 10-stage lifecycle ensuring complete traceability and compliance:

```mermaid
stateDiagram-v2
    [*] --> MandateEstablished: 1. Buyer defines quantity, budget & specs
    MandateEstablished --> SessionCreated: 2. Merchant session initiated
    SessionCreated --> LiveKitConnected: 3. Token issued & WebRTC room joined
    LiveKitConnected --> SpokenDialogue: 4. Speech exchange via OpenAI Realtime
    SpokenDialogue --> TermsExtracted: 5. Utterances parsed into commercial terms
    TermsExtracted --> EvidenceLedgered: 6. Terms bound to sourceTurnId in DB
    EvidenceLedgered --> PolicyEvaluated: 7. NegotiationGuard evaluates counteroffers
    PolicyEvaluated --> OfferConfirmed: 8. Merchant agrees to compliant terms
    OfferConfirmed --> MultiVendorComparison: 9. Landed cost calculated for all vendors
    MultiVendorComparison --> ExecutiveApproval: 10. Human reviewer signs off
    ExecutiveApproval --> [*]: Purchase Order Ready
```

1. **Mandate Creation:** The procurement officer sets the target volume (e.g., 50 ergonomic chairs), target unit price (₹2,600), maximum budget ceiling (₹150,000), delivery deadline (14 days), and required warranty (12 months).
2. **Session Initialization:** A new session record is generated in the backend, allocating a unique room ID (`roomId`).
3. **Room Connection:** The backend mints a short-lived, signed LiveKit JWT. The browser connects its microphone track while the AI Agent connects as a headless participant.
4. **Dialogue & Observation:** The merchant speaks: *"We can do 50 units at ₹3,200 each, plus ₹3,000 shipping, delivery in 7 days."*
5. **Observation Submission:** The agent invokes `submit_offer_observation`, passing the exact quote, speaker, timestamp, and parsed key-value terms.
6. **Evidence Recording:** The backend verifies that the quote text is valid, assigns an immutable `eventId`, logs the evidence, and recalculates the provisional landed cost.
7. **Guardrail Evaluation:** The agent plans a counteroffer: *"Can you do ₹2,800?"* It calls `request_negotiation_action`. The backend checks the proposed ₹2,800 against the buyer mandate. If permitted, the agent receives approval to make the counteroffer.
8. **Offer Confirmation:** When the vendor agrees to acceptable terms (e.g., ₹2,900 unit price, free shipping, 12 months warranty), the agent invokes `submit_confirmation_request`. The offer transitions from `counter_received` to `merchant_confirmed`.
9. **Landed Cost & Recommendation:** The recommendation engine compares all completed merchant sessions, applies penalties for longer delivery times, and ranks the offers.
10. **Human Review:** The procurement officer inspects the evidence, reviews the mathematical breakdown, enters comments, and approves the deal.

---

## 9. Negotiation Guard & Policy Engine

The `NegotiationGuard` (`apps/server/src/policies/negotiationGuard.ts`) is the system's core governance engine. It evaluates every proposed term and state mutation against 7 immutable constraints:

```typescript
// Deterministic Policy Checklist evaluated on every action
1. Unit Price Check:     proposedUnitPrice <= mandate.maxUnitPrice
2. Total Budget Check:   calculatedLandedCost <= mandate.maxBudget
3. Quantity Check:       offeredQuantity >= mandate.targetUnitCount
4. Delivery Check:       offeredDeliveryDays <= mandate.maxDeliveryDays
5. Warranty Check:       offeredWarrantyMonths >= mandate.minWarrantyMonths
6. Logistics Check:      shipping is explicitly quoted or explicitly included
7. Lifecycle Check:      session is active and offer has not reached terminal state
```

### Violation Enforcement
If any condition fails, the backend immediately halts the action, increments the violation counter, and returns an actionable rejection envelope:

```json
{
  "allowed": false,
  "action": "counteroffer_rejected",
  "reason": "Proposed unit price ₹3,300 exceeds authorized ceiling of ₹3,000.",
  "violations": [
    {
      "rule": "MAX_UNIT_PRICE_EXCEEDED",
      "severity": "critical",
      "message": "Vendor quote ₹3,300 exceeds maximum authorized price of ₹3,000."
    }
  ]
}
```

The AI Agent cannot bypass this rejection; it must pivot its conversational strategy or inform the vendor of the impassable budget ceiling.

---

## 10. Evidence Ledger & Provenance

Procurement disputes arise when vendors bill amounts different from verbal agreements. Busy-bee eliminates this through cryptographic and structural provenance tracking.

### The Evidence Record Schema
Every observation stored in the database adheres to the `EvidenceRecord` structure:

```typescript
interface EvidenceRecord {
  id: string;                      // Unique evidence identifier
  eventId: string;                 // Deterministic hash preventing duplicate ingestion
  negotiationId: string;           // Parent negotiation mandate ID
  sessionId: string;               // Merchant session ID
  sourceTurnId: string;            // ID of the exact spoken audio turn
  timestamp: string;               // ISO-8601 millisecond timestamp
  speaker: 'merchant' | 'agent';   // Identified speaker
  sourceText: string;              // Exact spoken quote (e.g. "₹2,800 per unit, free shipping")
  extractedTerms: ExtractedTerms;  // Structured key-value pairs
  verificationStatus: 'verified' | 'unverified' | 'disputed';
  verificationReason: string;      // Audit reasoning
}
```

### Idempotency Guarantee
The database creates a unique index on `eventId`. If network retries or LLM re-invocations submit the same observation twice, the backend safely deduplicates the event without corrupting the offer state.

---

## 11. Landed Cost Engine & Benchmark Scenarios

### The Landed Cost Formula
The `costEngine` (`apps/server/src/policies/costEngine.ts`) applies exact Rupee arithmetic:

$$\text{Landed Cost} = \text{Product Subtotal} + \text{Shipping Fee} + \text{Taxes} + \text{Additional Surcharges} - \text{Discounts}$$

Where:
- $\text{Product Subtotal} = \text{Quantity} \times \text{Unit Price}$
- $\text{Shipping Fee} = 0 \text{ if shipping is included; otherwise exact quoted amount}$
- $\text{Taxes} = 0 \text{ if tax is included; otherwise } (\text{Subtotal} \times \text{Tax Rate \%}) / 100$

> **CRITICAL RULE:** If a supplier does not specify shipping costs, $\text{Shipping Fee}$ is **NOT** set to zero. The offer is marked with `missingComponents: ['shipping_fee']` and flagged as `provisional`. It is excluded from winner selection until shipping terms are explicitly extracted.

### The Benchmark Procurement Challenge
The repository includes automated test scenarios evaluating 50 Ergonomic Mesh Chairs under a mandate budget of ₹150,000:

| Metric | Mandate Constraint | Merchant A (Apex Supplies) | Merchant B (Bharat Ergonomics) | Winner |
|---|---|---|---|---|
| **Quantity** | 50 units | 50 units | 50 units | Tie |
| **Initial Quote** | — | ₹3,200/unit + ₹3,000 shipping | ₹2,850/unit (all-inclusive) | — |
| **Negotiated Quote** | $\le$ ₹3,000 | **₹2,900 / unit** | **₹2,800 / unit** | Merchant B |
| **Shipping Terms** | Must be known | ₹2,000 doorstep delivery | **Free delivery included** | Merchant B |
| **Product Subtotal**| — | ₹145,000 | ₹140,000 | Merchant B |
| **Total Landed Cost**| $\le$ ₹150,000 | **₹146,500** | **₹145,000** | **Merchant B (₹1,500 Cheaper)** |
| **Delivery Time** | $\le$ 14 days | 4 days | 3 days | Merchant B (1 day faster) |
| **Warranty** | $\ge$ 12 months | 12 months | 18 months | Merchant B (6 months extra) |
| **Compliance** | Strict Pass | **PASSED** | **PASSED** | **Merchant B Wins** |

**Recommendation Rationale:** Bharat Ergonomics is ranked first because its total landed cost of ₹145,000 is lower than Apex Supplies (₹146,500), while providing superior warranty (18 months vs 12 months) and faster delivery (3 days vs 4 days).

---

## 12. Realtime Voice Architecture

Busy-bee supports live, browser-to-agent speech-to-speech negotiations via WebRTC:

```
[ Browser Microphone ]
         │ (WebRTC Audio Stream)
         ▼
[ LiveKit Cloud Edge ]
         │ (Room Audio Routing)
         ▼
[ LiveKit Agent Worker ] <──WebSocket Realtime──> [ OpenAI Realtime API ]
         │                                               │
         │ (5 Structured LLM Tool Calls)                │ (Low-latency audio synthesis)
         ▼                                               ▼
[ Authoritative Express Backend ]              [ Browser Audio Output ]
```

### Operational Safety & Graceful Degradation
To prevent wasted hackathon credits and protect users from broken WebRTC sessions:
1. **Startup Preflight:** On launch, the worker inspects `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`. If any key contains placeholder strings (e.g. `your-project` or `replace_with`), the live worker refuses connection.
2. **Deterministic Replay Fallback:** Instead of crashing, the system logs diagnostic instructions and automatically launches the fully functional replay negotiation engine, allowing evaluators to experience the entire negotiation, guardrail, and recommendation pipeline without third-party cloud setup.
3. **Frontend Simulation Notice:** If simulation tokens are detected, the frontend displays an explicit badge: `Simulation Mode (LiveKit credentials are placeholders)`, ensuring full transparency.

---

## 13. Installation & Quick Start

### Prerequisites
- **Node.js:** v20.0.0 or higher
- **npm:** v10.0.0 or higher
- **Git**
- **Operating System:** Windows (PowerShell commands documented below), macOS, or Linux

### 1. Clone the Repository
```powershell
git clone https://github.com/Shishir-0/Busy-bee.git
cd Busy-bee
```

### 2. Install Monorepo Dependencies
```powershell
npm install
```

### 3. Configure Local Environment
```powershell
# Copy the documented environment template
cp .env.example .env
```
*(The repository works out of the box in zero-spend Replay Mode without entering paid API keys!)*

---

### Running Busy-bee Locally

For the best developer and evaluator experience, run the three core tiers in separate terminal windows:

#### Terminal 1: Core Backend API Server
```powershell
# Starts the Express API server on Port 4000 (hot-reloads via tsx)
npm run dev:server
```
*Health Check: Open [http://localhost:4000/api/health](http://localhost:4000/api/health) in your browser.*

#### Terminal 2: AI Negotiation Agent
```powershell
# Runs the AI agent in deterministic replay mode (Default)
npm run agent:replay

# Or, if LiveKit and OpenAI credentials are configured in .env:
npm run agent:start
```

#### Terminal 3: React 18 Frontend Dashboard
```powershell
# Starts the Vite development server on Port 5173
npm run dev:frontend
```
*Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.*

---

## 14. Environment Variables Reference

| Variable | Target Component | Purpose | Required? | Default / Example Placeholder |
|---|---|---|---|---|
| `PORT` | Backend | HTTP listening port for Express API | Optional | `4000` |
| `NODE_ENV` | Global | Runtime environment (`development`, `production`, `test`) | Optional | `development` |
| `CORS_ORIGIN` | Backend | Allowed CORS client origins | Optional | `http://localhost:5173,http://localhost:3000` |
| `AGENT_BACKEND_TOKEN` | Backend & Agent | Shared secret header (`x-agent-token`) authenticating agent | **Required** | `agent-negotiator-secret-2026` |
| `MONGODB_URI` | Backend | MongoDB Atlas connection string (Falls back to In-Memory if omitted) | Optional | `mongodb+srv://user:pass@cluster.mongodb.net/negotiator` |
| `LIVEKIT_URL` | Server, Agent & UI | LiveKit WebRTC project websocket URL | Optional* | `wss://your-project.livekit.cloud` |
| `LIVEKIT_API_KEY` | Server & Agent | LiveKit Cloud project API key | Optional* | `your_livekit_api_key_here` |
| `LIVEKIT_API_SECRET` | Server & Agent | LiveKit Cloud project API secret | Optional* | `your_livekit_api_secret_here` |
| `OPENAI_API_KEY` | Agent | OpenAI API key with access to Realtime model | Optional* | `your_openai_api_key_here` |
| `OPENAI_REALTIME_MODEL`| Agent | OpenAI Realtime speech model | Optional | `gpt-4o-mini-realtime-preview` |
| `BACKEND_API_BASE_URL` | Agent | URL used by Agent worker to call Backend API | **Required** | `http://localhost:4000/api` |
| `AGENT_MODE` | Agent | Operational mode (`replay`, `voice`, `text`, `test`) | Optional | `replay` |
| `AGENT_SESSION_MAX_SECONDS`| Agent | Safety governor: maximum seconds per voice session | Optional | `90` |
| `AGENT_MAX_TEST_SESSIONS` | Agent | Safety governor: max test calls allowed | Optional | `5` |
| `ZERO_SPEND_ENFORCED` | Agent | Enforces zero new spend limit on cloud consumption | Optional | `true` |
| `LOG_LEVEL` | Agent | Logging verbosity (`debug`, `info`, `warn`, `error`) | Optional | `info` |

*\*Only required if attempting real-time voice mode (`AGENT_MODE=voice`) with LiveKit Cloud.*

---

## 15. Application Execution Modes

The AI Agent (`apps/agent`) supports four distinct runtime modes configured via `AGENT_MODE` or CLI flags:

### 1. `replay` (Default & Evaluator Recommended)
- Executes realistic, multi-turn negotiation conversations against mock merchants (Apex Supplies and Bharat Ergonomics).
- Generates real evidence events, triggers backend `NegotiationGuard` policy checks, updates live offer state, and triggers recommendation generation.
- Requires ₹0 external API spending and zero external credentials.

### 2. `voice` (LiveKit WebRTC + OpenAI Realtime)
- Connects as a headless participant to a LiveKit room.
- Streams microphone audio directly to OpenAI Realtime (`gpt-4o-mini-realtime-preview`).
- Invokes real-time tools to validate budget limits before uttering counteroffers.
- Automatically falls back to replay if credentials contain placeholders.

### 3. `text` (Interactive Terminal Mode)
- Launches an interactive terminal-based procurement session.
- Allows developers to manually type merchant statements and inspect tool execution in real-time.

### 4. `test` (Headless Test Harness)
- Runs automated scenario evaluations (Scenarios A through O) verifying policy rejection, timeout handling, and cost arithmetic without user interaction.

---

## 16. REST API Reference

All buyer endpoints are accessible under `/api`. Internal AI agent endpoints require the `x-agent-token` header.

### Buyer & Negotiation Endpoints
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health, MongoDB status, and active SSE client count | None |
| `POST`| `/api/negotiations` | Create a new buyer negotiation mandate | None |
| `GET` | `/api/negotiations` | List all active and archived negotiation mandates | None |
| `GET` | `/api/negotiations/:id` | Fetch specific mandate by ID | None |
| `POST`| `/api/negotiations/:id/sessions` | Create a merchant negotiation session | None |
| `GET` | `/api/negotiations/:id/sessions` | List all sessions for a mandate | None |
| `POST`| `/api/sessions/:id/token` | Issue signed LiveKit WebRTC access token | None |
| `GET` | `/api/negotiations/:id/offers` | Get all extracted vendor offers | None |
| `GET` | `/api/negotiations/:id/evidence` | Get chronological evidence ledger records | None |
| `GET` | `/api/negotiations/:id/violations` | Get policy violations triggered during negotiation | None |
| `POST`| `/api/negotiations/:id/recommendation` | Calculate multi-vendor ranking & landed costs | None |
| `GET` | `/api/negotiations/:id/recommendation` | Get existing recommendation record | None |
| `POST`| `/api/negotiations/:id/recommendation/approve` | Human procurement officer deal approval | None |
| `GET` | `/api/negotiations/:id/events` | Real-time Server-Sent Events (SSE) stream | None |

### Internal AI Agent Endpoints
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/internal/negotiations/:id/context` | Read buyer constraints, target prices & rules | `x-agent-token` |
| `POST`| `/api/internal/sessions/:id/observations` | Ingest spoken quote, extract terms & record evidence | `x-agent-token` |
| `POST`| `/api/internal/sessions/:id/actions/authorize`| Pre-authorize proposed counteroffer with Guard | `x-agent-token` |
| `POST`| `/api/internal/sessions/:id/confirmations` | Transition offer to `merchant_confirmed` | `x-agent-token` |
| `POST`| `/api/internal/sessions/:id/end` | Close active session cleanly | `x-agent-token` |

### Sample API Response: Recommendation Engine
```json
{
  "id": "rec-neg-001",
  "negotiationId": "neg-001",
  "status": "ready_for_review",
  "winnerOfferId": "offer-merchant-b",
  "winnerMerchantName": "Bharat Ergonomics",
  "eligibleOffers": [
    {
      "merchantName": "Bharat Ergonomics",
      "totalLandedCost": 145000,
      "deliveryDays": 3,
      "warrantyMonths": 18,
      "isCompliant": true
    },
    {
      "merchantName": "Apex Supplies",
      "totalLandedCost": 146500,
      "deliveryDays": 4,
      "warrantyMonths": 12,
      "isCompliant": true
    }
  ],
  "ineligibleOffers": [],
  "formulaExplanation": "Ranked by lowest landed cost (Product + Shipping + Taxes) with delivery & warranty compliance.",
  "calculatedAt": "2026-10-15T12:00:00.000Z"
}
```

---

## 17. Database & Persistence Layer

Busy-bee implements a clean **Dual-Repository Architecture**:

```
           Universal Repository Interface (IRepository)
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
InMemoryRepository                MongoRepository
(Zero setup, unit tests)          (Mongoose + MongoDB Atlas)
```

### Managed Collections & Indexes
1. **`negotiations`:** Stores buyer mandates with unique index on `id`.
2. **`sessions`:** Tracks merchant call status, timestamps, and LiveKit room IDs. Indexed on `negotiationId`.
3. **`offers`:** Stores current and historical term revisions, cost breakdowns, and compliance status.
4. **`evidence`:** Append-only ledger storing verified quotes. **Unique compound index on `eventId`** guarantees duplicate utterances cannot be inserted.
5. **`recommendations`:** Stores multi-vendor ranking decisions, formula breakdowns, and reviewer approvals. Unique index on `negotiationId`.

If `MONGODB_URI` is omitted from `.env` or unreachable due to network restrictions, the application gracefully initializes the in-memory repository without throwing unhandled exceptions.

---

## 18. Testing & Quality Assurance

Busy-bee maintains an automated test suite verifying every layer of the monorepo:

```powershell
# 1. Run the entire backend test suite (30 tests)
npm run test:server

# 2. Run the AI agent scenario and livekit test suite (20 tests)
npm run test:agent

# 3. Run the frontend calculation unit tests (5 tests)
npm run test:frontend

# 4. Verify TypeScript compilation and production bundle build
npm run build
```

### Verified Test Results Summary
- **Backend Test Suite:** **30 passed / 0 failed** (API routes, landed cost arithmetic, evidence deduplication, negotiation guard rejections, state machine).
- **AI Agent Test Suite:** **20 passed / 0 failed** (LiveKit worker preflight, LLM tool schemas, session timeouts, Scenario A through O quality tests).
- **Frontend Test Suite:** **5 passed / 0 failed** (Landed cost calculation, currency formatting, compliance checks).
- **Production Build:** `tsc -b && vite build` built successfully in 11.15 seconds with **0 errors**.

---

## 19. Security, Governance & Responsible AI

- **Zero-Spend Guarantees:** Strict session limits (`AGENT_SESSION_MAX_SECONDS=90`) and preflight credential checks ensure development never exceeds allocated hackathon credits.
- **Header-Based Internal Auth:** Model tool handlers communicate with the backend exclusively via an authenticated channel (`x-agent-token`).
- **No Client-Side Secrets:** Neither the OpenAI API key nor the LiveKit API secret is ever bundled into frontend JavaScript or exposed to client browsers.
- **Mandatory Spoken Disclosures:** The AI agent begins every conversation by explicitly disclosing its artificial identity and asking for permission to capture commercial terms:
  > *"Hello, I am the AI procurement assistant for this negotiation... With your permission, we will use the conversation to capture and verify offer terms. Is it okay to continue?"*

---

## 20. Troubleshooting Guide

| Issue | Root Cause | Solution |
|---|---|---|
| `Port 4000 already in use` | Another node process is holding port 4000 | Set `PORT=4001` in `.env` or kill existing node processes using `Stop-Process -Name node -Force`. |
| `Cannot connect to MongoDB Atlas` | IP not whitelisted in Atlas or invalid URI | Omit `MONGODB_URI` from `.env`. The backend will automatically use the In-Memory Repository. |
| `LiveKit Voice Worker fallback to replay` | Placeholder credentials in `.env` | Expected behavior. Enter real credentials from [cloud.livekit.io](https://cloud.livekit.io) in `.env` to activate live WebRTC. |
| `Microphone permission denied` | Browser blocked mic access in WebRTC | Click the camera/microphone icon in the browser address bar, select "Allow", and refresh. |
| `tsc compilation errors` | Outdated build cache | Run `npm run build` to perform a clean compilation. |

---

## 21. Product Roadmap

1. **Multi-Merchant Parallel Bidding:** Support concurrent negotiation rooms where competing merchants submit bids against real-time anonymized rank feedback.
2. **ERP & Punchout Integration:** Direct integration with SAP Ariba and Coupa for automatic purchase order creation upon human deal approval.
3. **Voice Biometric Verification:** Merchant caller verification ensuring that quotes are issued by authorized sales directors.
4. **Multilingual Procurement Models:** Support for regional Indian languages (Hindi, Tamil, Telugu) for vernacular vendor negotiations.

---

## 22. Documentation & Contributing

- **System Architecture Deep Dive:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **AI Agent Implementation Report:** [docs/AI_AGENT_IMPLEMENTATION.md](docs/AI_AGENT_IMPLEMENTATION.md)
- **Backend Implementation Report:** [docs/BACKEND_IMPLEMENTATION.md](docs/BACKEND_IMPLEMENTATION.md)
- **Frontend Implementation Report:** [docs/FRONTEND_IMPLEMENTATION.md](docs/FRONTEND_IMPLEMENTATION.md)
- **Contribution Guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security Policy:** [SECURITY.md](SECURITY.md)

### License
The Busy-bee codebase was developed for the CHAOS Hackathon. The repository does not currently specify an open-source license and is reserved for proprietary project evaluation.
