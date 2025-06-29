"use client";

import { useEffect, useState } from 'react';
import ShipSquare from '@/components/Square/ShipSquare';
import { Square } from '@/models/game';
import { Ship } from '@/models/game/ship';

const BOARD_SIZE = 10;

const createEmptyBoard = (): Square[][] =>
    Array(BOARD_SIZE).fill(null).map(() =>
        Array(BOARD_SIZE).fill(null).map(() => ({
            status: 'empty' as const,
            hover: false
        }))
    );

// Mock opponent's ships for simulation
const opponentShipsLayout: Ship[] = [
    { id: 1, size: 5, placed: true, positions: [{x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 1, y: 4}, {x: 1, y: 5}] },
    { id: 2, size: 4, placed: true, positions: [{x: 3, y: 3}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 6, y: 3}] },
];


export function BattleBoard({ myBoardInit, myShipsInit }: { myBoardInit?: Square[][], myShipsInit?: Ship[] }) {
    const [myBoard, setMyBoard] = useState<Square[][]>(myBoardInit ?? createEmptyBoard());
    const [myShips, setMyShips] = useState<Ship[]>(myShipsInit ?? []);
    const [opponentBoard, setOpponentBoard] = useState<Square[][]>(createEmptyBoard());
    const [isMyTurn, setIsMyTurn] = useState(true);
    const [gameStatus, setGameStatus] = useState("Your turn");

    const handleAttack = (x: number, y: number) => {
        if (!isMyTurn) return;

        const targetSquare = opponentBoard[x][y];
        if (targetSquare.status === 'hit' || targetSquare.status === 'miss') {
            return; // Already attacked
        }

        const newOpponentBoard = opponentBoard.map(row => row.map(sq => ({...sq})));
        
        const isHit = opponentShipsLayout.some(ship => 
            ship.positions?.some(pos => pos.x === x && pos.y === y)
        );

        if (isHit) {
            newOpponentBoard[x][y].status = 'hit';
        } else {
            newOpponentBoard[x][y].status = 'miss';
        }

        setOpponentBoard(newOpponentBoard);
        setIsMyTurn(false);
        setGameStatus("Opponent's turn");


        // Simulate opponent's turn
        setTimeout(() => {
            // A simple AI: random attack
            let ox, oy;
            do {
                ox = Math.floor(Math.random() * BOARD_SIZE);
                oy = Math.floor(Math.random() * BOARD_SIZE);
            } while (myBoard[ox][oy].status === 'hit' || myBoard[ox][oy].status === 'miss');
            
            const newMyBoard = myBoard.map(row => row.map(sq => ({...sq})));
            if (newMyBoard[ox][oy].status === 'ship') {
                newMyBoard[ox][oy].status = 'hit';
            } else {
                newMyBoard[ox][oy].status = 'miss';
            }
            setMyBoard(newMyBoard);
            setIsMyTurn(true);
            setGameStatus("Your turn");
            // TODO: Check for lose condition
        }, 1500);
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
            <div className={`flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md ${boardSizeClass}`}>
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
                    <div className="flex flex-col gap-1 bg-gray-200 dark:bg-gray-900 p-1 rounded-md">
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
    const mainBoardClickHandler = isMyTurn ? handleAttack : () => {};

    const secondaryBoard = isMyTurn ? myBoard : opponentBoard;
    const secondaryBoardTitle = isMyTurn ? "Your Board" : "Opponent's Board";

    return (
        <div className="relative p-4 md:p-6 flex flex-col md:flex-row items-center font-sans min-h-screen">
            <div className="w-full max-w-6xl mx-auto flex justify-center md:justify-start items-start md:pl-8 mt-8">
                <div className="w-full">
                    <h2 className="text-xl font-semibold mb-2 text-center">{mainBoardTitle}</h2>
                    {renderBoard(mainBoard, mainBoardClickHandler, isMobile, !isMobile)}
                </div>
            </div>
            <div className="flex flex-col items-center mt-6 w-full">
                <h2 className="text-base font-semibold mb-1 text-center">{secondaryBoardTitle}</h2>
                {renderBoard(secondaryBoard, () => {}, true)}
            </div>
        </div>
    );
}