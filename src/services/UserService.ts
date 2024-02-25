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

  private getDecodedJwt(): any {
    const jwt = sessionStorage.getItem("jwt");
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

  async searchUsers(tokens: string): Promise<AxiosResponse<Page<UserAccountIndex>>> {
    return super.sendRequest(axios.get, `user/search?${tokens}`);
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

  async allowRoleTaking(): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, "user/allow-role-taking");
  }

  async activateUserAccount(body: ActivateAccountRequest): Promise<AxiosResponse> {
    return super.sendRequest(axios.patch, "user/activate-account", body);
  }

  async getUserObjectByPersonId(personId: number): Promise<AxiosResponse> {
    return super.sendRequest(axios.get, `user/person/${personId}`);
  }
}

export default new UserService();