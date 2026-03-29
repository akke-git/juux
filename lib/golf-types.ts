export type User = {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  handicap: number | null;
  profile_image: string | null;
};

export type Team = {
  team_id: number;
  team_name: string;
  user1_id: number;
  user2_id: number;
  user1_name: string | null;
  user2_name: string | null;
  team_image: string | null;
};

export type Round = {
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

export type Match = {
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

export type Course = {
  id: number;
  name: string;
  region: string | null;
  holes: number;
};

export type DashboardData = {
  users: User[];
  teams: Team[];
  rounds: Round[];
  matches: Match[];
  courses: Course[];
};

export type UserForm = {
  id?: number;
  username: string;
  email: string;
  display_name: string;
  handicap: string;
  profile_image: string;
};

export type TeamForm = {
  id?: number;
  team_name: string;
  user1_id: string;
  user2_id: string;
  team_image: string;
};

export type RoundForm = {
  id?: number;
  user_id: string;
  course_id: string;
  play_date: string;
  weather: string;
  total_score: string;
  notes: string;
};

export type MatchForm = {
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

export const emptyData: DashboardData = {
  users: [],
  teams: [],
  rounds: [],
  matches: [],
  courses: []
};

export const defaultUserForm: UserForm = {
  username: "",
  email: "",
  display_name: "",
  handicap: "",
  profile_image: ""
};

export const defaultTeamForm: TeamForm = {
  team_name: "",
  user1_id: "",
  user2_id: "",
  team_image: ""
};

export const defaultRoundForm: RoundForm = {
  user_id: "",
  course_id: "",
  play_date: "",
  weather: "",
  total_score: "",
  notes: ""
};

export const defaultMatchForm: MatchForm = {
  team1_id: "",
  team2_id: "",
  course_id: "",
  match_date: "",
  handicap_team: "",
  handicap_amount: "",
  match_status: "scheduled",
  winner: ""
};
