# Quality Checklist

Run this checklist before finalizing any substantial Designer Skill / Agent response.

## Research Quality

- [ ] No old screenshot packs were used as primary evidence.
- [ ] No generic UI galleries, Dribbble/Pinterest boards, recycled SaaS screenshot libraries, outdated trend articles, or undated "best UI examples" were treated as primary evidence.
- [ ] Current platforms in the same product domain were considered when research was required.
- [ ] Each referenced current platform has a recency signal.
- [ ] Research is domain-specific, not generic.
- [ ] The answer synthesizes patterns instead of copying competitor UI.
- [ ] No exact layouts, brand systems, icons, illustrations, copywriting, or proprietary interactions were copied.

## Design Quality

- [ ] Design advice is concrete, not vague advice like "make it clean" or "improve UX".
- [ ] UX risks are stated clearly.
- [ ] Information hierarchy and content priority are explicit.
- [ ] Empty, error, loading, disabled, permission-limited, and first-run states were considered where relevant.
- [ ] Mobile/responsive behavior was considered where relevant.
- [ ] Accessibility was considered from a design perspective.
- [ ] Recommendations are actionable and scoped.

## Telegram Mini App Quality

Run for any work in **tg-mini-app-uikit**. See `references/telegram-mini-apps.md` for the why.

- [ ] Bottom-anchored controls (sheets, action sheets, toasts, write bar, bottom bar) clear the home indicator; top content clears the Telegram header / notch.
- [ ] Safe-area requirements are stated as acceptance criteria, not assumed from `env()`.
- [ ] The primary action is unambiguous and not duplicated across the native MainButton and an in-DOM button.
- [ ] Back button / edge-swipe closes the top layer first (overlay before nav), never closes the app with an overlay open, and fires exactly once.
- [ ] The form CTA and the focused field stay visible above the on-screen keyboard; the "keyboard open" state is defined.
- [ ] No modal or scroll surface lets Telegram's swipe-down collapse the app; horizontal-swipe content reserves the edge-swipe-back zone.
- [ ] Haptics are specified only on real state changes, with each trigger named.
- [ ] The design holds up in light, dark, and an arbitrary live Telegram theme; colors are expressed as semantic `--tk-*` tokens.
- [ ] Motion is directional (push from the right, back from the left) and reduced-motion safe; tap targets are ≥ 44px.
- [ ] Handoff names the implementation owner per item (`uikit-element-development` for reusable kit surfaces, `impeccable` for one-off craft).

## Boundary Quality

- [ ] No production code, CSS, framework code, tests, debugging steps, build/deploy work, API/backend/database work, or component implementation was produced.
- [ ] Handoff notes are clear but not code-level implementation.
- [ ] Mixed design/implementation requests are separated into design intent, UX/UI requirements, and handoff notes for `impeccable`.
- [ ] The response stops before the `impeccable` portion.

## Extra Strict Non-Overlap Audit

Use this audit when a capability could be ambiguous.

| Capability | Designer Skill / Agent | `impeccable` | Owner |
|---|---|---|---|
| Product feel and design principles | Defines intent and experience qualities | Does not own | Designer |
| UX strategy | Owns flows, priorities, and risks | Does not own | Designer |
| Information architecture | Owns navigation and content hierarchy | Implements approved structure | Designer |
| Competitive pattern research | Synthesizes current category patterns | Does not own | Designer |
| Journey maps and user roles | Owns design-facing journeys and jobs | May implement role logic later | Designer |
| Screen/page specs | Defines layout intent, states, and behavior | Converts approved specs into code/components | Designer for spec, `impeccable` for code |
| Component behavior spec | Defines UX behavior, variants, states, and acceptance criteria | Implements component | Designer for spec, `impeccable` for code |
| Accessibility review | Reviews design-level affordances, labels, contrast intent, focus expectations, and interaction risks | Implements and tests accessibility | Split by phase |
| Design system recommendations | Recommends tokens, patterns, usage rules, and component direction | Implements system changes | Designer for direction, `impeccable` for code |
| Handoff notes | Writes concise implementation guidance | Consumes and implements | Designer |
| Production code | Does not write | Writes | `impeccable` |
| Tests | Does not write | Writes | `impeccable` |
| Debugging | Does not debug code | Debugs code | `impeccable` |
| Backend/API/database work | Does not own | Owns | `impeccable` |
| Build/deploy/performance implementation | Does not own | Owns | `impeccable` |

If a capability involves both design and implementation, split it:

- Designer Skill / Agent: intent, UX rationale, UI behavior, acceptance criteria from a design perspective.
- `impeccable`: code, implementation, tests, framework decisions, production integration.
