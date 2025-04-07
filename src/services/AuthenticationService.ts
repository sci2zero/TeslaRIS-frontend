import axios, { type AxiosResponse } from "axios";
import { BaseService } from "@/services/BaseService";
import type { AuthenticationRequest, AuthenticationResponse, RefreshTokenRequest, ResearcherRegistrationRequest, EmployeeRegistrationRequest, ForgotPasswordRequest, ResetPasswordRequest, CommissionRegistrationRequest } from "../models/AuthenticationModel";
import type { UserResponse } from "../models/UserModel";
import UserService from "./UserService";

class AuthenticationService extends BaseService {

  private static idempotencyKey: string = super.generateIdempotencyKey();
  async login(loginRequest: AuthenticationRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/authenticate", loginRequest);
  }

  async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AxiosResponse<AuthenticationResponse>> {
    return super.sendRequest(axios.post, "user/refresh-token", refreshTokenRequest, AuthenticationService.idempotencyKey);
  }

  async registerResearcher(registrationRequest: ResearcherRegistrationRequest): Promise<AxiosResponse<UserResponse>> {
    return super.sendRequest(axios.post, "user/register-researcher", registrationRequest, AuthenticationService.idempotencyKey);
  }

  async registerEmployee(registrationRequest: EmployeeRegistrationRequest, employmentPosition: string): Promise<AxiosResponse<UserResponse>> {
    return super.sendRequest(axios.post, `user/register-employee/${employmentPosition}`, registrationRequest, AuthenticationService.idempotencyKey);
  }

  async registerCommission(registrationRequest: CommissionRegistrationRequest): Promise<AxiosResponse<UserResponse>> {
    return super.sendRequest(axios.post, "user/register-commission", registrationRequest, AuthenticationService.idempotencyKey);
  }

  async submitForgottenPassword(body: ForgotPasswordRequest): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.post, "user/forgot-password", body, AuthenticationService.idempotencyKey);
  }

  async resetPassword(body: ResetPasswordRequest): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, "user/reset-password", body, AuthenticationService.idempotencyKey);
  }

  userLoggedIn() {
    return !!localStorage.getItem("jwt");
  }

  logoutUser(): void {
    localStorage.removeItem("jwt");
    localStorage.removeItem("refreshToken");
    UserService.cachedUser = null;
  }
}

export default new AuthenticationService();