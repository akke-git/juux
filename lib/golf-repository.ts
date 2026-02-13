import { db } from "@/lib/mysql";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

type UserRow = RowDataPacket & {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  handicap: number | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
};

type TeamRow = RowDataPacket & {
  team_id: number;
  team_name: string;
  user1_id: number;
  user2_id: number;
  user1_name: string | null;
  user2_name: string | null;
  team_image: string | null;
  team_created_at: string;
  team_updated_at: string;
};

type RoundRow = RowDataPacket & {
  id: number;
  user_id: number;
  user_name: string | null;
  course_id: number;
  course_name: string;
  play_date: string;
  weather: string | null;
  total_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type MatchRow = RowDataPacket & {
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
  match_created_at: string;
  match_updated_at: string;
};

type CourseRow = RowDataPacket & {
  id: number;
  name: string;
  region: string | null;
  holes: number;
};

type HoleScoreInput = {
  hole_number: number;
  score: number;
  putts?: number | null;
  fairway_hit?: boolean | null;
  green_in_regulation?: boolean | null;
  sand_save?: boolean | null;
  penalty_strokes?: number | null;
  course_name?: string | null;
};

type MatchHoleInput = {
  hole_number: number;
  winner_team: number | null;
};

export async function getGolfDashboardData() {
  const [users] = await db.query<UserRow[]>(
    `SELECT id, username, email, display_name, handicap, profile_image, created_at, updated_at
     FROM users
     ORDER BY id DESC`
  );

  const [teams] = await db.query<TeamRow[]>(
    `SELECT
      t.team_id,
      t.team_name,
      t.user1_id,
      t.user2_id,
      u1.display_name AS user1_name,
      u2.display_name AS user2_name,
      t.team_image,
      t.team_created_at,
      t.team_updated_at
     FROM team t
     LEFT JOIN users u1 ON u1.id = t.user1_id
     LEFT JOIN users u2 ON u2.id = t.user2_id
     ORDER BY t.team_id DESC`
  );

  const [rounds] = await db.query<RoundRow[]>(
    `SELECT
      r.id,
      r.user_id,
      u.display_name AS user_name,
      r.course_id,
      gc.name AS course_name,
      DATE_FORMAT(r.play_date, '%Y-%m-%d') AS play_date,
      r.weather,
      r.total_score,
      r.notes,
      r.created_at,
      r.updated_at
     FROM rounds r
     JOIN users u ON u.id = r.user_id
     JOIN golf_courses gc ON gc.id = r.course_id
     ORDER BY r.play_date DESC, r.id DESC
     LIMIT 200`
  );

  const [matches] = await db.query<MatchRow[]>(
    `SELECT
      tm.team_match_id,
      tm.team1_id,
      tm.team2_id,
      t1.team_name AS team1_name,
      t2.team_name AS team2_name,
      tm.course_id,
      gc.name AS course_name,
      DATE_FORMAT(tm.match_date, '%Y-%m-%d') AS match_date,
      tm.handicap_team,
      tm.handicap_amount,
      tm.match_status,
      tm.winner,
      tw.team_name AS winner_name,
      tm.match_created_at,
      tm.match_updated_at
     FROM team_match tm
     JOIN team t1 ON t1.team_id = tm.team1_id
     JOIN team t2 ON t2.team_id = tm.team2_id
     JOIN golf_courses gc ON gc.id = tm.course_id
     LEFT JOIN team tw ON tw.team_id = tm.winner
     ORDER BY tm.match_date DESC, tm.team_match_id DESC
     LIMIT 200`
  );

  const [courses] = await db.query<CourseRow[]>(
    `SELECT id, name, region, holes
     FROM golf_courses
     ORDER BY name ASC`
  );

  return { users, teams, rounds, matches, courses };
}

export async function createUser(input: {
  username: string;
  email: string;
  display_name?: string | null;
  handicap?: number | null;
  profile_image?: string | null;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO users (username, email, password, display_name, handicap, profile_image)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.username,
      input.email,
      "",
      input.display_name ?? null,
      input.handicap ?? null,
      input.profile_image ?? null
    ]
  );

  return result.insertId;
}

export async function updateUser(
  id: number,
  input: {
    username: string;
    email: string;
    display_name?: string | null;
    handicap?: number | null;
    profile_image?: string | null;
  }
) {
  await db.execute(
    `UPDATE users
     SET username = ?, email = ?, display_name = ?, handicap = ?, profile_image = ?
     WHERE id = ?`,
    [
      input.username,
      input.email,
      input.display_name ?? null,
      input.handicap ?? null,
      input.profile_image ?? null,
      id
    ]
  );
}

export async function deleteUser(id: number) {
  await db.execute(`DELETE FROM users WHERE id = ?`, [id]);
}

