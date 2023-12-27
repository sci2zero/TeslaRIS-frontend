import { jwtDecode } from "jwt-decode";

export class UserService {

  provideUserEmail(): string {
    const decoded = this.getDecodedJwt();
    return decoded.sub;
  }

  private getDecodedJwt(): any {
    const jwt = sessionStorage.getItem("jwt");
    return jwtDecode(jwt as string);
  }
}

export default new UserService();