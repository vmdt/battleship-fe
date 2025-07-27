"use client";
import HomeLayout from "@/layouts/default";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { playerCreateRoom } from "@/services/roomService";
import { useSocketStore } from "@/stores/socketStore";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import { RoomModel, RoomPlayerModel } from "@/models";
import { Card } from "@/components/ui/card";
import { CreateRoomModal } from "@/partials/battleship/home/create-room-modal";
import { LoginModal } from "@/partials/auth/login-modal";
import { SignupModal } from "@/partials/auth/signup-modal";

const GAME_ID = "battleship";

const BattleShipPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const { connect, getSocket } = useSocketStore();
    const { setRoom, setRoomId, setPlayerOne, setPlayerTwo, getMe, setMe } = useRoomStore();
    const { isLogin, login } = useUserStore();

    useEffect(() => {
        setRoom(null);
        setRoomId(null);
        setPlayerOne(null);
        setPlayerTwo(null);
        setMe(0);
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

    const handleCreateRoom = async (displayName: string) => {
        setLoading(true);
        try {
            const userId = null;
            // reset rooom
            setRoomId(null);
            setRoom(null);
            setPlayerOne(null);
            setPlayerTwo(null);
            const data = await playerCreateRoom(GAME_ID, displayName, userId);
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
                    setMe(1);
                    router.push(`/battleship/${payload.room_id}`);
                }
            });
        } catch (err) {
            alert("Create room failed");
        } finally {
            setLoading(false);
            setIsCreateModalOpen(false);
        }
    };

    const handleCreateRoomClick = () => {
        if (!isLogin) {
            setIsLoginModalOpen(true);
            return;
        }
        setIsCreateModalOpen(true);
    };

    const handleLogin = async (email: string, password: string) => {
        // TODO: Implement actual login API call
        console.log('Login attempt:', email, password);
        
        // Mock login for now
        const mockUser = {
            id: '1',
            name: 'Dat',
            email: email,
            avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Dat'
        };
        const mockToken = 'mock-token-123';
        
        login(mockUser, mockToken);
        setIsLoginModalOpen(false);
        
        // Auto open create room modal after login
        setIsCreateModalOpen(true);
    };

    const handleSignup = async (username: string, email: string, password: string) => {
        // TODO: Implement actual signup API call
        console.log('Signup attempt:', username, email, password);
        
        // Mock signup for now
        const mockUser = {
            id: '2',
            name: username,
            email: email,
            avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=' + username
        };
        const mockToken = 'mock-token-456';
        
        login(mockUser, mockToken);
        setIsSignupModalOpen(false);
        
        // Auto open create room modal after signup
        setIsCreateModalOpen(true);
    };

    const handleSignupClick = () => {
        setIsLoginModalOpen(false);
        setIsSignupModalOpen(true);
    };

    const handleLoginClick = () => {
        setIsSignupModalOpen(false);
        setIsLoginModalOpen(true);
    };

    return (
        <HomeLayout>
            <div className="mt-[1rem] ml-[1rem]">
                <span className="text-lg text-gray dark:text-white font-bold font-luckiest">Welcome back, Player!</span>
            </div>
            <div className="flex flex-col md:flex-row mt-8 mx-4 md:gap-[5rem] gap-[3rem]">
                <div className="flex-1">
                    <Card className="w-full bg-zinc-100 dark:bg-[#2c3e50] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow p-3">
                        <div className="flex justify-center items-center h-full rounded-y-xl border-b-2">
                            <img
                                src="/assets/images/cover-image.png"
                                alt="Battleship Logo"
                                className="w-full object-cover rounded-t-xl"
                            />
                        </div>
                        <div className="flex flex-col justify-between my-4 px-4 gap-6">
                            <Button
                                onClick={handleCreateRoomClick}
                                variant="outline"
                                className="flex items-center gap-4 p-[1.5rem]"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                                Create Room
                            </Button>
                            <Button variant="outline" className="flex items-center gap-4 p-[1.5rem]">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600" viewBox="0 0 24 24"><path d="M15 12H9m12 0A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"/></svg>
                                Join Room
                            </Button>
                            <Button variant="outline" className="flex items-center gap-4 p-[1.5rem]">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M12 4v16m0 0H3"/></svg>
                                How to Play
                            </Button>
                        </div>
                    </Card>
                </div>
                <div className="flex-[1.5]">
                    <Card className="w-full bg-teal-100 dark:bg-[#2c3e50] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow p-2">
                        <div className="p-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                Leaderboard
                            </h2>

                            <div className="space-y-3">
                                {/* Top 10 Players */}
                                {[
                                    { rank: 1, name: "Alex Johnson", country: "🇺🇸 USA", score: 2850, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Alex" },
                                    { rank: 2, name: "Maria Garcia", country: "🇪🇸 Spain", score: 2720, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Maria" },
                                    { rank: 3, name: "Chen Wei", country: "🇨🇳 China", score: 2650, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Chen" },
                                    { rank: 4, name: "Yuki Tanaka", country: "🇯🇵 Japan", score: 2580, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Yuki" },
                                    { rank: 5, name: "Hans Mueller", country: "🇩🇪 Germany", score: 2510, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Hans" },
                                    { rank: 6, name: "Sofia Ivanova", country: "🇷🇺 Russia", score: 2440, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia" },
                                    { rank: 7, name: "Pierre Dubois", country: "🇫🇷 France", score: 2370, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Pierre" },
                                    { rank: 8, name: "Luca Rossi", country: "🇮🇹 Italy", score: 2300, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Luca" },
                                    { rank: 9, name: "Kim Min-jun", country: "🇰🇷 Korea", score: 2230, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Kim" },
                                    { rank: 10, name: "Ana Silva", country: "🇧🇷 Brazil", score: 2160, avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ana" }
                                ].map((player) => (
                                    <div key={player.rank} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            {/* Rank Badge */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                                player.rank === 1 ? 'bg-yellow-500' :
                                                player.rank === 2 ? 'bg-gray-400' :
                                                player.rank === 3 ? 'bg-amber-600' :
                                                'bg-blue-500'
                                            }`}>
                                                {player.rank}
                                            </div>

                                            {/* Avatar */}
                                            <img
                                                src={player.avatar}
                                                alt={player.name}
                                                className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                                            />

                                            {/* Player Info */}
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800 dark:text-white text-sm">
                                                    {player.name}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                    {player.country}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <span className="font-bold text-lg text-gray-800 dark:text-white">
                                                {player.score.toLocaleString()}
                                            </span>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create Room Modal */}
            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateRoom}
            />

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLogin={handleLogin}
                onSignupClick={handleSignupClick}
            />

            {/* Signup Modal */}
            <SignupModal
                isOpen={isSignupModalOpen}
                onClose={() => setIsSignupModalOpen(false)}
                onLoginClick={handleLoginClick}
                onSignup={handleSignup}
            />

        </HomeLayout>
    )
}
export default BattleShipPage;