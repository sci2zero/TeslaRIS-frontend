<template>
    <v-container>
        <v-row>
            <h1>{{ $t("routeLabel.healthCheck") }}</h1>
        </v-row>
        <v-row v-if="!loading">
            <v-col cols="12">
                <p><strong>Backend Version:</strong> {{ healthData.backendVersion }}</p>
                <p><strong>Frontend Version:</strong> {{ healthData.frontendVersion }}</p>
            </v-col>
        </v-row>
  
        <v-row v-if="!loading">
            <v-col
                v-for="(status, service) in serviceStatus"
                :key="service"
                cols="12"
                md="6"
            >
                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                            <v-icon
                                :color="status.status === 'UP' ? 'green' : 'red'"
                                class="mr-2"
                            >
                                mdi-circle
                            </v-icon>
                            <span class="text-capitalize">{{ service }}</span>
                        </div>
                    </v-card-title>
                    <v-card-text v-if="status.status !== 'UP' && status.error">
                        <v-alert type="error" variant="outlined">
                            {{ status.error }}
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <div v-if="loading" class="d-flex flex-row justify-center loader mt-10">
        <v-progress-circular
            color="primary"
            indeterminate
            size="128"
        ></v-progress-circular>
    </div>
</template>
  
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive, ref } from "vue";
import HealthCheckService from "@/services/HealthCheckService";
import type { AxiosResponse } from "axios";


export default defineComponent({
name: "HealthStatus",
setup() {
    const loading = ref(false);

    const healthData = reactive<Record<string, any>>({
        backendVersion: "",
        frontendVersion: import.meta.env.VITE_APP_VERSION as string
    });

    const serviceStatus = ref<Record<string, { status: string; error?: string } | string>[]>([]);

    const fetchHealthStatus = async () => {
        HealthCheckService.performHealthCheck()
        .then((response: AxiosResponse<any>) => {
            healthData.backendVersion = response.data["appVersion"] as string;
            delete response.data["appVersion"];
            serviceStatus.value = response.data;
            loading.value = false;
        });
    };

    let intervalId: number;
    onMounted(() => {
        loading.value = true;
        fetchHealthStatus();

        intervalId = setInterval(() => fetchHealthStatus(), 10000);
    });

    onUnmounted(() => {
        clearInterval(intervalId);
    });

    return {
        healthData,
        serviceStatus,
        loading
    };
},
});
</script>
  
<style scoped>

h1 {
    margin-bottom: 16px;
}

loader {
    height: 100vh;
    min-height: 200px;
}

</style>
  