
export interface Chat {
    id: string;
    game_type: string;
    room_id: string;
    created_at: Date;
    updated_at: Date;
    messages: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    is_log: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateChatMessage {
    sender_id: string;
    content: string;
    is_log?: boolean;
}