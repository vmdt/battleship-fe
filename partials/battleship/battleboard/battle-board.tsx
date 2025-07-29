"use client";

import { useEffect, useState } from 'react';
import ShipSquare from '@/components/Square/ShipSquare';
import { Square } from '@/models/game';
import { Ship } from '@/models/game/ship';
import { attackBattleShip } from '@/services/battleshipService';
import { useRoomStore } from '@/stores/roomStore';
import { useSocketStore } from '@/stores/socketStore';
import { Socket } from 'socket.io-client';
import { Chat } from '../chat/chat';

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
    const [turnSeconds, setTurnSeconds] = useState(30); // 30s mỗi lượt

    // Đếm ngược thời gian cho mỗi lượt
    useEffect(() => {
        if (turnSeconds <= 0) return;
        const timer = setInterval(() => setTurnSeconds(s => s - 1), 1000);
        return () => clearInterval(timer);
    }, [turnSeconds]);
    // Reset timer khi đổi lượt
    useEffect(() => { setTurnSeconds(30); }, [isMyTurn]);

    // Lấy thông tin player
    const playerOne = getPlayerOne();
    const playerTwo = getPlayerTwo();
    const me = getMe();
    const isPlayerOneMe = me === 1;
    const myInfo = isPlayerOneMe ? playerOne : playerTwo;
    const opponentInfo = isPlayerOneMe ? playerTwo : playerOne;

    // Avatar mẫu nếu thiếu
    const defaultAvatar = '/assets/images/battleship-logo.png';

    function renderHeader() {
        return (
            <div className="w-full flex flex-row items-center justify-center gap-4 py-3 px-4 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow border mb-2">
                {/* Player 1 */}
                <div className="flex flex-col items-center min-w-[70px]">
                    <img
                        src={defaultAvatar}
                        alt="avatar1"
                        className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover"
                    />
                    <span className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[70px] truncate text-center">{playerOne?.player.name || 'Player 1'}</span>
                    <span className="flex items-center mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full mr-1 ${!opponentDisconnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-gray-500">{!opponentDisconnected ? 'Connected' : 'Disconnected'}</span>
                    </span>
                </div>
                {/* VS + turn status + timer */}
                <div className="flex flex-col items-center mx-2 min-w-[90px]">
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-white text-lg font-extrabold shadow border-2 border-white dark:border-gray-800 mb-1">VS</span>
                    <span className={`text-sm font-semibold ${isMyTurn ? 'text-blue-600' : 'text-red-500'}`}>{isMyTurn ? 'Your Turn' : "Opponent's Turn"}</span>
                    <span className="text-xs font-mono text-gray-700 dark:text-gray-200 mt-0.5">{turnSeconds}s</span>
                </div>
                {/* Player 2 */}
                <div className="flex flex-col items-center min-w-[70px]">
                    <img
                        src={defaultAvatar}
                        alt="avatar2"
                        className="w-10 h-10 rounded-full border-2 border-red-400 object-cover"
                    />
                    <span className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[70px] truncate text-center">{playerTwo?.player.name || 'Player 2'}</span>
                    <span className="flex items-center mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full mr-1 ${opponentDisconnected ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className="text-xs text-gray-500">{opponentDisconnected ? 'Disconnected' : 'Connected'}</span>
                    </span>
                </div>
            </div>
        );
    }

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
        isLargeBoard: boolean = false,
        isOpponentBoard: boolean = false
    ) => {
        let boardSizeClass = '';
        let squareSize: 'xs' | 'sm' | 'md' | 'lg' = 'md';
        if (isSmall) squareSize = 'xs';
        else if (isLargeBoard) squareSize = 'lg';
        const boardBg = isOpponentBoard ? 'bg-[#FF8577]' : 'bg-[#699BF7]';
        const boardDarkBg = isOpponentBoard ? 'dark:bg-[#ff8577]/80' : 'dark:bg-[#699BF7]/80';
        return (
            <div className={`flex flex-col items-center p-2 ${boardBg} ${boardDarkBg} rounded-lg shadow-md ${boardSizeClass}`}>
                {/* Column labels (A-J) */}
                <div className={`flex gap-1 ${isSmall ? 'ml-2' : 'ml-8'}`}>
                    {Array.from({ length: BOARD_SIZE }, (_, i) => (
                        <div key={i} className={`flex items-center justify-center font-medium text-gray-600 dark:text-gray-600 ${isSmall ? 'w-5 h-5 text-[10px]' : isLargeBoard ? 'w-12 h-12 text-lg' : 'w-8 h-8'}`}>
                            {String.fromCharCode(65 + i)}
                        </div>
                    ))}
                </div>
                <div className="flex">
                    {/* Row labels (1-10) */}
                    <div className="flex flex-col gap-1 mr-2">
                        {Array.from({ length: BOARD_SIZE }, (_, i) => (
                            <div key={i} className={`flex items-center justify-center font-medium text-gray-600 dark:text-gray-600 ${isSmall ? 'w-5 h-5 text-[10px]' : isLargeBoard ? 'w-12 h-12 text-lg' : 'w-8 h-8'}`}> 
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1 bg-inherit dark:bg-inherit p-1 rounded-md">
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

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 500);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mainBoard = isMyTurn ? opponentBoard : myBoard;
    const mainBoardTitle = isMyTurn ? "Opponent's Board" : "Your Board";

    const mainBoardClickHandler = isMyTurn && !opponentDisconnected ? handleAttack : () => {};

    const secondaryBoard = isMyTurn ? myBoard : opponentBoard;
    const secondaryBoardTitle = isMyTurn ? "Your Board" : "Opponent's Board";

    return (
        <div className="relative p-4 md:p-6 flex flex-col md:flex-row font-sans min-h-screen">
            <div className="w-full max-w-6xl mx-auto flex flex-2/3 justify-center md:justify-start items-start md:pl-8 mt-8">
                <div className="flex relative items-center justify-center w-full flex-col">
                    <h2 className="text-xl font-semibold mb-2 text-center">{mainBoardTitle}</h2>
                    {renderBoard(mainBoard, mainBoardClickHandler, isMobile, !isMobile, isMyTurn)}
                    {/* {opponentDisconnected && isMyTurn &&  (
                        <div className="absolute inset-0 flex items-center justify-center backdrop-invert backdrop-opacity-30 z-100">
                            <span className="text-red-500 text-2xl font-bold">Disconnected</span>
                        </div>
                    )} */}
                </div>
            </div>
            <div className="flex flex-1/2 flex-col mt-8">
                <div className="flex flex-col justify-center items-center">
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-2 text-center">{secondaryBoardTitle}</h2>
                        {renderBoard(secondaryBoard, () => {}, true, false, !isMyTurn)}
                    </div>
                </div>
            </div>
            <div className="flex flex-1/2 flex-col mt-8 items-center">
                <Chat header={renderHeader()} />
            </div>
        </div>
    );
}