# Component design rules

Before designing or changing ANY component API, read
[docs/component-rules.md](docs/component-rules.md) — the contract every
component satisfies (shadcn-grade flexibility outside, TMA traps absorbed
inside). Never remove code commented with an incident ID (REU-*, KB-*,
OVL-*, INT-*, device-testing #N) without reading its story.

# Working with files

IMPORTANT — keep files small, split large ones:

- Never let a single file (source, plan, spec, docs) grow past ~300 lines /
  ~15 KB. Split by topic into focused files instead.
- This applies to ALL files, including plans and specs: one plan file per
  feature/milestone, not one giant `plans.md`. Large files burn tokens on
  every read and bloat session context.
- When reading an existing large file, read only the relevant section
  (offset/limit), not the whole file.
- When you touch a file that is already too big, split it as part of the
  change (or flag it if out of scope).
