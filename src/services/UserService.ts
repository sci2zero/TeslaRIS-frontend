import type { TakeRoleOfUserRequest, UserResponse, ActivateAccountRequest, UserAccountIndex } from "@/models/UserModel";
import type { AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { AuthenticationResponse } from "@/models/AuthenticationModel";
import type { Page } from "@/models/Common";

export class UserService extends BaseService {

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
    return super.sendRequest(axios.get, "user");
  }

  async searchUsers(tokens: string): Promise<AxiosResponse<Page<UserAccountIndex>>> {
    return super.sendRequest(axios.get, `user/search?${tokens}`);
  }

  async updateAccountActivationStatus(userId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `user/activation-status/${userId}`);
  }

  async takeRoleOfAccount(body: TakeRoleOfUserRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/take-role", body);
  }

  async activateUserAccount(body: ActivateAccountRequest): Promise<AxiosResponse> {
    return super.sendRequest(axios.patch, "user/activate-account", body);
  }
}

export default new UserService();