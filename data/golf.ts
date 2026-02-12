export type TeamMatch = {
  date: string;
  name: string;
  result: "A팀 승리" | "B팀 승리";
  win: boolean;
};

export type PersonalRound = {
  date: string;
  course: string;
  score: number;
};

export const latestTeamMatch = {
  name: "2월 정기 매치",
  meta: "2026.02.01 · 블루원CC",
  result: "A팀 승리"
};

export const teamMatches: TeamMatch[] = [
  { date: "02.01", name: "2월 정기 매치", result: "A팀 승리", win: true },
  { date: "01.18", name: "신년 친선전", result: "B팀 승리", win: false },
  { date: "01.04", name: "송년 결산전", result: "A팀 승리", win: true },
  { date: "12.21", name: "12월 정기 매치", result: "A팀 승리", win: true }
];

export const latestRound = {
  course: "남서울CC",
  date: "2026.02.08",
  score: 88
};

export const personalRounds: PersonalRound[] = [
  { date: "02.08", course: "남서울CC", score: 88 },
  { date: "02.01", course: "블루원CC", score: 92 },
  { date: "01.25", course: "레이크사이드CC", score: 95 },
  { date: "01.12", course: "파인힐스CC", score: 90 }
];
