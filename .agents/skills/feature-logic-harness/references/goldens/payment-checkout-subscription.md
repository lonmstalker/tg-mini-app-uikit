# Golden Harness: Payment Checkout and Subscription

Use this golden when the feature touches checkout, subscription, invoice, renewal, refund, dispute, tax, credits, entitlement, payment-provider events, or billing-provider reconciliation.

This is a calibration reference. Do not copy it blindly. Adapt terms, roles, entities, and business rules to the product context.

The goal of this golden is to teach the harness to model payment behavior with enough precision to avoid the common failure modes:
- granting access from a client success screen instead of authoritative billing state
- mixing provider state, internal billing state, invoice state, and entitlement state
- skipping duplicate, delayed, out-of-order, failed, or replayed webhooks
- ignoring provider/internal identity mapping
- ignoring concurrency between checkout, plan changes, and webhook processing
- under-modeling refunds, disputes, credits, proration, and grace periods

## Minimal input context

Product:

- A B2B SaaS product with organizations and workspaces.
- Users belong to organizations.
- Some organization roles can manage billing.
- Paid access is represented internally as an entitlement.
- A payment provider handles checkout, payment methods, invoices, subscriptions, charges, refunds, disputes, and webhooks.
- Internal product access must not depend only on the provider UI or client redirect result.

Feature:

- Add paid plan checkout for an organization.
- After authoritative payment or subscription confirmation, the organization receives paid entitlement.
- The provider sends asynchronous events for checkout completion, invoice payment, payment failure, subscription updates, payment method changes, refunds, and disputes.
- The product must keep billing records and entitlement state reconcilable.

## Expected harness qualities

The harness should:

- separate checkout session, payment, subscription, invoice, entitlement, ledger, and provider event state
- validate provider customer/subscription/invoice identifiers against the intended internal billing owner
- define when entitlement is granted, retained, placed in grace period, partially granted, or revoked
- model durable webhook processing state, not only provider event type
- include event authentication, idempotency, retry, replay, ordering, and reconciliation behavior
- include buyer permissions and cross-tenant boundaries
- include checkout terms: plan, quantity, price, currency, tax, discount, credit, renewal cadence, and target organization
- include concurrent checkout or plan-change attempts for the same billing owner
- include payment action-required, abandoned, expired, failed, and recovery flows
- include upgrade, downgrade, quantity change, proration, credits, and plan-change timing
- include cancellation, voluntary refund, partial refund, chargeback/dispute, and failed renewal paths
- include reconciliation behavior when provider state and internal state disagree
- avoid full actor × payment state × provider event × invoice state Cartesian products

The harness should not:

- treat client success redirect as authoritative unless product policy explicitly says so
- collapse provider subscription state and internal entitlement state into one state machine
- assume every valid provider event should mutate entitlement immediately
- grant or revoke access without mapping the provider object to the correct internal billing owner
- create exhaustive scenario grids with low-signal combinations

## Canonical entities

- Organization
- Workspace
- Buyer/User
- Billing Actor
- Billing Owner
- Billing Customer Mapping
- Checkout Session
- Payment Method
- Payment Intent or Charge
- Subscription
- Subscription Item
- Plan
- Price
- Plan or Price Snapshot
- Quantity or Seat Count
- Invoice
- Invoice Line Item
- Tax Treatment
- Discount or Promotion
- Credit Balance or Adjustment
- Refund
- Dispute or Chargeback
- Entitlement
- Internal Ledger or Billing Record
- Provider Event
- Webhook Processing Record
- Reconciliation Record
- Audit Log Entry
- Support-visible Billing State

## Canonical states

### Checkout session

- not_created
- created
- requires_payment_method
- requires_action
- completed
- expired
- canceled
- abandoned
- superseded
- failed

### Payment

- not_started
- initiated
- requires_payment_method
- requires_action
- authorized
- captured
- failed
- refunded
- partially_refunded
- disputed
- reversed

### Subscription

- not_created
- trialing
- active
- past_due
- unpaid
- scheduled_cancel
- canceled
- expired
- migrated
- incomplete
- incomplete_expired

### Invoice

- draft
- open
- paid
- partially_paid
- void
- uncollectible
- refunded
- partially_refunded
- disputed

### Entitlement

- not_granted
- pending
- active
- grace_period
- partially_granted
- scheduled_downgrade
- suspended
- revoked
- admin_granted

