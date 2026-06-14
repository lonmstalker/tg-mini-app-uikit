# Design Deliverable Templates

Use these templates when the user asks for a structured design artifact. Keep sections that matter for the request and remove empty sections.

## Design Critique

```markdown
## Design Critique

### Context And Assumptions
...

### What Works
...

### UX Risks
...

### Priority Issues
1. ...
2. ...
3. ...

### Recommended Direction
...

### Handoff Notes For `impeccable`
...
```

## UX Flow Recommendation

```markdown
## UX Flow Recommendation

### User Goal
...

### Entry Points
...

### Recommended Flow
1. ...
2. ...
3. ...

### Decision Points
...

### Empty / Error / Loading States
...

### Success Criteria
...

### Handoff Notes For `impeccable`
...
```

## Page / Screen Specification

```markdown
## Page Specification

### Screen Purpose
...

### Primary Users
...

### Content Hierarchy
1. ...
2. ...
3. ...

### Layout Direction
...

### Required States
- Default:
- Empty:
- Loading:
- Error:
- Disabled:
- Permission-limited:
- Mobile/responsive:

### Interaction Rules
...

### Accessibility Expectations
...

### Handoff Notes For `impeccable`
...
```

## Component Behavior Spec

```markdown
## Component Behavior Specification

### Component Purpose
...

### User Need
...

### Variants
...

### States
- Default:
- Hover/focus:
- Active/selected:
- Disabled:
- Loading:
- Error:
- Empty:

### Behavior Rules
...

### Content Rules
...

### Accessibility Expectations
...

### Handoff Notes For `impeccable`
...
```

## Onboarding Recommendation

```markdown
## Onboarding Recommendation

### First-Run Goal
...

### Recommended Structure
1. ...
2. ...
3. ...

### Progressive Disclosure
...

### Personalization
...

### Activation Moment
...

### Drop-Off Risks
...

### Handoff Notes For `impeccable`
...
```

## Dashboard Recommendation

```markdown
## Dashboard Recommendation

### Dashboard Job
...

### Primary Hierarchy
1. ...
2. ...
3. ...

### Information Density
...

### Filters And Search
...

### Alerts / Notifications
...

### Empty And Loading States
...

### Mobile / Responsive Behavior
...

### Handoff Notes For `impeccable`
...
```

## Empty-State Recommendation

```markdown
## Empty-State Recommendation

### Empty State Type
First use / no results / permission-limited / filtered out / error-adjacent

### User Context
...

### Message Strategy
...

### Primary Action
...

### Secondary Action
...

### Visual Direction
...

### Handoff Notes For `impeccable`
...
```

## Design System Recommendation

```markdown
## Design System Recommendation

### Current Need
...

### Recommended Pattern
...

### Token / Component Guidance
...

### Usage Rules
...

### Accessibility Expectations
...

### Anti-Patterns
...

### Handoff Notes For `impeccable`
...
```

## Accessibility Review

```markdown
## Accessibility Review

### Scope
...

### Design-Level Findings
1. ...
2. ...
3. ...

### Keyboard And Focus Expectations
...

### Color / Contrast Risks
...

### Content And Labeling Risks
...

### Responsive Risks
...

### Handoff Notes For `impeccable`
...
```

## Handoff Notes For `impeccable`

```markdown
## Handoff Notes For `impeccable`

### Design Intent
...

### UX/UI Requirements
- ...
- ...
- ...

### Required States
- ...
- ...
- ...

### Interaction Rules
- ...
- ...
- ...

### Responsive Expectations
...

### Accessibility Expectations
...

### Telegram Mini App Constraints
<!-- Omit outside tg-mini-app-uikit. See references/telegram-mini-apps.md. -->
- Safe area: which controls must clear the home indicator / Telegram header.
- Native chrome: MainButton/BackButton usage; Back closes the top layer first, never the app.
- Keyboard: which CTA/field must stay above the on-screen keyboard.
- Gestures: swipe-down-to-minimize contained; edge-swipe-back zone reserved.
- Theming: holds in light, dark, and live Telegram theme via `--tk-*` tokens.

### Implementation Owner
<!-- Reusable kit surface → uikit-element-development; one-off craft → impeccable. -->
...

### Acceptance Criteria From Design Perspective
- ...
- ...
- ...

### Open Questions
...
```

