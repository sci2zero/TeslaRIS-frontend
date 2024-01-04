import axios, { type AxiosResponse } from "axios";
import { BaseService } from "@/services/BaseService";
import type { AuthenticationRequest, AuthenticationResponse, RefreshTokenRequest, RegistrationRequest } from "../models/AuthenticationModel";
import type { UserResponse } from "../models/UserModel";

class AuthenticationService extends BaseService {
  async login(loginRequest: AuthenticationRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/authenticate", loginRequest);
  }

  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/refresh-token", refreshTokenRequest, "a73a6d1a-13f2-4d5a-a55e-8f489e5b1f99");
  }

  async register(registrationRequest: RegistrationRequest): Promise<AxiosResponse<UserResponse>> {
    return super.sendRequest(axios.post, "user/register", registrationRequest);
  }

  userLoggedIn() {
    return !!sessionStorage.getItem("jwt");
  }

  logoutUser(): void {
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("refreshToken");
  }
}

export default new AuthenticationService();