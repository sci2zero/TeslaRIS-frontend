<template>
    <div id="bookSeries" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!bookSeries"
            :subtitle="returnCurrentLocaleContent(bookSeries?.subtitle)"
            :entity-label="$t('bookSeriesLabel')"
            icon="mdi-bookshelf"
            :can-edit="canEdit"
            :edit-label="$t('updateBookSeriesLabel')"
            :entity-type="EntityType.BOOK_SERIES"
            :entity-id="bookSeries?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="PublicationSeriesUpdateForm"
                    :form-props="{ presetPublicationSeries: bookSeries, inputType: 'BOOK_SERIES' }"
                    entity-name="BookSeries"
                    is-update
                    is-section-update
                    :read-only="!canEdit"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                {{ returnCurrentLocaleContent(bookSeries?.title) + (bookSeries?.nameAbbreviation && bookSeries.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(bookSeries?.nameAbbreviation) + ")" : "") }}
            </template>
            <template #meta>
                <landing-meta-item v-if="bookSeries?.eissn" label="eISSN" abbrev="eISSN" tone="blue">
                    {{ bookSeries.eissn }}
                </landing-meta-item>
                <landing-meta-item v-if="bookSeries?.printISSN" label="Print ISSN" abbrev="ISSN" tone="indigo">
                    {{ bookSeries.printISSN }}
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <tab-content-loader v-if="!bookSeries" :tab-number="3" layout="list" />
        <v-tabs
            v-show="bookSeries"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
            show-arrows
            class="landing-tabs"
        >
            <v-tab value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-if="bookSeriesIndicators && bookSeriesIndicators.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="bookSeries"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="publications">
                <h2>{{ $t("thisJournalPublicationsLabel") }}</h2>
                <publication-table-component
                    :publications="publications"
                    :total-publications="totalPublications"
                    in-comparator
                    @switch-page="switchPage">
                </publication-table-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab :show-remark="false">
                    <template #details>
                        <landing-detail-field v-if="bookSeries?.languageIds && bookSeries.languageIds.length > 0" :label="$t('languageLabel')">
                            {{ bookSeries.languageIds.map(id => returnCurrentLocaleContent(languageMap.get(id)?.name)).filter(Boolean).join(', ') }}
                        </landing-detail-field>
                        <landing-detail-field v-if="bookSeries?.openAlexId" label="Open Alex ID">
                            <identifier-link :identifier="bookSeries.openAlexId" type="open_alex" compact />
                        </landing-detail-field>
                        <landing-detail-field v-if="bookSeries?.uris && bookSeries.uris.length > 0" :label="$t('uriInputLabel')">
                            <a
                                v-for="uri in bookSeries.uris"
                                :key="uri"
                                :href="uri"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="underline block"
                            >
                                {{ uri }}
                            </a>
                        </landing-detail-field>
                        <div class="md:col-span-2">
                            <entity-identifiers-list
                                :entity-identifiers="publicationSeriesIdentifiers"
                                :can-edit="canEdit"
                                :entity-id="bookSeries?.id"
                                :containing-entity-type="ApplicableEntityType.PUBLICATION_SERIES"
                                :concrete-entity-type="ApplicableEntityType.BOOK_SERIES"
                                @updated="fetchIdentifiers"
                            />
                        </div>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-publication-series-contribution-tabs
                    :contribution-list="bookSeries?.contributions ? bookSeries.contributions : []"
                    :publication-series-id="bookSeries?.id"
                    :read-only="!canEdit"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="bookSeriesIndicators" 
                    :applicable-types="[ApplicableEntityType.PUBLICATION_SERIES]" 
                    :entity-id="bookSeries?.id"
                    :entity-type="ApplicableEntityType.PUBLICATION_SERIES" 
                    :can-edit="false"
                    show-statistics
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="EntityType.BOOK_SERIES"
                    :entity-id="bookSeries?.id"
                    @restored="() => fetchBookSeries(false)"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="EntityType.BOOK_SERIES"
                    :entity-id="bookSeries?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </div>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageResponse } from '@/models/Common';
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import type { BookSeries } from '@/models/BookSeriesModel';
import BookSeriesService from '@/services/BookSeriesService';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import PersonPublicationSeriesContributionTabs from '@/components/core/PersonPublicationSeriesContributionTabs.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationSeriesUpdateForm from '@/components/publicationSeries/update/PublicationSeriesUpdateForm.vue';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityIndicatorResponse } from '@/models/AssessmentModel';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import EntityIdentifiersList from '@/components/core/identifiers/EntityIdentifiersList.vue';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import { EntityType } from '@/models/MergeModel';
import { useUserRole } from '@/composables/useUserRole';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';


