import { BaseService } from "../BaseService";
import axios from "axios";
import { useDownloadStore } from "@/stores/downloadStore";


export class RoCrateService extends BaseService {

    async downloadRoCrateForSingleDocument(documentId: number) {
        return this.downloadRoCrate(
            `ro-crate/document/${documentId}`,
            `ro-crate-${documentId}.zip`
        );
    }

    async downloadRoCrateBibliography(personId: number) {
        return this.downloadRoCrate(
            `ro-crate/person/${personId}`,
            `ro-crate-${personId}.zip`
        );
    }

    private async downloadRoCrate(
        exportUrl: string,
        filename: string
    ) {
        const exportId = crypto.randomUUID();

        const accessTokenResponse = 
            await super.sendRequest(axios.get, `sse/access-token?exportId=${exportId}`);
        if (!accessTokenResponse.data) {
            return;
        }

        const downloadStore = useDownloadStore();
        if (downloadStore.isDownloading) {
            return;
        }

        downloadStore.downloadProgressRef?.startDownload(filename);

        const sse = new EventSource(this.basePath + 
            `sse/progress/${exportId}?accessToken=${accessTokenResponse.data}`
        );
        
        sse.addEventListener("progress", e => {
            const progress = JSON.parse(e.data);
            downloadStore.downloadProgressRef?.setMessage(progress.stage);
        });

        try {
            const response = await super.sendRequest(
                axios.get,
                `${exportUrl}?exportId=${exportId}`,
                {
                    responseType: "blob",
                    onDownloadProgress: (progressEvent: any) => {
                        if (progressEvent.total) {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            downloadStore.downloadProgressRef?.updateProgress(percent);
                        }
                    }
                }
            );

            this.initialzeDownload(response, filename, "");
        } catch (error) {
            downloadStore.downloadProgressRef?.cancelDownload();
            throw error;
        } finally {
            sse.close();
        }
    }
}

export default new RoCrateService();