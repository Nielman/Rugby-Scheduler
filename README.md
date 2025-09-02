# Rugby Hosting Day Scheduler (with Requests & Swaps)

- Next.js single-page app
- Randomized fixtures, balanced fields, per-team caps & requested games, editable age rules
- Requests/Constraints per age (priority, earliest start, latest end, field policy)
- Swap matches by position per field with recompute
- 7-minute breaks **between** matches
- Prevent same-club parallel games at same time in same age
- Print pages (A4) with logo + host header, footer credit
- Export Excel (XLSX) split by Field, and Excel with embedded logo
- Save/Load/Clear settings in localStorage

## Dev
```bash
npm i
npm run dev
```
## Build
```bash
npm run build && npm start
```