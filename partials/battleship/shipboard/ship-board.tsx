"use client";

import { useState, useEffect, use } from 'react';
import ShipSquare from '@/components/Square/ShipSquare';
import { Square } from '@/models/game';
import type { Ship } from '@/models/game/ship';
import { canPlaceShip, getPreviewPositions } from '@/utils/shipUtils';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/stores/boardStore';
import { useSocketStore } from '@/stores/socketStore';
import { Socket } from 'socket.io-client';
import { useRoomStore } from '@/stores/roomStore';
import { RoomPlayerStatus } from '@/models/player';
import { updateRoomStatus } from "@/services/roomService"

interface ShipBoardProps {
    onStart?: (board: Square[][], ships: Ship[], callback: Function) => void;
    setPhase?: (phase: 'lobby' | 'setup' | 'battle') => void;
}

const ShipBoard = ({ onStart, setPhase }: ShipBoardProps) => {
    const BOARD_SIZE = 10;
    const router = useRouter();
    const { setPlacedShips } = useBoardStore();
    const { getRoom, getPlayerOne, getPlayerTwo, setPlayerOne, setPlayerTwo } = useRoomStore();

    // Ship configurations
    const initialShips: Ship[] = [
        { id: 5, size: 5, placed: false, name: 'Carrier' }, // Carrier
        { id: 4, size: 4, placed: false, name: 'Battleship' }, // Battleship
        { id: 3, size: 3, placed: false, name: 'Cruiser' }, // Cruiser
        { id: 3, size: 3, placed: false, name: 'Submarine' }, // Submarine
        { id: 2, size: 2, placed: false, name: 'Destroyer' }, // Destroyer
    ];
    const [ships, setShips] = useState<Ship[]>(initialShips);
    
    const [board, setBoard] = useState<Square[][]>(() => {
        return Array(BOARD_SIZE).fill(null).map(() =>
            Array(BOARD_SIZE).fill(null).map(() => ({
                status: 'empty' as const,
                hover: false
            }))
        );
    });
    
    const [currentShipIndex, setCurrentShipIndex] = useState(0);
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
    const { getSocket } = useSocketStore();
    const [waitingOther, setWaitingOther] = useState(false);

    // Handle rotation with R key
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'r') {
                handleRotate();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [hoverPosition]);

    useEffect(() => {
        const socket = getSocket('battleship')?.socket as Socket;
        if (!socket) {
            console.error('Socket connection failed');
            return;
        }

        socket.on('room:started', (payload: {
            player_id: string;
            room_id: string;
            event: string;
        }) => {
            if (payload.player_id == getPlayerOne()?.player_id) {
                const playerOne = getPlayerOne();
                if (playerOne) {
                    setPlayerOne({
                        ...playerOne,
                        status: RoomPlayerStatus.READY_TO_BATTLE
                    });

                    if (getPlayerTwo()?.status === RoomPlayerStatus.READY_TO_BATTLE) {
                        setPhase?.('battle');
                        setWaitingOther(false);
                        updateRoomStatus(getRoom()!.id, 'battle');
                    }
                }
            } else if (payload.player_id == getPlayerTwo()?.player_id) {
                const playerTwo = getPlayerTwo();
                if (playerTwo) {
                    setPlayerTwo({
                        ...playerTwo,
                        status: RoomPlayerStatus.READY_TO_BATTLE
                    });
                    // Nếu mình đã ready thì kiểm tra luôn
                    if (getPlayerOne()?.status === RoomPlayerStatus.READY_TO_BATTLE) {
                        setPhase?.('battle');
                        setWaitingOther(false);
                        updateRoomStatus(getRoom()!.id, 'battle');
                    }
                }
            }
        });
    }, [getSocket]);

    // Shared rotation function
    const handleRotate = () => {
        setOrientation(prev => {
            const newOrientation = prev === 'horizontal' ? 'vertical' : 'horizontal';
            // Update preview immediately after rotation
            if (hoverPosition) {
                updatePreview(hoverPosition.x, hoverPosition.y, newOrientation);
            }
            return newOrientation;
        });
    };

    // Update preview function
    const updatePreview = (x: number, y: number, shipOrientation: 'horizontal' | 'vertical') => {
        if (currentShipIndex >= ships.length) return;
        
        const currentShip = ships[currentShipIndex];
        const previewPositions = getPreviewPositions(x, y, currentShip.size, shipOrientation);
        const canPlace = canPlaceShip(board, x, y, currentShip.size, shipOrientation);
        
        setBoard(prevBoard => {
            const newBoard = prevBoard.map(row => row.map(square => ({
                ...square,
                status: square.status === 'preview' || square.status === 'preview-invalid' ? 'empty' : square.status
            })));
            
            previewPositions.forEach(({ x: px, y: py }, index) => {
                // Only update if the square is not already a ship
                if (newBoard[px][py].status !== 'ship') {
                    newBoard[px][py] = {
                        ...newBoard[px][py],
                        status: (canPlace ? 'preview' : 'preview-invalid') as any,
                        shipPart: {
                            shipId: currentShip.id,
                            index: index + 1,
                            direction: shipOrientation
                        }
                    };
                }
            });
            
            return newBoard;
        });
    };

    const handleSquareHover = (x: number, y: number) => {
        // Nếu tất cả thuyền đã đặt, không hiển thị preview.
        if (ships.every(s => s.placed)) {
            return;
        }
        if (currentShipIndex >= ships.length) return; // Không còn thuyền nào chờ đặt, không preview
        setHoverPosition({ x, y });
        updatePreview(x, y, orientation);
    };

    const handleSquareClick = (x: number, y: number) => {
        if (waitingOther) return; // Không cho phép đặt lại thuyền khi đang chờ
        // Nếu đang đặt thuyền mới
        if (currentShipIndex < ships.length) {
            const currentShip = ships[currentShipIndex];
            if (canPlaceShip(board, x, y, currentShip.size, orientation)) {
                // Tính toán danh sách tọa độ
                const positions: {x: number, y: number}[] = [];
                if (orientation === 'horizontal') {
                    for (let i = 0; i < currentShip.size; i++) {
                        positions.push({ x, y: y + i });
                    }
                } else {
                    for (let i = 0; i < currentShip.size; i++) {
                        positions.push({ x: x + i, y });
                    }
                }
                // Đặt thuyền lên board
                setBoard(prevBoard => {
                    const newBoard = prevBoard.map(row => row.map(square => ({ ...square })));
                    positions.forEach((pos, index) => {
                        newBoard[pos.x][pos.y] = {
                            ...newBoard[pos.x][pos.y],
                            status: 'ship',
                            shipPart: {
                                shipId: currentShip.id,
                                index: index + 1,
                                direction: orientation === 'horizontal' ? 'horizontal' : 'vertical'
                            }
                        };
                    });
                    return newBoard;
                });
                // Lưu lại positions cho thuyền
                setShips((prevShips: Ship[]) => {
                    const newShips = prevShips.map((ship, idx) =>
                        idx === currentShipIndex
                            ? { ...ship, placed: true, position: { x, y }, orientation, positions }
                            : ship
                    );
                    // Sau khi đặt, cập nhật placedShips vào store (kiểu mới)
                    const placedShipsForStore = newShips
                        .filter(s => s.placed && s.positions)
                        .map(s => ({
                            name: s.name || '',
                            positions: s.positions!,
                            size: s.size,
                            orientation: s.orientation as 'horizontal' | 'vertical',
                        }));
                    setPlacedShips(placedShipsForStore);
                    // Sau khi đặt, kiểm tra xem đã hết thuyền chưa
                    if (newShips.every(s => s.placed)) {
                        setCurrentShipIndex(newShips.length); // Hết thuyền, chuyển sang chế độ chờ
                    } else {
                        // Vẫn còn thuyền, tìm thuyền tiếp theo chưa đặt
                        const nextShipIndex = newShips.findIndex(s => !s.placed);
                        setCurrentShipIndex(nextShipIndex !== -1 ? nextShipIndex : newShips.length);
                    }
                    return newShips;
                });
                setHoverPosition(null);
            }
            return;
        }
        // Nếu đã đặt xong, kiểm tra click vào thuyền nào
        // Tìm thuyền chứa ô này
        const shipIdx = ships.findIndex(ship => ship.positions && ship.positions.some(pos => pos.x === x && pos.y === y));
        if (shipIdx !== -1) {
            const ship = ships[shipIdx];
            // Xóa toàn bộ thuyền khỏi board
            setBoard(prevBoard => {
                const newBoard = prevBoard.map(row => row.map(square => ({ ...square })));
                (ship.positions || []).forEach(pos => {
                    newBoard[pos.x][pos.y] = {
                        ...newBoard[pos.x][pos.y],
                        status: 'empty',
                    };
                });
                return newBoard;
            });
            // Đánh dấu thuyền là chưa đặt
            setShips((prevShips: Ship[]) => {
                const newShips = prevShips.map((s, idx) =>
                    idx === shipIdx
                        ? { ...s, placed: false, position: undefined, orientation: undefined, positions: undefined }
                        : s
                );
                // Sau khi bỏ đặt, cập nhật placedShips vào store (kiểu mới)
                const placedShipsForStore = newShips
                    .filter(s => s.placed && s.positions)
                    .map(s => ({
                        name: s.name || '',
                        positions: s.positions!,
                        size: s.size,
                        orientation: s.orientation as 'horizontal' | 'vertical',
                    }));
                setPlacedShips(placedShipsForStore);
                // Cho phép đặt lại thuyền này
                setCurrentShipIndex(shipIdx);
                setOrientation(ship.orientation || 'horizontal');
                setHoverPosition(null);
                return newShips;
            });
        }
    };

    const handleMouseLeave = () => {
        setHoverPosition(null);
        setBoard(prevBoard => {
            return prevBoard.map(row => row.map(square => ({
                ...square,
                status: square.status === 'preview' || square.status === 'preview-invalid' ? 'empty' : square.status
            })));
        });
    };

    const handleCallBackStart = () => {
        const socket = getSocket("battleship")?.socket as Socket;
        if (!socket) {
            console.error("Socket connection failed");
            return;
        }
        setWaitingOther(true);
    }
    // Tính số thuyền còn lại (chưa đặt)
    const shipsLeft = ships.filter(s => !s.placed).length;

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Place Your Ships
            </h2>
            {/* Hiển thị số thuyền còn lại */}
            <div className="mb-2 text-base font-semibold text-blue-600 dark:text-blue-400">
                Số thuyền còn lại: {shipsLeft}
            </div>
            
            {/* Instructions */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-4 mb-2">
                    <p>Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">R</kbd> to rotate ship</p>
                    <button
                        onClick={handleRotate}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium"
                    >
                        Rotate Ship
                    </button>
                </div>
                <p>Current ship: {ships[currentShipIndex]?.size || 'All placed'} units</p>
                <p>Orientation: {orientation}</p>
            </div>
            
            {/* Column labels (A-J) */}
            <div className="flex gap-1 ml-8">
                {Array.from({ length: BOARD_SIZE }, (_, i) => (
                    <div key={i} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                        {String.fromCharCode(65 + i)}
                    </div>
                ))}
            </div>
            
            {/* Board grid */}
            <div className="flex">
                {/* Row labels (1-10) */}
                <div className="flex flex-col gap-1 mr-2">
                    {Array.from({ length: BOARD_SIZE }, (_, i) => (
                        <div key={i} className="w-6 h-8 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                            {i + 1}
                        </div>
                    ))}
                </div>
                
                {/* Board squares */}
                <div 
                    className={`grid grid-cols-10 gap-1 ${waitingOther ? 'cursor-not-allowed opacity-70' : ''}`}
                    onMouseLeave={handleMouseLeave}
                >
                    {board.map((row, x) =>
                        row.map((square, y) => (
                            <div key={`${x}-${y}`} className={waitingOther ? 'cursor-not-allowed' : ''}>
                                <ShipSquare
                                    square={square}
                                    position={{ x, y }}
                                    onClick={() => handleSquareClick(x, y)}
                                    onHover={() => handleSquareHover(x, y)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-600 dark:bg-gray-500 rounded"></div>
                    <span>Ship</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-300 dark:bg-green-600 rounded"></div>
                    <span>Preview</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"></div>
                    <span>Empty</span>
                </div>
            </div>
            {/* Start button: luôn hiển thị, disable khi chưa đặt xong hoặc đang chờ */}
            {waitingOther && (
                <div className="mt-4 text-yellow-600 dark:text-yellow-400 font-semibold animate-pulse">
                    Waiting for other player...
                </div>
            )}
            <button
                className={`mt-6 px-6 py-2 rounded-lg text-lg font-semibold shadow transition-colors \
                    ${shipsLeft === 0 && !waitingOther ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                onClick={() => onStart?.(board, ships, handleCallBackStart)}
                disabled={shipsLeft > 0 || waitingOther}
            >
                Start
            </button>
        </div>
    );
};

export default ShipBoard;