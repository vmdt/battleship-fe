"use client";

import HomeLayout from '@/layouts/default';
import ShipBoard from '@/partials/battleship/shipboard/ship-board';
import { BattleBoard } from '@/partials/battleship/battleboard/battle-board';
import { useState } from 'react';
import type { Square } from '@/models/game';
import type { Ship } from '@/models/game/ship';

export default function BattleShipPage() {
    const [phase, setPhase] = useState<'setup' | 'battle'>('setup');
    const [myBoard, setMyBoard] = useState<Square[][] | null>(null);
    const [myShips, setMyShips] = useState<Ship[] | null>(null);

    return (
        <HomeLayout>
            {phase === 'setup' && (
                <ShipBoard
                    onStart={(board: Square[][], ships: Ship[]) => {
                        setMyBoard(board);
                        setMyShips(ships);
                        setPhase('battle');
                    }}
                />
            )}
            {phase === 'battle' && myBoard && myShips && (
                <BattleBoard myBoardInit={myBoard} myShipsInit={myShips} />
            )}
        </HomeLayout>
    );
}
