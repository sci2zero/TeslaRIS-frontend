<template>
    <div id="monograph" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!monograph"
            :subtitle="returnCurrentLocaleContent(monograph?.subTitle)"
            :entity-label="$t('monographLabel')"
            :badge="monograph?.monographType ? getMonographTypeTitleFromValueAutoLocale(monograph.monographType) : ''"
            icon="mdi-book-open-page-variant"
            :can-edit="canEdit && !monograph?.isArchived"
            :edit-label="$t('updateMonographLabel')"
            :entity-type="PublicationType.MONOGRAPH"
            :entity-id="monograph?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !monograph?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="MonographUpdateForm"
                    :form-props="{ presetMonograph: monograph}"
                    entity-name="Monograph"
                    is-update
                    is-section-update
                    :read-only="!canEdit"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(monograph?.title)" />
            </template>
            <template #visual>
                <v-icon v-if="!monograph" size="x-large" class="text-slate-400">mdi-book-open-page-variant</v-icon>
                <wordcloud
                    v-else
                    :for-document-id="monograph?.id"
                    :document-type="PublicationType.MONOGRAPH"
                    compact-icon
                />
            </template>
            <template #meta>
                <landing-meta-item v-if="monograph?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(monograph.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="monograph?.eisbn" label="eISBN" abbrev="eISBN" tone="blue">
                    {{ monograph.eisbn }}
                </landing-meta-item>
                <landing-meta-item v-if="monograph?.printISBN" label="Print ISBN" abbrev="ISBN" tone="indigo">
                    {{ monograph.printISBN }}
                </landing-meta-item>
                <landing-meta-item v-if="monograph?.publisherId || monograph?.authorReprint" :label="$t('publisherLabel')" icon="mdi-domain" tone="emerald">
                    <localized-link
                        v-if="(monograph?.publisherName?.length ?? 0) > 0"
                        :to="'publishers/' + monograph?.publisherId"
                        class="underline"
                    >
                        {{ returnCurrentLocaleContent(monograph?.publisherName) }}
                    </localized-link>
                    <localized-link
                        v-else-if="monograph?.authorReprint"
                        to="scientific-results/author-reprints"
                        class="underline"
                    >
                        {{ $t("authorReprintLabel") }}
                    </localized-link>
                </landing-meta-item>
                <landing-meta-item v-if="monograph?.publicationSeriesId" :label="$t('publicationSeriesLabel')" icon="mdi-book-multiple" tone="violet">
                    <localized-link
                        :to="`${publicationSeriesType.toString() === '0' ? 'journals' : 'book-series'}/` + monograph?.publicationSeriesId"
                        class="underline"
                    >
                        {{ returnCurrentLocaleContent(publicationSeries?.title) }}
                    </localized-link>
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="monograph?.doi"
            :can-edit="canEdit && !monograph?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="monograph?.isMetadataValid"
            :files-valid="monograph?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(monograph?.description)"
            :document="monograph"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(monograph?.id as number, monograph as _Document)"
        />

        <tab-content-loader v-if="!monograph" layout="sections" />
        <v-tabs
            v-show="monograph"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
            show-arrows
            class="landing-tabs"
        >
            <v-tab v-show="monograph?.monographType === MonographType.EDITED_BOOK" value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t(monograph?.monographType === MonographType.EDITED_BOOK ? "editorsAndReviewersLabel" : "contributionsLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab value="researchArea">
                {{ $t("researchAreaLabel") }}
            </v-tab>
            <v-tab v-show="(documentIndicators && documentIndicators.length > 0) || canEdit" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="(documentClassifications && documentClassifications.length > 0) || canClassify" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab v-show="displayConfiguration.shouldDisplayStatisticsTab()" value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="monograph"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="publications">
                <h2>{{ $t("monographPublicationsLabel") }}</h2>
                <publication-table-component
                    :publications="publications"
                    :total-publications="totalPublications"
                    in-comparator
                    show-publication-concrete-type
                    @switch-page="switchPage"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="monograph?.id"
                    :contribution-list="monograph?.contributions ? monograph?.contributions : []"
                    :read-only="!canEdit || monograph?.isArchived"
                    :shows-board-and-reviewers="monograph?.monographType === MonographType.EDITED_BOOK"
                    :document-type="PublicationType.MONOGRAPH"
                    :concrete-type="(monograph?.monographType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="monograph"
                    :can-edit="canEdit && !monograph?.isArchived"
                    :proofs="monograph?.proofs"
                    :file-items="monograph?.fileItems"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="monograph?.keywords ? monograph.keywords : []"
                    :description="monograph?.description"
                    :remark="monograph?.remark"
                    :can-edit="canEdit && !monograph?.isArchived"
                    :document="monograph"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.MONOGRAPH"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="monograph?.numberOfPages" :label="$t('numberOfPagesLabel')" :value="monograph.numberOfPages" />
                        <landing-detail-field v-if="monograph?.volume" :label="$t('volumeLabel')" :value="monograph.volume" />
                        <landing-detail-field v-if="monograph?.number" :label="$t('numberLabel')" :value="monograph.number" />
                        <landing-detail-field v-if="monograph?.languageIds && monograph.languageIds.length > 0" :label="$t('languageLabel')">
                            {{ monograph.languageIds.map(id => returnCurrentLocaleContent(languageMap.get(id)?.name)).filter(Boolean).join(', ') }}
                        </landing-detail-field>
                        <landing-detail-field v-if="monograph?.udc" :label="$t('udcLabel')" :value="monograph.udc" />
                        <landing-detail-field v-if="monograph?.eventId" :label="$t('conferenceLabel')">
                            <localized-link :to="'events/conference/' + monograph?.eventId" class="underline">
                                {{ returnCurrentLocaleContent(event?.name) }}
                            </localized-link>
                        </landing-detail-field>
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="researchArea">
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <research-areas-update-modal
                                    :research-areas-hierarchy="researchAreaHierarchy ? [researchAreaHierarchy] : []"
                                    :read-only="!canEdit || monograph?.isArchived"
                                    limit-one
                                    @update="updateResearchAreas"
                                />
                                <div><b>{{ $t("researchAreasLabel") }}</b></div>
                                <research-area-hierarchy
                                    :research-areas="researchAreaHierarchy ? [researchAreaHierarchy] : []"
                                />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.MONOGRAPH]" 
                    :entity-id="monograph?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="monograph?.fileItems && monograph?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="monograph?.id"
                    :can-edit="((canClassify && monograph?.documentDate) as boolean)"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.MONOGRAPH]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(monograph?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.MONOGRAPH"
                    :entity-id="monograph?.id"
                    @restored="() => fetchMonograph(false)"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.MONOGRAPH"
                    :entity-id="monograph?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="monograph && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(monograph.title) as string)"
            :document-id="(monograph.id as number)"
            :document-type="PublicationType.MONOGRAPH"
        />
    </div>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageResponse, type MultilingualContent } from '@/models/Common';
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { MonographType, PublicationType, type Document as _Document, type DocumentPublicationIndex, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Monograph } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import ResearchAreaService from '@/services/ResearchAreaService';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import ResearchAreaHierarchy from '@/components/core/ResearchAreaHierarchy.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getMonographTypeTitleFromValueAutoLocale } from '@/i18n/monographType';
import { PublicationSeriesType, type PublicationSeries } from '@/models/PublicationSeriesModel';
import EventService from '@/services/EventService';
import type { Conference } from '@/models/EventModel';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import MonographUpdateForm from '@/components/publication/update/MonographUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import { type DocumentIndicator, StatisticsType, type EntityIndicatorResponse, type EntityClassificationResponse, type DocumentAssessmentClassification } from '@/models/AssessmentModel';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import ResearchAreasUpdateModal from '@/components/core/ResearchAreasUpdateModal.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';


