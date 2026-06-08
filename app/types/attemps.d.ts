
// types/challenge.ts
export interface ChallengeAttempt {
  user_id: string;
  problem_id: string;
  score: number;
  milliseconds: number;
  challenge_id: string;
  created_at: Date;
}

export interface ChallengeStatus {
  user_id: string;
  problem_id: string;
  challenge_id: string;
  intent_number: number;
  averageMilliseconds: number;
  totalMilliseconds: number;
  stars: number;
  created_at: Date;
  updated_at: Date;
  last_attempt_at?: Date;
}