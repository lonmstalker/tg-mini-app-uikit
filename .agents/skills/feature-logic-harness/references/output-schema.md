# feature_logic_harness machine-readable schema

Use this only when strict structured output is requested or when another skill needs a parseable appendix.

## Required top-level field

- feature_logic_harness

## Required fields

- version
- mode
- product_context
- feature
- context_map
- actors
- permissions
- domain_entities
- state_model
- operations
- data_model
- contracts
- side_effects
- invariants
- dimensions
- domain_overlays_used
- scenario_cells
- assumptions
- open_questions
- coverage_notes

## Mode values

- draft
- final

## Product context statuses

- loaded
- supplied
- partial
- missing

## ID conventions

- dimensions: D001, D002, D003
- scenario cells: SC001, SC002, SC003
- contracts: C001, C002
- invariants: I001, I002
- assumptions: A001, A002
- open questions: Q001, Q002

## Allowed dimension statuses

- filled
- partial
- not_applicable
- unknown
- needs_human_decision

## Allowed scenario cell statuses

- modeled
- partial
- unknown
- needs_human_decision
- not_applicable

## YAML appendix skeleton

```yaml
feature_logic_harness:
  version: 2
  mode: draft
  product_context:
    status:
    source:
    product_name:
    product_purpose:
    primary_users:
    core_workflows:
    domain_terms:
    open_product_questions:
  feature:
    name:
    purpose:
    trigger:
    in_scope:
    out_of_scope:
    ambiguous:
  context_map:
    user_surfaces:
    backend_surfaces:
    data_entities:
    external_dependencies:
    async_flows:
    config_flags:
    tests_or_examples:
    observability:
  actors:
  permissions:
  domain_entities:
  state_model:
    states:
    transitions:
    terminal_states:
    reversible_states:
    ambiguous_states:
  operations:
  data_model:
    reads:
    writes:
    input_shapes:
    output_shapes:
  contracts:
    api_contracts:
    event_contracts:
    data_contracts:
    ui_contracts:
    permission_contracts:
    integration_contracts:
  side_effects:
  invariants:
  dimensions:
    - id:
      name:
      status:
      description:
      values:
      boundary_values:
      why_it_matters:
      related_entities:
      related_contracts:
      related_invariants:
      unknowns:
  domain_overlays_used:
  scenario_cells:
    - id:
      dimensions:
      scenario:
      expected_behavior:
      related_contracts:
      related_invariants:
      why_this_cell_matters:
      status:
  assumptions:
  open_questions:
  coverage_notes:
    modeled:
    partial:
    unknown:
    not_applicable:
```
