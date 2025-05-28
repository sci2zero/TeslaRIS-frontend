<template>
    <v-container>
        <h1>{{ $t("assessmentRulebookPageLabel") }}</h1>
        <br />
        <br />
        <br />
        <tab-content-loader
            v-if="loading"
            button-header
            :tab-number="1"
            layout="table"
        />
        <assessment-rulebook-table-component :assessment-rulebooks="assessmentRulebooks" :total-assessment-rulebooks="totalAssessmentRulebooks" @switch-page="switchPage"></assessment-rulebook-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import AssessmentRulebookService from '@/services/assessment/AssessmentRulebookService';
import { ref } from 'vue';
import type { AssessmentRulebookResponse } from '@/models/AssessmentModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import AssessmentRulebookTableComponent from '@/components/assessment/assessmentRulebook/AssessmentRulebookTableComponent.vue';
import type { Page } from '@/models/Common';
import type { AxiosResponse } from 'axios';
import TabContentLoader from '@/components/core/TabContentLoader.vue';


export default defineComponent({
    name: "AssessmentRulebookListView",
    components: { AssessmentRulebookTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const assessmentRulebooks = ref<AssessmentRulebookResponse[]>([]);
        const totalAssessmentRulebooks = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("assessmentRulebookPageLabel");
            loading.value = true;
        });

        watch(i18n.locale, () => {
            search();
        });

        const search = () => {
            AssessmentRulebookService.fetchAllAssessmentRulebooks(`page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
            .then((response: AxiosResponse<Page<AssessmentRulebookResponse>>) => {
                assessmentRulebooks.value = response.data.content;
                totalAssessmentRulebooks.value = response.data.totalElements;
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
            search, assessmentRulebooks,
            totalAssessmentRulebooks, switchPage,
            loading
        };
    }
});
</script>
