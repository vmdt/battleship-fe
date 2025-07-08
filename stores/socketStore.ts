import { connectSocket } from "@/services/socketService";
import { Socket } from "socket.io-client"
import { create } from "zustand";

type SocketStore = {
    sockets : Partial<Record<string, Socket>>;
    connect: (ns: string) => boolean;
    getSocket: (ns: string) => Socket | null;
}

export const useSocketStore = create<SocketStore>((set, get) => {
    return {
        sockets: {},

        connect: (ns: string) => {
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
                    [ns]: socket,
                },
            }));
            return true;
        },

        getSocket: (ns: string) => {
            return get().sockets[ns] || null;
        },
    };
})

