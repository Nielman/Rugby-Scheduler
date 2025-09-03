
import React, { useEffect, useMemo, useState } from "react";
import { addMinutes, format, parse } from "date-fns";

/* ---------- DEFAULT AGE RULES ---------- */
const BASE_RULES = {
  U8:  { halves: 2, halfDuration: 15, halftime: 5 },
  U9:  { halves: 2, halfDuration: 20, halftime: 5 },
  U10: { halves: 2, halfDuration: 20, halftime: 5 },
  U11: { halves: 2, halfDuration: 20, halftime: 5 },
  U12: { halves: 2, halfDuration: 20, halftime: 5 },
  U13: { halves: 2, halfDuration: 25, halftime: 5 },
  U14: { halves: 2, halfDuration: 25, halftime: 5 },
  U15: { halves: 2, halfDuration: 30, halftime: 5 },
  U16: { halves: 2, halfDuration: 30, halftime: 5 },
  U18: { halves: 2, halfDuration: 35, halftime: 5 }
};
const FIELDS = ["Field A", "Field B"];
const BETWEEN_MATCHES_BREAK = 7;

/* ---------- DEFAULT CONSTRAINTS (overridable via requests) ---------- */
const AFTERNOON_ONLY = new Set(["U14","U15","U16","U18"]); // default ≥13:00
const AGES_A_ONLY    = new Set(["U13","U14","U15","U16","U18"]); // default Field A
const DEFAULT_AFTERNOON_START = "13:00";

