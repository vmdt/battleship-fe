import GameCard from "@/components/GameCard";
import { GameCardModel } from "@/models";

interface GameListProps {
    games: GameCardModel[];
}

const GameList = ({ games }: GameListProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {games.map((game, index) => (
                <GameCard key={index} {...game} />
            ))}
        </div>
    );
}

export default GameList;
