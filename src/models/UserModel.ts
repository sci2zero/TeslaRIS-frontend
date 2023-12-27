export interface UserResponse {
    id: number;
    email: string;
    firstname: string;
    lastName: string;
    locked: boolean;
    canTakeRole: boolean;
    preferredLanguage: string;
    organisationUnitId: number;
}