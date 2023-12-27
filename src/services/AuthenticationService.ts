import axios from "axios";
import { BaseService } from "@/services/BaseService";
import type { AuthenticationRequest, AuthenticationResponse, RefreshTokenRequest, RegistrationRequest } from "../models/AuthenticationModel";
import type { UserResponse } from "../models/UserModel";

class AuthenticationService extends BaseService {
  async login(loginRequest: AuthenticationRequest): Promise<AuthenticationResponse> {
    return super.sendRequest(axios.post, "user/authenticate", loginRequest);
  }

  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AuthenticationResponse> {
    return super.sendRequest(axios.post, "user/refresh-token", refreshTokenRequest);
  }

  async register(registrationRequest: RegistrationRequest): Promise<UserResponse> {
    return super.sendRequest(axios.post, "user/register", registrationRequest);
  }

  userLoggedIn() {
    return !!sessionStorage.getItem("jwt");
  }
}

export default new AuthenticationService();