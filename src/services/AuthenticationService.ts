import axios, { type AxiosResponse } from "axios";
import { BaseService } from "@/services/BaseService";
import type { AuthenticationRequest, AuthenticationResponse, RefreshTokenRequest, RegistrationRequest } from "../models/AuthenticationModel";
import type { UserResponse } from "../models/UserModel";

class AuthenticationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async login(loginRequest: AuthenticationRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/authenticate", loginRequest);
  }

  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/refresh-token", refreshTokenRequest, AuthenticationService.idempotencyKey);
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