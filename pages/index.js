import React, { useEffect, useMemo, useState } from "react";
import { addMinutes, format } from "date-fns";

/* -------------------- CONFIG -------------------- */
const AGE_RULES = {
  U8:  { halves: 2, halfDuration: 15, halftime: 5 },
  U9:  { halves: 2, halfDuration: 20, halftime: 5 },
  U10: { halves: 2, halfDuration: 20, halftime: 5 },
  U11: { halves: 2, halfDuration: 20, halftime: 5 },
  U12: { halves: 2, halfDuration: 20, halftime: 5 },
  U13: { halves: 2, halfDuration: 25, halftime: 5 }
};
const AGE_GROUPS = Object.keys(AGE_RULES);
const FIELDS = ["Field A", "Field B"];
const BETWEEN_MATCHES_BREAK = 7; // only between matches

/* -------------------- STYLES -------------------- */
const s = {
  page: { padding: 16, fontFamily: "system-ui, Arial, sans-serif", lineHeight: 1.4 },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 },
  input: { border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px" },
  select: { border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px" },
  btn: { background: "#2563eb", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" },
  btnGreen: { background: "#16a34a", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" },
  btnGray: { background: "#6b7280", color: "#fff", border: 0, borderRadius: 6, padding: "8px 12px", cursor: "pointer" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" },
  card: { border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, background: "#f9fafb" },
  label: { fontSize: 12, color: "#374151" },
  success: { color: "#16a34a", fontWeight: 600, marginTop: 4, marginBottom: 6 },
  footer: { marginTop: 12, padding: 10, background: "#f1f5f9", borderRadius: 8, fontSize: 14 },
  devCredit: { marginTop: 6, fontSize: 12, color: "#475569", textAlign: "right" }
};

/* -------------------- COMPONENT -------------------- */
export default function Home() {
  const [clubs, setClubs] = useState([{ name: "Centurion Youth Rugby Club", teams: {} }]);
  const [newClubName, setNewClubName] = useState("");
  const [selectedClub, setSelectedClub] = useState("Centurion Youth Rugby Club");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("U13");
  const [teamCount, setTeamCount] = useState(1);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [schedule, setSchedule] = useState([]);
  const [message, setMessage] = useState("");

  // Print header settings
  const [hostName, setHostName] = useState("Centurion Youth Rugby Club");
  const [logoUrl, setLogoUrl] = useState("");

  /* -------- persistence: load on first render -------- */
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
      setSelectedClub((data?.clubs?.[0]?.name) || "Centurion Youth Rugby Club");
    } catch {}
  }, []);

  const saveConfig = () => {
    const data = { clubs, startTime, endTime, hostName, logoUrl };
    localStorage.setItem("rugbySchedulerConfig", JSON.stringify(data));
    setMessage("Config saved");
    setTimeout(() => setMessage(""), 1500);
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
      setSelectedClub((data?.clubs?.[0]?.name) || "Centurion Youth Rugby Club");
      setMessage("Config loaded");
      setTimeout(() => setMessage(""), 1500);
    } catch {}
  };
  const clearSaved = () => {
    localStorage.removeItem("rugbySchedulerConfig");
    setMessage("Saved config cleared");
    setTimeout(() => setMessage(""), 1500);
  };

  /* ------------- helpers ------------- */
  const matchDuration = (age) => {
    const r = AGE_RULES[age];
    return r.halves * r.halfDuration + r.halftime; // no 7 here
  };

  // input normalize: support old numeric value or object {count, desired}
  const normalizeEntry = (raw) => {
    if (typeof raw === "number") return { count: raw, desired: "" };
    return { count: Number(raw?.count || 0), desired: raw?.desired ?? "" };
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
        nt[selectedAgeGroup] = { count: (entry.count || 0) + Number(teamCount), desired: entry.desired };
        return { ...c, teams: nt };
      })
    );
    setMessage(`${teamCount} ${selectedAgeGroup} team(s) added to ${selectedClub}`);
    setTimeout(() => setMessage(""), 2000);
  };

  const setDesiredFor = (clubName, age, desired) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.name !== clubName) return c;
        const nt = { ...(c.teams || {}) };
        const entry = normalizeEntry(nt[age] || { count: 0, desired: "" });
        nt[age] = { count: entry.count, desired };
        return { ...c, teams: nt };
      })
    );
  };

  const removeClub = (clubName) => {
    setClubs((prev) => prev.filter((c) => c.name !== clubName));
    if (selectedClub === clubName) setSelectedClub(clubs[0]?.name || "Centurion Youth Rugby Club");
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

  /* ------------- build pairings ------------- */
  const buildMatches = () => {
    const matches = [];
    AGE_GROUPS.forEach((age) => {
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
    return matches;
  };

  /* ------------- schedule with field balancing + desired caps ------------- */
  const generateSchedule = () => {
    const matches = buildMatches();
    const dayStart = new Date(`1970-01-01T${startTime}:00`);
    const dayEnd = new Date(`1970-01-01T${endTime}:00`);
    const fieldTimes = { "Field A": new Date(dayStart), "Field B": new Date(dayStart) };
    const fieldCounts = { "Field A": 0, "Field B": 0 };
    const out = [];

    // build per-team desired caps
    const desiredCap = {};
    clubs.forEach((club) => {
      AGE_GROUPS.forEach((age) => {
        const entry = normalizeEntry(club.teams?.[age]);
        const desired = entry.desired === "" ? Infinity : Math.max(0, Number(entry.desired));
        for (let i = 0; i < (entry.count || 0); i++) {
          desiredCap[`${club.name} ${age} #${i + 1}`] = desired;
        }
      });
    });
    const gamesByTeam = {};

    const hasParallelSameClub = (candidateStart, age, clubsToCheck) =>
      out.some(
        (x) =>
          x.age === age &&
          format(x.startTime, "HH:mm") === format(candidateStart, "HH:mm") &&
          (clubsToCheck.includes(x.teamA.club) || clubsToCheck.includes(x.teamB.club))
      );

    for (const m of matches) {
      const tA = m.teamA.name;
      const tB = m.teamB.name;
      const capA = desiredCap[tA] ?? Infinity;
      const capB = desiredCap[tB] ?? Infinity;
      if ((gamesByTeam[tA] || 0) >= capA || (gamesByTeam[tB] || 0) >= capB) continue;

      const candidates = FIELDS.map((f) => {
        const start = new Date(fieldTimes[f]);
        const end = addMinutes(start, m.duration);
        const parallelConflict = hasParallelSameClub(start, m.age, [m.teamA.club, m.teamB.club]);
        const fits = end <= dayEnd && !parallelConflict;
        return { field: f, start, end, fits };
      });

      const valid = candidates.filter((c) => c.fits);
      if (!valid.length) continue;

      valid.sort((a, b) => {
        if (a.end.getTime() !== b.end.getTime()) return a.end - b.end;
        return fieldCounts[a.field] - fieldCounts[b.field];
      });

      const chosen = valid[0];

      out.push({ ...m, field: chosen.field, startTime: chosen.start, endTime: chosen.end });

      gamesByTeam[tA] = (gamesByTeam[tA] || 0) + 1;
      gamesByTeam[tB] = (gamesByTeam[tB] || 0) + 1;
      fieldTimes[chosen.field] = addMinutes(chosen.end, BETWEEN_MATCHES_BREAK);
      fieldCounts[chosen.field] += 1;
    }

    setSchedule(out);
  };

  /* ------------- export ------------- */
  const exportCSV = () => {
    if (!schedule.length) return;
    const headers = ["Field", "Age Group", "Start Time", "End Time", "Team A", "Team B"];
    const rows = schedule.map((m) => [
      m.field, m.age, format(m.startTime, "HH:mm"), format(m.endTime, "HH:mm"), m.teamA.name, m.teamB.name
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "match_schedule.csv"; a.click();
  };

  /* ------------- summaries ------------- */
  const summary = useMemo(() => {
    if (!schedule.length) return null;
    const lastEnd = schedule.reduce((max, m) => (m.endTime > max ? m.endTime : max), schedule[0].endTime);
    const perField = FIELDS.reduce((acc, f) => {
      acc[f] = schedule.filter((m) => m.field === f).length;
      return acc;
    }, {});
    return { lastEnd, perField, total: schedule.length };
  }, [schedule]);

  /* ------------- half calc ------------- */
  const halfs = (m) => {
    const r = AGE_RULES[m.age];
    const h = r.halfDuration, ht = r.halftime;
    const firstHalfEnd = addMinutes(m.startTime, h);
    const secondHalfStart = addMinutes(firstHalfEnd, ht);
    const secondHalfEnd = addMinutes(secondHalfStart, h);
    return { firstHalfEnd, secondHalfStart, secondHalfEnd };
  };

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Rugby Hosting Day Scheduler</h1>
      {message ? <div style={s.success}>✅ {message}</div> : null}

      {/* Print header settings + persistence */}
      <div className="no-print" style={s.card}>
        <div style={s.label}>Print Header</div>
        <div style={s.row}>
          <input
            placeholder="Host/Club name for print header"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            style={{ ...s.input, minWidth: 260 }}
          />
          <input
            placeholder="Logo URL (optional, e.g. /logo.png)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            style={{ ...s.input, minWidth: 260 }}
          />
          <button onClick={saveConfig} style={s.btnGray}>Save</button>
          <button onClick={loadConfig} style={s.btnGray}>Load</button>
          <button onClick={clearSaved} style={s.btnGray}>Clear Saved</button>
        </div>
      </div>

      <div className="no-print" style={s.grid2}>
        <div>
          <div style={s.row}>
            <input
              placeholder="New Club Name"
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              style={s.input}
            />
            <button onClick={addClub} style={s.btn}>Add Club</button>

            <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} style={s.select}>
              {clubs.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>

            <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} style={s.select}>
              {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
            </select>

            <input
              type="number" min="1"
              value={teamCount}
              onChange={(e) => setTeamCount(Number(e.target.value))}
              style={{ ...s.input, width: 80 }}
            />
            <button onClick={addTeamToClub} style={s.btnGreen}>Add Teams</button>
            <button onClick={() => window.print()} style={s.btnGray}>Print</button>
          </div>

          {/* Clubs & Teams with desired games per team */}
          <div style={s.card}>
            <div style={s.label}>Current Clubs & Teams (set requested games per team)</div>
            <ul style={{ marginTop: 6 }}>
              {clubs.map((club) => (
                <li key={club.name} style={{ marginTop: 6 }}>
                  <b>{club.name}</b>{" "}
                  {club.name !== "Centurion Youth Rugby Club" && (
                    <button
                      onClick={() => removeClub(club.name)}
                      style={{ ...s.btnGray, padding: "2px 8px", marginLeft: 6 }}
                      title="Remove club"
                    >
                      Remove Club
                    </button>
                  )}
                  <ul style={{ marginTop: 4, marginLeft: 14 }}>
                    {Object.keys(club.teams || {}).length === 0 ? (
                      <li style={{ color: "#6b7280", fontStyle: "italic" }}>No teams added yet</li>
                    ) : (
                      Object.entries(club.teams).map(([age, raw]) => {
                        const entry = normalizeEntry(raw);
                        return (
                          <li key={age} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span>{age}: {entry.count} team(s)</span>
                            <input
                              type="number" min="0"
                              placeholder="requested games / team"
                              value={entry.desired}
                              onChange={(e) => setDesiredFor(club.name, age, e.target.value)}
                              style={{ ...s.input, width: 190 }}
                              title="Leave blank for unlimited"
                            />
                            <span style={{ fontSize: 12, color: "#374151" }}>
                              match time: {matchDuration(age)}m
                            </span>
                            <button
                              onClick={() => removeAgeFromClub(club.name, age)}
                              style={{ ...s.btnGray, padding: "2px 8px" }}
                              title="Remove age group from this club"
                            >
                              ✕
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Match day + actions */}
          <div style={s.card}>
            <div style={s.label}>Match Day Window</div>
            <div style={{ ...s.row, marginTop: 6 }}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={s.input} />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={s.input} />
              <button onClick={generateSchedule} style={s.btn}>Generate Schedule</button>
              <button onClick={exportCSV} style={s.btnGray}>Export CSV</button>
              {schedule.length > 0 ? <span style={{ fontSize: 12, color: "#065f46" }}>Total Matches: {schedule.length}</span> : null}
            </div>
          </div>
        </div>

        <div>
          <div style={s.card}>
            <div style={s.label}>Age Group Rules (per match)</div>
            <ul style={{ marginTop: 6 }}>
              {AGE_GROUPS.map((age) => {
                const r = AGE_RULES[age];
                const total = matchDuration(age);
                return (
                  <li key={age}><b>{age}</b>: {r.halves} × {r.halfDuration}m + {r.halftime}m halftime = <b>{total}m</b></li>
                );
              })}
            </ul>
            <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
              + {BETWEEN_MATCHES_BREAK}m break between matches
            </div>
          </div>
        </div>
      </div>

      {/* On-screen schedule */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        {schedule.map((m, i) => {
          const r = AGE_RULES[m.age];
          const h = r.halfDuration;
          const ht = r.halftime;
          const firstHalfEnd = addMinutes(m.startTime, h);
          const secondHalfStart = addMinutes(firstHalfEnd, ht);
          const secondHalfEnd = addMinutes(secondHalfStart, h);
          return (
            <div key={i} style={s.card}>
              <div style={{ fontWeight: 700 }}>{m.age} | {m.teamA.name} vs {m.teamB.name}</div>
              <div>{m.field}</div>
              <div>{format(m.startTime, "HH:mm")} – {format(m.endTime, "HH:mm")}</div>
              <div style={{ fontSize: 12, marginTop: 6, color: "#374151" }}>
                1st: {format(m.startTime, "HH:mm")}–{format(firstHalfEnd, "HH:mm")}
                {" • "}HT: {format(firstHalfEnd, "HH:mm")}–{format(secondHalfStart, "HH:mm")}
                {" • "}2nd: {format(secondHalfStart, "HH:mm")}–{format(secondHalfEnd, "HH:mm")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen footer summary + credit */}
      {summary && (
        <div className="no-print" style={s.footer}>
          <div><b>Last match ends:</b> {format(summary.lastEnd, "HH:mm")}</div>
          <div><b>Total matches:</b> {summary.total}</div>
          <div><b>Per field:</b> {FIELDS.map((f) => `${f}: ${summary.perField[f]}`).join(" | ")}</div>
          <div style={s.devCredit}>Developer N. van Rooyen</div>
        </div>
      )}

      {/* Print-only pages with header + footer credit */}
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
              const r = AGE_RULES[m.age];
              const h = r.halfDuration;
              const ht = r.halftime;
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