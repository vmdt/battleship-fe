import { PlayerModel, RoomModel, RoomPlayerModel } from "@/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type RoomStore = {
    roomId: string | null;
    playerOne?: RoomPlayerModel | null;
    playerTwo?: RoomPlayerModel | null;
    room?: RoomModel | null;
    me: number;
    
    setRoomId: (id: string | null) => void;
    setPlayerOne: (player: RoomPlayerModel | null) => void;
    setPlayerTwo: (player: RoomPlayerModel | null) => void;
    setRoom: (room: RoomModel | null) => void;
    setMe: (me: number) => void;

    getPlayerOne: () => RoomPlayerModel | null;
    getPlayerTwo: () => RoomPlayerModel | null;
    getRoom: () => RoomModel | null;
    getMe: () => number;
}

export const useRoomStore = create<RoomStore>()(
    persist(
        (set, get) => ({
            roomId: null,
            playerOne: null,
            playerTwo: null,
            room: null,
            me: 0,

            setRoomId: (id) => set({ roomId: id }),
            setPlayerOne: (player) => set({ playerOne: player }),
            setPlayerTwo: (player) => set({ playerTwo: player }),
            setRoom: (room) => set({ room }),
            setMe: (me) => set({ me }),

            getPlayerOne: () => get().playerOne || null,
            getPlayerTwo: () => get().playerTwo || null,
            getRoom: () => get().room || null,
            getMe: () => get().me,
        }),
        {
            name: "room-store",
        }
    )
);