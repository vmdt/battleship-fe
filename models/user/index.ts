export * from "./identity";

export interface User {
    id: string;
    username: string;
    email: string;
    nation: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
}

export interface Tokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}