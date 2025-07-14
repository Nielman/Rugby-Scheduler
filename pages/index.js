
import React, { useState } from "react";
import { format, addMinutes } from "date-fns";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

const AGE_GROUP_SETTINGS = {
  U8: { halves: 1, halfTime: 5, halfDuration: 15 },
  U9: { halves: 2, halfTime: 5, halfDuration: 20 },
  U10: { halves: 2, halfTime: 5, halfDuration: 20 },
  U11: { halves: 2, halfTime: 5, halfDuration: 20 },
  U12: { halves: 2, halfTime: 5, halfDuration: 20 },
  U13: { halves: 2, halfTime: 5, halfDuration: 25 },
};

const FIELD_NAMES = ["Field A", "Field B"];
const BETWEEN_MATCHES_BREAK = 7;

export default function Home() {
  const [clubs, setClubs] = useState([]);
  const [clubName, setClubName] = useState("");
  const [teamsPerAge, setTeamsPerAge] = useState({
    U8: 0, U9: 0, U10: 0, U11: 0, U12: 0, U13: 0,
  });
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [schedule, setSchedule] = useState([]);

  const handleAddClub = () => {
    if (!clubName.trim()) return;
    const name = clubName.trim();
    if (clubs.find((club) => club.name === name)) {
      alert("Club already added.");
      return;
    }
    setClubs([...clubs, { name, teams: { ...teamsPerAge } }]);
    setClubName("");
    setTeamsPerAge({ U8: 0, U9: 0, U10: 0, U11: 0, U12: 0, U13: 0 });
  };

  const generateSchedule = () => {
    const matches = [];

    Object.keys(AGE_GROUP_SETTINGS).forEach((age) => {
      const teams = [];
      clubs.forEach((club) => {
        for (let i = 0; i < club.teams[age]; i++) {
          teams.push({ club: club.name, age });
        }
      });
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          if (teams[i].club !== teams[j].club) {
            matches.push({
              age,
              teamA: teams[i],
              teamB: teams[j],
              duration:
                AGE_GROUP_SETTINGS[age].halves * AGE_GROUP_SETTINGS[age].halfDuration +
                (AGE_GROUP_SETTINGS[age].halves > 1 ? AGE_GROUP_SETTINGS[age].halfTime : 5) +
                BETWEEN_MATCHES_BREAK,
            });
          }
        }
      }
    });

    const randomized = matches.sort(() => Math.random() - 0.5);
    const scheduleResult = [];
    const fieldTimes = FIELD_NAMES.map(() => new Date(`1970-01-01T${startTime}:00`));

    for (const match of randomized) {
      let assigned = false;

      for (let f = 0; f < FIELD_NAMES.length; f++) {
        const lastMatch = scheduleResult.filter((m) => m.field === FIELD_NAMES[f]).slice(-1)[0];
        const canSchedule = !lastMatch ||
          format(fieldTimes[f], "HH:mm") >= format(lastMatch.endTime, "HH:mm");

        const sameClubPlaying = scheduleResult.some(
          (m) =>
            m.age === "U13" &&
            (m.teamA.club === match.teamA.club || m.teamB.club === match.teamA.club) &&
            format(m.startTime, "HH:mm") === format(fieldTimes[f], "HH:mm")
        );

        if (canSchedule && (!sameClubPlaying || match.age !== "U13")) {
          const start = new Date(fieldTimes[f]);
          const end = addMinutes(start, match.duration);
          scheduleResult.push({ ...match, startTime: start, endTime: end, field: FIELD_NAMES[f] });
          fieldTimes[f] = addMinutes(end, 0);
          assigned = true;
          break;
        }
      }

      if (!assigned) console.log("Couldn't schedule match:", match);
    }

    setSchedule(scheduleResult);
  };

  const exportCSV = () => {
    const headers = ["Age Group", "Field", "Start Time", "End Time", "Team A", "Team B"];
    const rows = schedule.map((match) => [
      match.age,
      match.field,
      format(match.startTime, "HH:mm"),
      format(match.endTime, "HH:mm"),
      match.teamA.club,
      match.teamB.club,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "rugby_schedule.csv");
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Rugby Match Day Scheduler</h1>

      <div className="space-y-4">
        <div className="flex gap-2 items-center flex-wrap">
          <Input placeholder="Club Name" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          {Object.keys(teamsPerAge).map((age) => (
            <Input
              key={age}
              type="number"
              className="w-20"
              placeholder={age}
              value={teamsPerAge[age]}
              onChange={(e) => setTeamsPerAge({ ...teamsPerAge, [age]: +e.target.value })}
            />
          ))}
          <Button onClick={handleAddClub}>Add Club</Button>
        </div>

        <div className="flex gap-4">
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <div className="flex gap-4">
          <Button onClick={generateSchedule}>Generate Schedule</Button>
          <Button onClick={exportCSV} disabled={schedule.length === 0}>Export Schedule (CSV)</Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Added Clubs:</h2>
          <ul className="list-disc pl-6">
            {clubs.map((club, idx) => (
              <li key={idx}>{club.name}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedule.map((match, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="font-bold">{match.age} - {match.teamA.club} vs {match.teamB.club}</p>
              <p>{match.field}</p>
              <p>{format(match.startTime, "HH:mm")} - {format(match.endTime, "HH:mm")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
