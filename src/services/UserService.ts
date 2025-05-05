import type { TakeRoleOfUserRequest, UserResponse, ActivateAccountRequest, UserAccountIndex, UserUpdateRequest } from "@/models/UserModel";
import type { AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { AuthenticationResponse } from "@/models/AuthenticationModel";
import type { Page } from "@/models/Common";

export class UserService extends BaseService {

  public cachedUser: AxiosResponse<UserResponse> | null = null;

  provideUserEmail(): string {
    const decoded = this.getDecodedJwt();
    return decoded.sub;
  }

  provideUserRole(): string {
    const decoded = this.getDecodedJwt();
    return decoded.role;
  }

  invalidateCaches(): void {
    this.cachedUser = null;
  }

  private getDecodedJwt(): any {
    const jwt = localStorage.getItem("jwt");
    if (jwt === null) {
      return {};
    }
    return jwtDecode(jwt as string);
  }

  async getLoggedInUser(): Promise<AxiosResponse<UserResponse>> {
    if (this.cachedUser) {
      return Promise.resolve(this.cachedUser);
    }

    const response = await super.sendRequest(axios.get, "user");
    this.cachedUser = response;

    return response;
  }

  async searchUsers(tokens: string, allowedRoles: string[]): Promise<AxiosResponse<Page<UserAccountIndex>>> {
    let allowedRolesParams = "";
    allowedRoles.forEach(role => allowedRolesParams += `&allowedRoles=${role}`);

    return super.sendRequest(axios.get, `user/search?${tokens}${allowedRolesParams}`);
  }

  async updateAccountActivationStatus(userId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `user/activation-status/${userId}`);
  }

  async updateUser(body: UserUpdateRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.put, "user", body);
  }

  async takeRoleOfAccount(body: TakeRoleOfUserRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/take-role", body);
  }

  async getAccountsWithRoleTakingAllowed(): Promise<AxiosResponse<number[]>> {
    return super.sendRequest(axios.get, "user/take-role");
  }

  async allowRoleTaking(): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, "user/allow-role-taking");
  }

  async activateUserAccount(body: ActivateAccountRequest): Promise<AxiosResponse> {
    return super.sendRequest(axios.patch, "user/activate-account", body);
  }

  async getUserObjectByPersonId(personId: number): Promise<AxiosResponse> {
    return super.sendRequest(axios.get, `user/person/${personId}`);
  }

  async generateNewUserPassword(employeeUserId: number): Promise<AxiosResponse> {
    return super.sendRequest(axios.patch, `user/reset-user-password/${employeeUserId}`);
  }

  async deleteUser(userId: number): Promise<AxiosResponse> {
    return super.sendRequest(axios.delete, `user/${userId}`);
  }

  async migrateUserData(newUserId: number, oldUserId: number): Promise<AxiosResponse> {
    return super.sendRequest(axios.delete, `user/migrate/${oldUserId}/${newUserId}`);
  }
}

export default new UserService();