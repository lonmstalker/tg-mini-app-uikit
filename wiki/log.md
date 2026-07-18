# Wiki operation log (append-only)


One line per wiki operation. Newest at the bottom. NEVER edit or delete a past
line — a correction is a new line that references the old one. Timestamps are
ISO-8601 UTC. Format:

    <ISO-8601 UTC> | <create|update|split|merge|deprecate> | <page(s)> | <summary> | by: <author>

---

- 2026-06-14T21:06Z | create | index, project, trailhead-demo, telegram-runtime, navstack, i18n, testing-and-review | Seeded the wiki from verified session facts (kit runtime, navstack swipe-back, mock API, i18n, demo concept, testing policy). | by: Claude
- 2026-07-18T09:05Z | create | ios-debugging (+index) | On-device iOS debugging: the ?kbdebug=1 forensics overlay, branch-push prod loop, measured keyboard event order (bridge -> vv -> WKWebView resize) and the four fixes it produced (KB-4, shell cap+ease, body theming). | by: Claude