export default defineComponent({
    name: "MonographLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, ResearchAreaHierarchy, GenericCrudModal, LocalizedLink, PublicationTableComponent, ResearchAreasUpdateModal, IndicatorsSection, EntityClassificationView, RichTitleRenderer, Wordcloud, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab },
    setup() {
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
        const router = useRouter();

        const monograph = ref<Monograph>();
        const languageMap = ref<Map<number, LanguageResponse>>(new Map());

        const { isResearcher, isAdmin, isCommission } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const i18n = useI18n();

        const researchAreaHierarchy = ref<ResearchArea>();

        const event = ref<Conference>();
        const publicationSeries = ref<PublicationSeries>();
        const publicationSeriesType = ref<PublicationSeriesType>(PublicationSeriesType.JOURNAL);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const documentIndicators = ref<EntityIndicatorResponse[]>();
        const documentClassifications = ref<EntityClassificationResponse[]>();
        const documentIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore = useLoginStore();

        const actionsRef = ref<typeof DocumentActionBox>();
        const updateModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        const displayConfiguration = useDocumentChartDisplay(parseInt(currentRoute.params.id as string));

        onMounted(() => {
            fetchDisplayData(true);
        });

        const fetchDisplayData = (uponStartup: boolean) => {
            if (loginStore.userLoggedIn) {
                DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                }).catch(() => canEdit.value = false);

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchClassifications();
            }

            fetchMonograph(uponStartup);
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        const fetchIndicators = () => {
            EntityIndicatorService.fetchDocumentIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                documentIndicators.value = response.data;
            });
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchMonograph = (uponStartup: boolean) => {
            DocumentPublicationService.readMonograph(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                monograph.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(monograph.value.title) as string;

                monograph.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
                fetchConnectedEntities();
                populateData();

                if(uponStartup) {
                    Promise.all([fetchPublications()]).then(() => {
                        setStartTab();
                    });
                }
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const fetchClassifications = () => {
            EntityClassificationService.fetchDocumentClassifications(parseInt(currentRoute.params.id as string)).then(response => {
                documentClassifications.value = response.data;
            });
        };

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchDocumentIdentifiers(
                parseInt(currentRoute.params.id as string)
            ).then(response => {
                documentIdentifiers.value = response.data;
            });
        };

        const populateData = () => {
            LanguageService.getAllLanguages().then(response => {
                response.data.forEach(language => {
                    languageMap.value.set(language.id, language);
                })
            });

            if (monograph.value?.researchAreaId) {
                ResearchAreaService.readResearchAreaHierarchy(monograph.value?.researchAreaId).then(response => {
                    researchAreaHierarchy.value = response.data;
                });
            }
            actionsRef.value?.fetchCitations();
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = () => {
            if (!monograph.value?.id) {
                return;
            }

            return DocumentPublicationService.findPublicationsInMonograph(
                monograph.value?.id as number,
                `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
            ).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchConnectedEntities = () => {
            if (monograph.value?.eventId) {
                EventService.readConference(monograph.value?.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });
            }

            if(monograph.value?.publicationSeriesId) {
                JournalService.readJournal(monograph.value.publicationSeriesId).then((journalResponse) => {
                    publicationSeries.value = journalResponse.data;
                    publicationSeriesType.value = PublicationSeriesType.JOURNAL;
                }).catch(() => {
                    BookSeriesService.readBookSeries(monograph.value?.publicationSeriesId as number).then((bookSeriesResponse) => {
                        publicationSeries.value = bookSeriesResponse.data;
                        publicationSeriesType.value = PublicationSeriesType.BOOK_SERIES;
                    });
                });
            }
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" }});
        };

        const setStartTab = () => {
            if(totalPublications.value > 0) {
                currentTab.value = "publications";
            } else {
                currentTab.value = "contributions";
            }
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        }

        const updateKeywords = (keywords: MultilingualContent[]) => {
            monograph.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            monograph.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            monograph.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateResearchAreas = (researchAreaIds: number[]) => {
            monograph.value!.researchAreaId = researchAreaIds[0];

            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Monograph) => {
            monograph.value!.number = basicInfo.number;
            monograph.value!.volume = basicInfo.volume;
            monograph.value!.researchAreaId = basicInfo.researchAreaId;
            monograph.value!.languageIds = basicInfo.languageIds;
            monograph.value!.publicationSeriesId = basicInfo.publicationSeriesId;
            monograph.value!.numberOfPages = basicInfo.numberOfPages;
            monograph.value!.eisbn = basicInfo.eisbn;
            monograph.value!.printISBN = basicInfo.printISBN;
            monograph.value!.publisherId = basicInfo.publisherId;
            monograph.value!.authorReprint = basicInfo.authorReprint;
            monograph.value!.udc = basicInfo.udc;
            monograph.value!.monographType = basicInfo.monographType;

            updateCommonBasicInfo(monograph, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateMonograph(monograph.value?.id as number, monograph.value as Monograph).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchMonograph(false);
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchMonograph(false);
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData(false);
        };

        const {createDocumentClassification, createDocumentIndicator} = useDocumentAssessmentActions();
        
        const createClassification = (documentClassification: DocumentAssessmentClassification) => {
            createDocumentClassification(documentClassification, () => fetchClassifications())
        };

        const createIndicator = (documentIndicator: {indicator: DocumentIndicator, files: File[]}) => {
            createDocumentIndicator(documentIndicator, () => fetchIndicators());
        };

        const { fetchValidationStatus } = useTrustConfigurationActions();

        const updateRemark = (remark: MultilingualContent[]) => {
            monograph.value!.remark = remark;
            performUpdate(true);
        };

        return {
            monograph, actionsRef,
            returnCurrentLocaleContent,
            languageMap, updateBasicInfo,
            searchKeyword, goToURL, canEdit,
            updateKeywords, updateDescription,
            snackbar, snackbarMessage, event,
            researchAreaHierarchy, updateContributions,
            publicationSeries, publicationSeriesType,
            getMonographTypeTitleFromValueAutoLocale,
            switchPage, publications, totalPublications,
            handleResearcherUnbind, isResearcher,
            documentIndicators, StatisticsType,
            currentTab, updateResearchAreas,
            ApplicableEntityType, currentRoute,
            createIndicator, fetchIndicators,
            createClassification, fetchClassifications,
            documentClassifications, canClassify,
            fetchValidationStatus, PublicationType,
            updateRemark, displayConfiguration,
            isAdmin, isCommission, MonographUpdateForm,
            fetchIdentifiers, documentIdentifiers,
            MonographType, localiseFlexibleDate,
            fetchMonograph,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal
        };
}})

</script>

<style scoped>
.edit-pen-container {
    position:relative;
}
</style>
