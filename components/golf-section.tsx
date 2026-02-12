import Link from "next/link";
import {
  latestRound,
  latestTeamMatch,
  personalRounds,
  teamMatches
} from "@/data/golf";

export function GolfSection() {
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
                <h4>{latestTeamMatch.name}</h4>
                <p className="latest-card__meta">{latestTeamMatch.meta}</p>
              </div>
              <span className="badge badge--win">{latestTeamMatch.result}</span>
            </div>

            <div className="table-wrap">
              <div className="table-row table-row--head">
                <span>날짜</span>
                <span>매치명</span>
                <span>결과</span>
              </div>
              {teamMatches.map((match) => (
                <div key={`${match.date}-${match.name}`} className="table-row">
                  <span>{match.date}</span>
                  <span>{match.name}</span>
                  <span>
                    <em className={`badge ${match.win ? "badge--win" : "badge--lose"}`}>
                      {match.result}
                    </em>
                  </span>
                </div>
              ))}
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
                <h4>{latestRound.course}</h4>
                <p className="latest-card__meta">{latestRound.date}</p>
              </div>
              <div className="score">
                <strong>{latestRound.score}</strong>
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
                <div key={`${round.date}-${round.course}`} className="table-row">
                  <span>{round.date}</span>
                  <span>{round.course}</span>
                  <span className="table-score">{round.score}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
