<template>
    <v-container>
        <h1>{{ $t("journalListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component @search="clearSortAndPerformSearch"></search-bar-component>
        <br />
        <span class="d-flex align-center">
            <v-btn
                v-if="isAdmin"
                class="mb-5"
                color="primary"
                @click="addJournal">
                {{ $t("createNewJournalLabel") }}
            </v-btn>
        </span>
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
        <journal-table-component
            v-else
            ref="tableRef"
            :journals="journals"
            :total-journals="totalJournals"
            @switch-page="switchPage"
        />
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import JournalService from '@/services/JournalService';
import JournalTableComponent from '@/components/journal/JournalTableComponent.vue';
import { ref } from 'vue';
import type { JournalIndex } from '@/models/JournalModel';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserRole } from '@/composables/useUserRole';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import CommissionService from '@/services/assessment/CommissionService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "JournalListView",
    components: { SearchBarComponent, JournalTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const searchParams = ref("tokens=");
        const journals = ref<JournalIndex[]>([]);
        const totalJournals = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");
        const returnOnlyUnclassifiedEntities = ref(true);

        const i18n = useI18n();
        const router = useRouter();
        const tableRef = ref<typeof JournalTableComponent>();

        const { isAdmin, isUserBoundToOU, returnOnlyInstitutionRelatedEntities, isCommission, loggedInUser } = useUserRole();

        const commissions = ref<{title: string, value: number}[]>([]);
        const selectedCommission = ref({ title: '', value: -1 });

        onMounted(() => {
            document.title = i18n.t("journalListLabel");
            loading.value = true;
            search(searchParams.value);

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

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;

            if (returnOnlyInstitutionRelatedEntities.value && !loggedInUser.value?.organisationUnitId) {
                loading.value = false;
                return;
            }

            JournalService.searchJournals(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                returnOnlyInstitutionRelatedEntities.value ? loggedInUser.value?.organisationUnitId as number : null,
                (isCommission.value || isAdmin && selectedCommission.value.value > 0) && returnOnlyUnclassifiedEntities.value,
                selectedCommission.value.value > 0 ? selectedCommission.value.value : null
            ).then((response) => {
                journals.value = response.data.content;
                totalJournals.value = response.data.totalElements;
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
            search(searchParams.value);
        };

        const addJournal = () => {
            router.push({name: "submitJournal"});
        };

        const onClearCommission = () => {
            selectedCommission.value = { title: '', value: -1 };
        };

        return {
            search, journals, totalJournals, isAdmin,
            switchPage, addJournal, isUserBoundToOU,
            tableRef, clearSortAndPerformSearch,
            returnOnlyInstitutionRelatedEntities,
            loading, isCommission, commissions,
            returnOnlyUnclassifiedEntities,
            selectedCommission, onClearCommission
        };
    }
});
</script>
