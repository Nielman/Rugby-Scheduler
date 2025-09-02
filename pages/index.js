import React, { useEffect, useMemo, useState } from "react";
import { addMinutes, format } from "date-fns";

/* -------------------- BASE RULES (defaults) -------------------- */
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

// Defaults: U14–U18 only after 13:00; U13–U18 on Field A only (can be overridden by Requests)
const AFTERNOON_ONLY = new Set(["U14","U15","U16","U18"]);
const AGES_A_ONLY    = new Set(["U13","U14","U15","U16","U18"]);
const AFTERNOON_START_STR = "13:00";

/* -------------------- STYLES -------------------- */
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
  grid2: { display: "grid", gridTemplateColumns: "1fr 420px", gap: 16, alignItems: "start" },
  card: { border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#f9fafb" },
  label: { fontSize: 12, color: "#374151" },
  success: { color: "#16a34a", fontWeight: 600, marginTop: 4, marginBottom: 6 },
  warn: { color: "#b91c1c", fontSize: 13, marginTop: 6 },
  footer: { marginTop: 12, padding: 10, background: "#f1f5f9", borderRadius: 8, fontSize: 14 },
  devCredit: { marginTop: 6, fontSize: 12, color: "#475569", textAlign: "right" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 8 },
  th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: "6px 4px", fontSize: 12, color: "#374151" },
  td: { borderBottom: "1px solid #f1f5f9", padding: "6px 4px", fontSize: 13 }
};

