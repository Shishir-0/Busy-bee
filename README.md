# BUSY-BEE | The Negotiator

### A Voice AI Negotiation Agent for Evidence-Based Procurement Decisions

Busy-bee is an AI-powered negotiation and procurement decision-support platform designed to help organizations evaluate merchant offers, enforce negotiation policies, maintain traceable evidence, compare commercial terms, and generate explainable recommendations.

The project combines a React frontend, a TypeScript and Express backend, MongoDB persistence, and an agent architecture designed to support voice-based negotiations through LiveKit and an OpenAI Realtime model.

Rather than evaluating a vendor solely by the quoted price, Busy-bee is designed around a more rigorous principle:

**Every commercial decision should be explainable, every factual claim should have evidence, and every recommendation should respect explicit negotiation constraints.**

The repository currently includes a deterministic replay workflow for demonstrating and testing negotiation scenarios. Real-time voice functionality is under development and must be distinguished from the replay implementation.

**Repository:** https://github.com/Shishir-0/Busy-bee

**Project category:** Voice AI, agentic systems, procurement automation, negotiation intelligence, decision support

**Primary implementation languages:** TypeScript and JavaScript

**Data persistence:** MongoDB

**Development priority:** Reliable negotiation logic, traceable evidence, reproducible decisions, and a verifiable path to real-time voice interaction.

---

## Table of Contents

