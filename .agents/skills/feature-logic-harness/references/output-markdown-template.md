# Output Markdown Template

Use this as the default human-readable format.

```markdown
# Feature Logic Harness: <feature name>

## Summary

- Mode: draft | final
- Product context: loaded | supplied | partial | missing
- Feature purpose: <one sentence>
- Primary risk of misunderstanding: <one sentence>

## Product Context

- Source: <file/user/repo docs/unknown>
- Product purpose: <summary>
- Primary users: <list>
- Core workflows touched: <list>
- Domain terms used: <list>
- Open product questions: <Q IDs or none>

## Scope

### In scope

- <behavior>

### Out of scope

- <behavior>

### Ambiguous

- <behavior and linked question>

## Context Map

- User surfaces: <screens/components>
- Backend surfaces: <services/endpoints>
- Data entities: <entities>
- External dependencies: <providers/APIs>
- Async flows: <jobs/events/webhooks>
- Config flags: <flags>
- Tests/examples/docs: <evidence>
- Observability: <logs/metrics/traces>

## Actors and Permissions

- <actor>: <permissions and boundaries>

## Domain Entities

- <entity>: <ownership, lifecycle, relevant fields>

## State Model

### States

- <state>: <meaning>

### Transitions

- <from> → <to>: <trigger and expected result>

### Ambiguous states

- <state or gap>: <why unclear>

## Operations and Data Model

### Operations

- <operation>: <actor, preconditions, expected outcome>

### Reads

- <data read>

### Writes

- <data write>

### Input and output shapes

- <shape contract>

## Contracts

- C001: <contract>

## Invariants

- I001: <invariant>

## Dimensions

- D001 — <name>
  - Status: filled | partial | unknown | needs_human_decision | not_applicable
  - Values: <values>
  - Boundary values: <values>
  - Why it matters: <reason>
  - Related contracts: <C IDs>
  - Related invariants: <I IDs>
  - Unknowns: <Q IDs or none>

## Domain Overlays Used

- <overlay>: <reason>

## Scenario Cells

- SC001 — <short scenario name>
  - Dimensions: <D IDs>
  - Scenario: <concrete combination>
  - Expected behavior: <normative behavior or unknown>
  - Related contracts: <C IDs>
  - Related invariants: <I IDs>
  - Why this matters: <reason>
  - Status: modeled | partial | unknown | needs_human_decision | not_applicable

## Assumptions

- A001: <assumption and evidence>

## Open Questions

- Q001: <question, owner if inferable, blocking/non-blocking>

## Coverage Notes

- Modeled: <areas>
- Partial: <areas>
- Unknown: <areas>
- Not applicable: <areas>
```
