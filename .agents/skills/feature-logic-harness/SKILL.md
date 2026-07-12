---
name: feature-logic-harness
description: Build a feature behavior harness for a feature, PR, product idea, design, workflow, or implementation plan. Use when agent needs to clarify intended behavior, scope, actors, permissions, states, transitions, data contracts, invariants, dimensions, scenario cells, assumptions, and open questions before planning, implementation, testing, documentation, or review. Prefer product-specific terminology.
---

# Feature Logic Harness

## Purpose

Build a compact, structured model of how a feature is supposed to work inside the product.

The output is a reusable artifact named `feature_logic_harness`.

This skill builds the intended behavior map of a feature.

It should answer:

- what behavior is expected?
- under which states and permissions?
- through which contracts?
- with which side effects?
- where is the product decision missing?
- which scenarios are worth preserving, implementing, testing, or documenting?

Use the harness to make the feature's behavior space explicit:

- product purpose
- feature purpose
- scope
- actors
- permissions
- entities
- states
- transitions
- operations
- data reads/writes
- contracts
- side effects
- invariants
- dimensions
- values
- scenario cells
- assumptions
- open questions

The harness may be consumed later by planning, implementation, testing, documentation, review, or problem-search skills.

## Non-goals

Do not:

- search for bugs
- produce defect lists
- audit code
- rank vulnerabilities
- propose fixes
- rewrite implementation
- generate tests unless explicitly asked
- claim that behavior is correct or incorrect

The assistant is acting as a behavior modeler.

When evidence suggests inconsistency, incompleteness, or unsupported behavior, encode it neutrally as one of:

- open question
- assumption
- ambiguous behavior
- missing contract
- scenario cell needing verification
- coverage gap

## Required product context

Before building a final harness, locate and read product context.

Search in this order:

1. `./PRODUCT.md`
2. `./product.md`
3. `./docs/PRODUCT.md`
4. `./docs/product.md`
5. `./context/PRODUCT.md`
6. `./context/product.md`

If product context exists:

- read it first
- extract product purpose, users, workflows, domain rules, constraints, and terminology
- include `product_context_source` in the harness
- align feature interpretation with the product context
- mark contradictions as open questions, not conclusions

If product context is missing:

- Stop and inform the user that the skill cannot be used without PRODUCT.md.

Also load project harness profile if present:
1. ./HARNESS.md
2. ./docs/HARNESS.md
3. ./context/HARNESS.md
4. ./.harness/feature-logic.md

Use project profile for:
- product-specific actors and roles
- domain entity names
- allowed lifecycle states
- known invariants
- contract conventions
- dimensions to force or suppress
- domain overlays to prefer

## Input priority

Use context in this order:

1. Explicit user request
2. PRODUCT.md/product.md
3. AGENTS.md and repo instructions
4. Feature/PR/design/spec documents
5. Code diff and implementation files
6. Tests and examples
7. README/docs
8. Existing UI/routes/API/schema conventions
9. Reasonable inference, marked as assumption

Do not invent certainty. Mark missing or weak context explicitly.

## Core workflow

### 1. Product context pass

Extract from product context:

- product name
- product purpose
- primary users
- core jobs-to-be-done
- main workflows
- core domain entities
- permissions/trust boundaries
- business rules
- non-goals
- terminology
- constraints
- open product questions

If this pass fails, stop and inform the user that the skill cannot be used without it.

### 2. Feature framing

Identify:

- feature name
- feature purpose
- user/business outcome
- trigger for this work
- in-scope behavior
- out-of-scope behavior
- ambiguous behavior
- target surfaces
- relationship to existing product workflows

Preserve the user's intended boundary. Do not expand the feature unnecessarily.

### 3. Context map

Map visible implementation and product surfaces:

- user-facing screens/components
- API endpoints
- backend services
- commands/actions
- data entities
- external systems
- async jobs/events/webhooks
- configuration and feature flags
- telemetry/logging surfaces
- tests/examples/docs

