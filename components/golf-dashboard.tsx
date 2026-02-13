"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  handicap: number | null;
  profile_image: string | null;
};

type Team = {
  team_id: number;
  team_name: string;
  user1_id: number;
  user2_id: number;
  user1_name: string | null;
  user2_name: string | null;
  team_image: string | null;
};

type Round = {
  id: number;
  user_id: number;
  user_name: string | null;
  course_id: number;
  course_name: string;
  play_date: string;
  weather: string | null;
  total_score: number | null;
  notes: string | null;
};

type Match = {
  team_match_id: number;
  team1_id: number;
  team2_id: number;
  team1_name: string | null;
  team2_name: string | null;
  course_id: number;
  course_name: string;
  match_date: string;
  handicap_team: number | null;
  handicap_amount: number | null;
  match_status: string | null;
  winner: number | null;
  winner_name: string | null;
};

type Course = {
  id: number;
  name: string;
  region: string | null;
  holes: number;
};

type DashboardData = {
  users: User[];
  teams: Team[];
  rounds: Round[];
  matches: Match[];
  courses: Course[];
};

const emptyData: DashboardData = {
  users: [],
  teams: [],
  rounds: [],
  matches: [],
  courses: []
};

type UserForm = {
  id?: number;
  username: string;
  email: string;
  display_name: string;
  handicap: string;
  profile_image: string;
};

type TeamForm = {
  id?: number;
  team_name: string;
  user1_id: string;
  user2_id: string;
  team_image: string;
};

type RoundForm = {
  id?: number;
  user_id: string;
  course_id: string;
  play_date: string;
  weather: string;
  total_score: string;
  notes: string;
};

type MatchForm = {
  id?: number;
  team1_id: string;
  team2_id: string;
  course_id: string;
  match_date: string;
  handicap_team: string;
  handicap_amount: string;
  match_status: string;
  winner: string;
};

const defaultUserForm: UserForm = {
  username: "",
  email: "",
  display_name: "",
  handicap: "",
  profile_image: ""
};

const defaultTeamForm: TeamForm = {
  team_name: "",
  user1_id: "",
  user2_id: "",
  team_image: ""
};

const defaultRoundForm: RoundForm = {
  user_id: "",
  course_id: "",
  play_date: "",
  weather: "",
  total_score: "",
  notes: ""
};

const defaultMatchForm: MatchForm = {
  team1_id: "",
  team2_id: "",
  course_id: "",
  match_date: "",
  handicap_team: "",
  handicap_amount: "",
  match_status: "scheduled",
  winner: ""
};

