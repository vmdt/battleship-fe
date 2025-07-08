"use client";
import HomeLayout from "@/layouts/default";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { playerCreateRoom } from "@/services/roomService";
import { useSocketStore } from "@/stores/socketStore";

const GAME_ID = "battleship";

const BattleShipPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { connect, getSocket } = useSocketStore();

    useEffect(() => {
        if (!getSocket(GAME_ID)) {
            connect(GAME_ID);
        }
        const socket = getSocket(GAME_ID);
        if (!socket) {
            console.error("Socket connection failed");
            return;
        }

        socket.emit("room:join", { roomId: "user:test" });

    }, [connect, getSocket]);

    const handleCreateRoom = async () => {
        const playerName = prompt("Enter your player name:");
        if (!playerName) return;
        setLoading(true);
        try {
            const userId = null;
            const data = await playerCreateRoom(GAME_ID, playerName, userId);
            const socket = getSocket(GAME_ID);
            if (!socket) {
                alert("Socket connection failed");
                return;
            }

            socket.on("room:joined", (payload) => {
                console.log("Room joined event received:", payload);
                if (payload?.room_id) {
                    console.log("Joined room successfully:", payload);
                    router.push(`/battleship/${payload.room_id}`);
                }
            });
        } catch (err) {
            alert("Create room failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <HomeLayout>
            <div className="bg-white text-black dark:bg-gray-900 dark:text-white p-4 rounded transition-colors">
                <h1 className="text-2xl font-semibold">Battleship Game</h1>
                <p className="mt-2">Welcome to the Battleship game page!</p>
                <Button className="mt-4" onClick={handleCreateRoom} disabled={loading}>
                    {loading ? "Creating..." : "Create Room"}
                </Button>
            </div>
        </HomeLayout>
    )
}
export default BattleShipPage;