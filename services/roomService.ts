import { BattleshipOtions, CreateRoomPayload, CreateRoomResponse, GetRoomResponse, RoomModel } from "@/models";
import { BattleshipOptionUpdatePayload } from "@/models/room/battleship";
import axios from "axios";

export async function playerCreateRoom(payload: CreateRoomPayload): Promise<CreateRoomResponse> {
    const result = await axios.post<CreateRoomResponse>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/player/create`, {
        ...payload
    });
    return result.data;
}

export async function getRoom(roomId: string): Promise<GetRoomResponse> {
    const result = await axios.get<GetRoomResponse>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/${roomId}`);
    return result.data;
}

export async function joinRoom(gameId: string, roomId: string, playerName: string, userId: string | null): Promise<any> {
    const result = await axios.post<any>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/player/join`, {
        // gameId,
        room_id: roomId,
        name: playerName,
        user_id: userId,
    });
    return result.data;
}

export async function updateRoomPlayer(roomId: string, playerId: string, payload: any): Promise<any> {
    const result = await axios.put<any>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/${roomId}/players/${playerId}`, {
        ...payload
    })
    return result.data;
}

export async function kickRoomPlayer(roomId: string, playerId: string): Promise<any> {
    const result = await axios.delete<any>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/${roomId}/players/${playerId}`);
    return result.data;
}

export async function updateRoomStatus(roomId: string, status: string): Promise<RoomModel> {
    const result = await axios.put<RoomModel>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/status`, {
        room_id: roomId,
        status
    });
    return result.data;
}

export async function updateBattleshipOptions(roomId: string, options: BattleshipOptionUpdatePayload): Promise<BattleshipOtions> {
    const result = await axios.put<BattleshipOtions>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/${roomId}/battleship-options`, {
        ...options
    });
    return result.data;
}

export async function setWhoWin(roomId: string, playerId: string): Promise<RoomModel> {
    const result = await axios.put<RoomModel>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/${roomId}/set-who-win`, {
        player_id: playerId
    });
    return result.data;
}