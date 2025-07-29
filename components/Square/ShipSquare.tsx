import { Square } from '@/models/game';
import { cn } from '@/lib/utils';

interface ShipSquareProps {
    square: Square;
    position: {
        x: number;
        y: number;
    };
    onClick: () => void;
    onHover: () => void;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

const ShipSquare = ({ square, position, onClick, onHover, size = 'md' }: ShipSquareProps) => {
    const getSquareClasses = () => {
        const baseClasses = "border-2 border-[#000000] dark:border-gray-600 cursor-pointer transition-all duration-200 flex items-center justify-center overflow-hidden rounded-[8px]";
        let sizeClasses = '';
        if (size === 'lg') sizeClasses = 'w-12 h-12 text-lg';
        else if (size === 'md') sizeClasses = 'w-8 h-8';
        else if (size === 'sm') sizeClasses = 'w-6 h-6 text-xs';
        else if (size === 'xs') sizeClasses = 'w-5 h-5 text-[10px]';
        
        switch (square.status) {
            case 'empty':
                return `${baseClasses} ${sizeClasses} bg-white hover:bg-blue-100`;
            case 'ship':
                return `${baseClasses} ${sizeClasses} bg-white`;
            case 'hit-all':
                return `${baseClasses} ${sizeClasses} bg-transparent border-red-500 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-700`;
            case 'hit':
                return `${baseClasses} ${sizeClasses} bg-[#F16858] dark:bg-[#F16858] text-white`;
            case 'miss':
                return `${baseClasses} ${sizeClasses} bg-blue-500 dark:bg-blue-800`;
            case 'preview':
                return `${baseClasses} ${sizeClasses} bg-green-300 dark:bg-green-600`;
            case 'preview-invalid':
                return `${baseClasses} ${sizeClasses} bg-red-300 dark:bg-red-700`;
            default:
                return `${baseClasses} ${sizeClasses}`;
        }
    };

    const getShipImagePath = (id: number, index: number) => {
        return `/assets/images/ship${id}/ship${id}_${index}.png`;
    };

    const getSquareContent = () => {
        if ((square.status === 'ship' || square.status === 'preview') && square.shipPart) {
            const { index, direction, shipId } = square.shipPart;

            return (
                <div className="relative w-full h-full">
                    {square.status === 'preview' && (
                        <div className="absolute inset-0 bg-green-200 rounded-sm z-0" />
                    )}
                    <img
                        src={getShipImagePath(shipId,index)}
                        alt={`ship-part-${index}`}
                        className={cn(
                            'w-full h-full object-contain z-10 relative transition-transform duration-200',
                            direction === 'vertical' ? 'rotate-90' : ''
                        )}
                    />
                </div>
            );
        }

        if (square.status === 'hit') {
            return (
                <div className="relative w-full h-full">
                    <img
                        src="/assets/animations/fire.gif"
                        alt="fire-effect"
                        className="absolute inset-0 z-3 w-full h-full object-contain pointer-events-none"
                    />
                </div>
            );
        }

        if (square.status === 'hit-all' && square.shipPart) {
            const { index, direction, shipId } = square.shipPart;
            return (
                <div className="relative w-full h-full">
                    <img
                        src={getShipImagePath(shipId, index)}
                        alt={`ship-part-${index}`}
                        className={cn(
                            'w-full h-full object-contain z-10 relative transition-transform duration-200',
                            direction === 'vertical' ? 'rotate-90' : ''
                        )}
                    />
                    <img
                        src="/assets/animations/fire.gif"
                        alt="fire-effect"
                        className="absolute inset-0 z-3 w-full h-full object-contain pointer-events-none"
                    />
                </div>
            )
        }

        if (square.status === 'miss') {
            return (
                <div className="relative w-full h-full">
                    <img
                        src="/assets/animations/water.gif"
                        alt="miss-icon"
                        className="w-full h-full object-contain"
                    />
                </div>
            )
        }

        switch (square.status) {
            case 'preview-invalid':
                return '❌';
            default:
                return '';
        }
    };



    return (
        <div
            className={getSquareClasses()}
            onClick={onClick}
            onMouseEnter={onHover}
            onMouseLeave={onHover}
            title={`Position: ${position.x}, ${position.y}`}
        >
            {getSquareContent()}
        </div>
    );
};

export default ShipSquare;
