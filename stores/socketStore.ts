import { connectSocket } from "@/services/socketService";
import { Socket } from "socket.io-client"
import { create } from "zustand";

type SocketStore = {
    sockets : Partial<Record<string, {
        player: number;
        socket: Socket;
    }>>;
    connect: (ns: string, player: number) => boolean;
    getSocket: (ns: string) => { player: number; socket: Socket } | null;
}

export const useSocketStore = create<SocketStore>((set, get) => {
    return {
        sockets: {},

        connect: (ns: string, player: number) => {
            const existingSocket = get().sockets[ns];
            if (existingSocket) {
                return false;
            }

            const socket = connectSocket(ns);
            if (!socket) {
                return false;
            }
            set((state) => ({
                sockets: {
                    ...state.sockets,
                    [ns]: {
                        player,
                        socket,
                    },
                },
            }));
            return true;
        },

        getSocket: (ns: string) => {
            return get().sockets[ns] || null;
        },
    };
})