/* ---------- STYLES ---------- */
const s = {
  page: { padding: 16, fontFamily: "system-ui, Arial, sans-serif", lineHeight: 1.4 },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 },
  input: { border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px" },
  number: { border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px", width: 90 },
  select: { border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px" },
  btn: { background: "#2563eb", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" },
  btnGreen: { background: "#16a34a", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" },
  btnGray: { background: "#6b7280", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" },
  warn: { color: "#b91c1c", fontSize: 13, marginTop: 6 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, alignItems: "start" },
  card: { border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#f9fafb" },
  label: { fontSize: 12, color: "#374151" },
  success: { color: "#16a34a", fontWeight: 600, marginTop: 4, marginBottom: 6 },
  footer: { marginTop: 12, padding: 10, background: "#f1f5f9", borderRadius: 8, fontSize: 14 },
  devCredit: { marginTop: 6, fontSize: 12, color: "#475569", textAlign: "right" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 8 },
  th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "6px 4px", fontSize: 12, color: "#374151" },
  td: { borderBottom: "1px solid #f1f5f9", padding: "6px 4px", fontSize: 13 }
};

/* ---------- COMPONENT ---------- */
export default function Home() {
  /* data */
  const [ageRules, setAgeRules] = useState(BASE_RULES);
  const AGE_GROUPS = useMemo(() => Object.keys(ageRules), [ageRules]);

  const [clubs, setClubs] = useState([{ name: "Centurion Youth Rugby Club", teams: {} }]);
  const [newClubName, setNewClubName] = useState("");
  const [selectedClub, setSelectedClub] = useState("Centurion Youth Rugby Club");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("U13");
  const [teamCount, setTeamCount] = useState(1);

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState("");

  const [hostName, setHostName] = useState("Centurion Youth Rugby Club");
  const [logoUrl, setLogoUrl] = useState("");

  /* requests/constraints overrides (per age) */
  const [requests, setRequests] = useState(
    AGE_GROUPS.reduce((acc, age) => {
      acc[age] = { priority: false, earliestStart: "", latestEnd: "", fields: "default" };
      return acc;
    }, {})
  );

  /* swap/move UI */
  const [swapField, setSwapField] = useState("Field A");
  const [swapA, setSwapA] = useState("");
  const [swapB, setSwapB] = useState("");

  const [moveFromField, setMoveFromField] = useState("Field A");
  const [moveFromPos, setMoveFromPos] = useState("");
  const [moveToField, setMoveToField] = useState("Field B");
  const [moveToPos, setMoveToPos] = useState("");

  const [warnings, setWarnings] = useState([]);

  /* load saved */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rugbySchedulerConfig");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data?.clubs) setClubs(data.clubs);
      if (data?.startTime) setStartTime(data.startTime);
      if (data?.endTime) setEndTime(data.endTime);
      if (data?.hostName) setHostName(data.hostName);
      if (data?.logoUrl) setLogoUrl(data.logoUrl);
      if (data?.ageRules) setAgeRules(data.ageRules);
      if (data?.requests) setRequests(mergeRequestsDefaults(data.requests));
      setSelectedClub((data?.clubs?.[0]?.name) || "Centurion Youth Rugby Club");
    } catch {}
  }, []);

  const saveConfig = () => {
    const data = { clubs, startTime, endTime, hostName, logoUrl, ageRules, requests };
    localStorage.setItem("rugbySchedulerConfig", JSON.stringify(data));
    toast("Config saved");
  };
  const loadConfig = () => {
    try {
      const raw = localStorage.getItem("rugbySchedulerConfig");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data?.clubs) setClubs(data.clubs);
      if (data?.startTime) setStartTime(data.startTime);
      if (data?.endTime) setEndTime(data.endTime);
      if (data?.hostName) setHostName(data.hostName);
      if (data?.logoUrl) setLogoUrl(data.logoUrl);
      if (data?.ageRules) setAgeRules(data.ageRules);
      if (data?.requests) setRequests(mergeRequestsDefaults(data.requests));
      setSelectedClub((data?.clubs?.[0]?.name) || "Centurion Youth Rugby Club");
      toast("Config loaded");
    } catch {}
  };
  const clearSaved = () => { localStorage.removeItem("rugbySchedulerConfig"); toast("Saved config cleared"); };

  const toast = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 1500); };

  /* helpers */
  const normalizeEntry = (raw) => {
    if (typeof raw === "number") return { count: raw, desired: "", perTeamCaps: "" };
    return { count: Number(raw?.count || 0), desired: raw?.desired ?? "", perTeamCaps: raw?.perTeamCaps ?? "" };
  };
  const matchDuration = (age) => {
    const r = ageRules[age];
    return r.halves * r.halfDuration + r.halftime;
  };
  const parseHHMM = (hhmm, fallback) => {
    if (!hhmm) return fallback;
    try { return parse(hhmm, "HH:mm", new Date("1970-01-01T00:00:00")); } catch { return fallback; }
  };

  /* requests effective resolution */
  const effectiveAllowedFields = (age) => {
    const req = requests[age];
    if (req?.fields === "A_ONLY") return ["Field A"];
    if (req?.fields === "B_ONLY") return ["Field B"];
    if (req?.fields === "ANY")    return FIELDS;
    return AGES_A_ONLY.has(age) ? ["Field A"] : FIELDS;
  };
  const effectiveEarliestStart = (age, dayStart) => {
    const req = requests[age];
    if (req?.earliestStart) return parseHHMM(req.earliestStart, dayStart);
    if (AFTERNOON_ONLY.has(age)) return parseHHMM(DEFAULT_AFTERNOON_START, dayStart);
    return dayStart;
  };
  const effectiveLatestEnd = (age, dayEnd) => {
    const req = requests[age];
    if (req?.latestEnd) return parseHHMM(req.latestEnd, dayEnd);
    return dayEnd;
  };

  const mergeRequestsDefaults = (loaded) => {
    const base = AGE_GROUPS.reduce((acc, age) => {
      acc[age] = { priority: false, earliestStart: "", latestEnd: "", fields: "default" };
      return acc;
    }, {});
    const out = { ...base, ...(loaded || {}) };
    AGE_GROUPS.forEach((age) => { out[age] = { ...base[age], ...(out[age] || {}) }; });
    return out;
  };

  /* clubs ops */
  const addClub = () => {
    const name = newClubName.trim();
    if (!name || clubs.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setClubs((prev) => [...prev, { name, teams: {} }]);
    setSelectedClub(name); setNewClubName("");
  };
  const addTeamToClub = () => {
    if (!selectedClub || teamCount <= 0) return;
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== selectedClub) return c;
        const nt = { ...(c.teams || {}) };
        const curr = normalizeEntry(nt[selectedAgeGroup] || { count: 0, desired: "", perTeamCaps: "" });
        nt[selectedAgeGroup] = { ...curr, count: curr.count + Number(teamCount) };
        return { ...c, teams: nt };
      })
    );
    toast(`${teamCount} ${selectedAgeGroup} team(s) added to ${selectedClub}`);
  };
  const setDesiredFor = (clubName, age, desired) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== clubName) return c;
        const nt = { ...(c.teams || {}) };
        const curr = normalizeEntry(nt[age] || { count: 0 });
        nt[age] = { ...curr, desired };
        return { ...c, teams: nt };
      })
    );
  };
  const setPerTeamCapsFor = (clubName, age, capsCSV) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== clubName) return c;
        const nt = { ...(c.teams || {}) };
        const curr = normalizeEntry(nt[age] || { count: 0 });
        nt[age] = { ...curr, perTeamCaps: capsCSV };
        return { ...c, teams: nt };
      })
    );
  };
  const removeClub = (clubName) => {
    setClubs((prev) => prev.filter((c) => c.name !== clubName));
    if (selectedClub === clubName) setSelectedClub("Centurion Youth Rugby Club");
  };
  const removeAgeFromClub = (clubName, age) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== clubName) return c;
        const nt = { ...(c.teams || {}) }; delete nt[age];
        return { ...c, teams: nt };
      })
    );
  };

  /* pairings */
  const buildMatches = () => {
    const matches = [];
    const priorityAges = AGE_GROUPS.filter((a) => requests[a]?.priority);
    const normalAges = AGE_GROUPS.filter((a) => !requests[a]?.priority);
    const ageOrder = [...priorityAges, ...normalAges];

    ageOrder.forEach((age) => {
      const allTeams = [];
      clubs.forEach((club) => {
        const entry = normalizeEntry(club.teams?.[age]);
        for (let i = 0; i < (entry.count || 0); i++) {
          allTeams.push({ name: `${club.name} ${age} #${i + 1}`, club: club.name, age, teamIdx: i });
        }
      });

      // per-team caps mapping by index for each club+age
      const capsByTeam = {};
      clubs.forEach((club) => {
        const entry = normalizeEntry(club.teams?.[age]);
        const defaultCap = entry.desired === "" ? Infinity : Math.max(0, Number(entry.desired));
        const caps = (entry.perTeamCaps || "")
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x !== "")
          .map((x) => Math.max(0, Number(x)));
        for (let i = 0; i < (entry.count || 0); i++) {
          const custom = caps[i];
          capsByTeam[`${club.name} ${age} #${i + 1}`] = (custom === undefined ? defaultCap : custom);
        }
      });

      for (let i = 0; i < allTeams.length; i++) {
        for (let j = i + 1; j < allTeams.length; j++) {
          if (allTeams[i].club !== allTeams[j].club) {
            matches.push({
              age,
              teamA: allTeams[i],
              teamB: allTeams[j],
              duration: matchDuration(age),
              capsByTeam
            });
          }
        }
      }
    });

    // shuffle
    for (let i = matches.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      [matches[i], matches[k]] = [matches[k], matches[i]];
    }
    return matches;
  };

  /* conflicts */
  const conflictAt = (list, candidateStart, age, clubsToCheck) =>
    list.some(
      (x) =>
        x.age === age &&
        format(x.startTime, "HH:mm") === format(candidateStart, "HH:mm") &&
        (clubsToCheck.includes(x.teamA.club) || clubsToCheck.includes(x.teamB.club))
    );

  /* generate schedule */
  const generateSchedule = () => {
    const matches = buildMatches();
    const gamesByTeam = {};

    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);
    const fieldTimes = { "Field A": new Date(dayStart), "Field B": new Date(dayStart) };
    const out = [];

    for (const m of matches) {
      const tA = m.teamA.name, tB = m.teamB.name;
      const capA = m.capsByTeam?.[tA] ?? Infinity;
      const capB = m.capsByTeam?.[tB] ?? Infinity;
      if ((gamesByTeam[tA] || 0) >= capA || (gamesByTeam[tB] || 0) >= capB) continue;

      const allowedFields = effectiveAllowedFields(m.age);
      const candidates = allowedFields.map((f) => {
        let start = new Date(fieldTimes[f]);
        const earliest = effectiveEarliestStart(m.age, dayStart);
        if (start < earliest) start = new Date(earliest);
        const endMax = effectiveLatestEnd(m.age, dayEnd);
        const end = addMinutes(start, matchDuration(m.age));
        const parallelConflict = conflictAt(out, start, m.age, [m.teamA.club, m.teamB.club]);
        const fits = end <= endMax && end <= dayEnd && !parallelConflict;
        return { field: f, start, end, fits };
      });

      const valid = candidates.filter((c) => c.fits);
      if (!valid.length) continue;
      valid.sort((a, b) => a.end - b.end);
      const chosen = valid[0];

      out.push({ ...m, field: chosen.field, startTime: chosen.start, endTime: chosen.end });
      gamesByTeam[tA] = (gamesByTeam[tA] || 0) + 1;
      gamesByTeam[tB] = (gamesByTeam[tB] || 0) + 1;
      fieldTimes[chosen.field] = addMinutes(chosen.end, BETWEEN_MATCHES_BREAK);
    }

    out.sort((a, b) => a.startTime - b.startTime || a.field.localeCompare(b.field));
    setSchedule(out);
    setWarnings(validateConflicts(out, dayStart, dayEnd));
  };

  /* export XLSX (two sheets) */
  const exportXLSX = async () => {
    if (!schedule.length) return;
    const XLSX = await import("xlsx");
    const headers = ["Field", "Age Group", "Start Time", "End Time", "Team A", "Team B"];
    const wb = XLSX.utils.book_new();
    for (const f of FIELDS) {
      const rows = schedule.filter((m) => m.field === f).sort((a, b) => a.startTime - b.startTime)
        .map((m) => [m.field, m.age, format(m.startTime, "HH:mm"), format(m.endTime, "HH:mm"), m.teamA.name, m.teamB.name]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, ws, f.replace(" ", "_"));
    }
    XLSX.writeFile(wb, "match_schedule.xlsx");
  };

  /* export Excel with logo (ExcelJS) */
  const exportExcelWithLogo = async () => {
    if (!schedule.length) return;
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();

    // helper to fetch as base64 (works in browser)
    async function fetchAsBase64(url) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    for (const f of FIELDS) {
      const ws = wb.addWorksheet(f.replace(" ", "_"));
      let row = 1;

      if (logoUrl) {
        try {
          const base64 = await fetchAsBase64(logoUrl);
          const ext = logoUrl.toLowerCase().endsWith(".jpg") || logoUrl.toLowerCase().endsWith(".jpeg") ? "jpeg" : "png";
          const imageId = wb.addImage({ base64: base64, extension: ext });
          ws.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 220, height: 60 } });
          row = 5;
        } catch (e) {
          // ignore if fetch blocked
        }
      }

      ws.mergeCells(row, 1, row, 6);
      ws.getCell(row, 1).value = `${hostName} — ${f}`;
      ws.getCell(row, 1).font = { bold: true, size: 14 };
      row += 2;

      const header = ["Field", "Age Group", "Start Time", "End Time", "Team A", "Team B"];
      ws.getRow(row).values = header; ws.getRow(row).font = { bold: true };
      row++;

      schedule.filter((m) => m.field === f).sort((a, b) => a.startTime - b.startTime).forEach((m) => {
        ws.getRow(row).values = [m.field, m.age, format(m.startTime, "HH:mm"), format(m.endTime, "HH:mm"), m.teamA.name, m.teamB.name];
        row++;
      });

      ws.columns = [{ width: 12 }, { width: 10 }, { width: 12 }, { width: 12 }, { width: 42 }, { width: 42 }];
    }

    const blob = await wb.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([blob]));
    const a = document.createElement("a"); a.href = url; a.download = "match_schedule_logo.xlsx"; a.click();
  };

  /* lists & recompute */
  const fieldList = (field) => schedule.filter((m) => m.field === field).sort((a, b) => a.startTime - b.startTime);

  const recomputeFieldTimes = (field, orderedList, dayStart, dayEnd) => {
    let t = new Date(dayStart);
    const out = [];
    for (const m of orderedList) {
      const earliest = effectiveEarliestStart(m.age, dayStart);
      if (t < earliest) t = new Date(earliest);
      const start = new Date(t);
      const end = addMinutes(start, matchDuration(m.age));
      out.push({ ...m, field, startTime: start, endTime: end });
      t = addMinutes(end, BETWEEN_MATCHES_BREAK);
    }
    return out;
  };

  const validateConflicts = (all, dayStart, dayEnd) => {
    const msgs = [];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        if (a.age !== b.age) continue;
        if (format(a.startTime, "HH:mm") !== format(b.startTime, "HH:mm")) continue;
        const clubs = [a.teamA.club, a.teamB.club];
        if (clubs.includes(b.teamA.club) || clubs.includes(b.teamB.club))
          msgs.push(`Parallel same-club at ${format(a.startTime, "HH:mm")} for ${a.age} (${a.field} vs ${b.field}).`);
      }
    }
    all.forEach((m) => {
      const allowed = effectiveAllowedFields(m.age);
      if (!allowed.includes(m.field)) msgs.push(`${m.age} not allowed on ${m.field}.`);
      const earliest = effectiveEarliestStart(m.age, dayStart);
      const latest = effectiveLatestEnd(m.age, dayEnd);
      if (m.startTime < earliest) msgs.push(`${m.age} starts before allowed (${format(m.startTime,"HH:mm")} < ${format(earliest,"HH:mm")}).`);
      if (m.endTime > latest) msgs.push(`${m.age} exceeds latest end (${format(m.endTime,"HH:mm")} > ${format(latest,"HH:mm")}).`);
    });
    return Array.from(new Set(msgs));
  };

  /* swap within a field */
  const swapOnField = () => {
    const a = parseInt(swapA, 10), b = parseInt(swapB, 10);
    if (!a || !b || a === b) return;

    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);

    const list = fieldList(swapField);
    if (a < 1 || a > list.length || b < 1 || b > list.length) return;

    const swapped = [...list];
    [swapped[a - 1], swapped[b - 1]] = [swapped[b - 1], swapped[a - 1]];

    const recomputed = recomputeFieldTimes(swapField, swapped, dayStart, dayEnd);
    const others = schedule.filter((m) => m.field !== swapField);
    const merged = [...others, ...recomputed].sort((x, y) => x.startTime - y.startTime || x.field.localeCompare(y.field));

    setSchedule(merged);
    setWarnings(validateConflicts(merged, dayStart, dayEnd));
    toast(`Swapped ${swapField} game ${a} with ${b}`);
  };

  /* move between fields */
  const moveBetweenFields = () => {
    const fromPos = parseInt(moveFromPos, 10);
    const toPos = moveToPos === "" ? null : parseInt(moveToPos, 10);
    if (!fromPos || moveFromField === moveToField) return;

    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);

    const fromList = fieldList(moveFromField);
    const toList = fieldList(moveToField);
    if (fromPos < 1 || fromPos > fromList.length) return;

    const [item] = fromList.splice(fromPos - 1, 1);

    // Guard: field policy
    const allowed = effectiveAllowedFields(item.age);
    if (!allowed.includes(moveToField)) {
      toast(`${item.age} not allowed on ${moveToField}. Change Requests → Fields to allow.`);
      return;
    }

    if (toPos === null || toPos > toList.length) toList.push(item);
    else toList.splice(Math.max(0, toPos - 1), 0, item);

    const recFrom = recomputeFieldTimes(moveFromField, fromList, dayStart, dayEnd);
    const recTo   = recomputeFieldTimes(moveToField,   toList,   dayStart, dayEnd);

    const others = schedule.filter((m) => m.field !== moveFromField && m.field !== moveToField);
    const merged = [...others, ...recFrom, ...recTo].sort((x, y) => x.startTime - y.startTime || x.field.localeCompare(y.field));

    setSchedule(merged);
    setWarnings(validateConflicts(merged, dayStart, dayEnd));
    toast(`Moved ${item.age} from ${moveFromField}#${fromPos} → ${moveToField}${toPos?`#${toPos}`:" (end)"}`);
  };

  /* swap across fields */
  const swapAcrossFields = () => {
    const aPos = parseInt(moveFromPos, 10);
    const bPos = moveToPos === "" ? null : parseInt(moveToPos, 10);
    if (!aPos || !bPos) return;
    if (moveFromField === moveToField) return;

    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);

    const listA = fieldList(moveFromField);
    const listB = fieldList(moveToField);
    if (aPos < 1 || aPos > listA.length || bPos < 1 || bPos > listB.length) return;

    const itemA = listA[aPos - 1];
    const itemB = listB[bPos - 1];

    if (!effectiveAllowedFields(itemA.age).includes(moveToField)) {
      toast(`${itemA.age} not allowed on ${moveToField}. Change Requests → Fields to allow.`);
      return;
    }
    if (!effectiveAllowedFields(itemB.age).includes(moveFromField)) {
      toast(`${itemB.age} not allowed on ${moveFromField}. Change Requests → Fields to allow.`);
      return;
    }

    listA[aPos - 1] = { ...itemB };
    listB[bPos - 1] = { ...itemA };

    const recA = recomputeFieldTimes(moveFromField, listA, dayStart, dayEnd);
    const recB = recomputeFieldTimes(moveToField,   listB, dayStart, dayEnd);

    const others = schedule.filter((m) => m.field !== moveFromField && m.field !== moveToField);
    const merged = [...others, ...recA, ...recB].sort((x, y) => x.startTime - y.startTime || x.field.localeCompare(y.field));

    setSchedule(merged);
    setWarnings(validateConflicts(merged, dayStart, dayEnd));
    toast(`Swapped ${moveFromField}#${aPos} ↔ ${moveToField}#${bPos}`);
  };

  /* apply rules/requests & recompute */
  const applyRulesAndRecompute = () => {
    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);
    const out = [];
    for (const f of FIELDS) {
      out.push(...recomputeFieldTimes(f, fieldList(f), dayStart, dayEnd));
    }
    out.sort((a, b) => a.startTime - b.startTime || a.field.localeCompare(b.field));
    setSchedule(out);
    setWarnings(validateConflicts(out, dayStart, dayEnd));
    toast("Applied changes & recomputed times");
  };

  /* UI */
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Rugby Hosting Day Scheduler</h1>
      {message ? <div style={s.success}>✅ {message}</div> : null}

      {/* Header + save/load/print */}
      <div className="no-print" style={s.card}>
        <div style={s.label}>Print Header</div>
        <div style={s.row}>
          <input placeholder="Host/Club name" value={hostName} onChange={(e) => setHostName(e.target.value)} style={{ ...s.input, minWidth: 260 }} />
          <input placeholder="Logo URL (e.g. /logo.png)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ ...s.input, minWidth: 260 }} />
          <button onClick={saveConfig} style={s.btnGray}>Save</button>
          <button onClick={loadConfig} style={s.btnGray}>Load</button>
          <button onClick={clearSaved} style={s.btnGray}>Clear Saved</button>
          <button onClick={() => window.print()} style={s.btnGray}>Print</button>
        </div>
      </div>

      <div className="no-print" style={s.grid2}>
        <div>
          {/* Add clubs/teams */}
          <div style={s.row}>
            <input placeholder="New Club Name" value={newClubName} onChange={(e) => setNewClubName(e.target.value)} style={s.input} />
            <button onClick={addClub} style={s.btn}>Add Club</button>

            <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} style={s.select}>
              {clubs.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>

            <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} style={s.select}>
              {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
            </select>

            <input type="number" min="1" value={teamCount} onChange={(e) => setTeamCount(Number(e.target.value))} style={s.number} />
            <button onClick={addTeamToClub} style={s.btnGreen}>Add Teams</button>
          </div>

          {/* Clubs listing with caps */}
          <div style={s.card}>
            <div style={s.label}>Current Clubs & Teams (requested games / team & per-team caps)</div>
            <ul style={{ marginTop: 6 }}>
              {clubs.map((club) => (
                <li key={club.name} style={{ marginTop: 6 }}>
                  <b>{club.name}</b>{" "}
                  {club.name !== "Centurion Youth Rugby Club" && (
                    <button onClick={() => removeClub(club.name)} style={{ ...s.btnGray, padding: "2px 8px", marginLeft: 6 }}>Remove Club</button>
                  )}
                  <ul style={{ marginTop: 4, marginLeft: 14 }}>
                    {Object.keys(club.teams || {}).length === 0 ? (
                      <li style={{ color: "#6b7280", fontStyle: "italic" }}>No teams added yet</li>
                    ) : (
                      Object.entries(club.teams).map(([age, raw]) => {
                        const entry = normalizeEntry(raw);
                        const total = matchDuration(age);
                        return (
                          <li key={age} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span>{age}: {entry.count} team(s)</span>
                            <input type="number" min="0" placeholder="requested games / team" value={entry.desired}
                                   onChange={(e) => setDesiredFor(club.name, age, e.target.value)} style={{ ...s.input, width: 190 }} />
                            <input placeholder="Per-team caps (e.g. 2,1,1)" value={entry.perTeamCaps}
                                   onChange={(e) => setPerTeamCapsFor(club.name, age, e.target.value)} style={{ ...s.input, width: 190 }} />
                            <span style={{ fontSize: 12, color: "#374151" }}>match time: {total}m</span>
                            <button onClick={() => removeAgeFromClub(club.name, age)} style={{ ...s.btnGray, padding: "2px 8px" }}>✕</button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Window + generate + exports */}
          <div style={s.card}>
            <div style={s.label}>Match Day Window</div>
            <div style={{ ...s.row, marginTop: 6 }}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={s.input} />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={s.input} />
              <button onClick={generateSchedule} style={s.btn}>Generate Schedule</button>
              <button onClick={exportXLSX} style={s.btnGray}>Export Excel (XLSX)</button>
              <button onClick={exportExcelWithLogo} style={s.btnGray}>Export Excel (Logo)</button>
              {schedule.length > 0 ? <span style={{ fontSize: 12, color: "#065f46" }}>Total Matches: {schedule.length}</span> : null}
            </div>
          </div>

          {/* Swap within field */}
          <div style={s.card}>
            <div style={s.label}>Swap Matches (within a field)</div>
            <div style={s.row}>
              <select value={swapField} onChange={(e) => setSwapField(e.target.value)} style={s.select}>
                {FIELDS.map((f) => <option key={f}>{f}</option>)}
              </select>
              <input type="number" min="1" placeholder="Pos A" value={swapA} onChange={(e) => setSwapA(e.target.value)} style={s.number} />
              <input type="number" min="1" placeholder="Pos B" value={swapB} onChange={(e) => setSwapB(e.target.value)} style={s.number} />
              <button onClick={swapOnField} style={s.btn}>Swap</button>
            </div>
            <FieldTable field={swapField} data={fieldList(swapField)} />
          </div>

          {/* Move / Swap between fields */}
          <div style={s.card}>
            <div style={s.label}>Move / Swap Between Fields</div>
            <div style={s.row}>
              <select value={moveFromField} onChange={(e) => setMoveFromField(e.target.value)} style={s.select}>
                {FIELDS.map((f) => <option key={f}>{f}</option>)}
              </select>
              <input type="number" min="1" placeholder="From Pos" value={moveFromPos} onChange={(e) => setMoveFromPos(e.target.value)} style={s.number} />
              <select value={moveToField} onChange={(e) => setMoveToField(e.target.value)} style={s.select}>
                {FIELDS.map((f) => <option key={f}>{f}</option>)}
              </select>
              <input type="number" min="1" placeholder="To Pos (blank=end)" value={moveToPos} onChange={(e) => setMoveToPos(e.target.value)} style={s.number} />
              <button onClick={moveBetweenFields} style={s.btn}>Move</button>
              <button onClick={swapAcrossFields} style={s.btnGray} title="Swap FromPos with ToPos across fields">Swap Across</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><b>{moveFromField}</b><FieldTable field={moveFromField} data={fieldList(moveFromField)} /></div>
              <div><b>{moveToField}</b><FieldTable field={moveToField} data={fieldList(moveToField)} /></div>
            </div>
            {warnings.length > 0 && (
              <div style={s.warn}>
                <b>Warnings:</b>
                <ul style={{ marginTop: 4 }}>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Requests + Editable age rules */}
        <div>
          <div style={s.card}>
            <div style={s.label}>Requests / Constraints (per age)</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Age</th>
                  <th style={s.th}>Priority</th>
                  <th style={s.th}>Earliest Start</th>
                  <th style={s.th}>Latest End</th>
                  <th style={s.th}>Fields</th>
                </tr>
              </thead>
              <tbody>
                {AGE_GROUPS.map((age) => (
                  <tr key={age}>
                    <td style={s.td}><b>{age}</b></td>
                    <td style={s.td}>
                      <input type="checkbox"
                        checked={!!requests[age]?.priority}
                        onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], priority: e.target.checked } }))}
                      />
                    </td>
                    <td style={s.td}>
                      <input placeholder="HH:MM" value={requests[age]?.earliestStart || ""}
                        onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], earliestStart: e.target.value } }))}
                        style={{ ...s.input, width: 100 }} />
                    </td>
                    <td style={s.td}>
                      <input placeholder="HH:MM" value={requests[age]?.latestEnd || ""}
                        onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], latestEnd: e.target.value } }))}
                        style={{ ...s.input, width: 100 }} />
                    </td>
                    <td style={s.td}>
                      <select value={requests[age]?.fields || "default"}
                        onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], fields: e.target.value } }))}
                        style={s.select}>
                        <option value="default">Default</option>
                        <option value="A_ONLY">A only</option>
                        <option value="B_ONLY">B only</option>
                        <option value="ANY">A & B</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={applyRulesAndRecompute} style={s.btnGreen}>Apply Requests & Recompute</button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.label}>Age Group Rules (editable)</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Age</th><th style={s.th}>Halves</th><th style={s.th}>Half (min)</th><th style={s.th}>Halftime (min)</th><th style={s.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {AGE_GROUPS.map((age) => {
                  const r = ageRules[age];
                  const total = r.halves * r.halfDuration + r.halftime;
                  return (
                    <tr key={age}>
                      <td style={s.td}><b>{age}</b></td>
                      <td style={s.td}><input type="number" min="1" value={r.halves}
                        onChange={(e) => setAgeRules((p) => ({ ...p, [age]: { ...p[age], halves: Math.max(1, Number(e.target.value||1)) } }))} style={s.number}/></td>
                      <td style={s.td}><input type="number" min="1" value={r.halfDuration}
                        onChange={(e) => setAgeRules((p) => ({ ...p, [age]: { ...p[age], halfDuration: Math.max(1, Number(e.target.value||1)) } }))} style={s.number}/></td>
                      <td style={s.td}><input type="number" min="0" value={r.halftime}
                        onChange={(e) => setAgeRules((p) => ({ ...p, [age]: { ...p[age], halftime: Math.max(0, Number(e.target.value||0)) } }))} style={s.number}/></td>
                      <td style={s.td}>{total}m</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={applyRulesAndRecompute} style={s.btnGreen}>Apply Rules & Recompute</button>
              <button onClick={() => setAgeRules(BASE_RULES)} style={s.btnGray}>Reset to Defaults</button>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>Recompute keeps order per field; only times change.</div>
          </div>
        </div>
      </div>

      {/* On-screen schedule */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        {schedule.map((m, i) => (
          <div key={i} style={s.card}>
            <div style={{ fontWeight: 700 }}>{m.age} | {m.teamA.name} vs {m.teamB.name}</div>
            <div>{m.field}</div>
            <div>{format(m.startTime, "HH:mm")} – {format(m.endTime, "HH:mm")}</div>
          </div>
        ))}
      </div>

      {/* Footer summary + credit + warnings */}
      {useMemo(() => {
        if (!schedule.length) return null;
        const lastEnd = schedule.reduce((max, m) => (m.endTime > max ? m.endTime : max), schedule[0].endTime);
        const counts = FIELDS.map((f) => `${f}: ${schedule.filter((m) => m.field === f).length}`).join(" | ");
        return (
          <div className="no-print" style={s.footer}>
            <div><b>Last match ends:</b> {format(lastEnd, "HH:mm")}</div>
            <div><b>Total matches:</b> {schedule.length}</div>
            <div><b>Per field:</b> {counts}</div>
            {warnings.length > 0 && (
              <div style={{ ...s.warn, marginTop: 8 }}>
                <b>Warnings:</b>
                <ul style={{ marginTop: 4 }}>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
            <div style={s.devCredit}>Developer N. van Rooyen</div>
          </div>
        );
      }, [schedule, warnings])}

      {/* Print pages */}
      <div className="print-only">
        {FIELDS.map((f) => (
          <div key={f} className="page">
            <div className="print-header">
              <div className="print-brand">
                {logoUrl ? <img src={logoUrl} alt="Logo" /> : null}
                <div className="print-host">{hostName}</div>
              </div>
              <div style={{ fontSize: "12pt" }}>{f}</div>
            </div>
            <h2 className="print-h2">Schedule — {f}</h2>
            {schedule.filter((m) => m.field === f).length === 0 && <div>No matches scheduled on {f}.</div>}
            {schedule.filter((m) => m.field === f).map((m, i) => (
              <div key={i} className="print-card">
                <div className="print-h4">{format(m.startTime, "HH:mm")} – {format(m.endTime, "HH:mm")} | {m.age}</div>
                <div>{m.teamA.name} vs {m.teamB.name}</div>
              </div>
            ))}
            <div className="print-footer">Developer N. van Rooyen</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* small field table */
function FieldTable({ field, data }) {
  const sTable = {
    width: "100%", borderCollapse: "collapse", marginTop: 8,
    th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "6px 4px", fontSize: 12, color: "#374151" },
    td: { borderBottom: "1px solid #f1f5f9", padding: "6px 4px", fontSize: 13 }
  };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <thead>
        <tr><th style={s.th}>#</th><th style={s.th}>Time</th><th style={s.th}>Age</th><th style={s.th}>Teams</th></tr>
      </thead>
      <tbody>
        {data.map((m, idx) => (
          <tr key={`${field}-${idx}`}>
            <td style={s.td}>{idx + 1}</td>
            <td style={s.td}>{format(m.startTime, "HH:mm")}–{format(m.endTime, "HH:mm")}</td>
            <td style={s.td}>{m.age}</td>
            <td style={s.td}>{m.teamA.name} vs {m.teamB.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
