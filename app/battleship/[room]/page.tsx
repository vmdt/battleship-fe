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
import { useUserStore } from '@/stores/userStore';
import { LoginModal } from '@/partials/auth/login-modal';
import { SignupModal } from '@/partials/auth/signup-modal';

export default function BattleShipPage() {
    const [phase, setPhase] = useState<'lobby' | 'setup' | 'battle'>('lobby');
    const [myBoard, setMyBoard] = useState<Square[][] | null>(null);
    const [myShips, setMyShips] = useState<Ship[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
    const [roomFull, setRoomFull] = useState(false);
    const [roomNotFound, setRoomNotFound] = useState(false);
    const [battleBoardData, setBattleBoardData] = useState<BattleShipBoard | null>(null);
    const [battleLoading, setBattleLoading] = useState(false);
    
    const { connect, getSocket } = useSocketStore();
    const { setRoom, setRoomId, setPlayerOne, setMe, setPlayerTwo, getPlayerOne, getPlayerTwo, getMe, getRoom: getRoomStore } = useRoomStore();
    const { getPlacedShips } = useBoardStore();
    const { isLogin, user, login } = useUserStore();
    const params = useParams();
    const roomId = params.room as string;

    // Xử lý chuyển đổi giữa login và signup
    const handleSwitchToSignup = () => {
        setShowLogin(false);
        setShowSignup(true);
    };

    const handleSwitchToLogin = () => {
        setShowSignup(false);
        setShowLogin(true);
    };

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


    const checkAndJoinRoom = async () => {
        if (!roomId) return;
        try {
            setLoading(true);
            setRoomNotFound(false);
            const roomData = await getRoom(roomId);
            if (!roomData.room.id) {
                setRoomNotFound(true);
                return;
            }
            const playerCount = roomData.players.length;
            if (playerCount >= 2) {
                const playerOne = roomData.players.find(p => p.me === 1);
                const playerTwo = roomData.players.find(p => p.me === 2);
                const isPlayer = playerOne?.player_id === user?.id || playerTwo?.player_id === user?.id;
                if (isPlayer) {
                    setPlayerOne(playerOne || null);
                    setPlayerTwo(playerTwo || null);
                    setMe(playerOne?.player_id === user?.id ? 1 : 2);
                    setRoom(roomData.room);
                    setRoomId(roomData.room.id);
                    setRoomFull(false);
                } else {
                    setRoomFull(true);
                }
            } else if (playerCount === 1) {
                const playerOne = roomData.players[0];
                const isPlayerInRoom = playerOne?.player_id === user?.id;
                if (isPlayerInRoom) {
                    setPlayerOne(playerOne);
                    setPlayerTwo(null);
                    setMe(playerOne.is_host ? 1 : 2);
                    setRoom(roomData.room);
                    setRoomId(roomData.room.id);
                } else {
                    const joinedPlayer = await joinRoom('battleship', roomData.room.id, user?.name || 'Guest', null);
                    setPlayerOne(playerOne);
                    setPlayerTwo(joinedPlayer);
                    setMe(2);
                    setRoom(roomData.room);
                    setRoomId(roomData.room.id);
                    setHasJoinedRoom(true);
                }
            } else {
                // Empty room
                setPlayerOne(null);
                setPlayerTwo(null);
                setMe(1);
                setRoom(roomData.room);
                setRoomId(roomData.room.id);
            }

            if (roomData.room.status === "lobby") setPhase("lobby");
            else if (roomData.room.status === "setup") setPhase("setup");
            else if (roomData.room.status === "battle") setPhase("battle");

        } catch (err) {
            console.error(err);
            setRoomNotFound(true);
        } finally {
            setLoading(false);
            setShowLogin(false);
            setShowSignup(false);
        }
    };

    useEffect(() => {
        if (!isLogin) {
            setShowLogin(true);
        } else {
            setShowLogin(false);
            setShowSignup(false);
            checkAndJoinRoom();
        }
    }, [isLogin, user]);

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

    // Xử lý đăng nhập
    const handleLogin = async (email: string, password: string) => {
        setAuthLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUser = {
            id: 'dbe1fcdc-cbbc-4312-a3a9-7bfb6aa4ef96',
            name: 'Test User',
            email,
            avatar: ''
        };
        login(mockUser, 'mock-token');
        setAuthLoading(false);
        // checkAndJoinRoom();
        setShowLogin(false);
    };

    const handleSignup = async (username: string, email: string, password: string) => {
        setAuthLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUser = {
            id: 'dbe1fcdc-cbbc-4312-a3a9-7bfb6aa4ef96',
            name: username,
            email,
            avatar: ''
        };
        login(mockUser, 'mock-token');
        setAuthLoading(false);
        // checkAndJoinRoom();
        setShowSignup(false);
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

        return (
            <HomeLayout>
            {/* Modal login nếu chưa đăng nhập - luôn render ở đầu */}
            <LoginModal
                isOpen={showLogin}
                onClose={() => {
                    console.log('Login modal close clicked');
                    // Không cho phép đóng modal nếu chưa login
                }}
                onSignupClick={handleSwitchToSignup}
                onLogin={handleLogin}
                isLoading={authLoading}
            />
            
            {/* Modal signup */}
            <SignupModal
                isOpen={showSignup}
                onClose={() => {
                    console.log('Signup modal close clicked');
                    // Không cho phép đóng modal nếu chưa login
                }}
                onLoginClick={handleSwitchToLogin}
                onSignup={handleSignup}
                isLoading={authLoading}
            />
            
            {/* Chỉ hiển thị nội dung game khi đã login hoặc đang loading */}
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg">Đang tải...</div>
                </div>
            ) : roomNotFound ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Không tìm thấy phòng</h2>
                        <p className="text-gray-600">Phòng này không tồn tại hoặc đã bị xóa.</p>
                    </div>
                </div>
            ) : roomFull ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Phòng đã đầy</h2>
                        <p className="text-gray-600">Phòng này đã có đủ 2 người chơi.</p>
                    </div>
                </div>
            ) : (
                <>
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
                    {phase === 'battle' && (
                        <>
                            {battleLoading || !battleBoardData ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-lg">Đang tải dữ liệu trận đấu...</div>
                    </div>
                            ) : (
                                (() => {
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
                                    return <BattleBoard myBoardInit={myBoard} myShipsInit={shipsForBoard} opponentBoardInit={opponentBoard} />;
                                })()
                            )}
                        </>
                    )}
                </>
            )}
        </HomeLayout>
    );
}
