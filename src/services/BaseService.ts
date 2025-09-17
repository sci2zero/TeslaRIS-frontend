import axios, { type AxiosResponse } from "axios";

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
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
      link.href = blobUrl;
      link.download = documentName.endsWith(`.${extension}`)
        ? documentName
        : `${documentName}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
  }

  async fetchImageForDisplay(personId: number, fullSize: boolean): Promise<[string | null, string | null]> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(this.basePath + `file/image/${personId}?fullSize=${fullSize}`, {
        responseType: 'blob',
      });

      if (response.status === 204) {
        return [null, null];
      }

      let imageName = null;
      if (response.headers["content-disposition"]) {
        imageName = response.headers["content-disposition"].split("=")[1].replaceAll('"', '');
      }
  
      const imageUrl = URL.createObjectURL(response.data);
      return [imageUrl, imageName];
    } catch (error) {
      console.error('Error fetching image:', error);
      return [null, null];
    }
  }

  async fetchLogoForDisplay(organisationUnitId: number, fullSize: boolean): Promise<[string | null, string | null]> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(this.basePath + `file/logo/${organisationUnitId}?fullSize=${fullSize}`, {
        responseType: 'blob',
      });

      if (response.status === 204) {
        return [null, null];
      }

      let imageName = null;
      if (response.headers["content-disposition"]) {
        imageName = response.headers["content-disposition"].split("=")[1].replaceAll('"', '');
      }
  
      const imageUrl = URL.createObjectURL(response.data);
      return [imageUrl, imageName];
    } catch (error) {
      console.error('Error fetching image:', error);
      return [null, null];
    }
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
            for (const key in data) {
                appendFormData(data[key], parentKey ? `${parentKey}.${key}` : key);
            }
        } else if (Array.isArray(data)) {
            data.forEach((item, index) => {
                appendFormData(item, `${parentKey}[${index}]`);
            });
        } else {
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