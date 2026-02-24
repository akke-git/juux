import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getGolfDashboardData } from "@/lib/golf-repository";

const toShortDate = (value: string) => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${month}.${day}`;
};

const toLongDate = (value: string) => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${year}.${month}.${day}`;
};

const toMatchResult = (match: {
  winner: number | null;
  team1_id: number;
  team2_id: number;
  team1_name: string | null;
  team2_name: string | null;
}) => {
  if (match.winner === match.team1_id) {
    return { label: `${match.team1_name ?? "A팀"} 승리`, tone: "win" as const };
  }

  if (match.winner === match.team2_id) {
    return { label: `${match.team2_name ?? "B팀"} 승리`, tone: "win" as const };
  }

  return { label: "A/S", tone: "pending" as const };
};

const toMatchTitle = (match: {
  team1_name: string | null;
  team2_name: string | null;
  course_name: string;
}) => {
  if (match.team1_name || match.team2_name) {
    return `${match.team1_name ?? "팀1"} vs ${match.team2_name ?? "팀2"}`;
  }

  return match.course_name;
};

export async function GolfSection() {
  noStore();

  let rounds: Awaited<ReturnType<typeof getGolfDashboardData>>["rounds"] = [];
  let matches: Awaited<ReturnType<typeof getGolfDashboardData>>["matches"] = [];

  try {
    const data = await getGolfDashboardData();
    rounds = data.rounds;
    matches = data.matches;
  } catch {
    rounds = [];
    matches = [];
  }

  const latestRound = rounds[0] ?? null;
  const latestTeamMatch = matches[0] ?? null;
  const latestTeamMatchResult = latestTeamMatch
    ? toMatchResult(latestTeamMatch)
    : { label: "A/S", tone: "pending" as const };
  const personalRounds = rounds.slice(0, 4);
  const teamMatches = matches.slice(0, 4);

  return (
    <section className="golf">
      <div className="container">
        <div className="golf__header">
          <p className="section-eyebrow">GOLF</p>
          <h2 className="section-title">Golf Rounds</h2>
          <p className="section-desc">개인 및 팀 플레이 라운드 기록을 관리하세요</p>
        </div>

        <div className="golf__split">
          <article className="golf-card">
            <header className="golf-card__head">
              <h3>Team Match</h3>
              <Link href="/golf">전체 보기 →</Link>
            </header>

            <div className="latest-card">
              <div>
                <p className="latest-card__label">최근 매치</p>
                <h4>{latestTeamMatch ? toMatchTitle(latestTeamMatch) : "-"}</h4>
                <p className="latest-card__meta">
                  {latestTeamMatch ? toLongDate(latestTeamMatch.match_date) : "-"}
                </p>
              </div>
              <span className={`badge ${latestTeamMatchResult.tone === "win" ? "badge--win" : "badge--pending"}`}>
                {latestTeamMatchResult.label}
              </span>
            </div>

            <div className="table-wrap">
              <div className="table-row table-row--head">
                <span>날짜</span>
                <span>매치명</span>
                <span>결과</span>
              </div>
              {teamMatches.map((match) => {
                const result = toMatchResult(match);

                return (
                  <div key={`${match.match_date}-${match.team_match_id}`} className="table-row">
                    <span>{toShortDate(match.match_date)}</span>
                    <span>{toMatchTitle(match)}</span>
                    <span>
                      <em className={`badge ${result.tone === "win" ? "badge--win" : "badge--pending"}`}>
                        {result.label}
                      </em>
                    </span>
                  </div>
                );
              })}
              {teamMatches.length === 0 && (
                <div className="table-row">
                  <span>-</span>
                  <span>데이터 없음</span>
                  <span>
                    <em className="badge badge--pending">-</em>
                  </span>
                </div>
              )}
            </div>
          </article>

          <article className="golf-card">
            <header className="golf-card__head">
              <h3>My Rounds</h3>
              <Link href="/golf">전체 보기 →</Link>
            </header>

            <div className="latest-card">
              <div>
                <p className="latest-card__label">최근 라운드</p>
                <h4>{latestRound?.course_name ?? "-"}</h4>
                <p className="latest-card__meta">
                  {latestRound ? toLongDate(latestRound.play_date) : "-"}
                </p>
              </div>
              <div className="score">
                <strong>{latestRound?.total_score ?? "-"}</strong>
                <span>스코어</span>
              </div>
            </div>

            <div className="table-wrap">
              <div className="table-row table-row--head">
                <span>날짜</span>
                <span>코스</span>
                <span>스코어</span>
              </div>
              {personalRounds.map((round) => (
                <div key={`${round.play_date}-${round.id}`} className="table-row">
                  <span>{toShortDate(round.play_date)}</span>
                  <span>{round.course_name}</span>
                  <span className="table-score">{round.total_score ?? "-"}</span>
                </div>
              ))}
              {personalRounds.length === 0 && (
                <div className="table-row">
                  <span>-</span>
                  <span>데이터 없음</span>
                  <span className="table-score">-</span>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
