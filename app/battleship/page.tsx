"use client";
import HomeLayout from "@/layouts/default";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { playerCreateRoom } from "@/services/roomService";
import { useSocketStore } from "@/stores/socketStore";
import { useRoomStore } from "@/stores/roomStore";
import { RoomModel, RoomPlayerModel } from "@/models";

const GAME_ID = "battleship";

const BattleShipPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { connect, getSocket } = useSocketStore();
    const { setRoom, setRoomId, setPlayerOne, setPlayerTwo, getMe } = useRoomStore();

    useEffect(() => {
        if (!getSocket(GAME_ID)) {
            connect(GAME_ID, getMe());
        }
        const socket = getSocket(GAME_ID)?.socket;
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
            // reset rooom
            setRoomId(null);
            setRoom(null);
            setPlayerOne(null);
            setPlayerTwo(null);
            const data = await playerCreateRoom(GAME_ID, playerName, userId);
            const socket = getSocket(GAME_ID)?.socket;
            if (!socket) {
                alert("Socket connection failed");
                return;
            }

            socket.on("room:joined", (payload) => {
                if (payload?.room_id) {
                    setRoom(data?.room as RoomModel);
                    setPlayerOne(data as RoomPlayerModel);
                    setRoomId(payload.room_id);
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