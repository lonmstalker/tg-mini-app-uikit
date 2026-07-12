# Anti-Patterns

## Implementation-review drift

Symptom:

- the output starts judging code rather than modeling expected behavior

Correction:

- restate the intended behavior
- move uncertainty into assumptions, open questions, missing contracts, or scenario cells needing verification

## YAML wall

Symptom:

- the output is technically structured but unreadable for product and engineering discussion

Correction:

- use Markdown headings and stable IDs
- include strict YAML only as an appendix when requested

## Generic SaaS harness

Symptom:

- the harness could apply to any app

Correction:

- extract product terminology, workflows, and entity names from context
- replace generic actors and states with product-specific ones

## Cartesian scenario explosion

Symptom:

- the output combines every actor, state, input, and dependency

Correction:

- select 2-4 dimensions only when they interact semantically
- keep a scenario-cell budget

## Hidden uncertainty

Symptom:

- missing decisions are smoothed over as if known

Correction:

- add open questions and assumptions with IDs
- mark status as partial, unknown, or needs_human_decision
