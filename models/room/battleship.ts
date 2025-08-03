
export interface BattleshipOtions {
    id?: string;
    room_id?: string;
    time_per_turn: number; // seconds
    time_place_ship: number; // seconds
    who_go_first: number;
    start_place_at?: Date;
}

export interface BattleshipOptionUpdatePayload {
    time_per_turn?: number; // seconds
    time_place_ship?: number; // seconds
    who_go_first?: number;
}

export interface WhoWinResponse {
    room_id: string;
    win_status: WinStatus[];
}

export interface WinStatus {
    player_id: string;
    win: boolean;
    placed: boolean;
}