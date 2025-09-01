# Rugby Hosting Day Scheduler — XLSX Export

- Export **Excel (.xlsx)** with two sheets: **Field_A** and **Field_B**.
- Swap matches by position on a field; recomputes times.
- Editable age rules per age group; recompute times in place.
- Constraints kept: U14–U18 start after 13:00; U13–U18 on Field A.
- 7 minutes **between** matches only; no parallel same-club at same minute.

## Run
```
npm install
npm run dev
```

## Deploy (Vercel)
Push to GitHub → Import in Vercel (Next.js).

## Notes
- Excel export is **client-side** using `xlsx`. No server setup required.
- If you add `public/logo.png`, use `/logo.png` in the Logo URL field.
