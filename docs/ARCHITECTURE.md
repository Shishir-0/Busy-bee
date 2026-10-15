# Architecture Specification: The Negotiator (Busy-bee)

**System Name:** The Negotiator: Proof-First Procurement AI  
**Repository:** `Busy-bee`  
**Classification:** Distributed Multi-Tier Procurement & Negotiation Intelligence Platform  
**Target Architecture:** Clean Monorepo with Shared Type Contracts  

---

## 1. Architectural Philosophy & Core Axioms

The Negotiator is engineered around a foundational operational axiom:

> **"The model proposes; the backend authorizes; the evidence establishes what was said."**

In enterprise procurement, an autonomous agent cannot be permitted to make binding financial commitments without strict governance. Probabilistic large language models (LLMs) are prone to hallucinations, unauthorized concessions, and susceptibility to conversational pressure. 

Busy-bee resolves this fundamental risk by decoupling **conversational intelligence** from **business policy enforcement**:

```
+-----------------------------------------------------------------------------+
|                          CONVERSATIONAL BOUNDARY                            |
|  - LiveKit WebRTC Audio Ingestion & Transport                               |
|  - OpenAI Realtime Speech-to-Speech Processing                              |
|  - Spoken Transcript Parsing & Named Entity Extraction                      |
+-----------------------------------------------------------------------------+
                                     │
                        Untrusted Tool Calls Only
                                     ▼
+-----------------------------------------------------------------------------+
|                       DETERMINISTIC CONTROL BOUNDARY                        |
|  - Negotiation Guard Policy Engine (Strict Budget & Term Ceilings)          |
|  - State Machine Enforcer (Created -> Open -> Counter -> Confirmed)         |
|  - Zero-Spend Session Governor (Timer Limits & Credit Protection)           |
+-----------------------------------------------------------------------------+
                                     │
                        Verified Financial Actions
                                     ▼
+-----------------------------------------------------------------------------+
|                         EVIDENCE & LEDGER BOUNDARY                          |
|  - Timestamped Audio-Turn Provenance Tracking                               |
|  - Idempotent Event Deduplication (Unique eventId)                          |
|  - Deterministic Total Landed Cost Arithmetic                               |
|  - Explainable Multi-Offer Recommendation Engine                            |
+-----------------------------------------------------------------------------+
```

---

## 2. Monorepo Organization

The project employs an `npm workspaces` monorepo design, separating distinct operational domains into isolated packages and services while sharing contracts:

```
Busy-bee/
├── apps/
│   ├── agent/                 # AI Voice Agent Workspace (@busy-bee/agent)
│   │   ├── src/
│   │   │   ├── backend/       # Authoritative Backend Client & Resilience Adapter
│   │   │   ├── evidence/      # Local Transcript & Turn Verification Ledger
│   │   │   ├── instructions.ts# Procurement Prompt & System Context Builder
│   │   │   ├── runtime/       # LiveKit WebRTC Worker & Fallback Runner
│   │   │   └── tools/         # LLM Function Tool Definitions & Validation Handlers
│   │   └── tests/             # Agent Quality, Scenario & Policy Rejection Tests
│   │
│   └── server/                # Core Backend API & Persistence Service
│       ├── src/
│       │   ├── config/        # Environment Validation (Zod) & Database Health
│       │   ├── controllers/   # REST API & Internal Agent Route Controllers
│       │   ├── events/        # In-Memory Server-Sent Events (SSE) Bus
│       │   ├── middleware/    # Token Authentication, CORS & Error Envelopes
│       │   ├── models/        # Mongoose Schema Definitions & Index Configuration
│       │   ├── policies/      # Deterministic Guard, Cost & State Policy Engines
│       │   ├── repositories/  # In-Memory & MongoDB Persistence Adapters
│       │   ├── routes/        # Buyer-facing API & Internal Agent Routers
│       │   └── services/      # LiveKit Token Minting & Negotiation Coordinators
│       └── tests/             # End-to-End API, Policy & Landed Cost Test Suites
│
├── packages/
│   └── shared/                # Universal Shared Contracts (@busy-bee/contracts)
│       └── src/
│           └── contracts.ts   # Shared Types, Zod Enums & Request/Response Contracts
│
├── src/                       # React 18 Frontend Application (Vite + TailwindCSS)
│   ├── components/            # UI Panels (Guardrails, Visualizer, Evidence, Offers)
│   ├── context/               # Negotiation State Provider & Client Data Dispatch
│   ├── pages/                 # Full Procurement Workflow Pages
│   └── services/              # API Client & LiveKit Browser WebRTC Voice Service
│
└── docs/                      # Architectural & Engineering Specifications
```

