<template>
    <v-row class="align-center">
        <v-col cols="auto">
            <v-btn
                density="compact" class="bottom-spacer" :disabled="selectedApiKeys.length === 0"
                @click="deleteSelection">
                {{ $t("deleteLabel") }}
            </v-btn>
        </v-col>

        <v-col cols="auto">
            <generic-crud-modal
                :form-component="ApiKeyForm"
                :form-props="{ presetCountry: undefined }"
                entity-name="ApiKey"
                @create="createNewApiKey"
            />
        </v-col>
    </v-row>

    <v-row>
        <v-col>
            <v-data-table-server
                v-model="selectedApiKeys"
                :sort-by="tableOptions.sortBy"
                :items="apiKeys"
                :headers="headers"
                :items-length="totalApiKeys"
                :items-per-page-text="$t('itemsPerPageLabel')"
                :items-per-page-options="[5, 25, 50]"
                :items-per-page="25"
                show-select
                return-object
                :no-data-text="$t('noDataInTableMessage')"
                :page="tableOptions.page"
                @update:options="refreshTable">
                <template #item="row">
                    <tr>
                        <td>
                            <v-checkbox
                                v-model="selectedApiKeys"
                                :value="row.item"
                                class="table-checkbox"
                                hide-details
                            />
                        </td>
                        <td>{{ returnCurrentLocaleContent(row.item.name) }}</td>
                        <td>{{ getApiKeyTypeTitleFromValueAutoLocale(row.item.type) }}</td>
                        <td>{{ localiseDate(row.item.validUntil) }}</td>
                        <td>{{ row.item.clientEmail }}</td>
                        <td>
                            <generic-crud-modal
                                class="mt-5"
                                :form-component="ApiKeyForm"
                                :form-props="{ presetApiKey: row.item }"
                                entity-name=""
                                is-update
                                @update="updateApiKey(row.item.id as number, $event)"
                            />
                        </td>
                    </tr>
                </template>
            </v-data-table-server>
        </v-col>
    </v-row>
    
    <div class="notificationContainer">
        <v-slide-y-transition group>
            <v-alert
                v-for="notification in notifications"
                :key="notification[0]"
                theme="dark"
            >
                {{ notification[1] }}
            </v-alert>
        </v-slide-y-transition>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { ref } from 'vue';
import { type ApiKeyRequest, type ApiKeyResponse } from '@/models/Common';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import { getApiKeyTypeTitleFromValueAutoLocale } from '@/i18n/apiKeyType';
import { useI18n } from 'vue-i18n';
import ApiKeyService from '@/services/ApiKeyService';
import ApiKeyForm from './ApiKeyForm.vue';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import { localiseDate } from '@/utils/DateUtil';


export default defineComponent({
    name: "ApiKeyList",
    components: { GenericCrudModal },
    props: {
        apiKeys: {
            type: Array<ApiKeyResponse>,
            required: true
        },
        totalApiKeys: {
            type: Number,
            required: true
        }
    },
    emits: ["switchPage"],
    setup(_, { emit }) {
        const i18n = useI18n();

        const selectedApiKeys = ref<ApiKeyResponse[]>([]);
        const notifications = ref<Map<string, string>>(new Map());

        const nameLabel = computed(() => i18n.t("nameLabel"));
        const typeLabel = computed(() => i18n.t("typeLabel"));
        const validUntilLabel = computed(() => i18n.t("validUntilLabel"));
        const clientEmailLabel = computed(() => i18n.t("clientEmailLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const headers = ref<any>([
          { title: nameLabel, align: "start", sortable: false, key: "name"},
          { title: typeLabel, align: "start", sortable: false, key: "type"},
          { title: validUntilLabel, align: "start", sortable: false, key: "validUntil"},
          { title: clientEmailLabel, align: "start", sortable: false, key: "clientEmail"},
          { title: actionLabel},
        ]);

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 25});

        const refreshTable = (event: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                event = tableOptions.value;
            }

            tableOptions.value = event;
            emit("switchPage", event.page - 1, event.itemsPerPage);
        };

        const deleteSelection = () => {
            Promise.all(selectedApiKeys.value.map((apiKey: ApiKeyResponse) => {
                return ApiKeyService.deleteApiKey(apiKey.id as number)
                    .then(() => {
                        addNotification(i18n.t("deleteSuccessNotification", { name: returnCurrentLocaleContent(apiKey.name) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(apiKey.name) }));
                        return apiKey;
                    });
            })).then((failedDeletions) => {
                selectedApiKeys.value = selectedApiKeys.value.filter((country) => failedDeletions.includes(country));
                refreshTable(tableOptions.value);
            });
        };

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        };

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        };

        const createNewApiKey = (apiKey: ApiKeyRequest) => {
            ApiKeyService.createApiKey(apiKey).then(() => {
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage);
            });
        };

        const updateApiKey = (apiKeyId: number, apiKey: ApiKeyRequest) => {
            ApiKeyService.updateApiKey(apiKeyId, apiKey).then(() => {
                emit("switchPage", tableOptions.value.page - 1, tableOptions.value.itemsPerPage);
            });
        };

        return {
            headers, refreshTable, selectedApiKeys,
            returnCurrentLocaleContent, deleteSelection,
            getApiKeyTypeTitleFromValueAutoLocale,
            createNewApiKey, tableOptions, ApiKeyForm,
            notifications, updateApiKey, localiseDate
        };
    }
});
</script>
