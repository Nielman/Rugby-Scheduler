# Rugby Hosting Day Scheduler (Next.js)

- Two fields (A & B), balanced to finish earliest.
- 7 minutes **between** matches only.
- No parallel same-club games across fields at the same start time (for all ages).
- Ages: U8–U13 + **U14, U15, U16, U18** with correct half durations and 5m halftime.
- Add/remove clubs and teams, set **requested games per team** (blank = unlimited).
- Randomized age groups and pairings.
- CSV export.
- Print to A4 (Field A page then Field B) with logo + host header and footer credit.

## Run
```
npm install
npm run dev
```
Open http://localhost:3000

## Deploy (Vercel)
Push to GitHub → Import in Vercel → default build (`next build`).

## Logo
Add `public/logo.png` and enter `/logo.png` as Logo URL (or any HTTPS URL).