<template>
    <v-container>
        <h1>{{ $t("commissionListLabel") }}</h1>
        <br />
        <br />
        <br />
        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="1"
            layout="table"
        />
        <commission-table-component
            :commissions="commissions"
            :total-commissions="totalCommissions"
            @switch-page="switchPage">
        </commission-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CommissionService from '@/services/assessment/CommissionService';
import { ref } from 'vue';
import type { CommissionResponse } from '@/models/AssessmentModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import CommissionTableComponent from '@/components/assessment/commission/CommissionTableComponent.vue';
import type { Page } from '@/models/Common';
import type { AxiosResponse } from 'axios';
import { watch } from 'vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "CommissionListView",
    components: { CommissionTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const commissions = ref<CommissionResponse[]>([]);
        const totalCommissions = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("commissionListLabel");
            loading.value = true;
        });

        watch(i18n.locale, () => {
            search();
        });

        const search = () => {
            CommissionService.searchCommissions(
                `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`, false, false)
            .then((response: AxiosResponse<Page<CommissionResponse>>) => {
                commissions.value = response.data.content;
                totalCommissions.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search();
        };

        return {
            search, commissions,
            totalCommissions, switchPage,
            loading
        };
    }
});
</script>
