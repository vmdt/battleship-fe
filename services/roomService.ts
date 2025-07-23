import { CreateRoomResponse } from "@/models";
import axios from "axios";

export async function playerCreateRoom(gameId: string, playerName: string, userId: string | null): Promise<CreateRoomResponse> {
    const result = await axios.post<CreateRoomResponse>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/player/create`, {
        name: playerName,
        userId,
    });
    return result.data;
}

export async function getRoom(roomId: string): Promise<any> {
    const result = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/${roomId}`);
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