import { AuthResponse, RegisterPayload, Tokens } from "@/models";
import axios from "@/services/fetch";

export async function Login(payload: { email: string; password: string }): Promise<AuthResponse> {
    try {
        const response = await axios.post<AuthResponse>("/identity/login", payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function RefreshToken(refreshToken: string): Promise<Tokens> {
    try {
        const response = await axios.post<Tokens>("/identity/refresh", {
            refresh_token: refreshToken
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function Register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
        const response = await axios.post<AuthResponse>("/identity/register", payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}