import axios from "axios";

export async function playerCreateRoom(gameId: string, playerName: string, userId: string | null): Promise<any> {
    const result = await axios.post<any>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/room/player/create`, {
        name: playerName,
        userId,
    });
    return result.data;
}