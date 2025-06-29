import { ShipOrientation } from "./ship";

export interface GameCardModel {
    title: string;
    image: string;
    url: string;
}

export type SquareStatus = 'empty' | 'ship' | 'hit' | 'miss' | 'preview' | 'preview-invalid' | 'hit-all';

export interface Square {
    status: SquareStatus;
    hover: boolean;
    shipPart?: {
        shipId: number;
        index: number;
        direction: ShipOrientation;
    }; // represents the ship part if the square is part of a ship
}