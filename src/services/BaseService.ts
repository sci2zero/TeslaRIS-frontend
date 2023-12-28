import axios from "axios";

export class BaseService {
  basePath: string = import.meta.env.VITE_API_BASE_URL as string;

  
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
    requestBody: any = {}
  ): Promise<any> {
    const config = {
      headers: { "Content-Type": "application/json" },
    };
    return restMethod(this.basePath + path, requestBody, config);
  }
}

export default new BaseService();