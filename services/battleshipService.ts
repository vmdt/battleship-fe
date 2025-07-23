import { BattleShipBoard } from "@/models";
import axios  from "@/services/fetch";

export async function createBattleShipBoard(payload: BattleShipBoard): Promise<BattleShipBoard> {
    const result = await axios.post<BattleShipBoard>(`/boardgame/battleship`, payload);
    return result.data;
}

export async function getBattleShipBoard(roomId: string, playerId: string): Promise<BattleShipBoard> {
    const result = await axios.get<BattleShipBoard>(`/boardgame/battleship/room/${roomId}/player/${playerId}`);
    return result.data;
}