export async function createTeam(input: {
  team_name: string;
  user1_id: number;
  user2_id: number;
  team_image?: string | null;
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO team (team_name, user1_id, user2_id, team_image)
     VALUES (?, ?, ?, ?)`,
    [input.team_name, input.user1_id, input.user2_id, input.team_image ?? null]
  );

  return result.insertId;
}

export async function updateTeam(
  id: number,
  input: {
    team_name: string;
    user1_id: number;
    user2_id: number;
    team_image?: string | null;
  }
) {
  await db.execute(
    `UPDATE team
     SET team_name = ?, user1_id = ?, user2_id = ?, team_image = ?
     WHERE team_id = ?`,
    [input.team_name, input.user1_id, input.user2_id, input.team_image ?? null, id]
  );
}

export async function deleteTeam(id: number) {
  await db.execute(`DELETE FROM team WHERE team_id = ?`, [id]);
}

export async function createRound(input: {
  user_id: number;
  course_id: number;
  play_date: string;
  weather?: string | null;
  total_score?: number | null;
  notes?: string | null;
  hole_scores?: HoleScoreInput[];
}) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO rounds (user_id, course_id, play_date, weather, total_score, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.user_id,
        input.course_id,
        input.play_date,
        input.weather ?? null,
        input.total_score ?? null,
        input.notes ?? null
      ]
    );

    const roundId = result.insertId;

    if (input.hole_scores && input.hole_scores.length > 0) {
      await insertHoleScores(conn, roundId, input.hole_scores);
    }

    await conn.commit();
    return roundId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function updateRound(
  id: number,
  input: {
    user_id: number;
    course_id: number;
    play_date: string;
    weather?: string | null;
    total_score?: number | null;
    notes?: string | null;
  }
) {
  await db.execute(
    `UPDATE rounds
     SET user_id = ?, course_id = ?, play_date = ?, weather = ?, total_score = ?, notes = ?
     WHERE id = ?`,
    [
      input.user_id,
      input.course_id,
      input.play_date,
      input.weather ?? null,
      input.total_score ?? null,
      input.notes ?? null,
      id
    ]
  );
}

export async function deleteRound(id: number) {
  await db.execute(`DELETE FROM rounds WHERE id = ?`, [id]);
}

async function insertHoleScores(
  conn: PoolConnection,
  roundId: number,
  holeScores: HoleScoreInput[]
) {
  for (const hole of holeScores) {
    await conn.execute(
      `INSERT INTO hole_scores (
        round_id,
        hole_number,
        score,
        putts,
        fairway_hit,
        green_in_regulation,
        sand_save,
        penalty_strokes,
        course_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roundId,
        hole.hole_number,
        hole.score,
        hole.putts ?? null,
        hole.fairway_hit ?? null,
        hole.green_in_regulation ?? null,
        hole.sand_save ?? null,
        hole.penalty_strokes ?? 0,
        hole.course_name ?? null
      ]
    );
  }
}

export async function createTeamMatch(input: {
  team1_id: number;
  team2_id: number;
  course_id: number;
  match_date: string;
  handicap_team?: number | null;
  handicap_amount?: number | null;
  match_status?: string | null;
  winner?: number | null;
  hole_results?: MatchHoleInput[];
}) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO team_match (
        team1_id,
        team2_id,
        course_id,
        match_date,
        handicap_team,
        handicap_amount,
        match_status,
        winner
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.team1_id,
        input.team2_id,
        input.course_id,
        input.match_date,
        input.handicap_team ?? null,
        input.handicap_amount ?? null,
        input.match_status ?? null,
        input.winner ?? null
      ]
    );

    const matchId = result.insertId;

    if (input.hole_results && input.hole_results.length > 0) {
      for (const hole of input.hole_results) {
        await conn.execute(
          `INSERT INTO team_match_hole (team_match_id, hole_number, winner_team)
           VALUES (?, ?, ?)`,
          [matchId, hole.hole_number, hole.winner_team]
        );
      }
    }

    await conn.commit();
    return matchId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function updateTeamMatch(
  id: number,
  input: {
    team1_id: number;
    team2_id: number;
    course_id: number;
    match_date: string;
    handicap_team?: number | null;
    handicap_amount?: number | null;
    match_status?: string | null;
    winner?: number | null;
  }
) {
  await db.execute(
    `UPDATE team_match
     SET
       team1_id = ?,
       team2_id = ?,
       course_id = ?,
       match_date = ?,
       handicap_team = ?,
       handicap_amount = ?,
       match_status = ?,
       winner = ?
     WHERE team_match_id = ?`,
    [
      input.team1_id,
      input.team2_id,
      input.course_id,
      input.match_date,
      input.handicap_team ?? null,
      input.handicap_amount ?? null,
      input.match_status ?? null,
      input.winner ?? null,
      id
    ]
  );
}

export async function deleteTeamMatch(id: number) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    await conn.execute(`DELETE FROM team_match_hole WHERE team_match_id = ?`, [id]);
    await conn.execute(`DELETE FROM team_match WHERE team_match_id = ?`, [id]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
