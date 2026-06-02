<template>
    <v-container id="proceedingsPublication">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5">
                        <v-skeleton-loader
                            :loading="!proceedingsPublication"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(proceedingsPublication?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(proceedingsPublication?.subTitle) }}
                        <br />
                        {{ $t("proceedingsPublicationLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- ProceedingsPublication Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!proceedingsPublication" size="x-large" class="large-proceedingsPublication-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="proceedingsPublication?.id"
                    :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="ProceedingsPublicationUpdateForm"
                            :form-props="{ presetProceedingsPublication: proceedingsPublication}"
                            entity-name="ProceedingsPublication"
                            is-update
                            is-section-update
                            :read-only="!canEdit || proceedingsPublication?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!proceedingsPublication" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="proceedingsPublication?.proceedingsPublicationType">
                                    {{ $t("concretePublicationTypeLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.proceedingsPublicationType" class="response">
                                    {{ getTitleFromValue(proceedingsPublication.proceedingsPublicationType, publicationTypes) }}
                                </div>
                                <div v-if="proceedingsPublication?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + proceedingsPublication?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedingsPublication?.proceedingsId">
                                    {{ $t("proceedingsLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.proceedingsId" class="response">
                                    <localized-link :to="'proceedings/' + proceedingsPublication?.proceedingsId">
                                        {{ returnCurrentLocaleContent(proceedings?.title) }}
                                    </localized-link>
                                </div>
                                <div v-if="proceedingsPublication?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.documentDate" class="response">
                                    {{ localiseDate(proceedingsPublication.documentDate) }}
                                </div>
                                <div v-if="proceedingsPublication?.startPage">
                                    {{ $t("startPageLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.startPage" class="response">
                                    {{ proceedingsPublication.startPage }}
                                </div>
                                <div v-if="proceedingsPublication?.endPage">
                                    {{ $t("endPageLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.endPage" class="response">
                                    {{ proceedingsPublication.endPage }}
                                </div>
                                <div v-if="proceedingsPublication?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.articleNumber">
                                    {{ $t("articleNumberLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.articleNumber" class="response">
                                    {{ proceedingsPublication.articleNumber }}
                                </div>
                                <div v-if="proceedingsPublication?.section">
                                    {{ $t("sectionLabel") }}:
                                </div>
                                <div v-if="proceedingsPublication?.section" class="response">
                                    {{ returnCurrentLocaleContent(proceedingsPublication.section) }}
                                </div>
                            </v-col>

                            <document-common-fields-display
                                :document="proceedingsPublication"
                                :can-edit="canEdit"
                                :containing-entity-type="ApplicableEntityType.DOCUMENT"
                                :concrete-entity-type="ApplicableEntityType.PROCEEDINGS_PUBLICATION"
                                :document-identifiers="documentIdentifiers"
                                @identifiers-updated="fetchIdentifiers"
                            />
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="proceedingsPublication?.doi"
            :can-edit="canEdit && !proceedingsPublication?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="proceedingsPublication?.isMetadataValid"
            :files-valid="proceedingsPublication?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(proceedingsPublication?.description)"
            :document="proceedingsPublication"
            :handle-researcher-unbind="handleResearcherUnbind"
            :transfer-to="PublicationType.JOURNAL_PUBLICATION"
            type-transfer-suffix="Journal"
            @update="fetchValidationStatus(proceedingsPublication?.id as number, proceedingsPublication as _Document)"
        />

        <tab-content-loader v-if="!proceedingsPublication" layout="list" />
        <v-tabs
            v-show="proceedingsPublication"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-show="documentIndicators && documentIndicators.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="(documentClassifications && documentClassifications.length > 0) || canEdit" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab v-show="displayConfiguration.shouldDisplayStatisticsTab()" value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="proceedingsPublication"
            v-model="currentTab">
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="proceedingsPublication?.keywords ? proceedingsPublication.keywords : []"
                    :can-edit="canEdit && !proceedingsPublication?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="proceedingsPublication?.description"
                    :can-edit="canEdit && !proceedingsPublication?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="proceedingsPublication?.remark"
                    :can-edit="canEdit && !proceedingsPublication?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="proceedingsPublication?.id"
                    :contribution-list="proceedingsPublication?.contributions ? proceedingsPublication?.contributions : []"
                    :read-only="!canEdit || proceedingsPublication?.isArchived"
                    :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
                    :concrete-type="(proceedingsPublication?.proceedingsPublicationType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="proceedingsPublication"
                    :can-edit="canEdit && !proceedingsPublication?.isArchived"
                    :proofs="proceedingsPublication?.proofs"
                    :file-items="proceedingsPublication?.fileItems">
                </attachment-section>  
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="proceedingsPublication?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="proceedingsPublication?.fileItems && proceedingsPublication?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <v-btn v-if="proceedingsPublication?.documentDate" density="compact" class="ml-5" @click="assessProceedingsPublication">
                    {{ $t("assessPublicationLabel") }}
                </v-btn>
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="proceedingsPublication?.id"
                    :can-edit="canClassify && proceedingsPublication?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.PROCEEDINGS_PUBLICATION]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(proceedingsPublication?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="proceedingsPublication && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(proceedingsPublication.title) as string)"
            :document-id="(proceedingsPublication.id as number)"
            :document-type="PublicationType.PROCEEDINGS_PUBLICATION"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { computed, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type Document as _Document, type DocumentPublicationIndex, type PersonDocumentContribution, type ProceedingsPublicationType } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { ProceedingsPublication } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import type { ProceedingsResponse } from '@/models/ProceedingsModel';
import ProceedingsService from '@/services/ProceedingsService';
import { getTitleFromValue, getTypesForGivenLocale } from "@/i18n/proceedingsPublicationType";
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { localiseDate } from '@/utils/DateUtil';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import ProceedingsPublicationUpdateForm from '@/components/publication/update/ProceedingsPublicationUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import AssessmentClassificationService from '@/services/assessment/AssessmentClassificationService';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import DocumentCommonFieldsDisplay from '@/components/publication/DocumentCommonFieldsDisplay.vue';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';


export default defineComponent({
    name: "ProceedingsPublicationLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, Toast, KeywordList, DescriptionSection, LocalizedLink, GenericCrudModal, EntityClassificationView, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, IndicatorsSection, ShareButtons, DocumentVisualizations, DocumentCommonFieldsDisplay },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const { isResearcher, isAdmin, isCommission } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const proceedingsPublication = ref<ProceedingsPublication>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());
        
        const event = ref<Conference>();
        const proceedings = ref<ProceedingsResponse>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);

        const i18n = useI18n();
        const publicationTypes = computed((): { title: string, value: ProceedingsPublicationType }[] => (getTypesForGivenLocale() as { title: string; value: ProceedingsPublicationType; }[]));

        const icon = ref("mdi-newspaper-variant");

        const documentIndicators = ref<EntityIndicatorResponse[]>();
        const documentClassifications = ref<EntityClassificationResponse[]>();
        const documentIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore = useLoginStore();

        const actionsRef = ref<typeof DocumentActionBox>();

        const displayConfiguration = useDocumentChartDisplay(parseInt(currentRoute.params.id as string));

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            if (loginStore.userLoggedIn) {
                DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                }).catch(() => canEdit.value = false);

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchClassifications();
            }

            fetchProceedingsPublication();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        const fetchIndicators = () => {
            EntityIndicatorService.fetchDocumentIndicators(parseInt(currentRoute.params.id as string)).then(response => {
                documentIndicators.value = response.data;
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

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchProceedingsPublication = () => {
            DocumentPublicationService.readProceedingsPublication(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                proceedingsPublication.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(proceedingsPublication.value.title) as string;

                proceedingsPublication.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                EventService.readConference(proceedingsPublication.value.eventId as number).then((eventResponse) => {
                    event.value = eventResponse.data;
                });

                ProceedingsService.readProceedings(proceedingsPublication.value.proceedingsId as number).then((eventResponse) => {
                    proceedings.value = eventResponse.data;
                });
    
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
            actionsRef.value?.fetchCitations();
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            proceedingsPublication.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            proceedingsPublication.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            proceedingsPublication.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: ProceedingsPublication) => {
            proceedingsPublication.value!.proceedingsId = basicInfo.proceedingsId;
            proceedingsPublication.value!.startPage = basicInfo.startPage;
            proceedingsPublication.value!.endPage = basicInfo.endPage;
            proceedingsPublication.value!.numberOfPages = basicInfo.numberOfPages;
            proceedingsPublication.value!.articleNumber = basicInfo.articleNumber;
            proceedingsPublication.value!.proceedingsPublicationType = basicInfo.proceedingsPublicationType;
            proceedingsPublication.value!.section = basicInfo.section;

            updateCommonBasicInfo(proceedingsPublication, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateProceedingsPublication(proceedingsPublication.value?.id as number, proceedingsPublication.value as ProceedingsPublication).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchProceedingsPublication();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchProceedingsPublication();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const assessProceedingsPublication = () => {
            AssessmentClassificationService.assessProceedingsPublication(parseInt(currentRoute.params.id as string)).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchClassifications();
            });
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
            proceedingsPublication.value!.remark = remark;
            performUpdate(true);
        };

        return {
            proceedingsPublication, icon, publications, event, displayConfiguration,
            totalPublications, returnCurrentLocaleContent, isResearcher,
            languageTagMap, localiseDate, ProceedingsPublicationUpdateForm,
            searchKeyword, goToURL, canEdit, proceedings, getTitleFromValue,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, handleResearcherUnbind,
            StatisticsType, documentIndicators, currentTab, ApplicableEntityType,
            documentClassifications, assessProceedingsPublication,
            fetchClassifications, canClassify, createClassification,
            currentRoute, actionsRef, fetchIndicators, createIndicator,
            fetchValidationStatus, PublicationType, updateRemark, isAdmin,
            isCommission, publicationTypes, fetchIdentifiers, documentIdentifiers
        };
}})

</script>

<style scoped>
    #proceedingsPublication .large-proceedingsPublication-icon {
        font-size: 10em;
    }

    #proceedingsPublication .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