### Webhook processing

- received
- signature_invalid
- verified
- duplicate
- processing
- processed
- processing_failed
- pending_dependency
- pending_reconciliation
- ignored_by_policy
- replayed

### Reconciliation

- consistent
- provider_missing_internal_record
- internal_missing_provider_record
- provider_internal_state_mismatch
- unknown_provider_object
- mapped_to_wrong_billing_owner
- pending_manual_review
- resolved

## Canonical contracts

- C001: Only an authorized billing actor can start checkout, update payment method, change plan, cancel subscription, or request billing-sensitive operations for an organization.
- C002: Checkout is created for exactly one intended billing owner, usually an organization, and cannot mutate billing or entitlement for another owner.
- C003: Accepted checkout terms include plan, quantity, price, currency, tax treatment, discount, credit treatment, renewal cadence, effective date, and target organization.
- C004: Displayed checkout terms and charged terms must match the accepted terms, or the user must explicitly accept new terms.
- C005: Provider events are authenticated before processing.
- C006: Provider events are idempotent under duplicate delivery, replay, and retry.
- C007: Each provider event has a durable processing record with verification state, processing state, failure reason, and mutation result where applicable.
- C008: Provider customer, subscription, invoice, payment, checkout, and charge identifiers map to the intended internal billing owner before any billing or entitlement mutation.
- C009: Entitlement changes are derived from authoritative billing policy, not from the client success screen alone.
- C010: Concurrent checkout, payment-method update, cancellation, or plan-change attempts for the same billing owner are serialized, superseded, or reconciled by explicit policy.
- C011: Subscription, invoice, credit, refund, dispute, and entitlement state remain reconcilable after every processed billing event.
- C012: Renewal failure applies the product-defined grace rule before access is revoked or suspended.
- C013: Refund, partial refund, chargeback, cancellation, and invoice state reconcile with entitlement state by explicit policy.
- C014: Provider/internal state disagreement enters reconciliation and does not silently grant, revoke, duplicate, or corrupt entitlement.
- C015: Billing records remain auditable after cancellation, refund, dispute, migration, or organization deletion.
- C016: Support/operator actions that affect billing or entitlement are permissioned, audited, and distinguishable from provider-driven events.
- C017: Tax exemption, currency, promotion, legacy price, and credit handling are represented explicitly when they affect accepted or charged terms.
- C018: A failed or expired checkout cannot create paid entitlement unless a separate authoritative payment/subscription path later succeeds.

## Canonical invariants

- I001: A paid entitlement requires accepted payment, active trial, credit, explicit admin grant, or another documented product policy.
- I002: Duplicate provider events must not create duplicate entitlements, invoices, credits, ledger entries, notifications, or audit records.
- I003: A buyer cannot grant paid access to an organization they are not allowed to manage.
- I004: A provider object for one billing owner cannot grant, revoke, or modify entitlement for another billing owner.
- I005: Displayed checkout terms and charged terms must be reconcilable to the accepted terms snapshot.
- I006: Client redirect success is not sufficient proof of payment unless the product explicitly defines it as provisional access.
- I007: Renewal failure does not revoke access before the product-defined grace rule.
- I008: Refund, dispute, cancellation, invoice, ledger, and entitlement state must not remain contradictory after reconciliation.
- I009: One provider event ID can cause at most one successful billing mutation.
- I010: Entitlement is a policy-governed projection of billing state, not a direct copy of any single provider event.
- I011: Plan quantity, seat limits, credits, invoices, and entitlement remain reconcilable after upgrades, downgrades, refunds, disputes, and migrations.
- I012: Unknown, invalid, unmapped, or cross-tenant provider events do not mutate billing or entitlement state.
- I013: Manual support overrides are auditable and do not hide provider/internal disagreement.
- I014: Canceled or deleted organizations cannot receive new paid entitlement through stale provider events unless migration/recovery policy explicitly permits it.

## Critical dimensions

- D001 — Billing actor permission
  - Status: filled
  - Values: org owner, billing admin, workspace admin without billing rights, finance viewer, support operator, unauthorized member, external system
  - Boundary values: support operator with read-only access, workspace admin without org billing rights, removed user using stale session
  - Why it matters: checkout and billing operations create financial, access, and audit side effects
  - Related contracts: C001, C016
  - Related invariants: I003, I013
  - Unknowns: none

