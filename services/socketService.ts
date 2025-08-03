import { io, Socket } from 'socket.io-client';

export function connectSocket(namespace: string, query?: any): Socket {
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/${namespace}`, {
        transports: ['websocket'],
        autoConnect: true,
        query: {
            ...query
        }
    });

    return socket;
}