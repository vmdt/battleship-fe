"use client";
import HomeLayout from "@/layouts/default";

const BattleShipPage = () => {
    return (
        <HomeLayout>
            <div className="bg-white text-black dark:bg-gray-900 dark:text-white p-4 rounded transition-colors">
                <h1 className="text-2xl font-semibold">Battleship Game</h1>
                <p className="mt-2">Welcome to the Battleship game page!</p>
            </div>
        </HomeLayout>
    )
}
export default BattleShipPage;