- D002 — Billing owner / target organization
  - Status: filled
  - Values: current organization, different organization, deleted organization, migrated organization, organization without billing profile, organization with existing provider customer
  - Boundary values: user belongs to multiple organizations, stale selected organization, provider customer mapped to different organization
  - Why it matters: prevents cross-tenant entitlement and billing mutation
  - Related contracts: C002, C008
  - Related invariants: I004, I012, I014
  - Unknowns: none

- D003 — Purchase or billing intent
  - Status: filled
  - Values: new subscription, trial conversion, upgrade, downgrade, add-on purchase, seat increase, seat decrease, renewal recovery, payment method update, cancellation
  - Boundary values: downgrade scheduled at period end, seat decrease below current usage, recovery after failed renewal
  - Why it matters: pricing, proration, invoice behavior, entitlement timing, and user messaging differ
  - Related contracts: C003, C010, C011
  - Related invariants: I005, I011
  - Unknowns: none

- D004 — Checkout/payment lifecycle
  - Status: filled
  - Values: created, requires payment method, requires action, completed, expired, canceled, abandoned, failed, superseded
  - Boundary values: user returns to success page before authoritative event, action required then abandoned, expired session later receives delayed event
  - Why it matters: user-visible state and entitlement behavior differ
  - Related contracts: C009, C018
  - Related invariants: I001, I006
  - Unknowns: none

- D005 — Provider event condition
  - Status: filled
  - Values: first valid event, duplicate event, delayed event, out-of-order event, replayed event, invalid signature, unknown event type, event with unknown object, event with object mapped to another owner
  - Boundary values: invoice paid before subscription updated, duplicate checkout completed, valid event for deleted organization
  - Why it matters: payment providers deliver asynchronous events with retry and ordering uncertainty
  - Related contracts: C005, C006, C007, C008, C014
  - Related invariants: I002, I004, I009, I012
  - Unknowns: none

- D006 — Webhook processing state
  - Status: filled
  - Values: received, signature invalid, verified, duplicate, processing, processed, processing failed, pending dependency, pending reconciliation, ignored by policy, replayed
  - Boundary values: processing fails after partial write, replayed event after manual reconciliation, dependency record missing
  - Why it matters: event type alone is insufficient for idempotency, retry, recovery, and audit
  - Related contracts: C005, C006, C007, C014, C015
  - Related invariants: I002, I009, I012
  - Unknowns: none

- D007 — Provider/internal identity mapping
  - Status: filled
  - Values: known customer, unknown customer, customer mapped to another organization, known subscription, unknown subscription, migrated customer, deleted organization mapping
  - Boundary values: provider event references a customer that exists but is linked to a different org; subscription exists without internal billing record
  - Why it matters: prevents cross-tenant entitlement, duplicate subscriptions, and unowned billing mutations
  - Related contracts: C002, C008, C014
  - Related invariants: I004, I012, I014
  - Unknowns: none

- D008 — Internal entitlement state
  - Status: filled
  - Values: not granted, pending, active, grace period, partially granted, scheduled downgrade, suspended, revoked, admin granted
  - Boundary values: pending provider confirmation, active entitlement with disputed payment, admin grant overriding missing payment
  - Why it matters: product access must follow billing policy, not UI or provider events alone
  - Related contracts: C009, C011, C012, C013
  - Related invariants: I001, I006, I007, I010
  - Unknowns: none

- D009 — Subscription and invoice state
  - Status: filled
  - Values: active subscription, trialing subscription, past due subscription, unpaid subscription, canceled subscription, paid invoice, open invoice, void invoice, uncollectible invoice, partially paid invoice, disputed invoice
  - Boundary values: paid invoice with canceled subscription, past due subscription during grace, void invoice after checkout completion
  - Why it matters: entitlement and billing records depend on lifecycle transitions across multiple provider objects
  - Related contracts: C011, C012, C013, C014
  - Related invariants: I007, I008, I010
  - Unknowns: none

- D010 — Pricing and accepted terms
  - Status: filled
  - Values: current price, legacy price, promo, discount, tax inclusive, tax exclusive, tax exempt, different currency, credit applied, quantity changed, price changed during checkout
  - Boundary values: checkout created before price change, tax exemption added mid-checkout, currency mismatch, promotion expires before payment completion
  - Why it matters: accepted amount must match charged amount and remain auditable
  - Related contracts: C003, C004, C017
  - Related invariants: I005, I011
  - Unknowns: none

