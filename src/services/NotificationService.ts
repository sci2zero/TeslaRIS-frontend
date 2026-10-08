import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { Notification, NotificationAction, NotificationActionResult, NotificationReadStatus, Page } from "@/models/Common";


export class NotificationService extends BaseService {

  async getAllNotifications(readStatus: NotificationReadStatus = 'UNREAD', page: number = 0, size: number = 10): Promise<AxiosResponse<Page<Notification>>> {
    return super.sendRequest(axios.get, `notification?readStatus=${readStatus}&page=${page}&size=${size}`);
  }

  async getNotificationCount(): Promise<AxiosResponse<number>> {
    return super.sendRequest(axios.get, "notification/count");
  }

  async performAction(notificationId: number, action: NotificationAction): Promise<AxiosResponse<NotificationActionResult>> {
    return super.sendRequest(axios.patch, `notification/${notificationId}/perform?action=${action}`);
  }

  async dismissNotification(notificationId: number): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `notification/${notificationId}/dismiss`);
  }

  async dismissAllNotifications(): Promise<AxiosResponse<void>> {
    return super.sendRequest(axios.delete, `notification/dismiss-all`);
  }
}

export default new NotificationService();
