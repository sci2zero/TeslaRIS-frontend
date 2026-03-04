<template>
    <v-container>
        <h1>{{ $t("prizeListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component
            @search="clearSortAndPerformSearch"
        />
        <br />
        <span class="d-flex align-center">
            <v-checkbox
                v-if="isUserBoundToOU"
                v-model="returnOnlyInstitutionRelatedEntities"
                :label="$t('showEntitiesForMyInstitutionLabel')"
                class="ml-4"
            ></v-checkbox>
            <v-select
                v-if="isAdmin"
                v-model="selectedCommission"
                class="commission-select"
                :items="commissions"
                :label="$t('commissionViewLabel')"
                return-object
                clearable
                @click:clear="onClearCommission"
            />
            <v-checkbox
                v-if="isCommission || (isAdmin && selectedCommission.value > 0)"
                v-model="returnOnlyUnclassifiedEntities"
                :label="$t('showUnclassifiedLabel')"
                class="ml-4"
            ></v-checkbox>
        </span>

        <tab-content-loader
            v-if="loading"
            button-header
            tab-number-by-role
            layout="table"
        />
        <prize-table-component
            v-else
            ref="tableRef"
            :prizes="prizes"
            :total-prizes="totalPrizes"
            @switch-page="switchPage"
        />
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import PrizeService from '@/services/PrizeService';
import { ref } from 'vue';
import type { PrizeIndex } from '@/models/PersonModel';
import { useI18n } from 'vue-i18n';
import { useUserRole } from '@/composables/useUserRole';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import CommissionService from '@/services/assessment/CommissionService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PrizeTableComponent from '@/components/person/prize/PrizeTableComponent.vue';
import { debounce } from "lodash";


export default defineComponent({
    name: "PrizeListView",
    components: { SearchBarComponent, PrizeTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const prizes = ref<PrizeIndex[]>([]);
        const totalPrizes = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");
        const returnOnlyUnclassifiedEntities = ref(true);

        const i18n = useI18n();
        const tableRef = ref<typeof PrizeTableComponent>();

        const { isAdmin, isUserBoundToOU, returnOnlyInstitutionRelatedEntities, isCommission, loggedInUser } = useUserRole();

        const commissions = ref<{title: string, value: number}[]>([]);
        const selectedCommission = ref({ title: '', value: -1 });

        onMounted(() => {
            document.title = i18n.t("prizeListLabel");
            loading.value = true;

            fetchCommissions();
        });

        const fetchCommissions = () => {
            CommissionService.readAllCommissions(true, false).then(response => {
                commissions.value.splice(0)
                response.data.content.forEach(commission => {
                    commissions.value.push(
                        { title: returnCurrentLocaleContent(commission.description) as string, value: commission.id }
                    );
                })
            });
        };

        watch(
            [
                loggedInUser,
                returnOnlyInstitutionRelatedEntities,
                returnOnlyUnclassifiedEntities,
                selectedCommission
            ], () => {
            search(searchParams.value);
            loading.value = true;
        });

        const clearSortAndPerformSearch = (tokenParams: string) => {
            tableRef.value?.setSortAndPageOption([], 1);
            page.value = 0;
            sort.value = "";
            direction.value = "";
            search(tokenParams);
        };

        const search = debounce((tokenParams: string) => {
            searchParams.value = tokenParams;

            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                loading.value = false;
                return;
            }

            PrizeService.searchPrizes(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                returnOnlyInstitutionRelatedEntities.value ? loggedInUser.value?.organisationUnitId as number : null,
                selectedCommission.value.value > 0 ? selectedCommission.value.value : null,
                (isCommission.value || isAdmin && selectedCommission.value.value > 0) && returnOnlyUnclassifiedEntities.value
            ).then((response) => {
                prizes.value = response.data.content;
                totalPrizes.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            });
        }, 500);

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        };

        const onClearCommission = () => {
            selectedCommission.value = { title: '', value: -1 };
        };

        return {
            search, prizes, totalPrizes, isAdmin,
            switchPage, isUserBoundToOU,
            tableRef, clearSortAndPerformSearch,
            returnOnlyInstitutionRelatedEntities,
            loading, isCommission, commissions,
            returnOnlyUnclassifiedEntities,
            selectedCommission, onClearCommission
        };
    }
});
</script>
