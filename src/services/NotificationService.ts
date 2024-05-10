import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Notification, NotificationAction } from "@/models/Common";

export class LanguageService extends BaseService {

  async getAllNotifications(): Promise<AxiosResponse<Notification[]>> {
    return super.sendRequest(axios.get, "notification");
  }

  async getNotificationCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "notification/count");
  }

  async performAction(notificationId: number, action: NotificationAction): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.patch, `notification/${notificationId}/perform?action=${action}`);
  }

  async dismissNotification(notificationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `notification/${notificationId}/dismiss`);
  }
}

export default new LanguageService();