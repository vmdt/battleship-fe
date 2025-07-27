"use client";

import HomeLayout from '@/layouts/default';
import ShipBoard from '@/partials/battleship/shipboard/ship-board';
import { BattleBoard } from '@/partials/battleship/battleboard/battle-board';
import { useEffect, useState } from 'react';
import type { Square } from '@/models/game';
import type { Ship } from '@/models/game/ship';
import { useSocketStore } from '@/stores/socketStore';
import { Socket } from 'socket.io-client';
import Lobby from '@/partials/battleship/lobby';
import { getRoom, joinRoom } from '@/services/roomService';
import { useRoomStore } from '@/stores/roomStore';
import { useParams } from 'next/navigation';
import { useBoardStore } from '@/stores/boardStore';
import { createBattleShipBoard } from '@/services/battleshipService';
import { BattleShipBoard } from '@/models';
import { getBattleShipBoard } from '@/services/battleshipService';

export default function BattleShipPage() {
    const [phase, setPhase] = useState<'lobby' | 'setup' | 'battle'>('lobby');
    const [myBoard, setMyBoard] = useState<Square[][] | null>(null);
    const [myShips, setMyShips] = useState<Ship[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNameModal, setShowNameModal] = useState(false);
    const [roomFull, setRoomFull] = useState(false);
    const [roomNotFound, setRoomNotFound] = useState(false);
    const [playerName, setPlayerName] = useState("");
    const [battleBoardData, setBattleBoardData] = useState<BattleShipBoard | null>(null);
    const [battleLoading, setBattleLoading] = useState(false);
    
    const { connect, getSocket } = useSocketStore();
    const { setRoom, setRoomId, setPlayerOne, setMe, setPlayerTwo, getPlayerOne, getPlayerTwo, getMe, getRoom: getRoomStore } = useRoomStore();
    const { getPlacedShips } = useBoardStore();
    const params = useParams();
    const roomId = params.room as string;

    useEffect(() => {
        if (!getSocket('battleship')?.socket) {
            connect('battleship', getMe());
        }

        const socket = getSocket('battleship')?.socket as Socket;
        if (!socket) {
            console.error('Socket connection failed');
            return;
        }
        socket.emit('room:join', { roomId: "user:test" });
        socket.emit('room:join', { roomId: roomId });
        socket.on('user:disconnected', (payload) => {
            console.log('User disconnected:', payload);
        });

    }, [getSocket, connect]);

    // Check room before mount
    useEffect(() => {
        const checkRoom = async () => {
            if (!roomId) return;
            try {
                setLoading(true);
                setRoomNotFound(false); // Reset error state
                
                // Delay 2 seconds before api calling
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const roomData = await getRoom(roomId);

                console.log('Room data:', roomData);
                
                if (roomData.room.id) {
                    if (roomData.room.status === "lobby") {
                        setPhase("lobby");
                    } else if (roomData.room.status === "setup") {
                        setPhase("setup");
                    } else if (roomData.room.status === "battle") {
                        setPhase("battle");
                    }

                    const playerCount = roomData.players.length;
                    if (playerCount >= 2) {
                        const playerOne = roomData.players.find(p => p.me === 1);
                        const playerTwo = roomData.players.find(p => p.me === 2);
                        setPlayerOne(playerOne || null);
                        setPlayerTwo(playerTwo || null);
                        // Just show full screen if current user is not player in room
                        const currentMe = getMe();
                        const hasPlayerOne = getPlayerOne();
                        setMe(2);
                        
                        if (currentMe === 1 && hasPlayerOne) {
                            setRoom(roomData.room);
                            setRoomId(roomData.room.id);
                            setRoomFull(false);
                        } else if (currentMe === 2) {
                            setRoom(roomData.room);
                            setRoomId(roomData.room.id);
                            setRoomFull(false);
                        } else {
                            // Current user is not a player in the room, show full screen
                            setRoomFull(true);
                        }
                    } else if (playerCount === 1) {
                        if (roomData.players[0].is_host && getPlayerOne()?.player.id === roomData.players[0].player_id && getMe() === 1) {
                            setRoom(roomData.room);
                            setRoomId(roomData.room.id);
                            setPlayerOne(roomData.players[0]);
                            setPlayerTwo(null);

                            setMe(1); // I am player one
                        } else {
                            setMe(2); // I am player two
                            setPlayerOne(roomData.players[0]);
                            setPlayerTwo(null);
                            setRoom(roomData.room);
                            setRoomId(roomData.room.id);
                            setShowNameModal(true);
                        }
                    } else {
                        // Room is empty, show name modal
                        setShowNameModal(true);
                    }
                } else {
                    console.error('Room not found or invalid room ID');
                    setRoomNotFound(true);
                }
            } catch (error) {
                console.error('Error checking room:', error);
                setRoomNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        checkRoom();
    }, [roomId, setRoom, setRoomId, setPlayerOne, setPlayerTwo, getMe, getPlayerOne]);

    useEffect(() => {
        if (phase === 'battle') {
            const fetchBoard = async () => {
                setBattleLoading(true);
                try {
                    const room = getRoomStore();
                    const player = getMe();
                    let playerId = player === 1 ? getPlayerOne()?.player_id : getPlayerTwo()?.player_id;
                    if (!room?.id || !playerId) return;
                    const data = await getBattleShipBoard(room.id, playerId);
                    setBattleBoardData(data);
                } catch (err) {
                    console.error('Failed to fetch battle board', err);
                } finally {
                    setBattleLoading(false);
                }
            };
            fetchBoard();
        }
    }, [phase, getRoomStore, getMe, getPlayerOne, getPlayerTwo]);

    const handleJoinRoom = async () => {
        const data = await joinRoom('battleship', roomId, playerName, null);
        console.log('Join room data:', data);
        const socket = getSocket('battleship')?.socket as Socket;
        if (!socket) {
            alert('Socket connection failed');
            return;
        }

        socket.on("room:joined", (payload) => {
            if (payload?.room_id) {
                setPlayerTwo(data);
                setShowNameModal(false);
            }
        })
    };

    const handleStartGame = (player: number) => {
        const payload = {
            room_id: getRoomStore()?.id || "",
            player_id: player === 1 ? getPlayerOne()?.player_id : getPlayerTwo()?.player_id,
            ships: getPlacedShips(),
            shots: [], // Initialize with empty shots
            opponent_shots: [] // Initialize with empty opponent shots
        } as BattleShipBoard;
        createBattleShipBoard(payload);
    };

    if (loading) {
        return (
            <HomeLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg">Đang kiểm tra phòng...</div>
                </div>
            </HomeLayout>
        );
    }

    if (roomNotFound) {
        return (
            <HomeLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4 text-red-600">Phòng không tồn tại</h2>
                        <p className="text-gray-600 mb-4">Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <button 
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            onClick={() => window.history.back()}
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </HomeLayout>
        );
    }

    if (roomFull) {
        return (
            <HomeLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Phòng đã đầy</h2>
                        <p className="text-gray-600">Phòng này đã có đủ 2 người chơi.</p>
                    </div>
                </div>
            </HomeLayout>
        );
    }

    if (phase === 'battle') {
        if (battleLoading || !battleBoardData) {
            return (
                <HomeLayout>
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-lg">Đang tải dữ liệu trận đấu...</div>
                    </div>
                </HomeLayout>
            );
        }
        // Mapping ships vào myBoard
        const myBoard: import('@/models/game').Square[][] = Array(10).fill(null).map(() => Array(10).fill(null).map(() => ({ status: 'empty' as const, hover: false })));
        battleBoardData.ships.forEach(ship => {
            ship.positions.forEach((pos, index) => {
                myBoard[pos.x][pos.y] = { ...myBoard[pos.x][pos.y], status: 'ship', shipPart: {
                    shipId: ship.size,
                    index: index + 1,
                    direction: ship.orientation
                } };
            });
        });
        // opponent_shots lên myBoard
        battleBoardData.opponent_shots?.forEach(shot => {
            const { x, y } = shot.position;
            if (myBoard[x][y].status === 'ship') {
                myBoard[x][y].status = 'hit';
            } else {
                myBoard[x][y].status = 'miss';
            }
        });
        // Mapping shots lên opponentBoard
        const opponentBoard: import('@/models/game').Square[][] = Array(10).fill(null).map(() => Array(10).fill(null).map(() => ({ status: 'empty' as const, hover: false })));
        battleBoardData.shots?.forEach(shot => {
            const { x, y } = shot.position;
            opponentBoard[x][y].status = shot.status;
        });
        // Chuyển đổi ships nếu cần (id, placed)
        const shipsForBoard = battleBoardData.ships.map((ship, idx) => ({
            id: idx + 1,
            size: ship.size,
            placed: true,
            name: ship.name,
            orientation: ship.orientation,
            positions: ship.positions,
            position: ship.positions[0] || undefined,
        }));
        return (
            <HomeLayout>
                <BattleBoard myBoardInit={myBoard} myShipsInit={shipsForBoard} opponentBoardInit={opponentBoard} />
            </HomeLayout>
        );
    }

    return (
        <HomeLayout>
            {/* Modal nhập tên */}
            {showNameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Nhập tên người chơi</h2>
                        <input
                            className="w-full px-3 py-2 border rounded mb-4 text-black"
                            placeholder="Tên của bạn"
                            value={playerName}
                            onChange={e => setPlayerName(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button 
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                                onClick={() => setShowNameModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                onClick={handleJoinRoom}
                                disabled={!playerName.trim()}
                            >
                                Tham gia
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {phase === 'lobby' && <Lobby />}
            {phase === 'setup' && (
                <ShipBoard
                    onStart={(board: Square[][], ships: Ship[], callback?: Function) => {
                        setMyBoard(board);
                        setMyShips(ships);
                        handleStartGame(getMe());
                        callback && callback();
                    }}
                    setPhase={setPhase}
                />
            )}
        </HomeLayout>
    );
}
