import { Chat, CreateChatMessage } from '@/models';
import axios from "@/services/fetch";

export async function fetchChatMessages(roomId: string): Promise<Chat> {
    try {
        const response = await axios.get(`/chat/rooms/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch chat messages:', error);
        throw error;
    }
}

export async function sendChatMessage(roomId: string, payload: CreateChatMessage): Promise<Chat> {
    try {
        const response = await axios.post(`chat/rooms/${roomId}/messages`, payload);
        return response.data;
    } catch (error) {
        console.error('Failed to send chat message:', error);
        throw error;
    }
}