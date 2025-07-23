import { BattleShipBoard } from "@/models";
import axios  from "@/services/fetch";

export async function createBattleShipBoard(payload: BattleShipBoard): Promise<BattleShipBoard> {
    const result = await axios.post<BattleShipBoard>(`/boardgame/battleship`, payload);
    return result.data;
}