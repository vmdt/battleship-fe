import { create } from 'zustand';

interface Position {
  x: number;
  y: number;
}

interface Ship {
  name: string;
  positions: Position[];
  size: number;
  orientation: 'horizontal' | 'vertical';
}

interface BoardState {
  placedShips: Ship[];
  setPlacedShips: (ships: Ship[]) => void;
  getPlacedShips: () => Ship[];
}

export const useBoardStore = create<BoardState>((set, get) => ({
  placedShips: [],
  setPlacedShips: (ships) => set({ placedShips: ships }),
  getPlacedShips: () => get().placedShips,
})); 