---

## 3. Component Deep Dive

### 3.1 Core Backend Service (`apps/server`)

The backend is an Express-based TypeScript service providing REST APIs, Server-Sent Events (SSE), and strict business logic execution:

1. **Deterministic Negotiation Guard (`negotiationGuard.ts`):**
   - Validates all proposed counteroffers, concessions, and agreements against the buyer's mandate.
   - Rejects offers exceeding `maxUnitPrice` or `maxBudget`.
   - Enforces minimum delivery timeframes, warranty requirements, and mandatory specifications.
   - Prohibits terminal state regressions (e.g., modifying an already confirmed offer).

2. **Cost Calculation Engine (`costEngine.ts`):**
   - Calculates exact Rupee landed cost:
     $$\text{Landed Cost} = \text{Product Subtotal} + \text{Shipping Fee} + \text{Taxes} + \text{Additional Fees} - \text{Discounts}$$
   - **Critical Rule:** Missing or unstated shipping charges are **never** treated as zero. If shipping is unquoted, the offer is flagged as `incomplete`, preventing silent cost underestimation.

3. **Dual Persistence Layer (`repositories/`):**
   - **In-Memory Store:** Fast, isolated dictionary storage used for unit testing, CI pipelines, and zero-dependency local startup.
   - **MongoDB Atlas Store:** Production persistence storing `Negotiations`, `Sessions`, `Offers`, `Evidence`, and `Recommendations` with automated schema validation and unique index enforcement (`eventId` deduplication).

4. **Internal Agent API (`internalRoutes.ts`):**
   - Protected by `internalAgentAuth` via the `x-agent-token` header.
   - Provides safe endpoints for the AI Agent to fetch mandate context, submit term observations, request counteroffer authorization, and conclude sessions.

---

### 3.2 AI Voice Agent (`apps/agent`)

Built with the official `@livekit/agents` framework and `@livekit/agents-plugin-openai`, the agent operates as a headless real-time participant:

1. **Preflight Credential Diagnostics:**
   - Evaluates whether real LiveKit Cloud credentials and an OpenAI API key are present.
   - If keys are missing or contain placeholder values, the worker gracefully refuses live connection, logs human-actionable instructions, and executes Fallback B (deterministic replay) to avoid wasting developer time or corrupting state.

2. **Structured LLM Tools:**
   The agent exposes 5 functional tools to the OpenAI Realtime model:
   - `get_negotiation_context`: Reads buyer constraints, target prices, and session parameters.
   - `submit_offer_observation`: Ingests merchant statements, validates the source turn in the transcript ledger, extracts key-value commercial terms, and persists evidence.
   - `request_negotiation_action`: Submits proposed counteroffers to the backend Negotiation Guard before uttering them.
   - `submit_confirmation_request`: Formalizes agreed terms once both parties align.
   - `end_negotiation_session`: Cleanly disconnects the session upon completion or unresolvable impasse.

3. **Session Governor (`session-manager.ts`):**
   - Limits total continuous dialogue to `AGENT_SESSION_MAX_SECONDS` (default: 90s).
   - Limits test runs to `AGENT_MAX_TEST_SESSIONS` (default: 5 runs).
   - Enforces zero-spend guarantees to prevent runaway cloud consumption.

---

### 3.3 Frontend Application (`src/`)

