export interface PositionModel {
    x: number;
    y: number;
}

export interface BattleShipBoard {
    room_id: string;
    player_id: string;
    ships: Ship[];
    shots: Shot[];
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

