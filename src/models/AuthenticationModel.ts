export interface AuthenticationRequest {
    email: string;
    password: string;
}

export interface AuthenticationResponse {
    token: string;
    refreshToken: string;
}

export interface RegistrationRequest {
    email: string;
    password: string;
    preferredLanguageId: number;
    personId?: number;
}

export interface RefreshTokenRequest {
    refreshTokenValue: string;
}