- D011 — Plan-change economics
  - Status: filled
  - Values: upgrade now, downgrade now, downgrade at period end, seat increase, seat decrease, credit applied, proration applied, no proration, immediate entitlement change, scheduled entitlement change
  - Boundary values: seat decrease below current active seats, upgrade with credit balance, downgrade with already-paid invoice
  - Why it matters: entitlement timing, invoice behavior, credits, and user messaging differ
  - Related contracts: C003, C010, C011, C017
  - Related invariants: I005, I011
  - Unknowns: none

- D012 — Cancellation/refund/dispute path
  - Status: filled
  - Values: cancel immediately, cancel at period end, full refund, partial refund, credit instead of refund, chargeback, dispute won, dispute lost, refund after cancellation, refund before entitlement activation
  - Boundary values: chargeback after long active usage, partial refund for seat decrease, refund of invoice linked to active subscription
  - Why it matters: access, accounting, support state, and audit implications differ
  - Related contracts: C013, C015
  - Related invariants: I008, I010, I011
  - Unknowns: none

- D013 — Reconciliation authority
  - Status: needs_human_decision
  - Values: provider authoritative, internal ledger authoritative, entitlement projection authoritative, support/manual review authoritative, hybrid by state type
  - Boundary values: provider says subscription active but internal ledger missing; internal entitlement active but provider subscription canceled
  - Why it matters: provider/internal disagreement must not create silent access drift
  - Related contracts: C011, C014, C015
  - Related invariants: I008, I010, I013
  - Unknowns: Q006

- D014 — Concurrency condition
  - Status: partial
  - Values: single operation, two checkout sessions, checkout plus cancellation, checkout plus plan change, duplicate plan changes, webhook while user operation is processing, support override during provider event
  - Boundary values: two authorized billing actors change plan at the same time; webhook revokes while checkout grants
  - Why it matters: concurrent operations can create duplicate subscriptions, stale accepted terms, or conflicting entitlements
  - Related contracts: C010, C011, C014
  - Related invariants: I002, I008, I011
  - Unknowns: Q009

- D015 — Environment/configuration
  - Status: partial
  - Values: billing enabled, billing disabled, provider configured, provider missing config, test mode, live mode, staged rollout, per-org billing flag, legacy billing migration
  - Boundary values: live webhook sent to test config, org under legacy billing migration, checkout enabled but webhooks disabled
  - Why it matters: billing behavior can differ across environments and rollout states
  - Related contracts: C005, C015
  - Related invariants: I012, I014
  - Unknowns: Q010

## Domain overlays used

- Auth / Organization Overlay
  - Reason: buyer permission, organization ownership, workspace boundaries, and support/operator access affect billing mutations.

- Payment / Commerce Overlay
  - Reason: checkout, subscription, invoice, payment, refund, dispute, tax, credit, and entitlement behavior are core to the feature.

- Async / Event Overlay
  - Reason: provider webhooks are asynchronous, retryable, duplicate-prone, delayed, and sometimes out of order.

- Data Lifecycle / Reconciliation Overlay
  - Reason: internal billing records, provider objects, entitlement state, and audit logs must remain reconcilable after cancellation, migration, refund, dispute, and deletion.

## High-signal scenario cells

- SC001 — Authorized owner starts new checkout
  - Dimensions: D001, D002, D003, D010
  - Scenario: org owner starts a new subscription checkout for the current organization using current price, currency, quantity, and tax terms
  - Expected behavior: checkout session is created for the correct billing owner; accepted terms are snapshotted; no entitlement is granted yet unless product policy explicitly allows provisional access
  - Related contracts: C001, C002, C003, C004, C009
  - Related invariants: I003, I005, I006
  - Why this matters: validates the happy path without making client checkout authoritative
  - Status: modeled

- SC002 — Unauthorized workspace admin attempts checkout
  - Dimensions: D001, D002, D003
  - Scenario: workspace admin without billing rights attempts to buy a paid plan for the organization
  - Expected behavior: checkout is not created; no provider session, invoice, billing record, ledger entry, or entitlement side effect occurs
  - Related contracts: C001
  - Related invariants: I003
  - Why this matters: billing permissions are stricter than ordinary workspace administration
  - Status: modeled

