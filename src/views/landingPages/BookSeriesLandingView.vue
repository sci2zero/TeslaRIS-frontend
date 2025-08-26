<template>
    <v-container id="bookSeries">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!bookSeries"
                            type="heading"
                            color="blue-lighten-3"
                            class="d-flex justify-center align-center"
                        >
                            <p class="text-h5">
                                {{ returnCurrentLocaleContent(bookSeries?.title) + (bookSeries?.nameAbbreviation && bookSeries.nameAbbreviation.length > 0 ? " (" + returnCurrentLocaleContent(bookSeries?.nameAbbreviation) + ")" : "") }}
                            </p>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(bookSeries?.subtitle) }}
                        <br v-if="bookSeries?.subtitle && bookSeries.subtitle.length > 0" />
                        {{ $t("bookSeriesLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- BookSeries Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-bookSeries-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="PublicationSeriesUpdateForm"
                            :form-props="{ presetPublicationSeries: bookSeries, inputType: 'BOOK_SERIES' }"
                            entity-name="BookSeries"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!bookSeries" :citation-button="false" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div>eISSN:</div>
                                <div class="response">
                                    {{ bookSeries?.eissn ? bookSeries.eissn : $t("notYetSetMessage") }}
                                </div>
                                <div>Print ISSN:</div>
                                <div class="response">
                                    {{ bookSeries?.printISSN ? bookSeries.printISSN : $t("notYetSetMessage") }}
                                </div>
                                <div v-if="bookSeries?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="bookSeries?.openAlexId" class="response">
                                    <identifier-link :identifier="bookSeries.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="bookSeries?.languageTagIds && bookSeries?.languageTagIds.length > 0">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div>
                                    <v-chip v-for="(languageTagId, index) in bookSeries?.languageTagIds" :key="index" outlined>
                                        {{ languageTagMap.get(languageTagId)?.display }}
                                    </v-chip>
                                </div>
                                <div v-if="bookSeries?.uris && bookSeries?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="bookSeries?.uris"></uri-list>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <br />
        <tab-content-loader v-if="!bookSeries" :tab-number="3" layout="list" />
        <v-tabs
            v-show="bookSeries"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-if="bookSeriesIndicators.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="bookSeries"
            v-model="currentTab"
        >
            <v-tabs-window-item value="publications">
                <!-- Publications Table -->
                <h2>{{ $t("journalPublicationsLabel") }}</h2>
                <publication-table-component
                    :publications="publications"
                    :total-publications="totalPublications"
                    in-comparator
                    @switch-page="switchPage">
                </publication-table-component>
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-publication-series-contribution-tabs
                    :contribution-list="bookSeries?.contributions ? bookSeries.contributions : []"
                    :publication-series-id="bookSeries?.id"
                    :read-only="!canEdit" @update="updateContributions">
                </person-publication-series-contribution-tabs>
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
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
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
import UriList from '@/components/core/UriList.vue';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type EntityIndicatorResponse } from '@/models/AssessmentModel';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';


export default defineComponent({
    name: "BookSeriesLandingPage",
    components: { PublicationTableComponent, GenericCrudModal, PersonPublicationSeriesContributionTabs, UriList, Toast, BasicInfoLoader, TabContentLoader, IndicatorsSection, IdentifierLink },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const bookSeries = ref<BookSeries>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const icon = ref("mdi-bookshelf");

        const canEdit = ref(false);

        const loginStore = useLoginStore();
        const router = useRouter();

        const bookSeriesIndicators = ref<EntityIndicatorResponse[]>([]);

        onMounted(() => {
            if (loginStore.userLoggedIn) {
                BookSeriesService.canEdit(parseInt(currentRoute.params.id as string)).then(response => {
                    canEdit.value = response.data;
                });

                StatisticsService.registerPublicationSeriesView(parseInt(currentRoute.params.id as string));
            }

            fetchBookSeries(true);
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
            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
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
            bookSeries.value!.languageTagIds = updatedBookSeries.languageTagIds;
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
            bookSeries, icon,
            publications, 
            totalPublications,
            switchPage, currentTab,
            returnCurrentLocaleContent,
            languageTagMap, canEdit,
            updateBasicInfo, snackbar,
            snackbarMessage, updateContributions,
            PublicationSeriesUpdateForm,
            ApplicableEntityType,
            bookSeriesIndicators
        };
}})

</script>

<style scoped>
    #bookSeries .large-bookSeries-icon {
        font-size: 10em;
    }

    #bookSeries .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>