export default defineComponent({
    name: "BookSeriesLandingPage",
    components: { PublicationTableComponent, GenericCrudModal, PersonPublicationSeriesContributionTabs, Toast, TabContentLoader, IndicatorsSection, IdentifierLink, EntityIdentifiersList, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab },
    setup() {
        const { isAdmin } = useUserRole();

        const currentTab = ref("contributions");

        const dataQualityTabsRef = ref<typeof DataQualityTabsComponent>();

        const showAssessmentDetails = (
            version: { majorVersion: number, minorVersion: number }) => {
            currentTab.value = "dataQuality";

            nextTick(() => dataQualityTabsRef.value?.selectVersion(
                version.majorVersion, version.minorVersion));
        };

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const bookSeries = ref<BookSeries>();
        const languageMap = ref<Map<number, LanguageResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const canEdit = ref(false);

        const loginStore = useLoginStore();
        const router = useRouter();

        const bookSeriesIndicators = ref<EntityIndicatorResponse[]>();
        const publicationSeriesIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const updateModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                BookSeriesService.canEdit(parseInt(currentRoute.params.id as string)).then(response => {
                    canEdit.value = response.data;
                });

                StatisticsService.registerPublicationSeriesView(parseInt(currentRoute.params.id as string));
            }

            fetchBookSeries(true);
            fetchIdentifiers();
            fetchIndicators();
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchIndicators = () => {
            EntityIndicatorService.fetchPublicationSeriesIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                bookSeriesIndicators.value = response.data;
            });
        };

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchPublicationSeriesIdentifiers(parseInt(currentRoute.params.id as string)).then(response => {
                publicationSeriesIdentifiers.value = response.data;
            });
        };

        const fetchBookSeries = (uponStartup: boolean) => {
            BookSeriesService.readBookSeries(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                bookSeries.value = response.data;

                document.title = returnCurrentLocaleContent(bookSeries.value.title) as string;

                bookSeries.value.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if(uponStartup) {
                    Promise.all([fetchPublications()]).then(() => {
                        setStartTab();
                    });
                }

                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguages().then(response => {
                response.data.forEach(language => {
                    languageMap.value.set(language.id, language);
                })
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            return BookSeriesService.findPublicationsForBookSeries(bookSeries.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value}`).then((response) => {
                publications.value = response.data.content;
                totalPublications.value = response.data.totalElements
            });
        };

        const updateBasicInfo = (updatedBookSeries: BookSeries) => {
            bookSeries.value!.title = updatedBookSeries.title;
            bookSeries.value!.nameAbbreviation = updatedBookSeries.nameAbbreviation;
            bookSeries.value!.eissn = updatedBookSeries.eissn;
            bookSeries.value!.printISSN = updatedBookSeries.printISSN;
            bookSeries.value!.openAlexId = updatedBookSeries.openAlexId;
            bookSeries.value!.languageIds = updatedBookSeries.languageIds;
            bookSeries.value!.uris = updatedBookSeries.uris;
            bookSeries.value!.subtitle = updatedBookSeries.subtitle;

            performUpdate(false);
        };

        const updateContributions = (contributions: PersonPublicationSeriesContribution[]) => {
            bookSeries.value!.contributions = contributions;
            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            BookSeriesService.updateBookSeries(bookSeries.value?.id as number, bookSeries.value as BookSeries).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchBookSeries(false);
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchBookSeries(false);
                }
            });
        };

        const setStartTab = () => {
            if(totalPublications.value > 0) {
                currentTab.value = "publications";
            } else {
                currentTab.value = "contributions";
            }
        };

        return {
            bookSeries, publications, 
            fetchIdentifiers, totalPublications,
            publicationSeriesIdentifiers,
            switchPage, currentTab,
            returnCurrentLocaleContent,
            languageMap, canEdit,
            updateBasicInfo, snackbar,
            snackbarMessage, updateContributions,
            PublicationSeriesUpdateForm,
            ApplicableEntityType,
            bookSeriesIndicators,
            isAdmin, EntityType, fetchBookSeries,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal
        };
}})

</script>
