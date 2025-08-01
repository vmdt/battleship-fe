import { PlayerModel, RoomPlayerModel } from "../player";
import { BattleshipOtions } from "./battleship";

export type { BattleshipOtions } from "./battleship";

export interface RoomModel {
    id: string;
    status: string;
    turn?: number;
    options?: BattleshipOtions;
    created_at: Date;
    updated_at: Date;
}

export interface CreateRoomPayload {
    name: string;
    options: BattleshipOtions;
    user_id?: string;
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