A responsive React 18 single-page application built with Vite and TailwindCSS:

1. **Active Session Workspace (`ActiveSessionPage.tsx`):**
   - Real-time audio waveform visualizer and bidirectional WebRTC status badge.
   - Chronological transcript stream detailing spoken dialogue.
   - **Negotiation Guard Panel:** Real-time visual feedback on budget utilization, delivery constraints, and policy compliance violations.
   - **Live Extracted Terms Summary:** Displays confirmed vs. unverified terms extracted from the merchant conversation.

2. **WebRTC Voice Client (`livekitVoiceService.ts`):**
   - Requests browser microphone access via `createLocalAudioTrack`.
   - Connects to the LiveKit server room using a short-lived, backend-minted JWT token.
   - Subscribes to the remote agent's audio track and binds it to a dynamic HTML5 audio element.
   - Detects active speakers via `RoomEvent.ActiveSpeakersChanged` for immediate UI synchronization.

3. **Recommendation & Evidence Ledger:**
   - **Offer Comparison Matrix:** Side-by-side evaluation of competing vendor quotes with complete landed cost breakdowns.
   - **Evidence Ledger:** Audit-ready table linking every extracted term to its exact timestamped transcript quote.
   - **Executive Review & Sign-Off:** Human approval workflow requiring authorized reviewer sign-off before purchase commitment.

---

## 4. End-to-End Data & Control Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Procurement Officer
    participant UI as React Frontend
    participant Server as Express Backend
    participant Agent as LiveKit Voice Agent
    participant OpenAI as OpenAI Realtime API
    participant Merchant as Merchant / Vendor

    Buyer->>UI: Define Mandate (Budget, Units, Specs)
    UI->>Server: POST /api/negotiations
    Server-->>UI: Negotiation Mandate Created (status: active)

    Buyer->>UI: Start Merchant Session (e.g. Apex Supplies)
    UI->>Server: POST /api/negotiations/:id/sessions
    Server-->>UI: Session Created & Room ID Assigned

    UI->>Server: POST /api/sessions/:id/token
    Server-->>UI: Short-lived Signed LiveKit Token

    par Browser WebRTC Connection
        UI->>UI: Capture Microphone & Connect to Room
    and Agent WebRTC Connection
        Agent->>Server: GET /api/internal/negotiations/:id/context
        Server-->>Agent: Mandate Limits & Objectives
        Agent->>Agent: Connect to LiveKit Room as "agent-worker"
    end

    Merchant->>Agent: Spoken Offer: "We can do ₹3,200 per chair plus ₹3,000 shipping"
    Agent->>OpenAI: Audio Ingestion & Turn Recognition
    OpenAI-->>Agent: Parsed Utterance & Tool Call: submit_offer_observation
    
    Agent->>Server: POST /api/internal/sessions/:id/observations
    Server->>Server: Validate Evidence & Calculate Landed Cost
    Server-->>Agent: Evidence Recorded (eventId, verified: true)
    Server-->>UI: SSE Broadcast: "offer_updated"

    Agent->>Server: POST /api/internal/sessions/:id/actions/authorize (Counter ₹2,800)
    Server->>Server: Evaluate Negotiation Guard
    Server-->>Agent: Action Authorized (action: counteroffer_permitted)

    Agent->>OpenAI: Synthesize Audio Response: "Our ceiling is ₹3,000. Can you meet ₹2,800?"
    OpenAI-->>UI: Spoken Agent Audio stream via WebRTC

    Merchant->>Agent: "We can meet you at ₹2,900 with free delivery."
    Agent->>Server: Ingest & Formalize Confirmation
    Server->>Server: Update Offer State: "merchant_confirmed"

    Buyer->>UI: Request Recommendation
    UI->>Server: POST /api/negotiations/:id/recommendation
    Server->>Server: Multi-Offer Landed Cost Ranking (Merchant A vs B)
    Server-->>UI: Winner Selected with Explainable Rationale
    Buyer->>UI: Review & Approve Deal
