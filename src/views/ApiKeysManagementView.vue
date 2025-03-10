<template>
    <h1 class="d-flex flex-row justify-center">
        {{ $t("apiKeyManagementLabel") }}
    </h1>

    <v-row class="d-flex flex-row justify-center mt-5">
        <v-col cols="12" sm="10" md="8">
            <api-key-list :api-keys="apiKeys" :total-api-keys="totalApiKeys" @switch-page="switchPage"></api-key-list>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import ApiKeyList from '@/components/apiKey/ApiKeyList.vue';
import { type ApiKeyResponse } from '@/models/Common';
import ApiKeyService from '@/services/ApiKeyService';
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "ApiKeysManagementView",
    components: { ApiKeyList },
    setup() {
        const apiKeys = ref<ApiKeyResponse[]>([]);
        const totalApiKeys = ref(0);

        const page = ref(0);
        const size = ref(1);

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("apiKeyManagementLabel");
        });

        const search = () => {
            ApiKeyService.readAllApiKeys(`page=${page.value}&size=${size.value}`).then((response) => {
                apiKeys.value = response.data.content;
                totalApiKeys.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number) => {
            page.value = nextPage;
            size.value = pageSize;
            search();
        };

        return {
            apiKeys,
            totalApiKeys,
            switchPage
        };
    }
});
</script>
