import axios, { type AxiosResponse } from "axios";
import { BaseService } from "@/services/BaseService";
import type { AuthenticationRequest, AuthenticationResponse, RefreshTokenRequest, ResearcherRegistrationRequest, EmployeeRegistrationRequest } from "../models/AuthenticationModel";
import type { UserResponse } from "../models/UserModel";

class AuthenticationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();

  async login(loginRequest: AuthenticationRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/authenticate", loginRequest);
  }

  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/refresh-token", refreshTokenRequest, AuthenticationService.idempotencyKey);
  }

  async registerResearcher(registrationRequest: ResearcherRegistrationRequest): Promise<AxiosResponse<UserResponse>> {
    return super.sendRequest(axios.post, "user/register-researcher", registrationRequest);
  }

  async registerEmployee(registrationRequest: EmployeeRegistrationRequest): Promise<AxiosResponse<UserResponse>> {
    return super.sendRequest(axios.post, "user/register-institution-admin", registrationRequest, AuthenticationService.idempotencyKey);
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