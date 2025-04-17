<template>
    <v-list
        v-if="allGeneratedReports.length > 0"
        :lines="false"
        density="comfortable"
        class="bigger-font"
    >
        <v-list-item
            v-for="generatedReport in allGeneratedReports" :key="generatedReport"
            :value="generatedReport"
        >
            <v-list-item-title @click="downloadReport(generatedReport)">
                {{ generatedReport }}
            </v-list-item-title>

            <template #append>
                <v-row>
                    <v-col>
                        <v-btn
                            icon variant="outlined" size="x-small" color="primary"
                            class="inline-action" @click="deleteReport(generatedReport)">
                            <v-icon size="x-large" icon="mdi-delete"></v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </template>
        </v-list-item>
    </v-list>
    <h2 v-else>
        {{ $t("noGeneratedReportsLabel") }}
    </h2>
</template>

<script lang="ts">
import RegistryBookReportService from '@/services/thesisLibrary/RegistryBookReportService';
import { defineComponent, onMounted, ref } from 'vue';


export default defineComponent({
    name: "RegistryBookReportsList",
    setup() {
        const allGeneratedReports = ref<string[]>([]);
        
        onMounted(() => {
            fetchReports();
        });

        const fetchReports = () => {
            RegistryBookReportService.listGeneratedReports()
            .then(response => {
                allGeneratedReports.value = response.data;
            });
        };

        const downloadReport = (reportFileName: string) => {
            RegistryBookReportService.downloadReport(reportFileName);
        };

        const deleteReport = (reportFileName: string) => {
            RegistryBookReportService.deleteReport(reportFileName)
            .then(() => {
                fetchReports();
            });
        };

        return {
            allGeneratedReports,
            downloadReport,
            deleteReport
        };
    }
});
</script>
