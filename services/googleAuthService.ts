import { AuthResponse } from "@/models";
import axios from "@/services/fetch";

export interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export async function GoogleLogin(credential: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>("/identity/google", {
      credential
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export function getGoogleClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Google Client ID is not configured");
  }
  return clientId;
} 