# Contributing to The Negotiator (Busy-bee)

Thank you for your interest in contributing to **The Negotiator**! This document outlines our engineering standards, development workflow, and pull request expectations.

---

## 1. Code of Conduct & Core Axioms

When contributing to Busy-bee, keep the system's foundational rule in mind:
> **"The model proposes; the backend authorizes; the evidence establishes what was said."**

- **Deterministic Logic First:** Never allow conversational LLM output to bypass backend policy checks, budget caps, or state machine transitions.
- **Evidence Provenance:** Every commercial term must be backed by a verifiable, timestamped source turn.
- **Zero-Spend Safety:** Never introduce autonomous loops that run unmetered API calls against external services.

---

## 2. Development Setup

### Prerequisites
- **Node.js:** v20.0.0 or higher
- **npm:** v10.0.0 or higher
- **Git**

### Installation
```bash
# Clone the repository
git clone https://github.com/Shishir-0/Busy-bee.git
cd Busy-bee

# Install all monorepo dependencies
npm install

# Create local environment file from template
cp .env.example .env
```

---

## 3. Branching & Git Conventions

- **Branch Naming:**
  - `feat/<feature-name>` for new features
  - `fix/<bug-name>` for bug fixes
  - `docs/<doc-name>` for documentation updates
  - `test/<test-name>` for test additions
- **Commit Messages:**
  Follow Conventional Commits:
  - `feat(agent): implement real-time speech token handling`
  - `fix(policy): prevent unquoted shipping from evaluating to zero`
  - `docs(readme): update API endpoint documentation`
  - `test(server): add regression test for duplicate eventId submission`

---

## 4. Testing & Quality Assurance

Before submitting any Pull Request, you **must** ensure that all local tests and production builds pass cleanly:

```bash
# 1. Run the backend test suite (30 tests)
npm run test:server

# 2. Run the AI agent scenario and policy test suite (20 tests)
npm run test:agent

# 3. Run the frontend unit tests (5 tests)
npm run test:frontend

# 4. Verify TypeScript compilation and production build
npm run build
```

---

## 5. Security & Sensitive Data

- **NEVER** commit `.env`, API keys, MongoDB credentials, or LiveKit secrets.
- Double-check your staged diff before committing:
  ```bash
  git diff --staged
  ```
- Any PR that leaks credentials will be immediately rejected and requires rotating the compromised keys.

---

## 6. Pull Request Checklist

When opening a Pull Request, confirm that:
1. [ ] The branch is branched off the latest `main`.
2. [ ] All 55 tests pass without skips or warnings.
3. [ ] `npm run build` succeeds with 0 TypeScript compilation errors.
4. [ ] No `.env` or sensitive credentials are included.
5. [ ] Relevant tests have been added for any newly introduced endpoints or policy rules.
