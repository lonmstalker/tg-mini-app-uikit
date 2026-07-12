# Feature Logic Harness Quality Rubric

Use this before finalizing a substantial harness.

## 1. Product grounding

High quality:

- uses product-specific terminology
- names the source of product context
- preserves product constraints and non-goals
- marks contradictions as questions

Low quality:

- uses generic SaaS language
- assumes business rules not present in context
- ignores product context files

## 2. Scope discipline

High quality:

- clearly separates in-scope, out-of-scope, and ambiguous behavior
- does not expand the feature into adjacent redesign work
- links ambiguity to open questions

Low quality:

- models the entire product instead of the feature
- resolves ambiguous decisions by guessing

## 3. Behavioral completeness

High quality:

- covers actors, permissions, states, transitions, operations, side effects, contracts, and invariants
- distinguishes entity state from UI state and external-provider state
- captures failure, retry, concurrency, and lifecycle behavior where relevant

Low quality:

- only describes the happy path
- mixes states from unrelated entities
- omits side effects and external dependencies

## 4. Dimension quality

High quality:

- dimensions materially affect expected behavior
- values are concrete and bounded
- statuses make uncertainty visible
- dimensions link to contracts, invariants, and scenario cells

Low quality:

- includes decorative dimensions
- creates exhaustive but meaningless combinations
- silently skips relevant families

## 5. Scenario-cell quality

High quality:

- each cell combines 2-4 interacting dimensions
- expected behavior is concrete or explicitly unknown
- cells are decision-bearing and testable
- no Cartesian product explosion

Low quality:

- cells are generic examples
- cells repeat the same behavior
- expected behavior is vague

## 6. Human readability

High quality:

- Markdown-first structure
- stable IDs
- compact bullets
- machine-readable appendix only when useful

Low quality:

- large YAML wall
- long prose without IDs
- hard to scan or discuss

## 7. Neutrality and usefulness

High quality:

- keeps observations neutral
- turns uncertainty into assumptions, open questions, missing contracts, or verification cells
- helps PM, engineering, QA, design, and support reason from the same artifact

Low quality:

- becomes an implementation review by default
- makes unsupported correctness claims

## 8. Token discipline

High quality:
- emits only behavior-changing dimensions
- uses budgets for dimensions and scenario cells
- puts irrelevant families into compact coverage notes
- loads domain references only when triggered

Low quality:
- emits a dimension just because it exists in the bank
- lists not_applicable dimensions one by one
- reads or copies every reference by default