# Busy-bee: The Negotiator
### Proof-First Procurement AI Engine • CHAOS Hackathon

> **Core Architectural Principle:** The model proposes; the backend authorises; the evidence establishes what was said.

The Negotiator is an AI procurement negotiation system designed to conduct browser-based voice and text negotiations with vendors, extract structured commercial terms, enforce buyer budget and constraint policies in deterministic backend code, and establish transparent evidence provenance for every recorded term.

---

## 🛠️ Repository Architecture

```text
Busy-bee/
├── apps/
│   └── agent/             # LiveKit Agents worker, OpenAI Realtime, and Fallback runner
│       ├── src/
│       │   ├── backend/   # Typed client communicating with Express backend API
│       │   ├── evidence/  # Term extractor and transcript-linked evidence ledger
│       │   ├── runtime/   # LiveKit WebRTC worker, session manager, and fallback runner
│       │   ├── test-server/ # Deterministic mock backend with pure policy engine
│       │   ├── tools/     # Function definitions and execution handlers
│       │   ├── config.ts  # Zod-validated environment configuration
│       │   ├── instructions.ts # Structured negotiation persona & consent disclosures
│       │   └── index.ts   # Unified CLI entry point
│       └── tests/         # Complete 16-scenario unit & integration test suite
├── packages/
│   └── contracts/         # Canonical domain models, shared TypeScript types & Zod schemas
├── docs/
│   └── AI_AGENT_IMPLEMENTATION.md # Detailed workstream engineering report
├── .env.example           # Environment template with placeholders only
└── .gitignore
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite (16/16 Tests Passing)
```bash
npm test
```

### 3. Run Replay Demo (Fallback B)
Runs the complete multi-merchant negotiation dialogue and generates the landed cost recommendation:
```bash
npm run agent:replay
```

### 4. Run Live Voice Agent (LiveKit + OpenAI Realtime)
Configure your `.env` file from `.env.example`:
```bash
npm run agent:start -- --mode=voice
```

---

## 🛡️ Guardrails & Policy Enforcement
- **Financial Bounds:** Model cannot accept quotes above budget ceilings (e.g. ₹150,000 total landed cost / ₹3,000 per unit).
- **Evidence Provenance:** Every commercial term is anchored to an immutable, timestamped transcript turn ID. Fabricated quotes are rejected.
- **Unknown is NOT Zero:** Missing shipping or warranty costs are preserved as `null` (unknown), preventing inaccurate landed cost rankings.
- **Zero-Spend Protection:** 90-second session limits and bounded test runs protect API credits.
