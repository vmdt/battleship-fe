
export interface PlayerModel {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface RoomPlayerModel {
    is_ready: boolean;
    is_disconnected: boolean;
    is_host: boolean;
    room_id: string;
    player_id: string;
    status: RoomPlayerStatus;
    me: number;
    player: PlayerModel;
}

export enum RoomPlayerStatus {
    IN_LOBBY = 0,
    PLACING = 1,
    READY_TO_BATTLE = 2,
}