<template>
    <v-container>
        <h1>{{ $t("classificationsLabel") }}</h1>
        <br />
        <br />
        <br />
        <AssessmentCLassificationTableComponent :classifications="classifications" :total-classifications="totalClassifications" @switch-page="switchPage"></AssessmentCLassificationTableComponent>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import { ref } from 'vue';
import type { AssessmentClassification } from '@/models/AssessmentModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import AssessmentCLassificationTableComponent from '@/components/assessment/classifications/AssessmentCLassificationTableComponent.vue';
import type { Page } from '@/models/Common';
import type { AxiosResponse } from 'axios';


export default defineComponent({
    name: "ClassificationListView",
    components: { AssessmentCLassificationTableComponent },
    setup() {
        const classifications = ref<AssessmentClassification[]>([]);
        const totalClassifications = ref(0);
        const page = ref(0);
        const size = ref(25);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("classificationsLabel");
        });

        watch(i18n.locale, () => {
            search();
        });

        const search = () => {
            AssessmentClassificationService.fetchAllAssessmentClassifications(`page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`).then((response: AxiosResponse<Page<AssessmentClassification>>) => {
                classifications.value = response.data.content;
                totalClassifications.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search();
        }

        return {search, classifications, totalClassifications, switchPage};
    }
});
</script>
