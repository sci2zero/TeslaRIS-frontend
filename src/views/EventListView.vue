<template>
    <v-container>
        <h1>{{ $t("eventListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component
            :preset-search-input="presetSearchParams"
            @search="clearSortAndPerformSearch">
        </search-bar-component>
        <br />
        <span class="d-flex align-center">
            <v-btn v-if="isAdmin" color="primary" @click="addConference">
                {{ $t("createNewConferenceLabel") }}
            </v-btn>
        </span>
        <span class="d-flex align-center">
            <v-checkbox
                v-if="isUserBoundToOU"
                v-model="returnOnlyInstitutionRelatedEntities"
                :label="$t('showEntitiesForMyInstitutionLabel')"
                class="ml-4 mt-5"
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
                class="ml-4 mt-5"
            ></v-checkbox>
            <v-checkbox
                v-model="returnSerialEvents"
                :label="$t('showSerialEventsLabel')"
                class="ml-4 mt-5"
            ></v-checkbox>
            <v-checkbox
                v-if="isAdmin"
                v-model="returnEventsWithoutProceedings"
                :label="$t('showOnlyWithoutProceedingsLabel')"
                class="ml-4 mt-5"
            ></v-checkbox>
        </span>

        <tab-content-loader
            v-if="loading"
            button-header
            tab-number-by-role
            layout="table"
        />
        <event-table-component
            v-else
            ref="tableRef"
            :events="events"
            :total-events="totalEvents"
            @switch-page="switchPage"
        />
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import EventService from '@/services/EventService';
import EventTableComponent from '@/components/event/EventTableComponent.vue';
import { ref } from 'vue';
import type { EventIndex } from '@/models/EventModel';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { useUserRole } from '@/composables/useUserRole';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import CommissionService from '@/services/assessment/CommissionService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "EventListView",
    components: { SearchBarComponent, EventTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);
        const i18n = useI18n();
        const router = useRouter();
        const route = useRoute();

        const presetSearchParams = ref(route.query.searchQuery as string);
        const searchParams = ref("tokens=");
        const events = ref<EventIndex[]>([]);
        const totalEvents = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const returnSerialEvents = ref(true);
        const returnOnlyUnclassifiedEntities = ref(true);
        const returnEventsWithoutProceedings = ref(false);
        const tableRef = ref<typeof EventTableComponent>();

        const commissions = ref<{title: string, value: number}[]>([]);
        const selectedCommission = ref({ title: '', value: -1 });

        const { isAdmin, isCommission, isUserBoundToOU, returnOnlyInstitutionRelatedEntities } = useUserRole();

        onMounted(() => {
            document.title = i18n.t("eventListLabel");
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

        watch([
            returnSerialEvents,
            returnOnlyInstitutionRelatedEntities,
            returnOnlyUnclassifiedEntities,
            selectedCommission,
            returnEventsWithoutProceedings
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

            if (returnOnlyInstitutionRelatedEntities.value && !isUserBoundToOU.value) {
                loading.value = false;
                return;
            }

            EventService.searchConferences(
                `${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`,
                !returnSerialEvents.value,
                false,
                returnOnlyInstitutionRelatedEntities.value as boolean,
                (isCommission.value || isAdmin && selectedCommission.value.value > 0) && returnOnlyUnclassifiedEntities.value,
                selectedCommission.value.value > 0 ? selectedCommission.value.value : null,
                returnEventsWithoutProceedings.value
            ).then((response) => {
                events.value = response.data.content;
                totalEvents.value = response.data.totalElements;
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

        const addConference = () => {
            router.push({name: "submitConference"});
        };

        const onClearCommission = () => {
            selectedCommission.value = { title: '', value: -1 };
        };

        return {
            search, events, totalEvents, switchPage, isAdmin,
            addConference, presetSearchParams, returnSerialEvents,
            tableRef, clearSortAndPerformSearch, isUserBoundToOU,
            returnOnlyInstitutionRelatedEntities, isCommission,
            returnOnlyUnclassifiedEntities, loading, commissions,
            selectedCommission, onClearCommission,
            returnEventsWithoutProceedings
        };
    }
});
</script>