If code is not available, mark implementation surfaces as unknown.

### 4. Behavioral model

Model the feature using:

- actors
- roles
- permissions
- entry points
- operations
- entity states
- state transitions
- terminal states
- reversible states
- ambiguous states
- side effects
- data reads
- data writes
- external calls
- contracts
- invariants

Prefer product language from PRODUCT.md.

### 5. Dimension model

A dimension is any axis where changing the value can change expected behavior.

For each important dimension, provide:

- stable ID
- name
- description
- status
- values
- boundary values
- why it matters
- related entities
- related contracts
- related invariants
- unknowns

Allowed dimension statuses:

- `filled`: values are known or reasonably inferable
- `partial`: some values are known, but coverage is incomplete
- `not_applicable`: dimension does not apply; include reason
- `unknown`: likely relevant, but context is missing
- `needs_human_decision`: depends on product/business/architecture decision

Start with the Core Dimension Kernel. Emit only dimensions whose values can change expected behavior, permissions,
contracts, side effects, invariants, or user-visible state.

Default dimension budget:

- 5-8 dimensions for small features
- 8-12 dimensions for normal features
- 12-18 only for cross-domain, payment, auth, async, migration, or compliance-heavy features

Core Dimension Kernel:

1. actor / role / permission / trust boundary
2. user intent / entry point / operation
3. domain entity / ownership / lifecycle state
4. state transition / terminal and reversible states
5. input / output / validation contract
6. reads / writes / side effects / transaction boundary
7. time / ordering / retry / concurrency / idempotency
8. external dependency / async event / failure mode
9. configuration / rollout / environment
10. UI-visible state / observability / audit / privacy boundary

Do not emit not_applicable dimensions one by one. Put clearly irrelevant families into Coverage Notes.

Do not silently skip a family. Mark it as `filled`, `partial`, `not_applicable`, `unknown`, or `needs_human_decision`.

For the full dimension bank, read `references/dimension-bank.md`.

### 6. Dimension value generation

For each important dimension, generate values using these patterns when relevant:

- normal
- boundary
- empty
- missing
- invalid
- stale
- duplicate
- repeated
- out-of-order
- slow
- failed
- unauthorized
- concurrent
- legacy
- migrated
- partially configured
- disabled
- unknown

Do not create arbitrary exhaustive lists. Include values that could materially change expected behavior.

### 7. Domain overlays

After the base dimension pass, detect relevant domain overlays.

Use overlays only when relevant:

- product/UI
- auth/organization
- collaboration/multi-user
- data lifecycle
- async/job/event
- integration/API/platform
- commerce/payment
- admin/ops
- compliance/audit
- AI/tool/agent

For detailed overlays, read `references/domain-overlays.md`.

### 8. Scenario cells

Do not build a full Cartesian product.

A scenario cell is a meaningful combination of 2-4 dimensions that defines behavior worth designing, preserving,
implementing, testing, documenting, or reviewing.

Default scenario cell budget:

- 5-8 cells for a small feature
- 8-15 cells for a normal feature
- 15-25 cells only when the feature spans multiple domains or trust boundaries

Prefer combinations like:

- actor + permission + operation
- entity state + action + expected transition
- data freshness + operation + side effect
- UI state + backend state
- external dependency + operation + fallback behavior
- async event + current entity state
- migration state + reader/writer
- configuration + user segment + behavior
- product invariant + operation + state transition

Each scenario cell should include:

- stable ID
- dimensions involved
- scenario
- expected behavior
- related contracts
- related invariants
- why this scenario matters
- status

Allowed scenario cell statuses:

- `modeled`
- `partial`
- `unknown`
- `needs_human_decision`
- `not_applicable`

For more patterns, read `references/scenario-cell-patterns.md`.

### 9. Contracts and invariants

Contracts describe interfaces and expected boundaries:

