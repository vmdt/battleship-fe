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
import { Chat } from '../chat/chat';
import { useCountdownTimer, formatTime } from '@/hooks/useCountdownTimer';
import { checkWhoWin } from '@/services/battleshipService';
import { toast } from 'sonner';
import { useTranslations } from "next-intl";

interface ShipBoardProps {
    onStart?: (board: Square[][], ships: Ship[], callback: Function) => void;
    setPhase?: (phase: 'lobby' | 'setup' | 'battle') => void;
}

// Hàm render header cho chatbox (không có turn/timer)
function renderHeaderForChat() {
  const defaultAvatar = '/assets/images/battleship-logo.png';
  // TODO: Lấy playerOne, playerTwo, opponentDisconnected từ store nếu muốn dynamic
  return (
    <div className="w-full flex flex-row items-center justify-center gap-4 py-3 px-4 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow border mb-2">
      {/* Player 1 */}
      <div className="flex flex-col items-center min-w-[70px]">
        <img
          src={defaultAvatar}
          alt="avatar1"
          className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover"
        />
        <span className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[70px] truncate text-center">Player 1</span>
        <span className="flex items-center mt-1">
          <span className={`w-2.5 h-2.5 rounded-full mr-1 bg-green-500`}></span>
          <span className="text-xs text-gray-500">Connected</span>
        </span>
      </div>
      {/* VS */}
      <div className="flex flex-col items-center mx-2 min-w-[90px]">
        <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-red-500 text-white text-lg font-extrabold shadow border-2 border-white dark:border-gray-800 mb-1">VS</span>
      </div>
      {/* Player 2 */}
      <div className="flex flex-col items-center min-w-[70px]">
        <img
          src={defaultAvatar}
          alt="avatar2"
          className="w-10 h-10 rounded-full border-2 border-red-400 object-cover"
        />
        <span className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[70px] truncate text-center">Player 2</span>
        <span className="flex items-center mt-1">
          <span className={`w-2.5 h-2.5 rounded-full mr-1 bg-green-500`}></span>
          <span className="text-xs text-gray-500">Connected</span>
        </span>
      </div>
    </div>
  );
}

