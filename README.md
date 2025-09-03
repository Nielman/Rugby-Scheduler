# Rugby Hosting Day Scheduler

Next.js single-page app to generate randomized rugby match schedules across two fields with constraints.

## Features
- Clubs/teams with per-team caps (e.g. `2,1,1`) and default requested games per team
- Age rules editable (halves/half minutes/halftime)
- Requests/Constraints per age: priority, earliest start, latest end, field policy (default/A-only/B-only/any)
- U14–U18 default earliest 13:00; U13–U18 default Field A (both overridable via Requests)
- 7 minutes between matches; no parallel same-club at same time (per age)
- Swap within a field; Move/Swap between fields (recomputes times)
- Export Excel (.xlsx) with two sheets (Field_A, Field_B)
- Export Excel with embedded logo (ExcelJS)
- Print view per field with header logo & host name; footer credit
- Save/Load/Clear config (localStorage)

## Dev
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Deploy
Push to GitHub and import on Vercel (Next.js).

