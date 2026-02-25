import type { MultilingualContent } from "./Common";

export interface UserResponse {
    id: number;
    email: string;
    firstname: string;
    lastName: string;
    locked: boolean;
    canTakeRole: boolean;
    preferredUILanguage: string;
    preferredReferenceCataloguingLanguage: string;
    organisationUnitId: number;
    personId: number;
    organisationUnitName: MultilingualContent[];
    notificationPeriod: UserNotificationPeriod;
    commissionId: number;
}

export interface UserAccountIndex {
    id: string;
    fullName: string;
    email: string;
    emailSortable: string;
    organisationUnitNameSr: string;
    organisationUnitNameOther: string;
    organisationUnitId: number;
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

export interface ConfirmEmailUpdateRequest {
    confirmationToken: string;
}

export interface UserUpdateRequest {
    email: string;
    oldPassword: string;
    newPassword: string;
    firstname: string;
    lastName: string;
    preferredUILanguageTagId: number;
    preferredReferenceCataloguingLanguageTagId: number;
    organisationUnitId?: number;
    notificationPeriod: UserNotificationPeriod;
}

export enum UserRole {
    ADMIN = "ADMIN",
    RESEARCHER = "RESEARCHER",
    INSTITUTIONAL_EDITOR = "INSTITUTIONAL_EDITOR",
    COMMISSION = "COMMISSION",
    VICE_DEAN_FOR_SCIENCE = "VICE_DEAN_FOR_SCIENCE",
    INSTITUTIONAL_LIBRARIAN = "INSTITUTIONAL_LIBRARIAN",
    HEAD_OF_LIBRARY = "HEAD_OF_LIBRARY",
    PROMOTION_REGISTRY_ADMINISTRATOR = "PROMOTION_REGISTRY_ADMINISTRATOR"
}

export enum UserNotificationPeriod {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    NEVER = "NEVER"
}
