import axios from "axios";

export class BaseService {
  basePath: string = import.meta.env.VITE_BASE_URL as string;

  static generateIdempotencyKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < 36; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
  }
  
  initialzeDownload(blobData: any, documentName: string, extension: string) {
    const blob = new Blob([blobData.data], {
      type: "application/" + extension,
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = documentName + "." + extension;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async sendRequest(
    restMethod: any = axios.get,
    path: string = "",
    requestBody: any = {},
    idempotencyKey: string = ""
  ): Promise<any> {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      withCredentials: true
    };
    return restMethod(this.basePath + path, requestBody, config);
  }
}

export default new BaseService();