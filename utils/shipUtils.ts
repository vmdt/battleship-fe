import { ShipOrientation } from "@/models/game/ship";
import { Direction, SHIPBOARDING_SIZE, SquareStatus } from "@/constants/ship";
import { Square } from "@/models/game";
import { PositionModel } from "@/models";

export const canPlaceShip = (board: Square[][], x: number, y: number, shipSize: number, shipOrientation: ShipOrientation): boolean => {
    if (shipOrientation === Direction.Horizontal) {
        if (y + shipSize > SHIPBOARDING_SIZE) return false;
        for (let i = 0; i < shipSize; i++) {
            if (board[x][y + i].status === SquareStatus.Ship) return false;
        }
    } else {
        if (x + shipSize > SHIPBOARDING_SIZE) return false;
        for (let i = 0; i < shipSize; i++) {
            if (board[x + i][y].status === SquareStatus.Ship) return false;
        }
    }
    return true;
}

export const getPreviewPositions = (x: number, y: number, shipSize: number, shipOrientation: ShipOrientation): PositionModel[] => {
    const positions: PositionModel[] = [];
    if (shipOrientation === Direction.Horizontal) {
        for (let i = 0; i < shipSize; i++) {
            const newY = y + i;
            if (newY >= 0 && newY < SHIPBOARDING_SIZE && x >= 0 && x < SHIPBOARDING_SIZE) {
                positions.push({ x, y: newY });
            }
        }
    } else {
        for (let i = 0; i < shipSize; i++) {
            const newX = x + i;
            if (newX >= 0 && newX < SHIPBOARDING_SIZE && y >= 0 && y < SHIPBOARDING_SIZE) {
                positions.push({ x: newX, y });
            }
        }
    }
    return positions;
}