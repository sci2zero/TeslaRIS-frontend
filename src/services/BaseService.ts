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
    link.download = documentName;
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

  async sendMultipartFormDataRequest(
    restMethod: any = axios.get,
    path: string = "",
    requestBody: any = {},
    idempotencyKey: string = ""
  ): Promise<any> {
    const formData = new FormData();

    const appendFormData = (data: any, parentKey: string | null = null) => {
        if (data instanceof Object && !Array.isArray(data) && !(data instanceof File)) {
            // If it's a nested object, recursively append
            for (const key in data) {
                appendFormData(data[key], parentKey ? `${parentKey}.${key}` : key);
            }
        } else if (Array.isArray(data)) {
            // Handle arrays (with indexes)
            data.forEach((item, index) => {
                appendFormData(item, `${parentKey}[${index}]`);
            });
        } else {
            // Handle flat key-value pairs
            formData.append(parentKey!, data);
        }
    };

    for (const key in requestBody) {
        appendFormData(requestBody[key], key);
    }

    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            "Idempotency-Key": idempotencyKey,
        },
        withCredentials: true
    };

    return restMethod(this.basePath + path, formData, config);
  }
}

export default new BaseService();