- SC003 — Buyer belongs to multiple organizations
  - Dimensions: D001, D002, D010
  - Scenario: authorized user belongs to multiple organizations and starts checkout while the selected organization context is stale
  - Expected behavior: checkout target organization is explicit and verified before provider session creation; accepted terms include the intended billing owner
  - Related contracts: C002, C003, C008
  - Related invariants: I004, I005
  - Why this matters: prevents cross-tenant billing and entitlement grants
  - Status: modeled

- SC004 — Client success before authoritative provider event
  - Dimensions: D004, D005, D008
  - Scenario: user returns to the success page, but provider confirmation event has not been processed
  - Expected behavior: UI shows pending/processing unless product policy grants provisional entitlement; authoritative entitlement grant rule is explicit
  - Related contracts: C009, C018
  - Related invariants: I001, I006, I010
  - Why this matters: redirect success is not reliable proof of payment completion
  - Status: needs_human_decision if provisional access policy is unspecified

- SC005 — Payment requires action and user abandons flow
  - Dimensions: D004, D008, D010
  - Scenario: checkout requires additional payment action, user does not complete it, and the checkout later expires
  - Expected behavior: entitlement is not granted; checkout is expired or recoverable according to product policy; billing record remains auditable
  - Related contracts: C009, C015, C018
  - Related invariants: I001, I006
  - Why this matters: action-required payment flows are common and should not look like paid subscriptions
  - Status: modeled

- SC006 — Duplicate checkout completion event
  - Dimensions: D005, D006, D008, D009
  - Scenario: provider sends the same checkout completed event twice
  - Expected behavior: processing is idempotent; no duplicate entitlement, subscription, invoice, ledger entry, notification, or audit entry is created
  - Related contracts: C005, C006, C007
  - Related invariants: I002, I009
  - Why this matters: provider retry semantics make duplicate events normal, not exceptional
  - Status: modeled

- SC007 — Event with invalid signature
  - Dimensions: D005, D006, D008
  - Scenario: webhook payload has an invalid signature
  - Expected behavior: event is rejected or recorded as signature_invalid; no billing or entitlement mutation occurs
  - Related contracts: C005, C007
  - Related invariants: I012
  - Why this matters: webhook authenticity protects billing state and entitlement
  - Status: modeled

- SC008 — Out-of-order invoice and subscription events
  - Dimensions: D005, D006, D009, D013
  - Scenario: invoice paid event arrives before subscription updated event
  - Expected behavior: processor reconciles to a consistent internal billing state or records pending dependency/reconciliation; entitlement follows the authoritative product rule
  - Related contracts: C006, C007, C011, C014
  - Related invariants: I001, I002, I008, I010
  - Why this matters: event order is not guaranteed
  - Status: partial unless event precedence is specified

- SC009 — Valid provider event for unknown customer
  - Dimensions: D005, D006, D007, D013
  - Scenario: valid provider event references a customer or subscription that is not mapped to any organization
  - Expected behavior: no entitlement changes; event is recorded as unknown or pending reconciliation; support/manual review path is explicit if needed
  - Related contracts: C007, C008, C014, C015
  - Related invariants: I004, I012, I014
  - Why this matters: valid provider events can still be unsafe to apply
  - Status: modeled

- SC010 — Provider customer mapped to another organization
  - Dimensions: D002, D005, D007, D008
  - Scenario: provider event references a customer ID that exists internally but belongs to a different organization than the checkout or billing record
  - Expected behavior: no cross-tenant entitlement or billing mutation occurs; event enters reconciliation or security review
  - Related contracts: C002, C008, C014
  - Related invariants: I004, I012
  - Why this matters: identity mapping is a core billing trust boundary
  - Status: modeled

- SC011 — Concurrent checkout sessions for same organization
  - Dimensions: D003, D004, D014
  - Scenario: two authorized billing actors start checkout or plan change for the same organization before either completes
  - Expected behavior: product policy chooses one authoritative result; stale or superseded sessions cannot create duplicate subscriptions or conflicting entitlements
  - Related contracts: C010, C011, C014
  - Related invariants: I002, I008, I011
  - Why this matters: concurrency can create duplicate subscriptions or entitlement drift
  - Status: needs_human_decision if concurrency policy is unspecified

