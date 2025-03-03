export interface AuthenticationRequest {
    email: string;
    password: string;
}

export interface AuthenticationResponse {
    token: string;
    refreshToken: string;
}

export interface ResearcherRegistrationRequest {
    email: string;
    password: string;
    preferredLanguageId: number;
    personId?: number;
}

export interface EmployeeRegistrationRequest {
    name: string;
    surname: string;
    email: string;
    note: string;
    preferredLanguageId: number;
    organisationUnitId: number;
}

export interface CommissionRegistrationRequest extends EmployeeRegistrationRequest {
    commissionId: number;
}

export interface RefreshTokenRequest {
    refreshTokenValue: string;
}

export interface ForgotPasswordRequest {
    userEmail: string;
}

export interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
}
