
export interface BattleshipOtions {
    id?: string;
    room_id?: string;
    time_per_turn: number; // seconds
    time_place_ship: number; // seconds
    who_go_first: number;
}

export interface BattleshipOptionUpdatePayload {
    time_per_turn?: number; // seconds
    time_place_ship?: number; // seconds
    who_go_first?: number;
}