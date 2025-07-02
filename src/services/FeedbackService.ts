import type { AxiosResponse } from "axios";
import { BaseService } from "./BaseService";
import axios from "axios";
import type { ContactFormData } from "@/models/Common";


export class FeedbackService extends BaseService {

    private static idempotencyKey: string = super.generateIdempotencyKey();

    async submitFeedback(body: ContactFormData): Promise<AxiosResponse<void>> {
        return super.sendRequest(axios.post, "feedback", body, FeedbackService.idempotencyKey);
    }
}

export default new FeedbackService();
