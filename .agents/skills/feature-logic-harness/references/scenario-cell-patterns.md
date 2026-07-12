# Scenario Cell Patterns

## Do not build Cartesian products

Bad:
actor x role x state x input x dependency x platform x config

Good:
select combinations where dimensions interact semantically.

## Useful combination patterns

### Actor + permission + operation
Use when access rules matter.

### Entity state + action + expected transition
Use when lifecycle matters.

### Data freshness + operation + side effect
Use when stale data could affect outcome.

### External dependency + operation + fallback
Use when integrations affect user-visible behavior.

### UI state + backend state
Use when user sees async/pending/optimistic state.