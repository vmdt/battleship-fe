import Image from "next/image";
import { useState, useEffect } from "react";
import { useRoomStore } from "@/stores/roomStore";
import { useSocketStore } from "@/stores/socketStore";
import { getRoom, kickRoomPlayer, updateRoomPlayer } from "@/services/roomService";
import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { InviteQR } from './lobby/invite-qr';
import { useUserStore } from '@/stores/userStore';
import { LoginModal } from '@/partials/auth/login-modal';

export default function Lobby() {
  const [hasOpponent, setHasOpponent] = useState(false);
  const { 
    playerOne, 
    playerTwo, 
    setPlayerOne, 
    setPlayerTwo, 
    setRoom, 
    setRoomId,
    setMe,
    getRoom: getRoomFromStore,
    getPlayerOne,
    getPlayerTwo,
    getMe 
  } = useRoomStore();
  
  const { getSocket } = useSocketStore();
  const router = useRouter();

  // Check if there is a second player
  const hasPlayerTwo = !!playerTwo;

  // Get current player information
  const currentMe = getMe();
  const isPlayerOne = currentMe === 1;
  const isPlayerTwo = currentMe === 2;

  // Listen for room:joined and user:disconnected events
  useEffect(() => {
    const socket = getSocket('battleship')?.socket as Socket;
    if (!socket) {
      console.error('Socket connection not available');
      return;
    }

    const handleRoomJoined = async (payload: any) => {   
      if (payload?.room_id) {
        try {
          const roomData = await getRoom(payload.room_id);
          console.log('Updated room data:', roomData);
          
          if (roomData.room) {
            setRoom(roomData.room);
            setRoomId(roomData.room.id);
          }
          
          if (roomData.players && roomData.players.length > 0) {
            if (roomData.players[0]) {
              setPlayerOne(roomData.players[0]);
            }
            
            if (roomData.players.length > 1 && roomData.players[1]) {
              setPlayerTwo(roomData.players[1]);
            }
          }
        } catch (error) {
          console.error('Error fetching updated room data:', error);
        }
      }
    };

    const handleUserDisconnected = async (payload: any) => {     
        console.log('User disconnected:', payload); 
        if (payload) {
            if (getMe() === 1) {
                const playerTwo = getPlayerTwo();
                if (playerTwo && !playerTwo.is_disconnected) {
                    const data = await updateRoomPlayer(getRoomFromStore()?.id || "", playerTwo.player.id, { is_disconnected: true });
                    if (data) {
                        setPlayerTwo(data);
                    }
                }
            } else if (getMe() === 2) {
                const playerOne = getPlayerOne();
                if (playerOne && !playerOne.is_disconnected) {
                    const data = await updateRoomPlayer(getRoomFromStore()?.id || "", playerOne.player.id, { is_disconnected: true });
                    if (data) {
                        setPlayerOne(data);
                    }
                }
            }
        } 
    };

    const handleUserReconnected = async (payload: any) => {
        console.log('User reconnected:', payload);
        if (payload) {
            if (getMe() === 1) {
                const playerTwo = getPlayerTwo();
                if (playerTwo && playerTwo.is_disconnected) {
                    const data = await updateRoomPlayer(getRoomFromStore()?.id || "", playerTwo.player.id, { is_disconnected: false });
                    if (data) {
                        setPlayerTwo(data);
                    }
                }
            } else if (getMe() === 2) {
                const playerOne = getPlayerOne();
                if (playerOne && playerOne.is_disconnected) {
                    const data = await updateRoomPlayer(getRoomFromStore()?.id || "", playerOne.player.id, { is_disconnected: false });
                    if (data) {
                        setPlayerOne(data);
                    }
                }
            }
        }
    }

    const handleRoomKicked = async (payload: any) => {
      console.log('Room kicked:', payload);
      
      // Kiểm tra xem player hiện tại có phải là người bị kick không
      const currentPlayerId = getMe() === 1 ? getPlayerOne()?.player.id : getPlayerTwo()?.player.id;
      const kickedPlayerId = payload?.player_id || payload?.kicked_player_id;
      
      // Chỉ xử lý nếu player hiện tại là người bị kick
      if (currentPlayerId === kickedPlayerId) {
        // Reset store
        setRoom(null);
        setRoomId(null);
        setPlayerOne(null);
        setPlayerTwo(null);
        setMe(0);
        
        // Show toast notification
        alert('Bạn đã bị chủ phòng kick!');
        
        // Navigate back to battleship page
        router.push('/battleship');
      }
    }

    // Register listener for room:joined event
    socket.on('room:joined', handleRoomJoined);

    // Register listener for user:disconnected event
    socket.on('user:disconnected', handleUserDisconnected);

    socket.on('user:reconnected', handleUserReconnected);

    socket.on('room:kicked', handleRoomKicked);

    // Cleanup listener when component unmounts
    return () => {
      socket.off('room:joined', handleRoomJoined);
      socket.off('user:disconnected', handleUserDisconnected);
      socket.off('user:reconnected', handleUserReconnected);
      socket.off('room:kicked', handleRoomKicked);
    };
  }, [getSocket, setPlayerOne, setPlayerTwo, setRoom, setRoomId, setMe, router]);

  // Helper function to check if player is disconnected
  const isPlayerDisconnected = (player: number) => {
    if (player === 1) {
      const playerOneData = getPlayerOne();
      return playerOneData?.is_disconnected || false;
    } else if (player === 2) {
      const playerTwoData = getPlayerTwo();
      return playerTwoData?.is_disconnected || false;
    }
    return false;
  };

  const handleKickPlayer = async (player: number) => {
    if (player === 2 && isPlayerOne && hasPlayerTwo) {
      const isKick = await kickRoomPlayer(getRoomFromStore()?.id || "", getPlayerTwo()?.player.id || "");
      if (isKick) {
        setPlayerTwo(null);
        setHasOpponent(false);
      }
    }
  }

  // Nếu có 2 người chơi và người hiện tại là player 1, hiển thị lobby của player 1
  if (hasPlayerTwo && isPlayerOne) {
    return (
    <>
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-lg transition-colors">
        {/* Player 1 (Host) */}
        <div className="flex items-center w-1/4 min-h-[100px] flex-col justify-center">
          <div className="relative">
            <Image
              src="https://api.dicebear.com/9.x/adventurer/svg?seed=Eden"
              alt={getPlayerOne()?.player.name || "Player 1"}
              width={64}
              height={64}
              className="rounded-full border-2 border-blue-500 dark:border-blue-400"
              unoptimized
            />
            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Host
            </div>
            {/* Disconnect overlay cho Player 1 */}
            {isPlayerDisconnected(1) && (
              <div className="absolute inset-0 bg-gray-400 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">DISCONNECT</div>
              </div>
            )}
          </div>
          <div className="mt-2 font-semibold text-lg text-zinc-800 dark:text-zinc-100">{getPlayerOne()?.player.name || "Player 1"}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Level 1</div>
        </div>

        {/* Game Options - Player 1 Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="mb-4">
            <label className="font-medium mr-2 text-zinc-800 dark:text-zinc-100">Giờ thi đấu:</label>
            <select className="border rounded px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-gray-300 dark:border-zinc-700">
              <option>10:00</option>
              <option>14:00</option>
              <option>20:00</option>
            </select>
          </div>
          <button
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 dark:hover:bg-blue-800 transition"
          >
            Bắt đầu trò chơi
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Chờ người chơi 2 sẵn sàng...</p>
        </div>

        {/* Player 2 */}
        <div className="flex items-center w-1/4 min-h-[100px] relative justify-center flex-col">
          <div className="relative flex flex-col items-center">
            {/* Nút kích ở góc trên phải avatar - chỉ hiển thị cho player 1 */}
            <button
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-600 dark:bg-red-700 text-white rounded-full shadow hover:bg-red-700 dark:hover:bg-red-800 transition z-10"
              onClick={() => handleKickPlayer(2)}
              title="Kích người chơi 2"
            >
              <span className="text-lg leading-none">×</span>
            </button>
            <div className="relative">
              <Image
                src="https://api.dicebear.com/9.x/adventurer/svg?seed=Wyatt"
                alt={getPlayerTwo()?.player.name || "Player 2"}
                width={64}
                height={64}
                className="rounded-full border-2 border-red-500 dark:border-red-400"
                unoptimized
              />
              {/* Disconnect overlay cho Player 2 */}
              {isPlayerDisconnected(2) && (
                <div className="absolute inset-0 bg-gray-400 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs font-bold">DISCONNECT</div>
                </div>
              )}
            </div>
            <div className="mt-2 font-semibold text-lg text-zinc-800 dark:text-zinc-100">{getPlayerTwo()?.player.name || "Player 2"}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Level 1</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {isPlayerDisconnected(2) ? (
                <span className="text-red-600 dark:text-red-400">DISCONNECT</span>
              ) : (
                "Đã tham gia"
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <InviteQR link={`https://battleship.example.com/invite/${getRoomFromStore()?.id}`} />
      </div>
    </>
    );
  }

  // Nếu có 2 người chơi và người hiện tại là player 2, hiển thị lobby của player 2
  if (hasPlayerTwo && isPlayerTwo) {
    return (
    <>
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-lg transition-colors">
        {/* Player 1 */}
        <div className="flex items-center w-1/4 min-h-[100px] flex-col justify-center">
          <div className="relative">
            <Image
              src="https://api.dicebear.com/9.x/adventurer/svg?seed=Eden"
              alt={getPlayerOne()?.player.name || "Player 1"}
              width={64}
              height={64}
              className="rounded-full border-2 border-blue-500 dark:border-blue-400"
              unoptimized
            />
            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Host
            </div>
            {/* Disconnect overlay cho Player 1 */}
            {isPlayerDisconnected(1) && (
              <div className="absolute inset-0 bg-gray-400 bg-opacity-80 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">DISCONNECT</div>
              </div>
            )}
          </div>
          <div className="mt-2 font-semibold text-lg text-zinc-800 dark:text-zinc-100">{getPlayerOne()?.player.name || "Player 1"}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Level 1</div>
        </div>

        {/* Game Options - Player 2 Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="mb-4">
            <label className="font-medium mr-2 text-zinc-800 dark:text-zinc-100">Giờ thi đấu:</label>
            <select className="border rounded px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-gray-300 dark:border-zinc-700" disabled>
              <option>10:00</option>
              <option>14:00</option>
              <option>20:00</option>
            </select>
            <span className="text-xs text-gray-500 ml-2">(Chỉ host mới có thể thay đổi)</span>
          </div>
          <button
            className="bg-green-600 dark:bg-green-700 text-white px-6 py-2 rounded font-bold hover:bg-green-700 dark:hover:bg-green-800 transition"
          >
            Sẵn sàng
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Chờ host bắt đầu trò chơi...</p>
        </div>

        {/* Player 2 (Current User) - Không có nút kích */}
        <div className="flex items-center w-1/4 min-h-[100px] relative justify-center flex-col">
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <Image
                src="https://api.dicebear.com/9.x/adventurer/svg?seed=Wyatt"
                alt={getPlayerTwo()?.player.name || "Player 2"}
                width={64}
                height={64}
                className="rounded-full border-2 border-red-500 dark:border-red-400"
                unoptimized
              />
              {/* Disconnect overlay cho Player 2 */}
              {isPlayerDisconnected(2) && (
                <div className="absolute inset-0 bg-gray-400 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs font-bold">DISCONNECT</div>
                </div>
              )}
            </div>
            <div className="mt-2 font-semibold text-lg text-zinc-800 dark:text-zinc-100">{getPlayerTwo()?.player.name || "Player 2"}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Level 1</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Bạn</div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <InviteQR link={`https://battleship.example.com/invite/${getRoomFromStore()?.id}`} />
      </div>
    </>
    );
  }

  // Lobby mặc định khi chưa có đủ 2 người chơi
  return (
    <>
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-lg transition-colors">
      {/* Player 1 */}
      <div className="flex items-center w-1/4 min-h-[100px] flex-col justify-center">
        <div className="relative">
          <Image
            src="https://api.dicebear.com/9.x/adventurer/svg?seed=Eden"
            alt={getPlayerOne()?.player.name || "Player 1"}
            width={64}
            height={64}
            className="rounded-full border-2 border-blue-500 dark:border-blue-400"
            unoptimized
          />
          {/* Disconnect overlay cho Player 1 */}
          {isPlayerDisconnected(1) && (
            <div className="absolute inset-0 bg-gray-400 bg-opacity-80 rounded-full flex items-center justify-center">
              <div className="text-white text-xs font-bold">DISCONNECT</div>
            </div>
          )}
        </div>
        <div className="mt-2 font-semibold text-lg text-zinc-800 dark:text-zinc-100">{getPlayerOne()?.player.name || "Player 1"}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Level 1</div>
      </div>

      {/* Options */}
      <div className="flex flex-col items-center w-2/4">
        <div className="mb-4">
          <label className="font-medium mr-2 text-zinc-800 dark:text-zinc-100">Giờ thi đấu:</label>
          <select className="border rounded px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-gray-300 dark:border-zinc-700">
            <option>10:00</option>
            <option>14:00</option>
            <option>20:00</option>
          </select>
        </div>
        <button
          className={`bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded font-bold transition ${!hasPlayerTwo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 dark:hover:bg-blue-800'}`}
          disabled={!hasPlayerTwo}
        >
          Sẵn sàng
        </button>
      </div>

      {/* Player 2 hoặc ô trống mời bạn bè */}
      <div className="flex items-center w-1/4 min-h-[100px] relative justify-center flex-col">
        {hasPlayerTwo ? (
          <>
            <div className="relative flex flex-col items-center">
              {/* Nút X ở góc trên phải avatar */}
              <button
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-600 dark:bg-red-700 text-white rounded-full shadow hover:bg-red-700 dark:hover:bg-red-800 transition z-10"
                onClick={() => handleKickPlayer(2)}
                title="Kích"
              >
                <span className="text-lg leading-none">×</span>
              </button>
              <div className="relative">
                <Image
                  src="https://api.dicebear.com/9.x/adventurer/svg?seed=Wyatt"
                  alt={getPlayerTwo()?.player.name || "Player 2"}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-red-500 dark:border-red-400"
                  unoptimized
                />
                {/* Disconnect overlay cho Player 2 */}
                {isPlayerDisconnected(2) && (
                  <div className="absolute inset-0 bg-gray-400 rounded-full flex items-center justify-center">
                    <div className="text-white text-xs font-bold">DISCONNECT</div>
                  </div>
                )}
              </div>
              <div className="mt-2 font-semibold text-lg text-zinc-800 dark:text-zinc-100">{getPlayerTwo()?.player.name || "Player 2"}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Level 1</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-2xl">
              ?
            </div>
            <div className="ml-4">
              <div className="mb-2 text-gray-500 dark:text-gray-400">Chưa có người chơi</div>
              <button className="bg-green-600 dark:bg-green-700 text-white px-4 py-1 rounded font-bold hover:bg-green-700 dark:hover:bg-green-800 transition">
                Mời bạn bè
              </button>
            </div>
          </>
        )}
      </div>
    </div>
      <div className="flex items-center justify-center w-full max-w-4xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-lg mt-6">
        <InviteQR link={`https://battleship.example.com/invite/${getRoomFromStore()?.id}`} />
      </div>
    </>
  );
}