- SC012 — Price changes during checkout
  - Dimensions: D004, D010
  - Scenario: product price changes after session creation but before payment completion
  - Expected behavior: charged terms match the accepted terms snapshot, or checkout expires and is recreated with explicit user acceptance
  - Related contracts: C003, C004, C017
  - Related invariants: I005
  - Why this matters: accepted and charged billing terms must remain reconcilable
  - Status: modeled

- SC013 — Upgrade with proration and seat increase
  - Dimensions: D003, D010, D011, D009
  - Scenario: organization upgrades plan and increases quantity mid-cycle
  - Expected behavior: accepted terms snapshot includes plan, quantity, price, currency, tax, credit/proration treatment, and entitlement effective timing
  - Related contracts: C003, C004, C011, C017
  - Related invariants: I005, I011
  - Why this matters: plan changes affect both economics and access
  - Status: needs_human_decision if proration or effective-time policy is unspecified

- SC014 — Downgrade scheduled at period end
  - Dimensions: D003, D008, D009, D011
  - Scenario: organization downgrades from a paid plan, but downgrade is scheduled for the end of the billing period
  - Expected behavior: entitlement remains consistent with current paid period until effective date; future entitlement state is scheduled and visible
  - Related contracts: C011, C013
  - Related invariants: I007, I010, I011
  - Why this matters: billing state and entitlement timing often diverge during scheduled downgrades
  - Status: modeled if downgrade timing policy exists; otherwise needs_human_decision

- SC015 — Seat decrease below current usage
  - Dimensions: D003, D010, D011, D008
  - Scenario: billing actor reduces quantity below active seat usage
  - Expected behavior: product either blocks the change, schedules it, requires seat removal, or defines partial entitlement behavior explicitly
  - Related contracts: C003, C011
  - Related invariants: I011
  - Why this matters: quantity changes can create invalid entitlement state
  - Status: needs_human_decision if seat enforcement policy is unspecified

- SC016 — Renewal payment fails
  - Dimensions: D008, D009, D012
  - Scenario: subscription moves to past_due after renewal payment failure
  - Expected behavior: entitlement moves to grace period, remains active, or is suspended according to product-defined grace rule
  - Related contracts: C011, C012
  - Related invariants: I007, I010
  - Why this matters: renewal failure should not accidentally cause immediate or indefinite access
  - Status: needs_human_decision if grace period is unspecified

- SC017 — Full refund after entitlement granted
  - Dimensions: D008, D009, D012, D013
  - Scenario: paid invoice is fully refunded after the organization received active entitlement
  - Expected behavior: entitlement, invoice/accounting record, ledger, and user-visible billing state reconcile according to refund policy
  - Related contracts: C013, C015
  - Related invariants: I008, I010, I011
  - Why this matters: refund does not automatically imply one universal access outcome
  - Status: needs_human_decision if refund access policy is unspecified

- SC018 — Partial refund or credit adjustment
  - Dimensions: D010, D011, D012, D013
  - Scenario: organization receives partial refund or credit after plan or quantity change
  - Expected behavior: credit/refund is linked to invoice and ledger state; entitlement impact is explicit and reconcilable
  - Related contracts: C011, C013, C017
  - Related invariants: I008, I011
  - Why this matters: partial economic adjustments frequently do not map cleanly to binary access changes
  - Status: needs_human_decision if credit/refund policy is unspecified

- SC019 — Chargeback after paid entitlement
  - Dimensions: D008, D009, D012, D013
  - Scenario: payment is disputed after entitlement was granted
  - Expected behavior: entitlement, ledger, invoice state, support-visible billing state, and dispute record reconcile according to dispute policy
  - Related contracts: C013, C015
  - Related invariants: I008, I010, I013
  - Why this matters: chargebacks are not the same as voluntary refunds and may require operational handling
  - Status: needs_human_decision if dispute policy is unspecified

- SC020 — Support operator grants manual entitlement
  - Dimensions: D001, D008, D013
  - Scenario: support operator grants or extends entitlement while provider state is missing, failed, or disputed
  - Expected behavior: operation is permissioned, audited, distinguishable from provider-driven entitlement, and reconciled against billing policy
  - Related contracts: C001, C016, C014, C015
  - Related invariants: I001, I010, I013
  - Why this matters: manual overrides are useful but can hide billing drift
  - Status: needs_human_decision if support override policy is unspecified

