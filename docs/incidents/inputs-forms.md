# Incidents — inputs & forms

One guarantee per incident ID (M1's docs anchor). Paths are relative to
`packages/uikit/src/`.

## Inputs

- **INP-001** — `TKSelect` starts empty (`""`), not on the first option: the
  placeholder shows and the parent's state is never silently out of sync — an
  auto-selected first option would also never fire `onChange`.
  `atoms/inputs/select.tsx`
- **INP-003** — the OTP field stays focusable and autofillable (visually hidden,
  not `display: none`) so the OS can surface and fill the SMS one-time code.
  `atoms/inputs/otp.tsx`
- **INP-004** — the select popup keeps its filter combobox OUTSIDE
  `role="listbox"`, so the listbox holds only `option`/`group` children and the
  combobox/listbox pairing stays valid. `atoms/inputs/select.tsx`
- **INP-005** — dropped files are filtered with the same `accept` syntax the
  picker enforces (extension globs, type globs, exact MIME, `*`), so drag-and-
  drop cannot bypass the file-type contract. `atoms/inputs/file-input.tsx`
- **INP-006** — merged refs are memoized, so a parent re-render never detaches
  and reattaches the input node (which dropped focus and, for file inputs, the
  selection). `atoms/inputs/file-input.tsx`, `atoms/inputs/input.tsx`
- **INP-008** — a validation error is announced to AT (`role="alert"`); a plain
  hint stays silent. `atoms/inputs/form-field.tsx`
- **INP-009** — inline field actions (clear, reveal) keep a 44px hit area around
  a 20px glyph. `atoms/inputs/input.tsx`
- **A11Y-202** — an empty option list never renders an empty `role="listbox"`
  (which breaks `aria-required-children`): the "nothing found" message is a
  status region instead. `atoms/inputs/select.tsx`

## Forms

- **FRM-002** — a field with no visible label falls back to a real accessible
  name; the placeholder is not relied on, since it leaves the accname
  computation as soon as the field has a value. `atoms/inputs/textarea.tsx`
- **FRM-004** — PIN entry announces progress politely and rejection
  assertively; a visual-only dot + shake leaves screen-reader users with
  nothing. `composites/forms/pin.tsx`
- **FRM-005** — changing `length`/`maxLength` after digits were entered
  truncates to the new capacity and re-evaluates auto-complete, so shrinking the
  length cannot strand a longer value. `composites/forms/pin.tsx`
- **FRM-007** — calendar day cells always meet the 44px touch minimum in height
  while the width fills its `1fr` column and caps at the token, so seven columns
  never overflow a ≤320px viewport (`--tk-tap-min` resizes the grid).
  `composites/forms/calendar.tsx`
- **REU-012** — built-in validation copy (invalid date, invalid email, invalid
  time) resolves through `TKLocale` with an English fallback, never a hardcoded
  string at the call site. `foundation/i18n.tsx`
