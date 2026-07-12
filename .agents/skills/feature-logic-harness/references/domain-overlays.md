# Domain Overlays

## How to use overlays

Use overlays after the base dimension pass. Do not use every overlay. Select only relevant overlays.

## Auth / Organization Overlay

Use when the feature touches login, roles, teams, orgs, workspace boundaries, invites, admin mode, access control.

Dimensions:
- actor authentication state
- role
- org membership
- resource ownership
- invitation state
- session freshness
- admin/impersonation mode

## Payment / Commerce Overlay

Use when the feature touches pricing, checkout, subscription, invoice, credits, refund, tax, provider state.

Dimensions:
- payment lifecycle
- invoice state
- subscription state
- currency
- provider callback state
- entitlement state
- cancellation/refund state