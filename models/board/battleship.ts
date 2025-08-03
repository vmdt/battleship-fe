export interface PositionModel {
    x: number;
    y: number;
}

export interface BattleShipBoard {
    room_id: string;
    player_id: string;
    ships: Ship[];
    shots: Shot[];
    opponent_shots?: Shot[];
    created_at?: Date;
    updated_at?: Date;
    opponent_shot_at?: Date;
}

export interface Ship {
    name: string;
    positions: PositionModel[];
    size: number;
    orientation: 'horizontal' | 'vertical';
}

export interface Shot {
    position: PositionModel;
    status: 'hit' | 'miss';
}

export interface SunkShipDTO {
    ship_name: string;
    size: number;
    is_sunk: boolean;
}

export interface SunkShipsDTO {
    player_id: string;
    ships: SunkShipDTO[];
}