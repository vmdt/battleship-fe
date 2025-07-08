"use client";

import HomeLayout from '@/layouts/default';
import ShipBoard from '@/partials/battleship/shipboard/ship-board';
import { BattleBoard } from '@/partials/battleship/battleboard/battle-board';
import { useEffect, useState } from 'react';
import type { Square } from '@/models/game';
import type { Ship } from '@/models/game/ship';
import { useSocketStore } from '@/stores/socketStore';
import { Socket } from 'socket.io-client';

export default function BattleShipPage() {
    const [phase, setPhase] = useState<'setup' | 'battle'>('setup');
    const [myBoard, setMyBoard] = useState<Square[][] | null>(null);
    const [myShips, setMyShips] = useState<Ship[] | null>(null);
    const { connect, getSocket } = useSocketStore();

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Đảm bảo đã kết nối socket namespace battleship
        if (!getSocket('battleship')) {
            connect('battleship');
        }
        const socketInstance = getSocket('battleship');
        setSocket(socketInstance);
        if (!socketInstance) return;

        // Lắng nghe sự kiện room:joined
        const handleRoomJoined = (payload: { roomId: string; playerId: string; playerName: string }) => {
            console.log('User joined room:', payload);
            // Có thể cập nhật state hoặc hiển thị thông báo ở đây nếu muốn
        };
        socketInstance.on('room:joined', handleRoomJoined);

        // Cleanup listener khi unmount hoặc socket thay đổi
        return () => {
            socketInstance.off('room:joined', handleRoomJoined);
        };
    }, [getSocket, connect]);

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
