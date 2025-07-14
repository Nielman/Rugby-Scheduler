
// Full working app directly embedded in index.js
import React, { useState } from "react";
import { format, addMinutes } from "date-fns";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

const AGE_GROUPS = ["U8", "U9", "U10", "U11", "U12", "U13"];
const AGE_COLORS = {
  U8: "bg-green-100",
  U9: "bg-yellow-100",
  U10: "bg-blue-100",
  U11: "bg-purple-100",
  U12: "bg-pink-100",
  U13: "bg-red-100",
};
const AGE_RULES = {
  U8: { halves: 2, halfDuration: 15, break: 5 },
  U9: { halves: 2, halfDuration: 20, break: 5 },
  U10: { halves: 2, halfDuration: 20, break: 5 },
  U11: { halves: 2, halfDuration: 20, break: 5 },
  U12: { halves: 2, halfDuration: 20, break: 5 },
  U13: { halves: 2, halfDuration: 25, break: 5 },
};
const FIELD_NAMES = ["Field A", "Field B"];
const BETWEEN_MATCHES_BREAK = 7;

export default function Home() {
  const [clubs, setClubs] = useState([{ name: "Centurion Youth Rugby Club", teams: {} }]);
  const [newClubName, setNewClubName] = useState("");
  const [selectedClub, setSelectedClub] = useState("Centurion Youth Rugby Club");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("U13");
  const [teamCount, setTeamCount] = useState(1);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [schedule, setSchedule] = useState([]);

  const addClub = () => {
    if (!newClubName.trim() || clubs.find((c) => c.name === newClubName)) return;
    const newClubs = [...clubs, { name: newClubName, teams: {} }];
    setClubs(newClubs);
    setSelectedClub(newClubName);
    setNewClubName("");
  };

  const addTeamToClub = () => {
    if (!selectedClub || teamCount <= 0) return;
    const updated = clubs.map((club) => {
      if (club.name === selectedClub) {
        const prev = club.teams[selectedAgeGroup] || 0;
        return { ...club, teams: { ...club.teams, [selectedAgeGroup]: prev + teamCount } };
      }
      return club;
    });
    setClubs([...updated]);
  };

  const getMatchDuration = (age) => {
    const rule = AGE_RULES[age];
    return rule.halves * rule.halfDuration + rule.break + BETWEEN_MATCHES_BREAK;
  };

  const generateSchedule = () => {
    const matches = [];
    AGE_GROUPS.forEach((age) => {
      const allTeams = [];
      clubs.forEach((club) => {
        const count = club.teams[age] || 0;
        for (let i = 0; i < count; i++) {
          allTeams.push({ name: `${club.name} ${age} #${i + 1}`, club: club.name, age });
        }
      });
      for (let i = 0; i < allTeams.length; i++) {
        for (let j = i + 1; j < allTeams.length; j++) {
          if (allTeams[i].club !== allTeams[j].club) {
            matches.push({
              age,
              teamA: allTeams[i],
              teamB: allTeams[j],
              duration: getMatchDuration(age),
            });
          }
        }
      }
    });

    const shuffled = matches.sort(() => Math.random() - 0.5);
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const fieldTimes = FIELD_NAMES.map(() => new Date(start));
    const scheduled = [];

    for (const match of shuffled) {
      for (let f = 0; f < FIELD_NAMES.length; f++) {
        const ft = fieldTimes[f];
        const conflict = scheduled.some((m) =>
          m.age === match.age &&
          m.age === "U13" &&
          (m.teamA.club === match.teamA.club || m.teamB.club === match.teamA.club) &&
          format(m.startTime, "HH:mm") === format(ft, "HH:mm")
        );

        const matchEnd = addMinutes(ft, match.duration);
        if (!conflict && matchEnd <= end) {
          scheduled.push({
            ...match,
            field: FIELD_NAMES[f],
            startTime: new Date(ft),
            endTime: matchEnd,
          });
          fieldTimes[f] = addMinutes(matchEnd, 7);
          break;
        }
      }
    }

    setSchedule(scheduled);
  };

  const exportCSV = () => {
    const headers = ["Field", "Age Group", "Start Time", "End Time", "Team A", "Team B"];
    const rows = schedule.map((m) => [
      m.field,
      m.age,
      format(m.startTime, "HH:mm"),
      format(m.endTime, "HH:mm"),
      m.teamA.name,
      m.teamB.name,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "match_schedule.csv");
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rugby Hosting Day Scheduler</h1>

      <div className="flex gap-2 flex-wrap">
        <Input placeholder="New Club Name" value={newClubName} onChange={(e) => setNewClubName(e.target.value)} />
        <Button onClick={addClub}>Add Club</Button>
        <select className="border p-2 rounded-xl" value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)}>
          {clubs.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
        <select className="border p-2 rounded-xl" value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)}>
          {AGE_GROUPS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <Input type="number" min="1" className="w-20" value={teamCount} onChange={(e) => setTeamCount(+e.target.value)} />
        <Button onClick={addTeamToClub}>Add Teams</Button>
      </div>

      <div className="flex gap-4">
        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <Button onClick={generateSchedule}>Generate Schedule</Button>
        <Button onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <p><span className="inline-block w-4 h-4 bg-green-100 border rounded mr-1"></span>U8 = 15m halves</p>
        <p><span className="inline-block w-4 h-4 bg-yellow-100 border rounded mr-1"></span>U9 = 20m halves</p>
        <p><span className="inline-block w-4 h-4 bg-blue-100 border rounded mr-1"></span>U10 = 20m halves</p>
        <p><span className="inline-block w-4 h-4 bg-purple-100 border rounded mr-1"></span>U11 = 20m halves</p>
        <p><span className="inline-block w-4 h-4 bg-pink-100 border rounded mr-1"></span>U12 = 20m halves</p>
        <p><span className="inline-block w-4 h-4 bg-red-100 border rounded mr-1"></span>U13 = 25m halves</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((match, idx) => (
          <Card key={idx}>
            <CardContent className={`p-4 ${AGE_COLORS[match.age]}`}>
              <p className="font-bold">{match.age} | {match.teamA.name} vs {match.teamB.name}</p>
              <p>{match.field}</p>
              <p>{format(match.startTime, "HH:mm")} - {format(match.endTime, "HH:mm")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
