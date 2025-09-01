# Rugby Hosting Day Scheduler

- Next.js single-page app
- Randomized fixtures, balanced fields
- Constraints: U14–U18 only after 13:00; U13–U18 on Field A only
- 7 minutes only **between** matches
- No same-club in parallel at the same time (per age)
- Per-team requested caps (comma-separated), plus default cap per age
- Swap by position on a field (with recompute)
- Editable age rules (per age)
- Print pages (A4), CSV/XLSX export
- **XLSX with logo** via ExcelJS (button: Export Excel (Logo))

## Run
```bash
npm i
npm run dev
```
