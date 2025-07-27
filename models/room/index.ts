import { PlayerModel, RoomPlayerModel } from "../player";

export interface RoomModel {
    id: string;
    status: string;
    turn?: number;
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

export interface GetRoomResponse {
    room: RoomModel;
    players: RoomPlayerModel[];
}