const ShipBoard = ({ onStart, setPhase }: ShipBoardProps) => {
    const BOARD_SIZE = 10;
    const router = useRouter();
    const { setPlacedShips } = useBoardStore();
    const { getRoom, getPlayerOne, getPlayerTwo, setPlayerOne, setPlayerTwo, getMe } = useRoomStore();
    const t = useTranslations("ShipBoard");

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
    const [timeoutHandled, setTimeoutHandled] = useState(false);

    // Get room options for countdown timer
    const room = getRoom();
    const roomOptions = room?.options;
    
    // Initialize countdown timer
    const { timeLeft, isTimeout, isActive } = useCountdownTimer({
      startPlaceAt: roomOptions?.start_place_at,
      timePlaceShip: roomOptions?.time_place_ship || 120
    });

    // Handle timeout - check win status and show toast
    useEffect(() => {
      if (isTimeout && setPhase && !timeoutHandled) {
        setTimeoutHandled(true);
        const handleTimeout = async () => {
          try {
            const room = getRoom();
            if (!room?.id) return;
            
            const winResponse = await checkWhoWin(room.id);
            const currentPlayerId = getMe() === 1 ? getPlayerOne()?.player_id : getPlayerTwo()?.player_id;
            
            // Find current player's status
            const currentPlayerStatus = winResponse.win_status.find(
              status => status.player_id === currentPlayerId
            );
            
            if (currentPlayerStatus) {
              if (!currentPlayerStatus.placed) {
                // Player didn't finish placing ships - show lose toast
                toast.info(t('you_lost_timeout'), {
                  duration: 5000,
                  description: t('timeout_description', { time: roomOptions?.time_place_ship || 120 })
                });
              } else {
                // Player finished placing ships but timeout - show info toast
                toast.info(t('timeout_info'), {
                  duration: 3000,
                  description: t('timeout_info_description')
                });
              }
            }
            
            // Auto transition to battle phase after showing toast
            // setTimeout(() => {
            //   setPhase('battle');
            // }, 3000);
            
          } catch (error) {
            console.error('Error checking win status:', error);
            // // Still transition to battle phase even if API fails
            // setTimeout(() => {
            //   setPhase('battle');
            // }, 2000);
          }
        };
        
        handleTimeout();
      }
    }, [isTimeout, setPhase, getRoom, getMe, getPlayerOne, getPlayerTwo, timeoutHandled]);

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
        if (waitingOther || isTimeout) return; // Không cho phép đặt lại thuyền khi đang chờ hoặc timeout
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
        <div className="flex flex-col md:flex-row w-full h-full">
            {/* Cột trái: Ship board */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {t('place_your_ships')}
                </h2>
                
                {/* Countdown Timer */}
                <div className="mb-4 text-center">
                    <div className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {t('time_remaining')}
                    </div>
                    {isTimeout ? (
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400 animate-pulse">
                            {t('timeout')}
                        </div>
                    ) : (
                        <div className={`text-3xl font-bold ${timeLeft <= 30 ? 'text-red-600 dark:text-red-400 animate-pulse' : timeLeft <= 60 ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
                
                {/* Hiển thị số thuyền còn lại */}
                <div className="mb-2 text-base font-semibold text-blue-600 dark:text-blue-400">
                    {t('ships_remaining')} {shipsLeft}
                </div>
                {/* Instructions */}
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-4 mb-2">
                        <p>{t('press_r_to_rotate')}</p>
                        <button
                            onClick={handleRotate}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium"
                        >
                            {t('rotate_ship')}
                        </button>
                    </div>
                    <p>{t('current_ship')} {ships[currentShipIndex]?.size || 'All placed'} {t('units')}</p>
                    <p>{t('orientation')} {orientation}</p>
                </div>
                {/* Board + labels với background xanh */}
                <div className="bg-[#699BF7] dark:bg-[#699BF7]/80 rounded-lg shadow-md p-2 flex flex-col items-center border-2 border-white dark:border-gray-800">
                    {/* Column labels (A-J) */}
                    <div className="flex gap-1 ml-8">
                        {Array.from({ length: BOARD_SIZE }, (_, i) => (
                            <div key={i} className="w-12 h-12 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-600">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                    </div>
                    {/* Board grid */}
                    <div className="flex">
                        {/* Row labels (1-10) */}
                        <div className="flex flex-col gap-1 mr-2">
                            {Array.from({ length: BOARD_SIZE }, (_, i) => (
                                <div key={i} className="w-12 h-12 flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-600">
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        {/* Board squares */}
                        <div 
                            className={`grid grid-cols-10 gap-1 ${waitingOther || isTimeout ? 'cursor-not-allowed opacity-70' : ''}`}
                            onMouseLeave={handleMouseLeave}
                        >
                            {board.map((row, x) =>
                                row.map((square, y) => (
                                    <div key={`${x}-${y}`} className={waitingOther || isTimeout ? 'cursor-not-allowed' : ''}>
                                        <ShipSquare
                                            square={square}
                                            position={{ x, y }}
                                            onClick={() => handleSquareClick(x, y)}
                                            onHover={() => handleSquareHover(x, y)}
                                            size="lg"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="flex gap-6 mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-600 dark:bg-gray-500 rounded"></div>
                        <span>{t('ship')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-300 dark:bg-green-600 rounded"></div>
                        <span>{t('preview')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"></div>
                        <span>{t('empty')}</span>
                    </div>
                </div>
                {/* Start button: luôn hiển thị, disable khi chưa đặt xong hoặc đang chờ hoặc timeout */}
                {waitingOther && (
                    <div className="mt-4 text-yellow-600 dark:text-yellow-400 font-semibold animate-pulse">
                        {t('waiting_for_other')}
                    </div>
                )}
                {isTimeout && (
                    <div className="mt-4 text-red-600 dark:text-red-400 font-semibold animate-pulse">
                        {t('times_up')}
                    </div>
                )}
                <button
                    className={`mt-6 px-6 py-2 rounded-lg text-lg font-semibold shadow transition-colors \
                        ${shipsLeft === 0 && !waitingOther && !isTimeout ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                    onClick={() => onStart?.(board, ships, handleCallBackStart)}
                    disabled={shipsLeft > 0 || waitingOther || isTimeout}
                >
                    {t('start')}
                </button>
            </div>
            {/* Cột phải: Chatbox */}
            <div className="w-full max-w-md flex flex-col items-center justify-start mt-8">
                <Chat header={renderHeaderForChat()} />
            </div>
        </div>
    );
};

export default ShipBoard;