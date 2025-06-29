export interface Ship {
    id: number;
    size: number;
    placed: boolean;
    position?: { x: number; y: number };
    orientation?: 'horizontal' | 'vertical';
    name?: string;
    positions?: { x: number; y: number }[];
}

export type ShipOrientation = 'horizontal' | 'vertical';