import axios from "axios";
import { BaseService } from "@/services/BaseService";
import type { AuthenticationRequest, AuthenticationResponse, RegistrationRequest } from "../models/AuthenticationModel";
import type { UserResponse } from "../models/UserModel";

class AuthenticationService extends BaseService {
  async login(loginRequest: AuthenticationRequest): Promise<AuthenticationResponse> {
    return super.sendRequest(axios.post, "auth/login", loginRequest);
  }

  async register(registrationRequest: RegistrationRequest): Promise<UserResponse> {
    return super.sendRequest(axios.post, "auth", registrationRequest);
  }

  userLoggedIn() {
    return !!sessionStorage.getItem("jwt");
  }
}

export default new AuthenticationService();