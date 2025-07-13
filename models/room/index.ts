import { PlayerModel } from "../player";

export interface RoomModel {
    id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateRoomResponse {
    is_ready: boolean;
    is_disconnected: boolean;
    room_id: string;
    player_id: string;
    room?: RoomModel;
    player: PlayerModel;
}