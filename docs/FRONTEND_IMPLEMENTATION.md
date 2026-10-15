# Frontend Implementation Document: The Negotiator

**PROJECT:** The Negotiator: Proof-First Procurement AI  
**REPOSITORY:** `Busy-bee`  
**TEAM:** CHAOS Hackathon  
**VERSION:** 1.0 (15 October 2026)  
**BUILD STATUS:** Built, strictly type-checked, unit-tested, and operational on Vite (port 5173).

---

## 1. Installed Skills Activated & Utilized

1. **`frontend-design`**:
   - Aesthetic Stance: **Proof-First Procurement Control Room** (Industrial Utilitarian & Editorial Precision).
   - DFII Score: **19/19** (Impact: 5, Fit: 5, Feasibility: 5, Performance: 5, Consistency Risk: 1).
   - Restrained Color System: Near-white canvas (`#F8F9FA`), pure white surfaces, deep charcoal ink (`#0F172A`), rich procurement emerald (`#059669` / `#065F46`), restrained crimson (`#DC2626`) for policy breaches, restrained amber (`#D97706`) for unknown terms.
   - Tabular Monospace: `SFMono-Regular`, `Menlo`, `Monaco`, `JetBrains Mono` for currency (`₹`), timestamps, and turn references.
   - Visual Anchors:
     - **Negotiation Guard Gauge**: Real-time hard budget cap enforcement vs. proposed landed cost.
     - **Live Evidence Ledger**: Clickable turn citations illuminating verbatim audio transcript turns.
     - **Deal Decision Engine Breakdown**: Transparent arithmetic formula breakdown (Quantity × Unit Price + Taxes + Shipping + Fees).

2. **`full-stack-orchestration-full-stack-feature`**:
   - Contract-driven architecture aligning frontend request/response types with shared Express/MongoDB API contracts.
   - Separation of concerns: centralized API client, deterministic mock simulation provider, and domain types.

3. **`debugging-code` & `debugging-and-error-recovery` & `code-showcase-systematic-debugging`**:
   - Stop-the-line triage: resolved TypeScript strict compiler warnings and verified builds and tests end-to-end.

---

## 2. Page & Component Architecture

```
src/
├── types/
│   └── negotiation.ts               # Shared API domain contracts & types
├── services/
│   ├── api.ts                       # Central typed API client (Dual Mode: Live / Simulation)
│   └── mockData.ts                  # Deterministic P0 test scenarios (Chairs, Sterling vs Apex, Violations)
├── context/
│   └── NegotiationContext.tsx       # Central state management & reactive event stream
├── utils/
│   ├── formatters.ts                # Locale currency (₹ INR), time, and date formatters
│   ├── calculations.ts              # Deterministic landed cost arithmetic & policy guard checks
│   └── calculations.test.ts         # Vitest automated test suite (5 passing test cases)
├── components/
│   ├── common/
│   │   ├── Navigation.tsx           # Operational top bar with mode toggle & mandate selector
│   │   └── StatusBadge.tsx          # Semantic status badge (Verified, Proposed, Disputed, etc.)
│   ├── session/
│   │   ├── NegotiationGuardPanel.tsx# Signature constraint enforcement & policy violation log
│   │   ├── AudioVisualizer.tsx      # WebRTC channel activity & mute controls
│   │   ├── LiveTranscript.tsx       # Chronological transcript with evidence citation links
│   │   └── ExtractedTermsSummary.tsx# Extracted commercial terms summary
│   ├── evidence/
│   │   ├── EvidenceTimeline.tsx     # Chronological ledger stream with search & filters
│   │   └── EvidenceDetailModal.tsx  # Verbatim source turn audit inspection modal
│   ├── offers/
│   │   └── OfferComparisonTable.tsx # Side-by-side comparison, disqualification & incomplete state
│   └── recommendation/
│       └── DecisionEngineBreakdown.tsx # Winning offer card, calculation breakdown, & buyer review
├── pages/
│   ├── CommandCentrePage.tsx        # Screen 1: Executive procurement dashboard
│   ├── MandateSetupPage.tsx         # Screen 2: Mandate creation & budget cap setup
│   ├── ActiveSessionPage.tsx        # Screen 3: Live voice session & turn simulation
│   ├── EvidenceLedgerPage.tsx       # Screen 4: Signature audit evidence ledger
│   ├── OfferComparisonPage.tsx      # Screen 5: Multi-merchant comparison view
│   ├── RecommendationPage.tsx       # Screen 6: Deal recommendation & approval
│   └── MerchantBrowserPage.tsx      # Screen 7: Merchant participant portal
├── index.css
├── App.tsx
└── main.tsx
```