export function GolfDashboard() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [roundModalOpen, setRoundModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  const [userForm, setUserForm] = useState<UserForm>(defaultUserForm);
  const [teamForm, setTeamForm] = useState<TeamForm>(defaultTeamForm);
  const [roundForm, setRoundForm] = useState<RoundForm>(defaultRoundForm);
  const [matchForm, setMatchForm] = useState<MatchForm>(defaultMatchForm);

  const [saving, setSaving] = useState(false);

  const [roundFilterUser, setRoundFilterUser] = useState("all");
  const [matchFilterTeam, setMatchFilterTeam] = useState("all");

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/golf/dashboard", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "데이터를 불러오지 못했습니다.");
      }

      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 로딩 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const filteredRounds = useMemo(() => {
    if (roundFilterUser === "all") {
      return data.rounds;
    }

    return data.rounds.filter((round) => String(round.user_id) === roundFilterUser);
  }, [data.rounds, roundFilterUser]);

  const filteredMatches = useMemo(() => {
    if (matchFilterTeam === "all") {
      return data.matches;
    }

    return data.matches.filter(
      (match) => String(match.team1_id) === matchFilterTeam || String(match.team2_id) === matchFilterTeam
    );
  }, [data.matches, matchFilterTeam]);

  const kpis = useMemo(
    () => ({
      users: data.users.length,
      teams: data.teams.length,
      rounds: data.rounds.length,
      matches: data.matches.length
    }),
    [data]
  );
  const recentMatch = useMemo(() => data.matches[0] ?? null, [data.matches]);

  const teamNameById = useMemo(() => {
    return new Map(data.teams.map((team) => [team.team_id, team.team_name]));
  }, [data.teams]);

  const getHandicapLabel = (match: Match) => {
    if (match.handicap_team === null || match.handicap_amount === null) {
      return "-";
    }

    const handicapTeam = Number(match.handicap_team);

    // Legacy rows may store 1/2 (team slot) instead of actual team_id.
    if (handicapTeam === 1) {
      return `${match.team1_name ?? "알 수 없음"}/${match.handicap_amount}`;
    }

    if (handicapTeam === 2) {
      return `${match.team2_name ?? "알 수 없음"}/${match.handicap_amount}`;
    }

    return `${teamNameById.get(handicapTeam) ?? "알 수 없음"}/${match.handicap_amount}`;
  };

  const resetUserForm = () => setUserForm(defaultUserForm);
  const resetTeamForm = () => setTeamForm(defaultTeamForm);
  const resetRoundForm = () => setRoundForm(defaultRoundForm);
  const resetMatchForm = () => setMatchForm(defaultMatchForm);

  const selectRoundForEdit = (round: Round) => {
    setRoundForm({
      id: round.id,
      user_id: String(round.user_id),
      course_id: String(round.course_id),
      play_date: round.play_date,
      weather: round.weather ?? "",
      total_score: round.total_score === null ? "" : String(round.total_score),
      notes: round.notes ?? ""
    });
    setRoundModalOpen(true);
  };

  const selectMatchForEdit = (match: Match) => {
    setMatchForm({
      id: match.team_match_id,
      team1_id: String(match.team1_id),
      team2_id: String(match.team2_id),
      course_id: String(match.course_id),
      match_date: match.match_date,
      handicap_team: match.handicap_team === null ? "" : String(match.handicap_team),
      handicap_amount: match.handicap_amount === null ? "" : String(match.handicap_amount),
      match_status: match.match_status ?? "scheduled",
      winner: match.winner === null ? "" : String(match.winner)
    });
    setMatchModalOpen(true);
  };

  const submitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint = userForm.id ? `/api/golf/users/${userForm.id}` : "/api/golf/users";
    const method = userForm.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "사용자 저장 실패");
      }

      resetUserForm();
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "사용자 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const submitTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint = teamForm.id ? `/api/golf/teams/${teamForm.id}` : "/api/golf/teams";
    const method = teamForm.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "팀 저장 실패");
      }

      resetTeamForm();
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "팀 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async () => {
    if (!userForm.id) {
      return;
    }

    const ok = window.confirm("이 사용자를 삭제할까요?");
    if (!ok) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/golf/users/${userForm.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "사용자 삭제 실패");
      }

      resetUserForm();
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "사용자 삭제 실패");
    } finally {
      setSaving(false);
    }
  };

  const removeTeam = async () => {
    if (!teamForm.id) {
      return;
    }

    const ok = window.confirm("이 팀을 삭제할까요?");
    if (!ok) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/golf/teams/${teamForm.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "팀 삭제 실패");
      }

      resetTeamForm();
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "팀 삭제 실패");
    } finally {
      setSaving(false);
    }
  };

  const submitRound = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint = roundForm.id ? `/api/golf/rounds/${roundForm.id}` : "/api/golf/rounds";
    const method = roundForm.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roundForm)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "라운드 저장 실패");
      }

      resetRoundForm();
      setRoundModalOpen(false);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "라운드 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const submitMatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint = matchForm.id ? `/api/golf/matches/${matchForm.id}` : "/api/golf/matches";
    const method = matchForm.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchForm)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "매치 저장 실패");
      }

      resetMatchForm();
      setMatchModalOpen(false);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "매치 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const removeRound = async () => {
    if (!roundForm.id) {
      return;
    }

    const ok = window.confirm("이 라운드를 삭제할까요?");
    if (!ok) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/golf/rounds/${roundForm.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "라운드 삭제 실패");
      }

      resetRoundForm();
      setRoundModalOpen(false);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "라운드 삭제 실패");
    } finally {
      setSaving(false);
    }
  };

  const removeMatch = async () => {
    if (!matchForm.id) {
      return;
    }

    const ok = window.confirm("이 팀 매치를 삭제할까요?");
    if (!ok) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/golf/matches/${matchForm.id}`, { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "팀 매치 삭제 실패");
      }

      resetMatchForm();
      setMatchModalOpen(false);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "팀 매치 삭제 실패");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="golf-page">
        <div className="container golf-page__loading">데이터를 불러오는 중...</div>
      </main>
    );
  }

  return (
    <main className="golf-page">
      <div className="container">
        <section className="golf-page__hero" aria-hidden="true">
          <div className="golf-page__hero-overlay" />
          <Link href="/" className="golf-page__hero-home" aria-label="메인 화면으로 이동">
            ← back
          </Link>
        </section>

        <header className="golf-page__header">
          <div>
            <p className="section-eyebrow">GOLF</p>
            <h1 className="golf-page__title">Golf Rounds</h1>
            <p className="golf-page__desc">팀 매치결과를 등록하고 확인. 핸디캡 유의.</p>
          </div>
          <div className="golf-page__actions">
            <button onClick={() => setUserModalOpen(true)}>Player</button>
            <button onClick={() => setTeamModalOpen(true)}>Team</button>
          </div>
        </header>

        {error ? <p className="golf-page__error">{error}</p> : null}

        <section className="golf-kpis">
          <KpiCard label="사용자" value={kpis.users} />
          <KpiCard label="팀" value={kpis.teams} />
          <KpiCard label="개인 라운드" value={kpis.rounds} />
          <KpiCard label="팀 매치" value={kpis.matches} />
        </section>

        <section className="golf-highlight" aria-label="가장 최근 팀매치">
          <p className="golf-highlight__eyebrow">LATEST TEAM MATCH</p>
          {recentMatch ? (
            <>
              <div className="golf-highlight__top">
                <h2>
                  {recentMatch.team1_name ?? "팀1"} vs {recentMatch.team2_name ?? "팀2"}
                </h2>
                <div className="golf-highlight__meta">
                  <span>코스: {recentMatch.course_name}</span>
                  <span>핸디캡: {getHandicapLabel(recentMatch)}</span>
                  <p className="golf-highlight__date">{recentMatch.match_date}</p>
                </div>
              </div>
              <div className="golf-highlight__winner">
                <span className="golf-highlight__winner-label">승리팀</span>
                <strong>{recentMatch.winner_name ?? "미정"}</strong>
              </div>
            </>
          ) : (
            <div className="golf-highlight__empty">최근 팀매치 데이터가 없습니다.</div>
          )}
        </section>

        <section className="golf-dual">
          <article className="golf-list-panel">
            <header className="golf-list-panel__head">
              <h2>팀 매치</h2>
              <button
                type="button"
                className="golf-list-panel__add"
                aria-label="팀 매치 신규 등록"
                title="팀 매치 신규 등록"
                onClick={() => {
                  resetMatchForm();
                  setMatchModalOpen(true);
                }}
              >
                <span aria-hidden="true">＋</span>
              </button>
            </header>

            <div className="golf-list-panel__filter">
              <label htmlFor="match-team-filter">팀</label>
              <select
                id="match-team-filter"
                value={matchFilterTeam}
                onChange={(event) => setMatchFilterTeam(event.target.value)}
              >
                <option value="all">전체</option>
                {data.teams.map((team) => (
                  <option key={team.team_id} value={String(team.team_id)}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="golf-table-wrap">
              <table className="golf-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>매치</th>
                    <th>코스</th>
                    <th>핸디캡</th>
                    <th>승자</th>
                    <th className="golf-col-edit">수정</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.team_match_id}>
                      <td className="golf-col-date">{match.match_date}</td>
                      <td>
                        {match.team1_name} vs {match.team2_name}
                      </td>
                      <td>{match.course_name}</td>
                      <td>{getHandicapLabel(match)}</td>
                      <td>{match.winner_name ?? "-"}</td>
                      <td className="golf-col-edit">
                        <button
                          className="golf-table__action golf-table__action--icon"
                          onClick={() => selectMatchForEdit(match)}
                          aria-label="팀 매치 수정"
                          title="수정"
                        >
                          ✎
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="golf-list-panel">
            <header className="golf-list-panel__head">
              <h2>개인 라운드</h2>
              <button
                type="button"
                className="golf-list-panel__add"
                aria-label="개인 라운드 신규 등록"
                title="개인 라운드 신규 등록"
                onClick={() => {
                  resetRoundForm();
                  setRoundModalOpen(true);
                }}
              >
                <span aria-hidden="true">＋</span>
              </button>
            </header>

            <div className="golf-list-panel__filter">
              <label htmlFor="round-user-filter">사용자</label>
              <select
                id="round-user-filter"
                value={roundFilterUser}
                onChange={(event) => setRoundFilterUser(event.target.value)}
              >
                <option value="all">전체</option>
                {data.users.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.display_name ?? user.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="golf-table-wrap">
              <table className="golf-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>사용자</th>
                    <th>코스</th>
                    <th>스코어</th>
                    <th className="golf-col-weather">날씨</th>
                    <th className="golf-col-edit">수정</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRounds.map((round) => (
                    <tr key={round.id}>
                      <td className="golf-col-date">{round.play_date}</td>
                      <td>{round.user_name ?? "-"}</td>
                      <td>{round.course_name}</td>
                      <td>{round.total_score ?? "-"}</td>
                      <td className="golf-col-weather">{round.weather ?? "-"}</td>
                      <td className="golf-col-edit">
                        <button
                          className="golf-table__action golf-table__action--icon"
                          onClick={() => selectRoundForEdit(round)}
                          aria-label="개인 라운드 수정"
                          title="수정"
                        >
                          ✎
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>

      <Modal open={userModalOpen} title="Player" onClose={() => setUserModalOpen(false)}>
        <div className="user-modal-layout">
          <section className="user-modal-hero" aria-hidden="true">
            <div className="user-modal-hero__content">
              <p className="user-modal-hero__eyebrow">PLAYER DIRECTORY</p>
              <h3>Player infomation management</h3>
              <p>사용자 비밀번호와 프로필 이미지는 차후 업데이트 예정.</p>
              <span className="user-modal-hero__count">등록 사용자 {data.users.length}명</span>
            </div>
          </section>

          <div className="golf-modal-grid golf-modal-grid--user">
            <div className="golf-modal-list golf-modal-list--user">
              <button
                className="golf-modal-list__item golf-modal-list__item--new"
                onClick={resetUserForm}
              >
                + 신규 사용자 등록
              </button>
              {data.users.map((user) => (
                <button
                  key={user.id}
                  className="golf-modal-list__item"
                  onClick={() =>
                    setUserForm({
                      id: user.id,
                      username: user.username,
                      email: user.email,
                      display_name: user.display_name ?? "",
                      handicap: user.handicap?.toString() ?? "",
                      profile_image: user.profile_image ?? ""
                    })
                  }
                >
                  {user.display_name ?? user.username}
                </button>
              ))}
            </div>
            <form className="golf-form golf-form--user" onSubmit={submitUser}>
              <div className="golf-form__head">
                <h3>{userForm.id ? `사용자 수정 #${userForm.id}` : "신규 사용자 등록"}</h3>
                <button type="button" onClick={resetUserForm}>
                  신규 등록 모드
                </button>
              </div>
              <input
                required
                placeholder="username"
                value={userForm.username}
                onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
              />
              <input
                required
                type="email"
                placeholder="email"
                value={userForm.email}
                onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
              />
              <input
                placeholder="display_name"
                value={userForm.display_name}
                onChange={(event) => setUserForm((prev) => ({ ...prev, display_name: event.target.value }))}
              />
              <input
                placeholder="handicap"
                value={userForm.handicap}
                onChange={(event) => setUserForm((prev) => ({ ...prev, handicap: event.target.value }))}
              />
              <input
                placeholder="profile_image"
                value={userForm.profile_image}
                onChange={(event) => setUserForm((prev) => ({ ...prev, profile_image: event.target.value }))}
              />
              <div className="golf-form__actions">
                <button type="button" onClick={resetUserForm}>
                  초기화
                </button>
                {userForm.id ? (
                  <button type="button" className="golf-button--danger" onClick={removeUser} disabled={saving}>
                    삭제
                  </button>
                ) : null}
                <button type="submit" disabled={saving}>
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <Modal open={teamModalOpen} title="Team" onClose={() => setTeamModalOpen(false)}>
        <div className="user-modal-layout">
          <section className="user-modal-hero" aria-hidden="true">
            <div className="user-modal-hero__content">
              <p className="user-modal-hero__eyebrow">TEAM BUILDER</p>
              <h3>팀 구성을 빠르게 관리하세요</h3>
              <p>기존 팀을 선택해 수정하거나 새로운 팀 조합을 바로 등록할 수 있습니다.</p>
              <span className="user-modal-hero__count">등록 팀 {data.teams.length}개</span>
            </div>
          </section>

          <div className="golf-modal-grid golf-modal-grid--user">
            <div className="golf-modal-list golf-modal-list--user">
              <button className="golf-modal-list__item golf-modal-list__item--new" onClick={resetTeamForm}>
                + 신규 팀 등록
              </button>
              {data.teams.map((team) => (
                <button
                  key={team.team_id}
                  className="golf-modal-list__item"
                  onClick={() =>
                    setTeamForm({
                      id: team.team_id,
                      team_name: team.team_name,
                      user1_id: String(team.user1_id),
                      user2_id: String(team.user2_id),
                      team_image: team.team_image ?? ""
                    })
                  }
                >
                  {team.team_name}
                </button>
              ))}
            </div>
            <form className="golf-form golf-form--user" onSubmit={submitTeam}>
              <div className="golf-form__head">
                <h3>{teamForm.id ? `팀 수정 #${teamForm.id}` : "신규 팀 등록"}</h3>
                <button type="button" onClick={resetTeamForm}>
                  신규 등록 모드
                </button>
              </div>
              <input
                required
                placeholder="team_name"
                value={teamForm.team_name}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, team_name: event.target.value }))}
              />
              <select
                required
                value={teamForm.user1_id}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, user1_id: event.target.value }))}
              >
                <option value="">user1 선택</option>
                {data.users.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.display_name ?? user.username}
                  </option>
                ))}
              </select>
              <select
                required
                value={teamForm.user2_id}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, user2_id: event.target.value }))}
              >
                <option value="">user2 선택</option>
                {data.users.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.display_name ?? user.username}
                  </option>
                ))}
              </select>
              <input
                placeholder="team_image"
                value={teamForm.team_image}
                onChange={(event) => setTeamForm((prev) => ({ ...prev, team_image: event.target.value }))}
              />
              <div className="golf-form__actions">
                <button type="button" onClick={resetTeamForm}>
                  초기화
                </button>
                {teamForm.id ? (
                  <button type="button" className="golf-button--danger" onClick={removeTeam} disabled={saving}>
                    삭제
                  </button>
                ) : null}
                <button type="submit" disabled={saving}>
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <Modal open={roundModalOpen} title="Personal Round" onClose={() => setRoundModalOpen(false)}>
        <div className="user-modal-layout">
          <section className="user-modal-hero" aria-hidden="true">
            <div className="user-modal-hero__content">
              <p className="user-modal-hero__eyebrow">ROUND LOG</p>
              <h3>Round Record management</h3>
              <p>사용자, 코스, 스코어를 입력해 라운드 데이터 등록.</p>
              <span className="user-modal-hero__count">총 라운드 {data.rounds.length}건</span>
            </div>
          </section>

          <div className="golf-modal-split">
            <aside className="golf-modal-side golf-modal-side--round" aria-hidden="true" />
            <form className="golf-form golf-form--user golf-form--wide" onSubmit={submitRound}>
              <h3>{roundForm.id ? "개인 라운드 수정" : "개인 라운드 등록"}</h3>
              <select
                required
                value={roundForm.user_id}
                onChange={(event) => setRoundForm((prev) => ({ ...prev, user_id: event.target.value }))}
              >
                <option value="">사용자 선택</option>
                {data.users.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.display_name ?? user.username}
                  </option>
                ))}
              </select>
              <select
                required
                value={roundForm.course_id}
                onChange={(event) => setRoundForm((prev) => ({ ...prev, course_id: event.target.value }))}
              >
                <option value="">코스 선택</option>
                {data.courses.map((course) => (
                  <option key={course.id} value={String(course.id)}>
                    {course.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="date"
                value={roundForm.play_date}
                onChange={(event) => setRoundForm((prev) => ({ ...prev, play_date: event.target.value }))}
              />
              <input
                placeholder="날씨"
                value={roundForm.weather}
                onChange={(event) => setRoundForm((prev) => ({ ...prev, weather: event.target.value }))}
              />
              <input
                placeholder="total_score"
                value={roundForm.total_score}
                onChange={(event) => setRoundForm((prev) => ({ ...prev, total_score: event.target.value }))}
              />
              <textarea
                placeholder="notes"
                value={roundForm.notes}
                onChange={(event) => setRoundForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
              <div className="golf-form__actions">
                <button type="button" onClick={resetRoundForm} disabled={saving}>
                  초기화
                </button>
                {roundForm.id ? (
                  <button type="button" className="golf-button--danger" onClick={removeRound} disabled={saving}>
                    삭제
                  </button>
                ) : null}
                <button type="submit" disabled={saving}>
                  {roundForm.id ? "수정" : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <Modal open={matchModalOpen} title="Team match" onClose={() => setMatchModalOpen(false)}>
        <div className="user-modal-layout">
          <section className="user-modal-hero" aria-hidden="true">
            <div className="user-modal-hero__content">
              <p className="user-modal-hero__eyebrow">MATCH RESULT</p>
              <h3>팀 매치 결과를 업데이트하세요</h3>
              <p>팀 조합, 핸디캡, 승자 정보를 입력해 매치 이력을 정확히 기록합니다.</p>
              <span className="user-modal-hero__count">총 팀매치 {data.matches.length}건</span>
            </div>
          </section>

          <div className="golf-modal-split">
            <aside className="golf-modal-side golf-modal-side--match" aria-hidden="true" />
            <form className="golf-form golf-form--user golf-form--wide" onSubmit={submitMatch}>
              <h3>{matchForm.id ? "팀 매치 수정" : "팀 매치 등록"}</h3>
              <select
                required
                value={matchForm.team1_id}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, team1_id: event.target.value }))}
              >
                <option value="">team1 선택</option>
                {data.teams.map((team) => (
                  <option key={team.team_id} value={String(team.team_id)}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              <select
                required
                value={matchForm.team2_id}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, team2_id: event.target.value }))}
              >
                <option value="">team2 선택</option>
                {data.teams.map((team) => (
                  <option key={team.team_id} value={String(team.team_id)}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              <select
                required
                value={matchForm.course_id}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, course_id: event.target.value }))}
              >
                <option value="">코스 선택</option>
                {data.courses.map((course) => (
                  <option key={course.id} value={String(course.id)}>
                    {course.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="date"
                value={matchForm.match_date}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, match_date: event.target.value }))}
              />
              <input
                placeholder="handicap_team (team_id)"
                value={matchForm.handicap_team}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, handicap_team: event.target.value }))}
              />
              <input
                placeholder="handicap_amount"
                value={matchForm.handicap_amount}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, handicap_amount: event.target.value }))}
              />
              <select
                value={matchForm.match_status}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, match_status: event.target.value }))}
              >
                <option value="scheduled">scheduled</option>
                <option value="completed">completed</option>
              </select>
              <select
                value={matchForm.winner}
                onChange={(event) => setMatchForm((prev) => ({ ...prev, winner: event.target.value }))}
              >
                <option value="">승자 없음</option>
                {data.teams.map((team) => (
                  <option key={team.team_id} value={String(team.team_id)}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              <div className="golf-form__actions">
                <button type="button" onClick={resetMatchForm} disabled={saving}>
                  초기화
                </button>
                {matchForm.id ? (
                  <button type="button" className="golf-button--danger" onClick={removeMatch} disabled={saving}>
                    삭제
                  </button>
                ) : null}
                <button type="submit" disabled={saving}>
                  {matchForm.id ? "수정" : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="golf-kpi-chip">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="golf-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="golf-modal">
        <header className="golf-modal__header">
          <h2>{title}</h2>
          <button onClick={onClose}>닫기</button>
        </header>
        <div className="golf-modal__body">{children}</div>
      </div>
    </div>
  );
}
