import type { MultilingualContent } from "./Common";

export interface UserResponse {
    id: number;
    email: string;
    firstname: string;
    lastName: string;
    locked: boolean;
    canTakeRole: boolean;
    preferredLanguage: string;
    organisationUnitId: number;
    organisationUnitName: MultilingualContent[];
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

export interface ActivateAccountRequest {
    activationToken: string;
}

export interface UserUpdateRequest {
    email: string;
    oldPassword: string;
    newPassword: string;
    firstname: string;
    lastName: string;
    preferredLanguageId: number;
    organisationUnitId?: number;
}

export enum UserRole {
    ADMIN = "ADMIN",
    RESEARCHER = "RESEARCHER",
    INSTITUTIONAL_EDITOR = "INSTITUTIONAL_EDITOR"
}