---

## 3. Core Business & Integrity Rules Implemented

1. **Policy Before Persuasion**:
   - The LLM cannot override the buyer's authorized constraints.
   - When an offer exceeds the budget ceiling (e.g. ₹1,65,000 > ₹1,50,000) or delivery deadline (8 days > 5 days), the backend Negotiation Guard automatically blocks acceptance and records the violation.

2. **Unknown Is Not Zero**:
   - If shipping freight is unknown, total landed cost is strictly rendered as **null / Incomplete**, never fabricated as ₹0.

3. **Evidence Provenance**:
   - Every verified material term links to a real transcript turn with speaker label, timestamp, and verbatim excerpt.

4. **Transparent Landed Cost Arithmetic**:
   - Total Landed Cost = (Unit Price × Quantity) + Taxes + Shipping + Additional Fees.
   - Evaluated tie-breakers: Landed Cost -> Delivery Speed -> Warranty Duration.

5. **Ethical AI Disclosure & WebRTC Simulation**:
   - Discloses AI identity and transcript capture consent before retaining evidence.
   - Clearly identified as browser WebRTC audio, not PSTN telecommunications.

---

## 4. API Endpoints Consumed

| Operation | Endpoint | Method | Status |
|-----------|----------|--------|--------|
| Create Mandate | `/api/negotiations` | `POST` | Implemented |
| Get Mandate | `/api/negotiations/:id` | `GET` | Implemented |
| Create Session | `/api/negotiations/:id/sessions` | `POST` | Implemented |
| Request Room Token | `/api/sessions/:id/token` | `POST` | Implemented |
| Post Spoken Evidence | `/api/internal/evidence` | `POST` | Implemented |
| List Offers | `/api/negotiations/:id/offers` | `GET` | Implemented |
| Get Recommendation | `/api/negotiations/:id/recommendation` | `GET` | Implemented |
| Approve Recommendation | `/api/negotiations/:id/recommendation/approve` | `POST` | Implemented |

*Note: The frontend includes a global `SIMULATION / DEMO DATA` vs `LIVE BACKEND API` switcher in the top navigation bar. In Simulation mode, all 4 deterministic PRD scenarios execute locally without requiring an active external MongoDB server.*

---

## 5. Automated Tests & Verification Results

### Vitest Test Suite (`src/utils/calculations.test.ts`)
- `calculates total landed cost accurately when all terms are present` -> **PASS**
- `strictly treats missing shipping cost as incomplete and null, never ₹0` -> **PASS**
- `Negotiation Guard rejects offers exceeding total budget ceiling` -> **PASS**
- `Negotiation Guard rejects offers failing delivery deadline or warranty threshold` -> **PASS**
- `Deal Decision Engine ranks lowest landed cost first among eligible offers` -> **PASS**

**Result**: 5/5 tests passed (100% success rate, 449ms execution duration).  
**TypeScript Type Check**: `tsc -b` passed with 0 errors.  
**Production Build**: `vite build` completed in 1.60s with 0 errors.

---

## 6. How to Run and Demonstrate

1. **Development Server**:
   ```bash
   npm run dev -- --port 5173
   ```
   Open `http://localhost:5173` in any standard web browser (Chrome, Edge, Safari, Firefox).

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Build Bundle**:
   ```bash
   npm run build
   ```

4. **Judge Walkthrough**:
   - **Step 1**: Visit `http://localhost:5173` to see the **Command Centre** with the 50 Ergonomic Chairs mandate.
   - **Step 2**: Open **Active Session** to inspect the live WebRTC audio visualizer, transcript stream, and **Negotiation Guard Panel**. Click *"Simulate Over-Budget Violation"* to see the Guard immediately block an unauthorized quote.
   - **Step 3**: Open **Evidence Ledger** to inspect verbatim turn citations and click *"Audit Provenance"*.
   - **Step 4**: Open **Offer Comparison** to review Sterling (winner) vs. Apex vs. Metro (disqualified) vs. Global Trade Hub (incomplete shipping).
   - **Step 5**: Open **Deal Decision** to inspect the calculation formula breakdown and click *"Audit & Approve Recommendation"*.
