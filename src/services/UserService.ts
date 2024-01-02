import type { UserResponse } from "@/models/UserModel";
import type { AxiosResponse } from "axios";
import { jwtDecode } from "jwt-decode";
import { BaseService } from "./BaseService";
import axios from "axios";

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
    return jwtDecode(jwt as string);
  }

  async getLoggedInUser(): Promise<AxiosResponse<UserResponse>> {
    return super.sendRequest(axios.get, "user");
  }

  async searchUsers(tokens: string): Promise<AxiosResponse<any>> {
    return super.sendRequest(axios.get, `user/search?${tokens}`);
  }
}

export default new UserService();