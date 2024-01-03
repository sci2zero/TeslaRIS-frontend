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

export interface UserAccountIndex {
    id: string;
    fullName: string;
    email: string;
    emailSortable: string;
    organisationUnitNameSr: string;
    organisationUnitNameOther: string;
    userRole: string;
    databaseId: number;
    active: boolean;
}

export interface TakeRoleOfUserRequest {
    userEmail: string;
}