- SC021 — Billing disabled or provider misconfigured
  - Dimensions: D003, D015
  - Scenario: billing feature is enabled in UI but provider configuration or webhook configuration is missing
  - Expected behavior: checkout is blocked or safely degraded; no partial provider session creates unrecoverable state
  - Related contracts: C005, C015, C018
  - Related invariants: I012
  - Why this matters: environment/configuration errors should fail closed for billing mutations
  - Status: partial unless configuration behavior is specified

- SC022 — Legacy or migrated billing customer
  - Dimensions: D002, D007, D013, D015
  - Scenario: organization has a migrated provider customer or legacy subscription representation
  - Expected behavior: migration mapping is verified before mutation; reconciliation path handles old and new provider/internal identifiers
  - Related contracts: C008, C014, C015
  - Related invariants: I004, I011, I014
  - Why this matters: migrations are a common source of duplicate or orphaned billing records
  - Status: needs_human_decision if migration rules are unspecified

## Common open questions

- Q001: Which roles can manage billing for an organization?
- Q002: Is billing scoped to organization, workspace, account, or another billing owner?
- Q003: Which provider event or internal billing state authoritatively grants entitlement?
- Q004: Is provisional access allowed while provider confirmation is pending?
- Q005: What is the renewal failure grace period?
- Q006: What is the source of truth when provider state and internal state disagree?
- Q007: What happens when provider customer/subscription/invoice IDs are unknown, missing, migrated, or mapped to another organization?
- Q008: Are partial refunds, credits, and disputes supported, and how do they affect entitlement?
- Q009: How are concurrent checkout, cancellation, payment-method update, and plan-change attempts serialized or reconciled?
- Q010: Which environments, rollout flags, and provider modes are supported?
- Q011: How are tax exemptions, currency, promotions, legacy prices, and credits represented?
- Q012: Are upgrades/downgrades effective immediately or at the end of the billing period?
- Q013: Is proration enabled, disabled, or configurable?
- Q014: How are seat quantity changes constrained by current product usage?
- Q015: Which billing events must be auditable for support, finance, compliance, or customer communication?
- Q016: Can support/admin users manually grant, revoke, extend, or reconcile entitlement?
- Q017: How are organizations deleted, restored, or migrated while provider subscriptions still exist?
- Q018: Which notifications are sent for successful payment, failed payment, grace period, cancellation, refund, or dispute?

## Common assumptions

- A001: The provider handles raw payment method collection; the product stores only provider identifiers and internal billing records.
- A002: The product has an internal entitlement model separate from provider subscription state.
- A003: Provider webhooks are asynchronous and can be duplicated, delayed, replayed, or delivered out of order.
- A004: Billing ownership is tenant-scoped, usually to an organization.
- A005: Client success redirect is not authoritative unless product policy explicitly says otherwise.
- A006: Refund and dispute behavior is product-specific and should not be inferred from payment provider defaults.
- A007: Manual support actions are possible only if explicitly present in product/admin context.

## Coverage notes

Modeled:

- authorized and unauthorized checkout
- billing owner targeting
- accepted checkout terms
- provider event authentication
- duplicate, delayed, out-of-order, unknown, and invalid provider events
- webhook processing record
- provider/internal identity mapping
- client success versus authoritative billing state
- entitlement projection
- checkout expiration and action-required payment flows
- plan upgrade, downgrade, quantity change, and proration
- renewal failure and grace period
- full refund, partial refund, credit, dispute, and chargeback
- concurrent checkout and plan-change attempts
- provider/internal reconciliation
- support/operator override risks
- migration and deleted-organization boundaries

Partial:

- exact role names
- exact provider event names
- exact entitlement grant rule
- exact grace period
- exact proration and credit policy
- exact concurrency serialization policy
- exact dispute handling policy
- exact tax and currency policy
- exact support override permissions

Unknown:

- product-specific billing owner model
- provider-specific object naming
- whether provisional access is allowed
- whether manual reconciliation exists
- whether legacy subscriptions or migrations exist
- whether tax exemption and multi-currency are supported
- whether seat enforcement is hard, soft, or scheduled

Not applicable unless explicitly present:

