# Rugby Hosting Scheduler (Per-team caps)

- Next.js single-page app
- XLSX export per field
- Swap matches on a field by positions
- Editable age rules
- Per-team requested games via comma-separated caps list per age (e.g., `2,1,1`)
- Constraints: U14–U18 only after 13:00; U13–U18 must be on Field A
- 7 minutes break between matches
- No parallel same-club at same time within the same age
- Print pages (A4) with logo + host, and footer credit

## Dev
```
npm install
npm run dev
```