- API contracts
- event contracts
- data contracts
- UI contracts
- permission contracts
- integration contracts

Invariants describe truths that should remain true:

- product invariants
- business invariants
- data invariants
- workflow invariants
- permission invariants
- lifecycle invariants

State contracts and invariants neutrally. Do not turn them into findings.

### 10. Assumptions and open questions

Separate assumptions from open questions.

Use assumptions when:

- behavior is reasonably inferable
- product context supports it
- evidence is weak but directionally clear

Use open questions when:

- behavior depends on product/business decision
- permission boundary is unclear
- state transition is ambiguous
- product terminology is inconsistent
- external contract is unknown
- compatibility expectation is unclear
- privacy/data retention expectation is missing

Open questions are first-class output. Do not resolve them by guessing.

## Output format

Default to human-readable Markdown.

Use this section order:

1. `# Feature Logic Harness: <feature name>`
2. `## Summary`
3. `## Product Context`
4. `## Scope`
5. `## Context Map`
6. `## Actors and Permissions`
7. `## Domain Entities`
8. `## State Model`
9. `## Operations and Data Model`
10. `## Contracts`
11. `## Invariants`
12. `## Dimensions`
13. `## Domain Overlays Used`
14. `## Scenario Cells`
15. `## Assumptions`
16. `## Open Questions`
17. `## Coverage Notes`
18. `## Machine-Readable Appendix` when explicitly requested or useful for downstream tooling

Use stable IDs throughout:

- dimensions: `D001`, `D002`, `D003`
- scenario cells: `SC001`, `SC002`, `SC003`
- contracts: `C001`, `C002`
- invariants: `I001`, `I002`
- assumptions: `A001`, `A002`
- open questions: `Q001`, `Q002`

Read `references/output-markdown-template.md` for the default human-readable template.
Read `references/output-schema.md` when strict YAML is requested.

## Golden harnesses

Use golden harnesses as calibration examples, not as templates to copy blindly.

Available goldens:

- `references/goldens/payment-checkout-subscription.md`

A golden harness should define:

- minimal input context
- expected output shape
- critical dimensions
- canonical state model
- contracts and invariants
- high-signal scenario cells
- quality checks
- common overgeneration traps

## Quality bar

A good harness:

* is grounded in PRODUCT.md/product.md
* makes the feature easier to reason about
* uses product-specific terminology
* separates known behavior from assumptions
* exposes missing product/technical decisions
* gives stable IDs for dimensions and scenario cells
* avoids premature bug/problem claims
* is compact enough for a human to review
* is structured enough for another skill to consume

A weak harness:

* describes generic SaaS behavior not tied to the product
* skips product context
* silently guesses permissions or business rules
* over-generates scenario combinations
* produces long prose instead of structured output
* mixes assumptions with confirmed behavior
* drifts into bug search

## Reference loading guide

Read references only when needed:

- Read `references/dimension-bank.md` when building or checking dimensions.
- Read `references/domain-overlays.md` when the feature belongs to a recognizable domain.
- Read `references/scenario-cell-patterns.md` when selecting scenario cells.
- Read `references/output-markdown-template.md` when producing default output.
- Read `references/output-schema.md` when producing strict machine-readable output.
- Read `references/goldens/payment-checkout-subscription.md` for payment, checkout, subscription, invoice, refund,
  credit, entitlement, or provider-webhook features.
- Read `references/quality-rubric.md` before finalizing a large harness.

## Hard rules

* Always check for PRODUCT.md/product.md before building a harness.
* Always stop without product context.
* Do not search for bugs.
* Do not produce a defect list.
* Do not propose fixes unless explicitly asked.
* Do not silently skip mandatory dimension families.
* Do not claim complete coverage.
* Do not build a full Cartesian product.
* Do not bury uncertainty.
* Mark missing context as unknown.
* Prefer structured harness output over long prose.
* Keep the harness product-specific, not generic.