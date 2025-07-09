<template>
    <v-container>
        <h1
            v-if="organisationUnit && !selectedYear"
            class="d-flex flex-row justify-center mb-15">
            {{ $t("institutionPublicReviewDissertationsLabel", [returnCurrentLocaleContent(organisationUnit.name)]) }}
        </h1>
        <h1
            v-else-if="organisationUnit && selectedYear"
            class="d-flex flex-row justify-center mb-15">
            {{ $t("institutionPublicReviewDissertationsArchiveLabel", [returnCurrentLocaleContent(organisationUnit.name)]) }}
        </h1>
        <h1
            v-else-if="selectedYear"
            class="d-flex flex-row justify-center mb-15">
            {{ $t("publicReviewDissertationsArchiveLabel") }}
        </h1>
        <h1
            v-else
            class="d-flex flex-row justify-center mb-15">
            {{ $t("allPublicReviewDissertationsLabel") }}
        </h1>
        <v-row class="d-flex justify-start">
            <v-col cols="12" sm="6" md="2">
                <p class="mt-2">
                    {{ $t("browseArchiveForYearLabel") }}
                </p>
            </v-col>
            <v-col cols="12" sm="6" md="2">
                <v-select
                    v-model="selectedYear"
                    :items="years"
                    :label="$t('archiveYearLabel')"
                    style="min-width: 150px;"
                    clearable
                />
            </v-col>
        </v-row>
        <v-row v-if="showingNotDefended">
            <v-col>
                <p>{{ $t("navigateToThesisSearchMessage") }}<a href="#" @click.prevent="navigateToSearch">{{ $t("linkLabel") }}</a></p>
            </v-col>
        </v-row>
        <v-row v-if="showingNotDefended">
            <v-col>
                <p>{{ $t("publicReviewOngoingLabel") }}<a href="#" @click.prevent="navigateToThisView(false)">{{ $t("linkLabel") }}</a></p>
            </v-col>
        </v-row>
        <v-row v-else-if="organisationUnit">
            <v-col>
                <p>{{ $t("notYetDefendedNavigationLabel") }}<a href="#" @click.prevent="navigateToThisView(true)">{{ $t("linkLabel") }}</a></p>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <tab-content-loader
                    v-if="loading"
                    button-header
                    tab-number-by-role
                    layout="table"
                />
                <thesis-table-component
                    v-else
                    ref="tableRef"
                    :theses="theses"
                    :institution-id="currentRoute.query.institutionId ? parseInt(currentRoute.query.institutionId as string) : undefined"
                    :total-theses="totalTheses"
                    :show-review-end-date="!showingNotDefended"
                    @switch-page="switchPage">
                </thesis-table-component>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import ThesisTableComponent from '@/components/thesisLibrary/ThesisTableComponent.vue';
import type { ThesisPublicReviewResponse } from '@/models/ThesisLibraryModel';
import { useRoute, useRouter } from 'vue-router';
import ThesisLibraryReportingService from '@/services/thesisLibrary/ThesisLibraryReportingService';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import type { OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "UserListView",
    components: { ThesisTableComponent, TabContentLoader },
    setup() {
        const loading = ref(false);

        const theses = ref<ThesisPublicReviewResponse[]>([]);
        const totalTheses = ref(0);
        const page = ref(0);
        const size = ref(1);

        const currentRoute = useRoute();
        const router = useRouter();

        const i18n = useI18n();
        const tableRef = ref<typeof ThesisTableComponent>();

        const years = ref<number[]>([]);
        const selectedYear = ref<number | null>((currentRoute.query.year as string) ? parseInt(currentRoute.query.year as string) : null);

        const organisationUnit = ref<OrganisationUnitResponse>();

        const showingNotDefended = computed(() => (currentRoute.query.notYetDefended as string) === 'true');

        onMounted(() => {
            document.title = i18n.t("thesisListLabel");
            loading.value = true;

            const now = new Date();
            for(let i = now.getFullYear(); i > 1950; i--) {
                years.value.push(i);
            }

            if (currentRoute.query.institutionId) {
                OrganisationUnitService.readOU(parseInt(currentRoute.query.institutionId as string)).then(response => {
                    organisationUnit.value = response.data;
                });
            }
        });

        watch(selectedYear, () => {
            router.replace({
                query: {
                    ...currentRoute.query,
                    year: selectedYear.value !== null ? selectedYear.value.toString() : undefined
                }
            });
        });

        const fetchPublicReviewTheses = () => {
            const institutionId = currentRoute.query.institutionId as string;
            const notDefended = currentRoute.query.notYetDefended as string;

            ThesisLibraryReportingService.fetchPublicReviewDissertations(
                institutionId ? parseInt(institutionId) : null,
                selectedYear.value,
                notDefended ? notDefended === "true" : false,
                `&page=${page.value}&size=${size.value}`
            ).then(response => {
                theses.value = response.data.content;
                totalTheses.value = response.data.totalElements;
            })
            .finally(() => {
                loading.value = false;
            });
        };

        const switchPage = (nextPage: number, pageSize: number) => {
            page.value = nextPage;
            size.value = pageSize;
            fetchPublicReviewTheses();
        };

        const navigateToSearch = () => {
            router.push({name: "thesisLibrarySearch"});
        };

        const navigateToThisView = (notYetDefended: boolean) => {
            router.push({name: "publicDissertationsReport", query: {institutionId: parseInt(currentRoute.query.institutionId as string), notYetDefended: `${notYetDefended}`}});
        };

        return {
            theses, totalTheses,
            tableRef, loading, years,
            switchPage, currentRoute,
            selectedYear, organisationUnit,
            returnCurrentLocaleContent,
            navigateToSearch, navigateToThisView,
            showingNotDefended
        };
    }
});
</script>
