import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Notification } from "@/models/Common";

export class LanguageService extends BaseService {

  async getAllNotifications(): Promise<AxiosResponse<Notification[]>> {
    return super.sendRequest(axios.get, "notification");
  }

  async getNotificationCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "notification/count");
  }

  async approveNotification(notificationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.get, `notification/${notificationId}/approve`);
  }

  async rejectNotification(notificationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.get, `notification/${notificationId}/reject`);
  }
}

export default new LanguageService();