/* -------------------- COMPONENT -------------------- */
export default function Home() {
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

  // Swap UI + warnings
  const [swapField, setSwapField] = useState("Field A");
  const [swapA, setSwapA] = useState("");
  const [swapB, setSwapB] = useState("");
  const [warnings, setWarnings] = useState([]);

  // Requests/Constraints per age
  // fields: DEFAULT | A_ONLY | B_ONLY | A_B
  const [requests, setRequests] = useState({}); 

  // ---------- persistence ----------
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
      if (data?.requests) setRequests(data.requests);
      setSelectedClub((data?.clubs?.[0]?.name) || "Centurion Youth Rugby Club");
    } catch {}
  }, []);

  const saveConfig = () => {
    const data = { clubs, startTime, endTime, hostName, logoUrl, ageRules, requests };
    localStorage.setItem("rugbySchedulerConfig", JSON.stringify(data));
    setMessage("Config saved"); setTimeout(() => setMessage(""), 1500);
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
      if (data?.requests) setRequests(data.requests);
      setSelectedClub((data?.clubs?.[0]?.name) || "Centurion Youth Rugby Club");
      setMessage("Config loaded"); setTimeout(() => setMessage(""), 1500);
    } catch {}
  };
  const clearSaved = () => {
    localStorage.removeItem("rugbySchedulerConfig");
    setMessage("Saved config cleared"); setTimeout(() => setMessage(""), 1500);
  };

  // ---------- clubs/teams & caps ----------
  const normalizeEntry = (raw) => {
    if (raw == null) return { count: 0, desired: "", caps: "" };
    if (typeof raw === "number") return { count: raw, desired: "", caps: "" };
    return {
      count: Number(raw?.count ?? 0),
      desired: raw?.desired ?? "",
      caps: raw?.caps ?? ""
    };
  };

  const setDesiredFor = (clubName, age, desired) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== clubName) return c;
        const nt = { ...(c.teams || {}) };
        const entry = normalizeEntry(nt[age]);
        nt[age] = { ...entry, desired };
        return { ...c, teams: nt };
      })
    );
  };

  const setCapsFor = (clubName, age, caps) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== clubName) return c;
        const nt = { ...(c.teams || {}) };
        const entry = normalizeEntry(nt[age]);
        nt[age] = { ...entry, caps };
        return { ...c, teams: nt };
      })
    );
  };

  const matchDuration = (age) => {
    const r = ageRules[age];
    return r.halves * r.halfDuration + r.halftime;
  };

  const addClub = () => {
    const name = newClubName.trim();
    if (!name || clubs.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setClubs((prev) => [...prev, { name, teams: {} }]);
    setSelectedClub(name);
    setNewClubName("");
  };

  const addTeamToClub = () => {
    if (!selectedClub || teamCount <= 0) return;
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== selectedClub) return c;
        const nt = { ...(c.teams || {}) };
        const entry = normalizeEntry(nt[selectedAgeGroup]);
        nt[selectedAgeGroup] = { ...entry, count: entry.count + Number(teamCount) };
        return { ...c, teams: nt };
      })
    );
    setMessage(`${teamCount} ${selectedAgeGroup} team(s) added to ${selectedClub}`);
    setTimeout(() => setMessage(""), 2000);
  };

  const removeClub = (clubName) => {
    setClubs((prev) => prev.filter((c) => c.name !== clubName));
    if (selectedClub === clubName) setSelectedClub("Centurion Youth Rugby Club");
  };

  const removeAgeFromClub = (clubName, age) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== clubName) return c;
        const nt = { ...(c.teams || {}) };
        delete nt[age];
        return { ...c, teams: nt };
      })
    );
  };

  // ---------- Requests helpers ----------
  const getAllowedFieldsForAge = (age) => {
    const req = requests[age] || {};
    const policy = req.fieldPolicy || "DEFAULT";
    if (policy === "A_ONLY") return ["Field A"];
    if (policy === "B_ONLY") return ["Field B"];
    if (policy === "A_B")    return FIELDS.slice();
    // default policy
    return AGES_A_ONLY.has(age) ? ["Field A"] : FIELDS.slice();
  };

  const getEarliestStartForAge = (age, dayStart) => {
    const req = requests[age] || {};
    if (req.earliestStart && req.earliestStart.length === 5) {
      return new Date(`1970-01-01T${req.earliestStart}:00`);
    }
    // default earliest for afternoon-only ages
    if (AFTERNOON_ONLY.has(age)) return new Date(`1970-01-01T${AFTERNOON_START_STR}:00`);
    return new Date(dayStart);
  };

  const getLatestEndForAge = (age, dayEnd) => {
    const req = requests[age] || {};
    if (req.latestEnd && req.latestEnd.length === 5) {
      return new Date(`1970-01-01T${req.latestEnd}:00`);
    }
    return new Date(dayEnd);
  };

  const isPriorityAge = (age) => !!(requests[age]?.priority);

  // ---------- build pairings ----------
  const buildMatches = () => {
    const matches = [];
    Object.keys(ageRules).forEach((age) => {
      const allTeams = [];
      clubs.forEach((club) => {
        const entry = normalizeEntry(club.teams?.[age]);
        for (let i = 0; i < (entry.count || 0); i++) {
          allTeams.push({ name: `${club.name} ${age} #${i + 1}`, club: club.name, age });
        }
      });
      for (let i = 0; i < allTeams.length; i++) {
        for (let j = i + 1; j < allTeams.length; j++) {
          if (allTeams[i].club !== allTeams[j].club) {
            matches.push({ age, teamA: allTeams[i], teamB: allTeams[j], duration: matchDuration(age) });
          }
        }
      }
    });
    // shuffle
    for (let i = matches.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1));
      [matches[i], matches[k]] = [matches[k], matches[i]];
    }
    // priority ages first
    matches.sort((a, b) => Number(isPriorityAge(b.age)) - Number(isPriorityAge(a.age)));
    return matches;
  };

  // helper: clash same age + same hh:mm + overlapping club
  const parallelSameClub = (list, candidateStart, age, clubsToCheck) =>
    list.some(
      (x) =>
        x.age === age &&
        format(x.startTime, "HH:mm") === format(candidateStart, "HH:mm") &&
        (clubsToCheck.includes(x.teamA.club) || clubsToCheck.includes(x.teamB.club))
    );

  // ---------- generate schedule (with caps + requests) ----------
  const generateSchedule = () => {
    const matches = buildMatches();

    // build per-team desired caps (default + per-team caps list)
    const desiredCap = {};
    clubs.forEach((club) => {
      Object.keys(ageRules).forEach((age) => {
        const entry = normalizeEntry(club.teams?.[age]);
        const defaultCap = entry.desired === "" ? Infinity : Math.max(0, Number(entry.desired));
        const capsList = (entry.caps || "").split(",").map(x => x.trim()).filter(x => x.length>0).map(x => Number(x));
        for (let i = 0; i < (entry.count || 0); i++) {
          const perTeam = Number.isFinite(capsList[i]) ? Math.max(0, capsList[i]) : defaultCap;
          desiredCap[`${club.name} ${age} #${i + 1}`] = perTeam;
        }
      });
    });
    const gamesByTeam = {};

    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);
    const fieldTimes = { "Field A": new Date(dayStart), "Field B": new Date(dayStart) };
    const out = [];

    for (const m of matches) {
      const tA = m.teamA.name;
      const tB = m.teamB.name;
      const capA = desiredCap[tA] ?? Infinity;
      const capB = desiredCap[tB] ?? Infinity;
      if ((gamesByTeam[tA] || 0) >= capA || (gamesByTeam[tB] || 0) >= capB) continue;

      const allowedFields = getAllowedFieldsForAge(m.age);
      const earliestStart = getEarliestStartForAge(m.age, dayStart);
      const latestEnd = getLatestEndForAge(m.age, dayEnd);

      const candidates = allowedFields.map((f) => {
        let start = new Date(fieldTimes[f]);
        if (start < earliestStart) start = new Date(earliestStart);
        const end = addMinutes(start, matchDuration(m.age));
        const parallelConflict = parallelSameClub(out, start, m.age, [m.teamA.club, m.teamB.club]);
        const fits = end <= latestEnd && end <= dayEnd && !parallelConflict;
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

  // ---------- export XLSX (per field) ----------
  const exportXLSX = async () => {
    if (!schedule.length) return;
    const XLSX = await import("xlsx");
    const headers = ["Field", "Age Group", "Start Time", "End Time", "Team A", "Team B"];

    const wb = XLSX.utils.book_new();
    for (const f of FIELDS) {
      const rows = schedule
        .filter((m) => m.field === f)
        .sort((a, b) => a.startTime - b.startTime)
        .map((m) => [
          m.field, m.age, format(m.startTime, "HH:mm"), format(m.endTime, "HH:mm"), m.teamA.name, m.teamB.name
        ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, ws, f.replace(" ", "_"));
    }
    XLSX.writeFile(wb, "match_schedule.xlsx");
  };

  // ---------- export Excel with logo via ExcelJS ----------
  const exportExcelLogo = async () => {
    if (!schedule.length) return;
    const ExcelJS = (await import("exceljs")).default || (await import("exceljs"));
    const wb = new ExcelJS.Workbook();
    const fetchImage = async (url) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const buf = await blob.arrayBuffer();
        return Buffer.from(buf);
      } catch { return null; }
    };
    const headers = ["Field", "Age Group", "Start Time", "End Time", "Team A", "Team B"];
    for (const f of FIELDS) {
      const ws = wb.addWorksheet(f.replace(" ", "_"));
      let rowIdx = 1;
      // Logo
      if (logoUrl) {
        const imgBuf = await fetchImage(logoUrl);
        if (imgBuf) {
          const imageId = wb.addImage({ buffer: imgBuf, extension: logoUrl.toLowerCase().endsWith(".jpg") || logoUrl.toLowerCase().endsWith(".jpeg") ? "jpeg" : "png" });
          ws.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 220, height: 60 } });
          rowIdx = 5;
        }
      }
      // Title
      ws.mergeCells(rowIdx,1,rowIdx,6);
      ws.getCell(rowIdx,1).value = `${hostName} — ${f}`;
      ws.getCell(rowIdx,1).font = { bold: true, size: 14 };
      rowIdx += 2;
      // Headers
      ws.addRow(headers).font = { bold: true };
      // Rows
      schedule
        .filter((m) => m.field === f)
        .sort((a,b) => a.startTime - b.startTime)
        .forEach((m) => {
          ws.addRow([m.field, m.age, format(m.startTime,"HH:mm"), format(m.endTime,"HH:mm"), m.teamA.name, m.teamB.name]);
        });
      ws.columns = [
        { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 40 }, { width: 40 }
      ];
    }
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "match_schedule_with_logo.xlsx";
    a.click();
  };

  // ---------- swap & recompute respecting requests ----------
  const fieldList = (field) => schedule.filter((m) => m.field === field).sort((a, b) => a.startTime - b.startTime);

  const recomputeFieldTimes = (listForField, dayStart, dayEnd) => {
    let t = new Date(dayStart);
    const recomputed = [];
    for (const m of listForField) {
      const earliestStart = getEarliestStartForAge(m.age, dayStart);
      const latestEnd = getLatestEndForAge(m.age, dayEnd);
      if (t < earliestStart) t = new Date(earliestStart);
      const start = new Date(t);
      const end = addMinutes(start, matchDuration(m.age));
      // We don't drop matches here; warn later if > latestEnd
      recomputed.push({ ...m, startTime: start, endTime: end });
      t = addMinutes(end, BETWEEN_MATCHES_BREAK);
    }
    return recomputed;
  };

  const validateConflicts = (all, dayStart, dayEnd) => {
    const msgs = [];
    // parallel same-club
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        if (a.age !== b.age) continue;
        if (format(a.startTime, "HH:mm") !== format(b.startTime, "HH:mm")) continue;
        const clubs = [a.teamA.club, a.teamB.club];
        if (clubs.includes(b.teamA.club) || clubs.includes(b.teamB.club)) {
          msgs.push(`Parallel same-club conflict at ${format(a.startTime,"HH:mm")} for ${a.age} (${a.field} vs ${b.field}).`);
        }
      }
    }
    // field policy & time window checks
    for (const m of all) {
      const allowed = getAllowedFieldsForAge(m.age);
      if (!allowed.includes(m.field)) msgs.push(`${m.age} not allowed on ${m.field} (allowed: ${allowed.join(", ")}).`);
      const earliest = getEarliestStartForAge(m.age, dayStart);
      const latest = getLatestEndForAge(m.age, dayEnd);
      if (m.startTime < earliest) msgs.push(`${m.age} cannot start before ${format(earliest,"HH:mm")} (found ${format(m.startTime,"HH:mm")}).`);
      if (m.endTime > latest) msgs.push(`${m.age} should end by ${format(latest,"HH:mm")} (found ${format(m.endTime,"HH:mm")}).`);
    }
    return Array.from(new Set(msgs));
  };

  const swapOnField = () => {
    const a = parseInt(swapA, 10);
    const b = parseInt(swapB, 10);
    if (!a || !b || a === b) return;

    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);

    const list = fieldList(swapField);
    if (a < 1 || a > list.length || b < 1 || b > list.length) return;

    const swapped = [...list];
    [swapped[a - 1], swapped[b - 1]] = [swapped[b - 1], swapped[a - 1]];
    const recomputed = recomputeFieldTimes(swapped, dayStart, dayEnd);

    const others = schedule.filter((m) => m.field !== swapField);
    const merged = [...others, ...recomputed].sort((x, y) => x.startTime - y.startTime || x.field.localeCompare(y.field));
    setSchedule(merged);
    setWarnings(validateConflicts(merged, dayStart, dayEnd));
    setMessage(`Swapped ${swapField} game ${a} with ${b}`); setTimeout(() => setMessage(""), 1500);
  };

  const applyRulesAndRecompute = () => {
    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);
    const out = [];
    for (const f of FIELDS) out.push(...recomputeFieldTimes(fieldList(f), dayStart, dayEnd));
    out.sort((a, b) => a.startTime - b.startTime || a.field.localeCompare(b.field));
    setSchedule(out);
    setWarnings(validateConflicts(out, dayStart, dayEnd));
    setMessage("Applied changes & recomputed times"); setTimeout(() => setMessage(""), 1500);
  };

  const applyRequestsAndRecompute = applyRulesAndRecompute;

  /* -------------------- UI -------------------- */
  return (
    <div style={s.page}>
      <h1 style={s.h1}>Rugby Hosting Day Scheduler</h1>
      {message ? <div style={s.success}>✅ {message}</div> : null}

      {/* Print header + persistence */}
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

          {/* Clubs & Teams with per-team caps */}
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
                          <li key={age} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <span><b>{age}</b>: {entry.count} team(s)</span>
                            <input
                              type="number" min="0"
                              placeholder="requested games / team"
                              value={entry.desired}
                              onChange={(e) => setDesiredFor(club.name, age, e.target.value)}
                              style={{ ...s.input, width: 170 }}
                              title="Blank = unlimited; 0 = exclude all teams by default"
                            />
                            <input
                              type="text"
                              placeholder="Per-team caps e.g. 2,1,1"
                              value={entry.caps}
                              onChange={(e) => setCapsFor(club.name, age, e.target.value)}
                              style={{ ...s.input, width: 180 }}
                              title="Comma-separated caps by team index; blank entries use default cap"
                            />
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

          {/* Window + actions */}
          <div style={s.card}>
            <div style={s.label}>Match Day Window</div>
            <div style={{ ...s.row, marginTop: 6 }}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={s.input} />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={s.input} />
              <button onClick={generateSchedule} style={s.btn}>Generate Schedule</button>
              <button onClick={exportXLSX} style={s.btnGray}>Export Excel (XLSX)</button>
              <button onClick={exportExcelLogo} style={s.btnGray}>Export Excel (Logo)</button>
              {schedule.length > 0 ? <span style={{ fontSize: 12, color: "#065f46" }}>Total Matches: {schedule.length}</span> : null}
            </div>
          </div>

          {/* Swap */}
          <div style={s.card}>
            <div style={s.label}>Swap Matches on a Field (recomputes that field)</div>
            <div style={s.row}>
              <select value={swapField} onChange={(e) => setSwapField(e.target.value)} style={s.select}>
                {FIELDS.map((f) => <option key={f}>{f}</option>)}
              </select>
              <input type="number" min="1" placeholder="Pos A" value={swapA} onChange={(e) => setSwapA(e.target.value)} style={s.number} />
              <input type="number" min="1" placeholder="Pos B" value={swapB} onChange={(e) => setSwapB(e.target.value)} style={s.number} />
              <button onClick={swapOnField} style={s.btn}>Swap</button>
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th><th style={s.th}>Time</th><th style={s.th}>Age</th><th style={s.th}>Teams</th>
                </tr>
              </thead>
              <tbody>
                {fieldList(swapField).map((m, idx) => (
                  <tr key={m.teamA.name + m.teamB.name + idx}>
                    <td style={s.td}>{idx + 1}</td>
                    <td style={s.td}>{format(m.startTime, "HH:mm")}–{format(m.endTime, "HH:mm")}</td>
                    <td style={s.td}>{m.age}</td>
                    <td style={s.td}>{m.teamA.name} vs {m.teamB.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {warnings.length > 0 && (
              <div style={s.warn}>
                <b>Warnings:</b>
                <ul style={{ marginTop: 4 }}>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Age rules + Requests */}
        <div>
          <div style={s.card}>
            <div style={s.label}>Age Group Rules (editable)</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Age</th>
                  <th style={s.th}>Halves</th>
                  <th style={s.th}>Half (min)</th>
                  <th style={s.th}>Halftime (min)</th>
                  <th style={s.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {AGE_GROUPS.map((age) => {
                  const r = ageRules[age];
                  const total = r.halves * r.halfDuration + r.halftime;
                  return (
                    <tr key={age}>
                      <td style={s.td}><b>{age}</b></td>
                      <td style={s.td}>
                        <input type="number" min="1" value={r.halves}
                          onChange={(e) => setAgeRules((p) => ({ ...p, [age]: { ...p[age], halves: Math.max(1, Number(e.target.value||1)) } }))} style={s.number}/>
                      </td>
                      <td style={s.td}>
                        <input type="number" min="1" value={r.halfDuration}
                          onChange={(e) => setAgeRules((p) => ({ ...p, [age]: { ...p[age], halfDuration: Math.max(1, Number(e.target.value||1)) } }))} style={s.number}/>
                      </td>
                      <td style={s.td}>
                        <input type="number" min="0" value={r.halftime}
                          onChange={(e) => setAgeRules((p) => ({ ...p, [age]: { ...p[age], halftime: Math.max(0, Number(e.target.value||0)) } }))} style={s.number}/>
                      </td>
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
            <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
              Recompute keeps the same order per field; only times change.
            </div>
          </div>

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
                {AGE_GROUPS.map((age) => {
                  const r = requests[age] || {};
                  return (
                    <tr key={age}>
                      <td style={s.td}><b>{age}</b></td>
                      <td style={s.td}>
                        <input type="checkbox" checked={!!r.priority} onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], priority: e.target.checked } }))} />
                      </td>
                      <td style={s.td}>
                        <input type="time" value={r.earliestStart || ""} onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], earliestStart: e.target.value } }))} style={s.input} />
                      </td>
                      <td style={s.td}>
                        <input type="time" value={r.latestEnd || ""} onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], latestEnd: e.target.value } }))} style={s.input} />
                      </td>
                      <td style={s.td}>
                        <select value={r.fieldPolicy || "DEFAULT"} onChange={(e) => setRequests((p) => ({ ...p, [age]: { ...p[age], fieldPolicy: e.target.value } }))} style={s.select}>
                          <option value="DEFAULT">Default</option>
                          <option value="A_ONLY">A only</option>
                          <option value="B_ONLY">B only</option>
                          <option value="A_B">A & B</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={applyRequestsAndRecompute} style={s.btnGreen}>Apply Requests & Recompute</button>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
              Tip: Set U16 <i>Earliest Start</i> to move them earlier than 13:00; set <i>Latest End</i> to enforce finish-by time.
            </div>
          </div>
        </div>
      </div>

      {/* On-screen schedule */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        {schedule.map((m, i) => {
          const r = ageRules[m.age];
          const h = r.halfDuration, ht = r.halftime;
          const firstHalfEnd = addMinutes(m.startTime, h);
          const secondHalfStart = addMinutes(firstHalfEnd, ht);
          const secondHalfEnd = addMinutes(secondHalfStart, h);
          return (
            <div key={i} style={s.card}>
              <div style={{ fontWeight: 700 }}>{m.age} | {m.teamA.name} vs {m.teamB.name}</div>
              <div>{m.field}</div>
              <div>{format(m.startTime, "HH:mm")} – {format(m.endTime, "HH:mm")}</div>
              <div style={{ fontSize: 12, marginTop: 6, color: "#374151" }}>
                1st: {format(m.startTime, "HH:mm")}–{format(firstHalfEnd, "HH:mm")} •
                HT: {format(firstHalfEnd, "HH:mm")}–{format(secondHalfStart, "HH:mm")} •
                2nd: {format(secondHalfStart, "HH:mm")}–{format(secondHalfEnd, "HH:mm")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary + credit */}
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

      {/* Print-only pages */}
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
            {schedule.filter((m) => m.field === f).map((m, i) => {
              const r = ageRules[m.age];
              const h = r.halfDuration, ht = r.halftime;
              const firstHalfEnd = addMinutes(m.startTime, h);
              const secondHalfStart = addMinutes(firstHalfEnd, ht);
              const secondHalfEnd = addMinutes(secondHalfStart, h);
              return (
                <div key={i} className="print-card">
                  <div className="print-h4">{format(m.startTime, "HH:mm")} – {format(m.endTime, "HH:mm")} | {m.age}</div>
                  <div>{m.teamA.name} vs {m.teamB.name}</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    1st: {format(m.startTime, "HH:mm")}–{format(firstHalfEnd, "HH:mm")} • HT: {format(firstHalfEnd, "HH:mm")}–{format(secondHalfStart, "HH:mm")} • 2nd: {format(secondHalfStart, "HH:mm")}–{format(secondHalfEnd, "HH:mm")}
                  </div>
                </div>
              );
            })}
            <div className="print-footer">Developer N. van Rooyen</div>
          </div>
        ))}
      </div>
    </div>
  );
}