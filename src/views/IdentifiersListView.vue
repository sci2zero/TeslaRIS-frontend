<template>
    <v-container>
        <h1>{{ $t("identifierListLabel") }}</h1>
        <br />
        <br />
        <br />
        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="1"
            layout="table"
        />
        <div v-show="!loading">
            <identifier-table-component
                :identifiers="identifiers"
                :total-identifiers="totalIdentifiers"
                @switch-page="switchPage"
            />
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import IdentifierService from '@/services/IdentifierService';
import { ref } from 'vue';
import type { IdentifierResponse } from '@/models/IdentifierModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import IdentifierTableComponent from '@/components/core/identifiers/IdentifierTableComponent.vue';
import type { Page } from '@/models/Common';
import type { AxiosResponse } from 'axios';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "IdentifierListView",
    components: { IdentifierTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);
        
        const identifiers = ref<IdentifierResponse[]>([]);
        const totalIdentifiers = ref(0);
        const page = ref(0);
        const size = ref(50);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("identifierListLabel");
            loading.value = true;
        });

        watch(i18n.locale, () => {
            search();
        });

        const search = () => {
            IdentifierService.fetchAllIdentifiers(`page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
            .then((response: AxiosResponse<Page<IdentifierResponse>>) => {
                identifiers.value = response.data.content;
                totalIdentifiers.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            })
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search();
        };

        return {
            search, identifiers,
            totalIdentifiers, switchPage,
            loading
        };
    }
});
</script>
