# Security Policy: The Negotiator (Busy-bee)

The Negotiator team takes the security and integrity of our procurement automation platform seriously. This document outlines our security model, threat mitigation strategies, and how to report vulnerabilities responsibly.

---

## 1. Security Model & Architecture

### 1.1 Dual-Boundary Defense
Busy-bee enforces a strict boundary between probabilistic AI models and consequential business operations:
1. **Zero Financial Authority for LLMs:** The AI agent cannot sign contracts, approve payments, or authorize prices. It acts solely as a conversational sensor and negotiator whose output must be explicitly validated by the deterministic `NegotiationGuard` engine.
2. **Deterministic Constraint Enforcement:** Budget limits, quantity requirements, delivery deadlines, and warranty minimums are hardcoded into TypeScript policy logic, making prompt injection ineffective at violating commercial boundaries.
3. **Evidence Immutability:** Commercial terms must be tied to a specific turn ID in the audio/transcript ledger. Fabricated claims are rejected by the backend evidence validator.

### 1.2 Authentication & Authorization
- **Internal Service Authentication:** All communication between the AI Agent and the Backend Service requires the `x-agent-token` header, verified against `AGENT_BACKEND_TOKEN`.
- **Short-Lived WebRTC Tokens:** LiveKit WebRTC tokens are minted by the backend using `livekit-server-sdk` with an explicit 1-hour expiration time (`ttl: 3600`) and minimal room join/publish grants. Secret keys are never exposed to client browsers.
- **Database Credential Protection:** MongoDB Atlas connection URIs are loaded exclusively from local environment variables and never logged or serialized into client responses.

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability, prompt injection exploit that circumvents policy enforcement, or credential leak within this repository:

1. **Do Not Open a Public GitHub Issue.**
2. Report the vulnerability privately to the project repository owner ([Shishir-0](https://github.com/Shishir-0)).
3. Include:
   - A detailed description of the vulnerability.
   - Exact steps or script to reproduce the behavior.
   - Any proposed remediation or mitigation patch.

We will acknowledge receipt within 48 hours and work with you to validate and remediate the issue prior to public disclosure.

---

## 3. Best Practices for Operators

When deploying Busy-bee in local or production environments:
- Always set strong, random values for `AGENT_BACKEND_TOKEN` and `LIVEKIT_API_SECRET`.
- Ensure `CORS_ORIGIN` is configured to only allow authorized frontend domains.
- Restrict MongoDB Atlas network access to your deployment's specific IP whitelist.
- Keep `ZERO_SPEND_ENFORCED=true` and `AGENT_SESSION_MAX_SECONDS` bounded to prevent runaway LLM costs.
