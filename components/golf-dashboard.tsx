"use client";

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
  password: string;
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
  user_id: string;
  course_id: string;
  play_date: string;
  weather: string;
  total_score: string;
  notes: string;
};

type MatchForm = {
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
  password: "",
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
  const [activeTab, setActiveTab] = useState<"rounds" | "matches">("rounds");

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

  const resetUserForm = () => setUserForm(defaultUserForm);
  const resetTeamForm = () => setTeamForm(defaultTeamForm);

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

  const submitRound = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/golf/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roundForm)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "라운드 저장 실패");
      }

      setRoundForm(defaultRoundForm);
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

    try {
      const response = await fetch("/api/golf/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchForm)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "매치 저장 실패");
      }

      setMatchForm(defaultMatchForm);
      setMatchModalOpen(false);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "매치 저장 실패");
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
        <header className="golf-page__header">
          <div>
            <p className="section-eyebrow">GOLF</p>
            <h1 className="golf-page__title">Golf 통합 관리</h1>
            <p className="golf-page__desc">기록 조회는 한 페이지에서, 사용자/팀 관리는 팝업으로 처리합니다.</p>
          </div>
          <div className="golf-page__actions">
            <button onClick={() => setUserModalOpen(true)}>사용자 관리</button>
            <button onClick={() => setTeamModalOpen(true)}>팀 관리</button>
            <button onClick={() => setRoundModalOpen(true)}>라운드 기록</button>
            <button onClick={() => setMatchModalOpen(true)}>팀매치 기록</button>
          </div>
        </header>

        {error ? <p className="golf-page__error">{error}</p> : null}

        <section className="golf-kpis">
          <KpiCard label="사용자" value={kpis.users} />
          <KpiCard label="팀" value={kpis.teams} />
          <KpiCard label="개인 라운드" value={kpis.rounds} />
          <KpiCard label="팀 매치" value={kpis.matches} />
        </section>

        <section className="golf-tabs">
          <div className="golf-tabs__head">
            <button
              className={activeTab === "rounds" ? "is-active" : ""}
              onClick={() => setActiveTab("rounds")}
            >
              개인 라운드
            </button>
            <button
              className={activeTab === "matches" ? "is-active" : ""}
              onClick={() => setActiveTab("matches")}
            >
              팀 매치
            </button>
          </div>

          {activeTab === "rounds" ? (
            <div className="golf-list-panel">
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
                      <th>날씨</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRounds.map((round) => (
                      <tr key={round.id}>
                        <td>{round.play_date}</td>
                        <td>{round.user_name ?? "-"}</td>
                        <td>{round.course_name}</td>
                        <td>{round.total_score ?? "-"}</td>
                        <td>{round.weather ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="golf-list-panel">
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
                      <th>상태</th>
                      <th>승자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatches.map((match) => (
                      <tr key={match.team_match_id}>
                        <td>{match.match_date}</td>
                        <td>
                          {match.team1_name} vs {match.team2_name}
                        </td>
                        <td>{match.course_name}</td>
                        <td>{match.match_status ?? "-"}</td>
                        <td>{match.winner_name ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal open={userModalOpen} title="사용자 관리" onClose={() => setUserModalOpen(false)}>
        <div className="golf-modal-grid">
          <div className="golf-modal-list">
            {data.users.map((user) => (
              <button
                key={user.id}
                className="golf-modal-list__item"
                onClick={() =>
                  setUserForm({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    password: "",
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
          <form className="golf-form" onSubmit={submitUser}>
            <h3>{userForm.id ? `사용자 수정 #${userForm.id}` : "신규 사용자 등록"}</h3>
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
              placeholder={userForm.id ? "password (변경 시만 입력)" : "password"}
              required={!userForm.id}
              value={userForm.password}
              onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
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
              <button type="submit" disabled={saving}>
                저장
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal open={teamModalOpen} title="팀 관리" onClose={() => setTeamModalOpen(false)}>
        <div className="golf-modal-grid">
          <div className="golf-modal-list">
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
          <form className="golf-form" onSubmit={submitTeam}>
            <h3>{teamForm.id ? `팀 수정 #${teamForm.id}` : "신규 팀 등록"}</h3>
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
              <button type="submit" disabled={saving}>
                저장
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal open={roundModalOpen} title="개인 라운드 기록" onClose={() => setRoundModalOpen(false)}>
        <form className="golf-form" onSubmit={submitRound}>
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
          <button type="submit" disabled={saving}>
            저장
          </button>
        </form>
      </Modal>

      <Modal open={matchModalOpen} title="팀 매치 기록" onClose={() => setMatchModalOpen(false)}>
        <form className="golf-form" onSubmit={submitMatch}>
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
          <button type="submit" disabled={saving}>
            저장
          </button>
        </form>
      </Modal>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="golf-kpi-card">
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
