"use client";

import { useState, useEffect } from 'react';
import ShipSquare from '@/components/Square/ShipSquare';
import { Square } from '@/models/game';
import type { Ship } from '@/models/game/ship';
import { canPlaceShip, getPreviewPositions } from '@/utils/shipUtils';
import { useRouter } from 'next/navigation';

interface ShipBoardProps {
    onStart?: (board: Square[][], ships: Ship[]) => void;
}

const ShipBoard = ({ onStart }: ShipBoardProps) => {
    const BOARD_SIZE = 10;
    const router = useRouter();
    
    // Ship configurations
    const initialShips: Ship[] = [
        { id: 5, size: 5, placed: false }, // Carrier
        { id: 4, size: 4, placed: false }, // Battleship
        { id: 3, size: 3, placed: false }, // Cruiser
        { id: 3, size: 3, placed: false }, // Submarine
        { id: 2, size: 2, placed: false }, // Destroyer
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
            setShips((prevShips: Ship[]) => prevShips.map((s, idx) =>
                idx === shipIdx
                    ? { ...s, placed: false, position: undefined, orientation: undefined, positions: undefined }
                    : s
            ));
            // Cho phép đặt lại thuyền này
            setCurrentShipIndex(shipIdx);
            setOrientation(ship.orientation || 'horizontal');
            setHoverPosition(null);
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
                    className="grid grid-cols-10 gap-1"
                    onMouseLeave={handleMouseLeave}
                >
                    {board.map((row, x) =>
                        row.map((square, y) => (
                            <ShipSquare
                                key={`${x}-${y}`}
                                square={square}
                                position={{ x, y }}
                                onClick={() => handleSquareClick(x, y)}
                                onHover={() => handleSquareHover(x, y)}
                            />
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
            {/* Start button: only show when all ships placed */}
            {shipsLeft === 0 && (
                <button
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold shadow transition-colors"
                    onClick={() => onStart?.(board, ships)}
                >
                    Start
                </button>
            )}
        </div>
    );
};

export default ShipBoard;