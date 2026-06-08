export interface LevelsResponse {
    _id: string;
    title: string;
    order: number;
    starts: number;
    unlocked: boolean;
}

export interface ChallengesResponse {
    _id: string;
    name: string;
    symbol: string;
    explain: string;
    stars: number;
    unlocked: boolean;
}
