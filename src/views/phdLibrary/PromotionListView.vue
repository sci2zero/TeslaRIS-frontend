<template>
    <v-container>
        <h1>{{ $t("promotionListLabel") }}</h1>
        <br />
        <br />
        <promotion-table
            ref="tableRef"
            :countries="countries"
            :total-promotions="totalCountries"
            @switch-page="switchPage">
        </promotion-table>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import PromotionService from '@/services/thesisLibrary/PromotionService';
import PromotionTable from '@/components/thesisLibrary/PromotionTable.vue';
import { ref } from 'vue';
import type { Promotion } from '@/models/ThesisLibraryModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';


export default defineComponent({
    name: "PromotionListView",
    components: { PromotionTable },
    setup() {
        const searchParams = ref("tokens=");
        const countries = ref<Promotion[]>([]);
        const totalCountries = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();
        const tableRef = ref<typeof PromotionTable>();

        onMounted(() => {
            document.title = i18n.t("promotionListLabel");
        });

        watch(i18n.locale, () => {
            fetchPromotions(searchParams.value);
        });

        const fetchPromotions = (tokenParams: string) => {
            searchParams.value = tokenParams;
            PromotionService.getAllPromotions(
                `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
            ).then((response) => {
                countries.value = response.data.content;
                totalCountries.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPromotions(searchParams.value);
        };

        return {
            fetchPromotions, countries,
            totalCountries,
            switchPage, tableRef
        };
    }
});
</script>
