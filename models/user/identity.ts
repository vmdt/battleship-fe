import { Tokens, User } from ".";

export interface AuthResponse {
    user: User;
    tokens: Tokens;
}