1. [Overview](#1-overview)
2. [The Problem](#2-the-problem)
3. [The Busy-bee Approach](#3-the-busy-bee-approach)
4. [Project Objectives](#4-project-objectives)
5. [Core Capabilities](#5-core-capabilities)
6. [Feature Implementation Status](#6-feature-implementation-status)
7. [System Architecture](#7-system-architecture)
8. [Technology Stack](#8-technology-stack)
9. [Repository Structure](#9-repository-structure)
10. [How a Negotiation Works](#10-how-a-negotiation-works)
11. [Negotiation Policy and Guardrails](#11-negotiation-policy-and-guardrails)
12. [Evidence Ledger and Traceability](#12-evidence-ledger-and-traceability)
13. [Landed Cost and Offer Evaluation](#13-landed-cost-and-offer-evaluation)
14. [Recommendation and Human Review](#14-recommendation-and-human-review)
15. [Voice Agent Architecture](#15-voice-agent-architecture)
16. [Prerequisites](#16-prerequisites)
17. [Installation](#17-installation)
18. [Environment Configuration](#18-environment-configuration)
19. [Running Busy-bee](#19-running-busy-bee)
20. [Application Modes](#20-application-modes)
21. [Backend API Reference](#21-backend-api-reference)
22. [Database and Persistence](#22-database-and-persistence)
23. [Testing and Build](#23-testing-and-build)
24. [Security and Privacy](#24-security-and-privacy)
25. [Zero-Spend Development Strategy](#25-zero-spend-development-strategy)
26. [Troubleshooting](#26-troubleshooting)
27. [Development Workflow](#27-development-workflow)
28. [Known Limitations](#28-known-limitations)
29. [Roadmap](#29-roadmap)
30. [Contributing](#30-contributing)
31. [License](#31-license)
32. [Project Summary](#32-project-summary)

---

## 1. Overview

Traditional procurement frequently requires a buyer to communicate with multiple suppliers, collect quotations, compare prices and conditions, clarify missing information, and decide which offer represents the best overall value.

This process becomes difficult when commercial information is scattered across conversations, different vendors quote different terms, and the lowest quoted price does not necessarily produce the lowest final cost.

Busy-bee is being developed to make this process more structured and auditable.

The system combines a conversational agent architecture with backend-controlled business operations. Negotiation interactions can be evaluated against explicit policies, relevant commercial claims can be associated with evidence, and offers can be assessed using structured decision logic.

The intended result is a procurement workflow in which an operator can understand not only which offer is recommended, but also why it is recommended and which evidence supports the decision.

### What makes Busy-bee different?

Busy-bee is designed around five engineering principles:

1. **Evidence before assumptions.** Commercial claims should be traceable to the conversation or another explicitly identified source.
2. **Policy before persuasion.** An agent should not be allowed to bypass defined negotiation constraints simply because a conversational model suggests doing so.
3. **Total cost before headline price.** Offers should be compared using relevant commercial costs and conditions rather than price alone.
4. **Reproducibility before opaque decisions.** Deterministic business logic should govern calculations and policy checks wherever possible.
5. **Human oversight before consequential commitment.** A recommendation should remain distinguishable from an approved or executed purchase decision.

These principles describe the project's design objectives. Their implementation status varies by subsystem and is documented below.

---

## 2. The Problem

### 2.1 Manual negotiations are difficult to scale

A procurement team dealing with multiple suppliers must often repeat the same activities:

- Initiating supplier conversations
- Collecting quotations
- Requesting discounts
- Clarifying delivery and payment terms
- Comparing warranties and support commitments
- Recording concessions
- Checking whether an offer satisfies internal policy
- Preparing a final recommendation

As the number of suppliers and transactions increases, the administrative workload grows.

### 2.2 A lower quoted price does not always mean a better offer

Consider two hypothetical supplier quotations.

| Commercial factor | Supplier A | Supplier B |
|---|---:|---:|
| Quoted price | ₹1,35,000 | ₹1,30,000 |
| Delivery charges | ₹10,000 | Unknown |
| Installation | Included | ₹5,000 |
| Warranty | 2 years | 1 year |
| Final comparable cost | ₹1,45,000 before other adjustments | ₹1,35,000 plus unknown delivery charges |

Supplier B has the lower quoted price, but its final comparable cost cannot be established until delivery charges are confirmed. Warranty duration may also affect the buyer's decision.

This example is illustrative, not a statement about actual project test data.

A procurement system should not silently treat missing charges as zero or claim certainty where the available evidence is incomplete.

### 2.3 Conversational information can be difficult to audit

A supplier may make a claim about a discount, delivery date, warranty, or payment condition during a conversation.

If that claim is not captured with its source, later reviewers may be unable to determine:

- What was actually stated
- Who stated it
- Which negotiation session it came from
- Whether the statement was confirmed or inferred
- Whether it influenced the final recommendation

Busy-bee is designed to make this relationship between conversation, evidence, and recommendation more explicit.

### 2.4 Language models need operational constraints

A conversational AI model can produce plausible responses without guaranteeing that every response complies with a company's procurement rules.

Examples of unacceptable outcomes include promising an unauthorized discount, inventing a delivery commitment, accepting an unverified condition, or recommending an offer based on incomplete information.

Busy-bee separates the conversational agent from backend-controlled operations and deterministic decision logic wherever the implementation supports that separation.

---

## 3. The Busy-bee Approach

Busy-bee approaches procurement negotiation as a combination of conversation, structured data, policy enforcement, and decision support.

At a conceptual level, the system is designed to:

1. Establish a negotiation context.
2. Conduct or replay a supplier interaction.
3. Extract relevant commercial information.
4. Associate claims with their supporting evidence.
5. Evaluate proposed actions against negotiation constraints.
6. Compare available offers using the applicable cost and commercial rules.
7. Generate an explainable recommendation.
8. Persist relevant records for later inspection.
9. Allow an operator to review a recommendation before a consequential decision.

The repository contains components for negotiation-agent configuration, tool handling, session management, evidence tracking, backend communication, recommendation-related API routes, and replay demonstrations.

The precise completeness of each step depends on the implementation status of the corresponding component.

### Intended application areas

- Procurement and supplier negotiations
- Business-to-business purchasing
- Equipment and hardware sourcing
- Commercial quotation comparison
- Negotiation policy compliance
- Supplier evaluation
- Procurement decision support
- Auditable AI-assisted purchasing workflows

These are potential application areas, not claims of existing production deployments.

---

## 4. Project Objectives

Busy-bee has the following engineering objectives.

### Objective 1: Structured negotiation

Represent a negotiation as a sequence of interactions and business decisions rather than an unstructured chat transcript alone.

### Objective 2: Policy-controlled agent actions

Apply deterministic restrictions to consequential negotiation actions instead of relying exclusively on natural-language instructions.

### Objective 3: Evidence-backed commercial claims

Associate extracted information with identifiable evidence so reviewers can distinguish supported claims from assumptions.

### Objective 4: Comparable supplier evaluation

Use structured commercial information to evaluate supplier offers and explain the factors influencing a recommendation.

### Objective 5: Persistent operational records

Use the backend and MongoDB integration to retain applicable negotiation and decision data.

### Objective 6: Voice-first interaction

Develop a real-time voice interface using LiveKit and an OpenAI Realtime model, with browser audio communication and agent runtime integration.

### Objective 7: Safe and reproducible development

Support replay scenarios, automated tests, session limits, controlled configuration, and a development workflow that does not require every test to invoke a billable AI service.

---

## 5. Core Capabilities

### 5.1 Negotiation agent infrastructure

The agent workspace contains configuration, system instructions, tool definitions, tool handlers, a backend client, session management, and an evidence ledger.

These components establish the architecture for connecting conversational behavior to controlled business operations.

The existence of a component does not by itself establish that it is connected to a complete production runtime.

### 5.2 Replay-based negotiation

The project includes a replay workflow that demonstrates negotiation scenarios without requiring a live merchant interaction.

The documented example involves two merchants:

- Apex Supplies
- Bharat Ergonomics

A previously observed replay result selected Bharat Ergonomics at a reported landed cost of ₹1,40,000, compared with ₹1,45,000 for Apex Supplies.

That result is a sample replay output, not a live supplier quotation or a guarantee that every execution will produce the same result.

Replay is useful for inspecting the negotiation pipeline, recommendation behavior, and integration with backend business logic without treating scripted dialogue as live voice activity.

### 5.3 Evidence ledger

The agent workspace contains an evidence ledger component intended to retain evidence associated with negotiation activity.

Its purpose is to support traceability between extracted information and the source from which that information originated.

The exact evidence fields, persistence behavior, and validation guarantees should be confirmed from the current ledger implementation before being treated as a complete audit guarantee.

### 5.4 Negotiation tools

The agent architecture includes tool definitions and handlers for connecting agent actions to backend functionality.

This separation is intended to keep business operations within controlled application logic rather than allowing a conversational model to modify business state arbitrarily.

Only tools that are registered and actually connected to the runtime should be considered operational.

### 5.5 Recommendation workflow

The backend includes recommendation-related endpoints for retrieving a recommendation and submitting an approval action.

This supports a distinction between producing a recommendation and reviewing it.

The exact approval semantics, authorization requirements, and resulting database changes depend on the corresponding backend handlers.

### 5.6 Session and violation inspection

The backend exposes routes for retrieving negotiation sessions and recorded violations.

These endpoints provide a foundation for inspecting negotiation activity and potential policy issues.

### 5.7 MongoDB persistence

The backend has previously been verified to connect to MongoDB Atlas in the development environment.

MongoDB is used for application persistence. The precise models, indexes, relationships, and retention policies should be derived from the current database schemas.

### 5.8 Voice integration architecture

The repository contains LiveKit-related agent infrastructure and configuration for an OpenAI Realtime model.

However, the previously inspected LiveKit worker did not contain a complete runtime startup implementation. The live voice capability must therefore be considered incomplete until a real browser-to-agent audio session is verified.

---

## Feature Implementation

Busy-bee brings together conversational AI, procurement intelligence, deterministic business rules, and evidence-based decision support in a unified negotiation platform.

| Feature | Description |
|---|---|
| AI Negotiation Agent | A structured agent architecture designed to conduct supplier negotiations, interpret commercial terms, and support procurement decisions. |
| Voice-First Interaction | LiveKit-based communication architecture combined with OpenAI Realtime model configuration for natural, real-time voice interactions. |
| Negotiation Policy Engine | Policy-oriented controls designed to keep negotiation actions within defined business constraints. |
| Evidence Ledger | A dedicated evidence-tracking component designed to associate negotiation information with supporting records and improve traceability. |
| Agent Tool System | Structured tool definitions and handlers that connect agent operations to backend business functionality. |
| Session Management | Centralized session management with configurable duration and test-session limits. |
| Supplier Comparison | A negotiation workflow for evaluating competing merchant offers and comparing commercial outcomes. |
| Landed Cost Evaluation | Cost-oriented comparison that considers the overall commercial offer rather than relying exclusively on the quoted price. |
| Recommendation Engine | Recommendation workflows that support the selection of commercially suitable offers and provide a basis for review. |
| Human Review Workflow | Backend endpoints for retrieving recommendations and submitting approval actions. |
| Negotiation History | API support for retrieving sessions associated with a negotiation. |
| Policy Violation Tracking | API support for retrieving recorded negotiation violations. |
| Persistent Backend | Express and TypeScript backend integrated with MongoDB for application data management. |
| Web Application | React and Vite frontend architecture for interacting with the negotiation platform. |
| Replay-Based Testing | Reproducible negotiation scenarios for evaluating workflow behavior without requiring a live supplier interaction for every development iteration. |
| Cost-Conscious Development | Replay-oriented development, configurable execution modes, and session limits to support controlled testing and reduce unnecessary external API usage. |

## How the Platform Works

Busy-bee follows a structured negotiation workflow that connects conversational interaction with business logic and decision support.

1. **Negotiation initialization:** Establish the negotiation context and the commercial requirements that guide the evaluation.
2. **Conversational processing:** Process negotiation dialogue through the configured agent workflow.
3. **Commercial information extraction:** Identify relevant supplier terms, pricing information, and offer conditions.
4. **Evidence tracking:** Associate relevant information with supporting negotiation records.
5. **Policy enforcement:** Apply business constraints to negotiation operations through the agent's tool and backend architecture.
6. **Offer evaluation:** Compare available offers using relevant commercial terms and cost calculations.
7. **Recommendation generation:** Produce a recommendation based on the available negotiation information and evaluation logic.
8. **Review and approval:** Retrieve the recommendation and submit it to the backend approval workflow.
9. **Persistence and inspection:** Use the backend to manage negotiation information and retrieve associated session and violation records.

This design separates conversational interaction from structured business operations, making the procurement workflow easier to inspect, maintain, and extend.

## Demonstration Scenario

The repository includes a replay-based negotiation workflow featuring two sample merchants: Apex Supplies and Bharat Ergonomics.

In a previously observed run, the workflow selected Bharat Ergonomics based on a reported landed cost of ₹1,40,000, compared with ₹1,45,000 for Apex Supplies.

This scenario demonstrates the project's procurement-comparison concept and recommendation workflow using sample negotiation data.

The amounts are illustrative development results, not live market quotations.

## Technology and Engineering

Busy-bee combines a modern web stack with a modular agent architecture.

- **Frontend:** React, TypeScript, and Vite
- **Backend:** Node.js, Express, and TypeScript
- **Database:** MongoDB with the project's Mongoose integration
- **Voice infrastructure:** LiveKit
- **Conversational AI:** OpenAI Realtime model configuration
- **Agent architecture:** Dedicated configuration, instructions, tool definitions, tool handlers, session management, and evidence tracking
- **Validation:** Zod-based environment configuration
- **Development and testing:** npm workspaces and repository-configured test and build scripts

The modular structure allows the frontend, backend, data layer, and agent components to be developed and maintained as distinct parts of one system.

## Project Vision

Busy-bee aims to make procurement negotiations more structured, transparent, and scalable by connecting conversational AI with explicit business constraints and evidence-based commercial evaluation.

The long-term vision is an intelligent procurement assistant that can communicate naturally, evaluate competing supplier offers, preserve the reasoning behind its decisions, and help organizations make more informed purchasing decisions.

**Busy-bee is built around a simple principle: AI should not merely negotiate. It should help organizations make decisions they can explain.**

## 7. System Architecture

Busy-bee uses a frontend, backend, persistence layer, and agent workspace.

The conceptual architecture is shown below. The agent-to-backend connections represent the intended integration and should be checked against the current runtime before being treated as fully operational.

```mermaid
flowchart TD
    USER[User or Procurement Operator]
    FRONTEND[React and Vite Frontend]
    API[Express and TypeScript API]
    DB[(MongoDB Atlas)]
    AGENT[Negotiation Agent Workspace]
    TOOLS[Agent Tool Definitions and Handlers]
    POLICY[Negotiation Policy and Guardrails]
    EVIDENCE[Evidence Ledger]
    RECOMMENDATION[Recommendation Logic]
    LIVEKIT[LiveKit Voice Infrastructure]
    OPENAI[OpenAI Realtime Model]

    USER --> FRONTEND
    FRONTEND --> API
    API <--> DB
    AGENT <--> API
    AGENT --> TOOLS
    TOOLS --> POLICY
    AGENT --> EVIDENCE
    EVIDENCE --> RECOMMENDATION
    RECOMMENDATION --> API
    LIVEKIT <--> OPENAI
    LIVEKIT -. Intended live audio integration .-> AGENT
```

### 7.1 Frontend

The frontend is built with React, TypeScript, and Vite.

Its responsibilities include presenting the user interface and communicating with backend endpoints through the configured API path.

The actual pages, components, and available user workflows are defined by the frontend source.

### 7.2 Backend API

The backend uses Express and TypeScript.

It provides HTTP endpoints for applicable application operations, negotiation data retrieval, session history, violation history, and recommendation workflows.

The backend is the appropriate location for validating requests, enforcing access controls, applying business rules, and coordinating persistence.

### 7.3 Database

MongoDB provides persistent storage through the backend's database integration.

Database schemas and persistence operations determine which application records survive restarts.

### 7.4 Agent workspace

The agent package contains the components used to configure and execute negotiation workflows.

Relevant areas include:

- Configuration
- System instructions
- Tool definitions
- Tool handlers
- Evidence ledger
- Backend client
- Session manager
- LiveKit worker
- Replay workflow

### 7.5 Voice infrastructure

LiveKit is the intended real-time communication layer for browser audio and agent sessions.

The OpenAI Realtime model is configured through environment variables.

A working voice deployment requires more than installing dependencies and specifying credentials: the worker must start correctly, connect to the intended room, process audio, invoke tools where appropriate, and return audio to the client.

---

## 8. Technology Stack

The following technologies are identified in the project architecture. Exact package versions should be taken from the current lockfile and package manifests.

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | User interface |
| Frontend language | TypeScript | Typed application code |
| Frontend build tooling | Vite | Development server and frontend build |
| Backend | Node.js | Server runtime |
| Backend framework | Express | HTTP APIs and middleware |
| Backend language | TypeScript | Typed server and agent code |
| Database | MongoDB | Persistent application data |
| Data-access layer | Mongoose | MongoDB object modelling, where used |
| Voice transport | LiveKit | Intended real-time room and audio infrastructure |
| Conversational model | OpenAI Realtime model | Intended real-time conversational processing |
| Configuration | dotenv | Environment-variable loading |
| Validation | Zod | Environment and configuration validation |
| Agent runtime tooling | TypeScript-based agent package | Negotiation logic and tool handling |
| Testing | Repository-configured test frameworks | Automated verification |
| Version control | Git and GitHub | Source control and collaboration |

Do not infer that all installed packages are actively used by a production runtime.

---

## 9. Repository Structure

The project is organized as a monorepo with application workspaces.

The following is a functional overview, not an exhaustive file listing. Inspect the current repository to confirm exact filenames before adding new entries.

```text
Busy-bee/
├── apps/
│   ├── frontend/
│   │   └── React and Vite application
│   ├── server/
│   │   └── Express backend application
│   └── agent/
│       └── Negotiation agent workspace
│           └── src/
│               ├── config.ts
│               ├── instructions.ts
│               ├── index.ts
│               ├── runtime/
│               │   ├── livekit-worker.ts
│               │   └── session-manager.ts
│               ├── tools/
│               │   ├── definitions.ts
│               │   └── handlers.ts
│               ├── evidence/
│               │   └── ledger.ts
│               └── backend/
│                   └── client.ts
├── packages/
│   └── Shared packages and contracts, if present
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Important agent modules

**`apps/agent/src/config.ts`**

Loads and validates agent configuration, including the selected execution mode, model name, LiveKit settings, backend API URL, session limits, and logging level.

**`apps/agent/src/instructions.ts`**

Contains the system instructions used to define agent behavior.

**`apps/agent/src/runtime/livekit-worker.ts`**

Contains the LiveKit negotiation worker interface and startup/preflight logic. The previously inspected version contained placeholder startup logic rather than a complete live agent implementation.

**`apps/agent/src/runtime/session-manager.ts`**

Contains session-management logic and configured limits.

**`apps/agent/src/tools/definitions.ts`**

Defines the available agent tools.

**`apps/agent/src/tools/handlers.ts`**

Contains the handlers that implement agent tool operations.

**`apps/agent/src/evidence/ledger.ts`**

Contains evidence-ledger functionality.

**`apps/agent/src/backend/client.ts`**

Contains the agent's backend communication client.

**`apps/agent/src/index.ts`**

Acts as the agent execution entry point and selects the configured execution workflow.

The frontend and server directories should be expanded with their actual routes, components, models, and entry points when the repository tree is verified.

---

## 10. How a Negotiation Works

A procurement negotiation can be represented as a sequence of state transitions, evidence updates, and commercial evaluations.

The following describes the intended workflow and the components visible in the current project architecture. Not every step is verified as part of a fully operational live voice session.

### Step 1: Establish the negotiation context

A negotiation must have an identifiable context, such as the procurement requirement, supplier, commercial constraints, or existing offer.

The backend should validate the relevant identifiers and input data before consequential operations.

### Step 2: Start the negotiation workflow

The application selects an appropriate execution mode.

In replay mode, the project runs a scripted demonstration workflow.

A real voice session additionally requires a functioning browser-to-agent connection, valid credentials, room management, and a working agent runtime.

### Step 3: Process dialogue

In a live implementation, dialogue is exchanged through the voice infrastructure and the conversational model.

In replay mode, predefined dialogue or scenario data is used instead.

These execution paths must remain clearly distinguishable.

### Step 4: Extract commercial terms

Relevant commercial information may include:

- Quoted price
- Discount
- Delivery charges
- Installation charges
- Taxes
- Warranty
- Delivery date
- Payment terms
- Return conditions
- Maintenance or support costs

A production implementation should normalize extracted terms into structured records and retain the source of each claim.

### Step 5: Record evidence

Relevant claims should be linked to evidence that identifies their origin.

An unsupported statement should not silently become a confirmed commercial fact.

### Step 6: Apply negotiation constraints

Proposed actions should be checked against the applicable negotiation policy.

The policy should define the boundaries within which the agent may operate and the conditions requiring rejection or human review.

### Step 7: Compare supplier offers

Where sufficient data exists, the system can compare offers using the applicable commercial-cost model.

Unknown costs must remain explicitly unknown unless the business rules establish a valid way to resolve them.

### Step 8: Generate a recommendation

The recommendation should explain the selected option and identify the factors influencing the decision.

Where evidence is incomplete, the recommendation should communicate that limitation rather than manufacture certainty.

### Step 9: Review the recommendation

The backend exposes a recommendation retrieval endpoint and an approval endpoint.

The exact approval transition and associated permissions are determined by the implementation of those routes.

### Step 10: Persist and inspect results

Applicable negotiation data can be stored through the backend's persistence layer.

Session and violation endpoints provide a way to inspect related records where those records have been generated and persisted.

---

## 11. Negotiation Policy and Guardrails

A conversational model should not be treated as the sole authority for commercial decisions.

Busy-bee's architecture includes agent tool handling, session management, and policy-oriented negotiation logic. The goal is to make consequential operations subject to explicit application rules.

### Examples of policy constraints

A procurement policy might specify:

- A maximum permitted purchase price
- A minimum acceptable warranty period
- A maximum authorized discount
- Required delivery conditions
- Approved payment terms
- Restrictions on making commitments
- Conditions that require operator approval

These examples describe possible policy rules; their presence in the active configuration must be verified before being treated as existing features.

### Deterministic enforcement

A deterministic rule produces a result from explicit inputs and conditions.

For example, if a discount exceeds an authorized maximum, the backend can reject the proposed action regardless of how confidently the conversational model recommends it.

This approach is preferable to relying exclusively on a natural-language instruction that asks the model to obey the same restriction.

### Recommended enforcement boundary

The intended separation is:

1. The conversational model interprets dialogue and proposes an action.
2. A tool handler validates the request.
3. The backend checks applicable business constraints.
4. The application records the result.
5. The agent communicates the permitted outcome.

This is an architectural objective. The actual enforcement guarantees depend on which checks are implemented and where they execute.

---

## 12. Evidence Ledger and Traceability

The evidence ledger is intended to connect negotiation claims to their supporting source material.

### Why an evidence ledger matters

Without provenance, a system may retain a commercial conclusion without retaining the information that justified it.

For example, a recommendation might state that a supplier offers a two-year warranty. A reviewer should be able to determine whether that duration came from an explicit supplier statement, a verified document, a structured quotation, or an unsupported inference.

### Evidence categories

A robust procurement evidence model can distinguish:

- Directly stated facts
- Explicitly confirmed commercial terms
- Derived calculations
- Inferred information
- Missing or unknown values
- Contradictory claims

These categories are design recommendations unless they already appear in the implementation.

### Expected evidence attributes

Depending on the current schema, useful attributes may include:

| Attribute | Purpose |
|---|---|
| Evidence identifier | Identifies a record |
| Negotiation identifier | Associates evidence with a negotiation |
| Session identifier | Identifies the originating session |
| Source or speaker | Indicates who provided the information |
| Transcript reference | Locates the supporting dialogue |
| Claim type | Describes the commercial fact |
| Extracted value | Stores the normalized value |
| Timestamp or turn reference | Locates the claim in the interaction |
| Validation status | Indicates whether the claim has been checked |

Do not assume these exact fields exist until the ledger and database models have been inspected.

### Evidence integrity principles

A reliable implementation should:

1. Preserve the relationship between a claim and its source.
2. Avoid representing an inference as an explicit supplier commitment.
3. Retain contradictory evidence rather than silently overwriting it.
4. Keep unknown values distinct from zero.
5. Make it possible to determine which evidence influenced a recommendation.

The existence of an evidence ledger component does not alone establish cryptographic integrity, immutable records, or a complete compliance audit trail.

---

## 13. Landed Cost and Offer Evaluation

The quoted purchase price is not necessarily the final cost of a procurement decision.

### 13.1 Conceptual cost model

A simplified landed-cost model may be expressed as:

\[
\begin{aligned}
\text{Landed Cost} ={}&
\text{Base Price}\\
&+ \text{Delivery Charges}\\
&+ \text{Installation Charges}\\
&+ \text{Applicable Taxes}\\
&+ \text{Other Applicable Costs}\\
&- \text{Valid Discounts}
\end{aligned}
\]

The actual formula must follow the project's implemented calculation logic, particularly where discounts, tax inclusion, or other commercial terms affect the calculation order.

Do not double-count taxes or charges already included in the quoted amount.

### 13.2 Unknown values

Suppose one supplier quotes ₹1,30,000 but does not specify delivery charges.

It is not valid to conclude that the final cost is ₹1,30,000 unless the applicable conditions establish that delivery is included or free.

A robust evaluation process should distinguish:

- A confirmed cost of zero
- A cost that has not been provided
- A cost that is not applicable
- A cost that is estimated rather than confirmed

If the implemented engine does not yet distinguish these states, this should be treated as a limitation.

### 13.3 Commercial comparability

Price is only one dimension of a supplier decision.

Relevant comparison factors may include:

- Warranty duration
- Delivery commitment
- Installation
- Payment terms
- After-sales support
- Return conditions
- Supplier reliability
- Compliance with procurement requirements

These factors should be compared using explicit rules rather than blended into an unexplained score.

### 13.4 Sample replay result

A previously observed replay result reported:

| Supplier | Reported landed cost |
|---|---:|
| Apex Supplies | ₹1,45,000 |
| Bharat Ergonomics | ₹1,40,000 |

The replay selected Bharat Ergonomics based on the lower reported landed cost.

This is an example from the development workflow. It does not establish the accuracy of a general-purpose procurement engine or represent verified real-world vendor pricing.

---

## 14. Recommendation and Human Review

Busy-bee includes backend routes for retrieving a negotiation recommendation and submitting an approval action.

The intended decision process separates the analytical result from the final business decision.

### Recommendation generation

A recommendation should identify:

- The preferred offer
- The reason for the selection
- The relevant commercial comparison
- Supporting evidence
- Missing information
- Policy violations or unresolved constraints
- Conditions requiring additional review

The exact fields returned by the current recommendation endpoint should be documented from its response schema.

### Human review

A recommendation is not equivalent to a purchase order or completed transaction.

A human reviewer may need to confirm:

- The commercial information is correct
- The selected offer meets the procurement requirements
- All required approvals have been obtained
- No important costs or contractual conditions are missing

### Approval endpoint

The documented route is:

`POST /api/negotiations/:id/recommendation/approve`

The actual request body, authorization requirements, approval state transition, and side effects must be taken from the route implementation.

Do not assume that calling this endpoint creates a purchase order or contacts a supplier unless the backend explicitly implements those actions.

---

## 15. Voice Agent Architecture

Busy-bee is designed to support voice-first negotiation through LiveKit and an OpenAI Realtime model.

### 15.1 Intended live voice flow

A functioning implementation should support the following sequence:

1. The browser requests a negotiation session.
2. The backend validates the request and applicable session limits.
3. The backend creates or authorizes the required LiveKit session.
4. The browser obtains an appropriately scoped, short-lived room token.
5. The browser connects to the correct LiveKit room.
6. The browser publishes microphone audio.
7. The agent joins the room and receives audio.
8. The Realtime model processes the interaction.
9. The agent invokes permitted tools where necessary.
10. The agent's audio output is delivered to the browser.
11. Relevant session activity and evidence are recorded.

This is the target integration flow. Each stage must be implemented and tested before the full sequence can be described as operational.

### 15.2 Current runtime limitation

The previously inspected file `apps/agent/src/runtime/livekit-worker.ts` validated whether the OpenAI and LiveKit credentials were present and logged startup information.

However, the actual agent initialization and startup were left as placeholder logic.

Therefore:

- Credential validation is not equivalent to a working voice agent.
- Installing the LiveKit SDK is not equivalent to joining a room.
- Setting `AGENT_MODE=voice` is not sufficient if the worker is still a placeholder.
- A replay demonstration is not a real merchant conversation.
- Live microphone input and generated audio output must be tested independently and together.

### 15.3 Realtime model configuration

The observed default model setting is:

`gpt-4o-mini-realtime-preview`

Model availability, API compatibility, account access, and pricing can change. Verify the supported model and the integration method against the current official documentation before attempting live sessions.

### 15.4 Voice verification checklist

A real voice integration should not be marked complete until the following checks pass:

- [ ] Backend session creation succeeds.
- [ ] Room credentials are generated securely.
- [ ] Browser connects to the correct room.
- [ ] Microphone permission is requested.
- [ ] Browser audio reaches the agent.
- [ ] Agent audio reaches the browser.
- [ ] A complete two-way spoken exchange succeeds.
- [ ] Tool calls invoke actual backend handlers.
- [ ] Policy checks run on consequential operations.
- [ ] Evidence references correspond to actual interaction data.
- [ ] Session duration and usage limits are enforced.
- [ ] Errors and disconnections are handled safely.

---

## 16. Prerequisites

Before running the project, ensure that the following requirements are satisfied.

### Required development tools

- Node.js version compatible with the current package manifests
- npm compatible with the workspace configuration
- Git
- A terminal such as Windows PowerShell
- Access to the repository

### Backend and persistence

- A reachable MongoDB deployment if database persistence is required
- A correctly configured MongoDB connection string
- Appropriate database-user permissions
- Network access to the database host

MongoDB Atlas network-access restrictions and database credentials are separate configuration concerns.

### Voice functionality

Real-time voice functionality additionally requires valid credentials and a completed runtime integration for:

- LiveKit
- OpenAI Realtime API

The project can be developed and replay-tested without assuming that live voice is operational.

---

## 17. Installation

### Step 1: Clone the repository

```powershell
git clone https://github.com/Shishir-0/Busy-bee.git
cd Busy-bee
```

### Step 2: Install dependencies

```powershell
npm install
```

The repository's workspace configuration and package lockfile should determine the correct installation procedure.

Do not install arbitrary alternative versions of workspace dependencies without checking compatibility.

### Step 3: Create local environment configuration

If the repository contains `.env.example`:

```powershell
Copy-Item .env.example .env
```

If `.env` already exists, preserve it rather than overwriting working local configuration.

### Step 4: Configure environment variables

Open `.env` in a local editor and populate the required values.

Never commit `.env` or share its secret values in screenshots, terminal logs, or issue reports.

### Step 5: Start the backend

From the repository root, use the verified workspace script:

```powershell
npm run dev:server
```

### Step 6: Start the frontend

Open a second terminal in the repository root:

```powershell
npm run dev:frontend
```

### Step 7: Start the agent workflow

Open another terminal:

```powershell
npm run agent:start
```

Inspect the startup logs to determine which mode is active.

With replay configuration, this command runs the replay workflow rather than establishing a live voice conversation.

The exact scripts and default ports should be checked against the current root `package.json` and Vite configuration.

---

## 18. Environment Configuration

The repository uses environment variables to separate local configuration from source code.

The following variables have appeared in the project configuration. Defaults and required status must be confirmed against the current `.env.example` and configuration loader.

| Variable | Purpose |
|---|---|
| `PORT` | Backend listening port |
| `NODE_ENV` | Runtime environment |
| `CORS_ORIGIN` | Permitted frontend origins |
| `AGENT_BACKEND_TOKEN` | Internal agent-to-backend authentication token |
| `MONGODB_URI` | MongoDB connection string |
| `LIVEKIT_URL` | LiveKit server URL |
| `LIVEKIT_API_KEY` | LiveKit API key |
| `LIVEKIT_API_SECRET` | LiveKit API secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_REALTIME_MODEL` | Configured Realtime model |
| `BACKEND_API_BASE_URL` | Backend API base URL used by the agent |
| `AGENT_SESSION_MAX_SECONDS` | Configured maximum session duration |
| `AGENT_MAX_TEST_SESSIONS` | Configured test-session limit |
| `AGENT_MODE` | Agent execution mode |
| `ZERO_SPEND_ENFORCED` | Zero-spend enforcement configuration flag |
| `LOG_LEVEL` | Application logging level |

### Example local configuration

Use placeholder values, not real credentials.

```dotenv
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

AGENT_BACKEND_TOKEN=replace_with_a_random_secret

MONGODB_URI=mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@YOUR_CLUSTER_HOST/negotiator?retryWrites=true&w=majority

LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=replace_with_your_livekit_api_key
LIVEKIT_API_SECRET=replace_with_your_livekit_api_secret

OPENAI_API_KEY=replace_with_your_openai_api_key
OPENAI_REALTIME_MODEL=gpt-4o-mini-realtime-preview

BACKEND_API_BASE_URL=http://localhost:4000/api

AGENT_SESSION_MAX_SECONDS=90
AGENT_MAX_TEST_SESSIONS=5

AGENT_MODE=replay
ZERO_SPEND_ENFORCED=true
LOG_LEVEL=info
```

This is an illustrative configuration based on the observed project settings. Use the actual `.env.example` as the final authority.

### MongoDB connection string

Replace the placeholders with the correct database username, URL-encoded password, cluster hostname, and database name.

Special characters in a password may need URL encoding.

Do not use unrestricted database network access simply to work around a connection problem. Prefer the narrowest suitable network-access rule.

### Agent execution mode

The configuration loader has been observed to support these values:

- `replay`
- `text`
- `voice`
- `test`

The default mode is `replay` in the inspected configuration.

Mode availability does not guarantee that every mode is fully operational. In particular, the observed LiveKit worker still requires its actual runtime implementation.

### Secret management

- Keep `.env` out of version control.
- Use `.env.example` only for non-sensitive placeholders.
- Rotate any credential that has been exposed.
- Use separate credentials for local development and deployment.
- Never print full API keys or database passwords into logs.
- Apply least-privilege permissions to service accounts.

---

## 19. Running Busy-bee

The root package scripts observed in the project include the following commands. Verify that each remains present before relying on it.

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the configured development workflow |
| `npm run dev:frontend` | Starts the frontend development server |
| `npm run dev:server` | Starts the backend development server |
| `npm run start` | Runs the configured start script |
| `npm run build` | Runs the configured build workflow |
| `npm run test` | Runs the configured test suite |
| `npm run test:frontend` | Runs frontend tests |
| `npm run test:server` | Runs backend tests |
| `npm run test:agent` | Runs agent tests |
| `npm run agent:start` | Starts the configured agent entry point |
| `npm run agent:replay` | Runs the replay workflow |
| `npm run agent:text` | Runs the configured text workflow |

The actual behavior of each command is determined by the current package scripts.

### Recommended first-run sequence

1. Install dependencies.
2. Configure `.env`.
3. Start the backend.
4. Confirm that the backend can reach MongoDB if persistence is required.
5. Start the frontend.
6. Start the replay agent workflow.
7. Inspect the generated negotiation output.
8. Run the relevant tests.
9. Attempt live voice only after the worker and browser integration have been implemented and verified.

### Development URLs

The previously configured development setup used:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

Verify the current Vite configuration and backend port before using these addresses.

---

## 20. Application Modes

Busy-bee's agent configuration supports multiple execution modes.

### Replay mode

Replay mode runs a predefined negotiation scenario.

It is useful for:

- Demonstrating the negotiation workflow
- Testing backend integration
- Inspecting sample recommendations
- Reproducing expected application behavior
- Developing without making live model calls

Replay mode must not be represented as a live voice conversation.

### Text mode

Text mode is a configured execution option.

Its exact capabilities, model connectivity, tool access, and cost implications must be determined from the current entry point and runtime implementation before it is used as a verified operational feature.

### Voice mode

Voice mode is intended to support the LiveKit and OpenAI Realtime integration.

In the previously inspected implementation, the worker did not yet establish a real agent connection. Live voice should therefore be treated as incomplete until a real two-way browser audio session is verified.

### Test mode

Test mode is a configured execution option for agent testing.

The tests should be used to determine which components are covered and whether test mode invokes mocks, local logic, or external services.

---

## 21. Backend API Reference

The following endpoints were present in the reported backend integration.

The methods and paths below identify the known routes. Request schemas, response bodies, error codes, and authorization behavior must be documented from the current route handlers and middleware rather than inferred.

### 21.1 Negotiation session history

**Endpoint**

`GET /api/negotiations/:id/sessions`

**Purpose**

Retrieves session records associated with a negotiation.

**Path parameter**

- `id`: Negotiation identifier expected by the route.

**Expected use**

A frontend or operator tool can use this endpoint to inspect available negotiation sessions.

The exact response structure, pagination behavior, and authorization requirements depend on the route implementation.

### 21.2 Negotiation violations

**Endpoint**

`GET /api/negotiations/:id/violations`

**Purpose**

Retrieves violation records associated with a negotiation.

**Expected use**

Provides a way to inspect recorded negotiation-policy violations, where those records have been generated and persisted.

The route's actual response shape and violation schema should be taken from the backend implementation.

### 21.3 Retrieve a recommendation

**Endpoint**

`GET /api/negotiations/:id/recommendation`

**Purpose**

Retrieves the recommendation associated with a negotiation.

**Expected use**

A client can request the current recommendation and display the returned decision data.

The route's exact handling of missing recommendations, errors, and recommendation states must be verified from its handler.

### 21.4 Approve a recommendation

**Endpoint**

`POST /api/negotiations/:id/recommendation/approve`

**Purpose**

Submits an approval action for a negotiation recommendation.

**Expected use**

Allows the client to invoke the approval workflow exposed by the backend.

The exact request body, authorization requirements, state transition, and side effects must be taken from the route implementation.

Do not assume that this action automatically creates a purchase order or contacts a merchant.

### 21.5 Other endpoints

The repository may contain additional health, negotiation-management, session-creation, authentication, or LiveKit-related routes.

These should be added to the API reference only after inspecting the actual Express route registrations and middleware.

### API documentation standards

For every additional endpoint, document:

- HTTP method
- Exact route
- Purpose
- Path and query parameters
- Request body
- Representative response
- Error behavior
- Authentication requirements
- Whether the endpoint reads, creates, updates, or deletes persistent data

Do not publish internal service tokens or real database identifiers.

---

## 22. Database and Persistence

MongoDB is used as the persistence layer for the application.

The backend's Mongoose schemas and database operations determine the actual records stored.

### Persistence responsibilities

Depending on the current implementation, the database may retain records associated with:

- Negotiations
- Sessions
- Evidence
- Violations
- Recommendations
- Approval actions

The presence of an API endpoint does not by itself prove that every associated record is persisted.

### Persistence verification

A reliable verification procedure should:

1. Start the backend with a valid MongoDB connection.
2. Execute a supported operation that creates or updates a record.
3. Inspect the corresponding API response.
4. Confirm the expected database change.
5. Restart the relevant process.
6. Confirm that persisted data remains available.
7. Verify that invalid operations do not silently create incorrect records.

Document actual model names, fields, indexes, and relationships after inspecting the database schema files.

### Data integrity

Commercial records should preserve the distinction between confirmed values, derived values, and missing information.

Any calculations used for recommendations should be reproducible from the inputs and applicable rules whenever possible.

---

## 23. Testing and Build

Busy-bee has separate test commands for the frontend, backend, and agent workspace.

### Run the complete configured test suite

```powershell
npm run test
```

### Run backend tests

```powershell
npm run test:server
```

### Run frontend tests

```powershell
npm run test:frontend
```

### Run agent tests

```powershell
npm run test:agent
```

### Run the configured build

```powershell
npm run build
```

Confirm the exact scripts in `package.json` before executing them.

### What should be tested?

A comprehensive verification strategy should cover the following areas.

**Backend**

- Request validation
- Authentication and authorization
- Negotiation operations
- Session history
- Violation retrieval
- Recommendation retrieval
- Recommendation approval
- MongoDB persistence
- Error handling

**Agent**

- Configuration validation
- Session-duration limits
- Test-session limits
- Tool input validation
- Tool-handler behavior
- Policy restrictions
- Evidence recording
- Recommendation inputs and outputs
- Replay scenarios
- Runtime startup failures

**Frontend**

- Application startup
- API connectivity
- Loading and error states
- Session presentation
- Recommendation display
- Approval workflows
- Voice connection and disconnection behavior, where implemented

**Integration**

- Backend-to-database connectivity
- Agent-to-backend communication
- Correct persistence of generated records
- Consistency between evidence and recommendations
- Real browser-to-agent audio, once implemented

### Reporting test results

Never describe a test suite as passing unless it was actually executed successfully against the relevant code.

A successful TypeScript build does not prove that MongoDB persistence, tool execution, or real-time voice functionality works end to end.

---

## 24. Security and Privacy

Busy-bee handles configuration, commercial data, and potentially sensitive negotiation information. Security must be considered across the frontend, backend, agent, and persistence layers.

### Environment variables

Credentials must be loaded from environment configuration rather than hardcoded into application source.

The root `.env` file must remain excluded from version control.

### Internal service authentication

The project has an `AGENT_BACKEND_TOKEN` configuration variable intended for internal backend communication.

The actual security guarantee depends on whether the relevant middleware validates this token on every protected route, rejects invalid credentials, and limits access appropriately.

Do not treat the existence of a token variable as proof that the entire API is authenticated.

### CORS

CORS configuration should permit only the frontend origins required for the current deployment.

CORS is a browser access-control mechanism, not a replacement for authentication or authorization.

### LiveKit credentials

LiveKit API secrets must remain on trusted server-side components.

Browser clients should receive appropriately scoped, short-lived session tokens rather than permanent service credentials.

Room access should be restricted to the necessary room and permissions.

### Database security

- Use a dedicated database user.
- Apply least-privilege permissions.
- Restrict network access to appropriate hosts or trusted networks.
- Protect connection strings.
- Avoid logging database credentials.
- Use a managed secret mechanism for deployed environments.

### Negotiation integrity

Consequential business actions should be validated by backend rules rather than relying on the model's conversational output alone.

### Sensitive logs

Logs should help diagnose problems without exposing credentials, private conversations, or unnecessary commercial information.

### Human oversight

Recommendations should remain distinct from actual purchasing commitments. Approval requirements should be enforced in the backend wherever the business process requires them.

---

## 25. Zero-Spend Development Strategy

Busy-bee is being developed with a strict objective of avoiding additional spend during the hackathon.

The project includes a `ZERO_SPEND_ENFORCED` configuration flag and a replay-based workflow.

### Replay-first development

Replay mode is useful for developing and testing deterministic application logic without invoking a live conversational model for every iteration.

A replay workflow can help validate:

- Scenario handling
- Backend connectivity
- Evidence and recommendation logic
- UI integration
- Regression tests

### Important cost limitation

A configuration flag named `ZERO_SPEND_ENFORCED` does not automatically prove that all billable API calls are prevented.

The actual cost protections depend on the code paths that enforce the flag.

Real-time OpenAI sessions may incur usage charges, and LiveKit or other services may have account-specific usage limits or billing conditions.

Before enabling live sessions:

1. Verify the actual enforcement logic.
2. Confirm which API calls are made.
3. Check applicable account pricing and usage limits.
4. Keep sessions short during development.
5. Use replay and local tests for routine iterations.
6. Avoid unnecessary repeated live-session testing.

The project should not promise zero cost unless all relevant billable paths and external service conditions have been verified.

---

## 26. Troubleshooting

### Backend does not start

Check the working directory and available scripts.

```powershell
Get-Location
npm run
```

Run the command from the repository root and inspect the first error reported by the runtime.

### Frontend cannot reach the backend

Check:

- The backend is running.
- The configured backend port is correct.
- The frontend API base URL or Vite proxy is correct.
- CORS settings permit the development frontend origin.
- The requested route exists.

Do not change several configuration values at once without identifying the actual failure.

### MongoDB connection fails

Check:

- The URI is correctly formatted.
- The database username and password are valid.
- Special characters in the password are URL-encoded.
- The cluster hostname is correct.
- The database service is reachable.
- Atlas network-access rules permit the connection.
- The database user has the required permissions.

Do not solve a connection problem by exposing the database to all IP addresses unnecessarily.

### Agent falls back to replay

Inspect the configured `AGENT_MODE` and the agent startup logs.

If required voice credentials are missing, the configured voice workflow may fall back to replay or another configured fallback.

Even with valid credentials, a placeholder LiveKit worker will not become a complete voice agent automatically.

### Live voice does not connect

Verify the implementation of:

- LiveKit room creation and authorization
- Browser token generation
- Browser room connection
- Microphone permissions
- Agent dispatch or startup
- Audio input processing
- Audio output publication
- Tool integration
- Session lifecycle management

Credentials alone are insufficient to establish that these components are operational.

### Environment variables appear to be ignored

Check that:

- The command is being run from the expected working directory.
- The application loads the intended environment file.
- Variable names match the configuration schema.
- No shell or deployment setting overrides the local value.
- Configuration defaults are understood.

Never share the full `.env` file when asking for help.

### Tests fail

Run the relevant test suite independently to narrow down the failure.

Inspect the test output, dependency versions, environment requirements, and recent changes before modifying implementation code.

### Build succeeds but the application fails at runtime

A successful build verifies only the checks performed by that build process.

It does not prove that external services are reachable, credentials are valid, routes are authorized, database writes succeed, or the voice agent works end to end.

---

## 27. Development Workflow

Contributors should work in small, verifiable changes.

### 1. Update the repository

```powershell
git pull origin main
```

Inspect local modifications before pulling if the working tree contains uncommitted changes.

### 2. Install dependencies

```powershell
npm install
```

### 3. Create a feature branch

```powershell
git checkout -b feat/your-feature-name
```

### 4. Implement the change

Keep changes focused on a specific capability or defect.

Avoid unrelated dependency upgrades during time-sensitive development.

### 5. Run relevant tests

```powershell
npm run test
```

Run additional targeted test commands where appropriate.

### 6. Validate the build

```powershell
npm run build
```

### 7. Inspect the change

```powershell
git diff --check
git status --short
git diff
```

Verify that no secrets, generated artifacts, or unrelated changes are included.

### 8. Commit the work

```powershell
git add <intended-files>
git commit -m "feat: describe the change"
```

Replace the placeholder with the exact files intended for the commit.

### 9. Push the branch

```powershell
git push -u origin feat/your-feature-name
```

Use a pull request when collaborating or when the project's workflow requires review.

---

## 28. Known Limitations

The following limitations are based on the previously inspected implementation and should be rechecked against the current repository.

### Live voice runtime is incomplete

The inspected LiveKit worker validates credentials and logs initialization details, but its actual agent startup logic was a placeholder.

A complete two-way browser voice session has not been established by the available evidence.

### Replay is not live negotiation

Replay mode demonstrates a scripted workflow. It does not prove that the agent can negotiate with a real merchant or conduct a live spoken conversation.

### End-to-end voice behavior remains unverified

Browser microphone capture, room connectivity, agent audio processing, synthesized speech delivery, and live tool execution require end-to-end testing.

### Audit guarantees depend on implementation

An evidence ledger component does not automatically establish complete transcript provenance, immutable records, or tamper-proof audit history.

### Cost enforcement must be verified

The existence of a zero-spend configuration flag does not guarantee that every possible external API call is blocked.

### API security requires route-level verification

An internal service token is useful only when the relevant routes validate it correctly and enforce the intended access boundaries.

### Production readiness has not been established

Production readiness requires additional verification of deployment configuration, security, monitoring, error handling, persistence, concurrency, and external-service integration.

Update this section as limitations are resolved. Do not remove a limitation until the corresponding behavior has been verified.

---

## 29. Roadmap

The following items represent potential development priorities, not claims of completed functionality.

### Phase 1: Core reliability

- Validate negotiation and recommendation logic.
- Confirm deterministic cost calculations.
- Add regression tests for missing or contradictory commercial terms.
- Verify persistence of sessions, evidence, violations, and recommendations.
- Validate API request schemas and authorization behavior.

### Phase 2: Complete real-time voice

- Implement the actual LiveKit agent runtime.
- Integrate browser session creation and secure room authorization.
- Verify microphone input and audio output.
- Connect live model tool calls to the existing backend handlers.
- Add session interruption, disconnection, and timeout handling.
- Test the complete interaction using real browser audio.

### Phase 3: Evidence and audit quality

- Strengthen transcript-to-evidence references.
- Distinguish explicit statements from inferred values.
- Handle conflicting supplier claims.
- Preserve unknown commercial terms.
- Improve recommendation explanations and reproducibility.

### Phase 4: Procurement intelligence

- Extend supplier comparison capabilities.
- Support configurable procurement policies.
- Improve the treatment of warranty and service terms.
- Add better handling of incomplete commercial information.
- Evaluate recommendation quality against repeatable test scenarios.

### Phase 5: Operational hardening

- Improve structured logging and diagnostics.
- Add appropriate monitoring.
- Review authentication and authorization.
- Verify rate limits and resource controls.
- Improve deployment documentation.
- Test concurrent sessions and failure recovery.
- Establish data retention and privacy policies.

### Phase 6: User experience

- Improve negotiation-session visibility.
- Make recommendation evidence easier to inspect.
- Improve approval and exception-handling workflows.
- Add accessible loading, error, and connection states.
- Make desktop and mobile workflows consistent.

Prioritize features according to observed implementation gaps and actual user requirements.

---

## 30. Contributing

Contributions should improve correctness, reliability, usability, or maintainability.

Before submitting a change:

1. Inspect the relevant implementation.
2. Keep changes focused.
3. Add or update tests for changed behavior.
4. Update documentation when behavior or configuration changes.
5. Check for accidental credential exposure.
6. Run the applicable tests and build.
7. Describe what was changed and what was verified.

For changes involving the agent, explicitly distinguish mocked or replayed behavior from real external-service integration.

For changes involving procurement decisions, preserve the separation between model-generated suggestions and backend-enforced business rules.

For changes involving voice sessions, verify actual audio transport rather than relying exclusively on successful initialization logs.

---

## 31. License

The repository's actual license file is authoritative.

If the repository does not contain a license, the project should not be presented as having an unrestricted open-source license. Add an appropriate license only after the project owner has chosen one.

---

## 32. Project Summary

Busy-bee is a negotiation and procurement decision-support project built around the intersection of conversational AI, deterministic business logic, evidence traceability, and structured commercial evaluation.

Its architectural direction is to make AI-assisted negotiation more accountable by connecting conversation to verifiable evidence and connecting recommendations to explicit business rules.

The current development workflow includes a replay-based negotiation demonstration, a TypeScript and Express backend, MongoDB integration, and agent components for tools, session management, and evidence tracking.

The next critical engineering milestone is completing and verifying the real-time voice runtime so that browser audio, the LiveKit agent, model interaction, backend tools, evidence recording, and recommendation workflows operate as one end-to-end system.

**The goal is not simply to build an AI that can negotiate. It is to build a negotiation system whose decisions can be inspected, explained, and validated.**

---

*Documentation should evolve with the implementation. Always verify feature status, environment variables, API contracts, and execution commands against the current source code before publishing a release.*
