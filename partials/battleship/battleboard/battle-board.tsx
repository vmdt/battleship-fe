"use client";

import { useEffect, useState } from 'react';
import ShipSquare from '@/components/Square/ShipSquare';
import { Square } from '@/models/game';
import { Ship } from '@/models/game/ship';
import { attackBattleShip } from '@/services/battleshipService';
import { useRoomStore } from '@/stores/roomStore';
import { useSocketStore } from '@/stores/socketStore';
import { Socket } from 'socket.io-client';

const BOARD_SIZE = 10;

const createEmptyBoard = (): Square[][] =>
    Array(BOARD_SIZE).fill(null).map(() =>
        Array(BOARD_SIZE).fill(null).map(() => ({
            status: 'empty' as const,
            hover: false
        }))
    );


export function BattleBoard({ myBoardInit, myShipsInit, opponentBoardInit }: { myBoardInit?: Square[][], myShipsInit?: Ship[], opponentBoardInit?: Square[][] }) {
    const [myBoard, setMyBoard] = useState<Square[][]>(myBoardInit ?? createEmptyBoard());
    const [myShips, setMyShips] = useState<Ship[]>(myShipsInit ?? []);
    const [opponentBoard, setOpponentBoard] = useState<Square[][]>(opponentBoardInit ?? createEmptyBoard());
    const [isMyTurn, setIsMyTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState("Your turn");
    const { getRoom, getPlayerOne, getPlayerTwo, getMe } = useRoomStore();
    const { getSocket } = useSocketStore();

    // Set turn state from room.turn
    useEffect(() => {
        const room = getRoom();
        if (room && typeof room.turn === 'number') {
            setIsMyTurn(room.turn === getMe());
            setGameStatus(room.turn === getMe() ? "Your turn" : "Opponent's turn");
        }
    }, [getRoom, getMe]);

    // State để kiểm soát trạng thái disconnect của đối phương trong trận
    const [opponentDisconnected, setOpponentDisconnected] = useState(false);

    // Listen for opponent's attack via socket
    useEffect(() => {
        const socket = getSocket("battleship")?.socket as Socket;

        const handleOpponentAttack = (data: {
            event: string, 
            room_id: string, 
            player_id: string, 
            shot: { position: {x: number, y: number}, status: 'hit' | 'miss' } 
        }) => {
            const myPlayerId = (getMe() === 1 ? getPlayerOne()?.player_id : getPlayerTwo()?.player_id);
            if (data.player_id === myPlayerId) return;

            // Update my board with opponent's shot
            setMyBoard(prev => {
                const newBoard = prev.map(row => row.map(sq => ({ ...sq })));
                const { position, status } = data.shot;
                newBoard[position.x][position.y].status = status;
                return newBoard;
            })

            
            setTimeout(() => {
                setIsMyTurn(true);
                setGameStatus("Your turn");
            }, 1000);
        };

        const handleUserDisconnected = async (_payload: any) => {
            setOpponentDisconnected(true);
        }
        const handleUserReconnected = async (_payload: any) => {
            setOpponentDisconnected(false);
        }

        socket.on("battleship:attack", handleOpponentAttack);
        socket.on('user:disconnected', handleUserDisconnected);
        socket.on('user:reconnected', handleUserReconnected);
        return () => {
            socket.off("battleship:attack", handleOpponentAttack);
            socket.off('user:disconnected', handleUserDisconnected);
            socket.off('user:reconnected', handleUserReconnected);
        };
    }, [getSocket, getMe, getPlayerOne, getPlayerTwo]);

    const handleAttack = async (x: number, y: number) => {
        // Chỉ cho phép bắn nếu là lượt của mình
        if (!isMyTurn) return;

        const targetSquare = opponentBoard[x][y];
        if (targetSquare.status === 'hit' || targetSquare.status === 'miss') {
            return; // Already attacked
        }

        const result = await attackBattleShip(getRoom()!.id, getMe() === 1 ? getPlayerOne()!.player_id : getPlayerTwo()!.player_id, { x, y });
        setOpponentBoard(prev => {
            const newBoard = prev.map(row => row.map(sq => ({ ...sq })));
            newBoard[x][y].status = result ? 'hit' : 'miss';
            return newBoard;
        });
        // Đợi một chút rồi mới chuyển lượt
        setTimeout(() => {
            setIsMyTurn(false);
            setGameStatus("Opponent's turn");
        }, 600);
    };

    const renderBoard = (
        board: Square[][], 
        onSquareClick: (x: number, y: number) => void,
        isSmall: boolean = false,
        isLargeBoard: boolean = false
    ) => {
        let boardSizeClass = '';
        if (isSmall) boardSizeClass = 'w-[290px]';
        else if (isLargeBoard) boardSizeClass = 'w-[600px]';
        else boardSizeClass = '';
        let squareSize: 'xs' | 'sm' | 'md' | 'lg' = 'md';
        if (isSmall) squareSize = 'xs';
        else if (isLargeBoard) squareSize = 'lg';
        return (
            <div className={`flex flex-col items-center p-2 bg-[#699BF7] dark:bg-gray-800 rounded-lg shadow-md ${boardSizeClass}`}>
                {/* Column labels (A-J) */}
                <div className={`flex gap-1 ${isSmall ? 'ml-2' : 'ml-8'}`}>
                    {Array.from({ length: BOARD_SIZE }, (_, i) => (
                        <div key={i} className={`flex items-center justify-center font-medium text-gray-600 dark:text-gray-400 ${isSmall ? 'w-5 h-5 text-[10px]' : isLargeBoard ? 'w-12 h-12 text-lg' : 'w-8 h-8'}`}>
                            {String.fromCharCode(65 + i)}
                        </div>
                    ))}
                </div>
                <div className="flex">
                    {/* Row labels (1-10) */}
                    <div className="flex flex-col gap-1 mr-2">
                        {Array.from({ length: BOARD_SIZE }, (_, i) => (
                            <div key={i} className={`flex items-center justify-center font-medium text-gray-600 dark:text-gray-400 ${isSmall ? 'w-5 h-5 text-[10px]' : isLargeBoard ? 'w-12 h-12 text-lg' : 'w-8 h-8'}`}>
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1 bg-[#699BF7] dark:bg-gray-900 p-1 rounded-md">
                        {board.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                                {row.map((square, colIndex) => (
                                    <ShipSquare
                                        key={colIndex}
                                        square={square}
                                        position={{ x: rowIndex, y: colIndex }}
                                        onClick={() => onSquareClick(rowIndex, colIndex)}
                                        onHover={() => {}}
                                        size={squareSize}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Responsive: detect mobile
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 500);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mainBoard = isMyTurn ? opponentBoard : myBoard;
    const mainBoardTitle = isMyTurn ? "Opponent's Board" : "Your Board";
    // Nếu đối phương disconnect thì không cho click vào board đối phương
    const mainBoardClickHandler = isMyTurn && !opponentDisconnected ? handleAttack : () => {};

    const secondaryBoard = isMyTurn ? myBoard : opponentBoard;
    const secondaryBoardTitle = isMyTurn ? "Your Board" : "Opponent's Board";

    return (
        <div className="relative p-4 md:p-6 flex flex-col md:flex-row items-center font-sans min-h-screen">
            <div className="w-full max-w-6xl mx-auto flex justify-center md:justify-start items-start md:pl-8 mt-8">
                <div className="w-full relative">
                    <h2 className="text-xl font-semibold mb-2 text-center">{mainBoardTitle}</h2>
                    {renderBoard(mainBoard, mainBoardClickHandler, isMobile, !isMobile)}
                    {/* Nếu đối phương disconnect thì overlay chữ Disconnect */}
                    {opponentDisconnected && isMyTurn &&  (
                        <div className="absolute inset-0 flex items-center justify-center backdrop-invert backdrop-opacity-30 z-100">
                            <span className="text-red-500 text-2xl font-bold">Disconnected</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-center mt-6 w-full">
                <h2 className="text-base font-semibold mb-1 text-center">{secondaryBoardTitle}</h2>
                {renderBoard(secondaryBoard, () => {}, true)}
            </div>
        </div>
    );
}