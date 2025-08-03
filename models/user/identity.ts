import { Tokens, User } from ".";

export interface AuthResponse {
    user: User;
    tokens: Tokens;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    nation: string;
}