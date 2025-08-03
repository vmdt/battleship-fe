import { BattleShipBoard, SunkShipsDTO } from "@/models";
import { WhoWinResponse } from "@/models/room/battleship";
import axios  from "@/services/fetch";

export async function createBattleShipBoard(payload: BattleShipBoard): Promise<BattleShipBoard> {
    const result = await axios.post<BattleShipBoard>(`/boardgame/battleship`, payload);
    return result.data;
}

export async function getBattleShipBoard(roomId: string, playerId: string): Promise<BattleShipBoard> {
    const result = await axios.get<BattleShipBoard>(`/boardgame/battleship/room/${roomId}/player/${playerId}`);
    return result.data;
}

export async function attackBattleShip(roomId: string, playerId: string, position: { x: number, y: number }): Promise<boolean> {
    const result = await axios.put<boolean>(`/boardgame/battleship/attack`, {
        room_id: roomId,
        player_id: playerId,
        position
    });
    return result.data;
}

export async function checkWhoWin(roomId: string): Promise<WhoWinResponse> {
    const result = await axios.get<WhoWinResponse>(`/boardgame/battleship/room/${roomId}/check-who-win`);
    return result.data;
}

export async function checkSunkShipStatus(playerId: string, roomId: string): Promise<SunkShipsDTO> {
    const result = await axios.get<SunkShipsDTO>(`/boardgame/battleship/room/${roomId}/player/${playerId}/check-sunk-ships`);
    return result.data;
}