- marketplace seller payouts
- revenue sharing
- metered usage billing
- prepaid wallet billing
- multi-provider payment routing
- invoice PDF generation
- procurement approval workflow
- purchase orders
- reseller billing
- consumer app-store subscriptions
- crypto payments
- cash/manual offline payments

## Common overgeneration traps

- Do not create every combination of role, checkout state, payment state, invoice state, subscription state, event type, and entitlement state.
- Do not include dimensions that do not change expected behavior.
- Do not collapse checkout, payment, subscription, invoice, ledger, and entitlement into one state machine.
- Do not treat provider state as identical to internal billing state.
- Do not treat entitlement as a direct mirror of a single provider event.
- Do not treat the client success page as authoritative unless product policy explicitly says so.
- Do not skip duplicate, delayed, replayed, and out-of-order provider events.
- Do not skip unknown provider customer/subscription mappings.
- Do not assume refund, dispute, cancellation, and failed renewal all revoke access the same way.
- Do not model tax, currency, discounts, credits, and legacy prices unless they affect accepted terms, charged terms, invoice state, or support visibility.
- Do not create scenario cells for low-signal happy-path variations that have the same expected behavior.

## Near-miss examples

### Near miss: client redirect treated as entitlement grant

Bad harness behavior:

- grants paid entitlement immediately when the user lands on `/success`
- does not wait for provider event or internal authoritative billing confirmation
- has no pending entitlement state

Why this is wrong:

- client redirect can happen before payment confirmation
- user-visible success is not the same as settled billing state
- entitlement should follow explicit billing policy

Expected correction:

- add pending/processing state
- model authoritative grant rule
- include provider event and reconciliation path

### Near miss: duplicate webhook ignored as “edge case”

Bad harness behavior:

- models only first successful checkout completion event
- omits duplicate or replayed provider event
- omits idempotency record

Why this is wrong:

- provider retries are normal operational behavior
- duplicate mutation can create duplicate invoices, credits, notifications, or entitlements

Expected correction:

- add webhook processing record
- add idempotency contract
- add scenario cell for duplicate event

### Near miss: provider customer ID not mapped to billing owner

Bad harness behavior:

- processes valid provider event only because signature is valid
- does not verify customer/subscription ownership
- can mutate entitlement for the wrong organization

Why this is wrong:

- authenticity does not prove tenant ownership
- cross-tenant billing mutation is a critical trust-boundary failure

Expected correction:

- add provider/internal identity mapping dimension
- require billing owner verification before mutation
- add unknown/mismatched customer scenario cells

### Near miss: refund and dispute treated as the same

Bad harness behavior:

- uses one generic “refund” path
- assumes access is always revoked
- omits dispute lifecycle

Why this is wrong:

- voluntary refund, partial refund, credit, chargeback, and dispute resolution can have different product and accounting outcomes

Expected correction:

- split refund, partial refund, credit, chargeback, dispute won, and dispute lost
- link each to entitlement, invoice, ledger, and support-visible billing state

### Near miss: plan change modeled without economics

Bad harness behavior:

- says “upgrade changes plan”
- omits quantity, proration, credits, tax, currency, and effective date

Why this is wrong:

- plan changes are both entitlement changes and financial changes
- accepted terms must be reconcilable to charged terms

Expected correction:

- include accepted terms snapshot
- model plan-change economics dimension
- add upgrade/downgrade/seat-change scenario cells

## Calibration checklist

A strong payment harness produced from this golden should include:

- 8-15 behavior-changing dimensions, not dozens of decorative axes
- explicit separation of provider state, internal billing state, invoice state, and entitlement state
- at least one scenario for unauthorized billing actor
- at least one scenario for client success before authoritative confirmation
- at least one scenario for duplicate provider event
- at least one scenario for out-of-order or delayed provider event
- at least one scenario for unknown or mismatched provider customer mapping
- at least one scenario for concurrent checkout or plan change
- at least one scenario for renewal failure and grace period
- at least one scenario for refund or dispute
- open questions for product-specific decisions instead of guessed policy
- compact coverage notes instead of one-by-one not_applicable dimensions

A weak payment harness usually:

- only models happy-path checkout
- grants entitlement on client success redirect
- ignores webhook idempotency
- ignores provider/internal object mapping
- treats invoice, subscription, payment, and entitlement as the same state
- has no reconciliation story
- has no concurrency story
- has no refund/dispute story
- emits a large Cartesian product instead of high-signal scenario cells