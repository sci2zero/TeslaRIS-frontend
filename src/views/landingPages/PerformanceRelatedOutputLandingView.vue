<template>
    <v-container id="performanceRelatedOutput">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!performanceRelatedOutput"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(performanceRelatedOutput?.title)"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(performanceRelatedOutput?.subTitle) }}
                        <br />
                        {{ $t("performanceRelatedOutputLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- PerformanceRelatedOutput Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!performanceRelatedOutput" size="x-large" class="large-performanceRelatedOutput-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="performanceRelatedOutput?.id"
                    :document-type="PublicationType.PERFORMANCE_RELATED_OUTPUT"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="PerformanceRelatedOutputUpdateForm"
                            :form-props="{ presetPerformanceRelatedOutput: performanceRelatedOutput }"
                            entity-name="PerformanceRelatedOutput"
                            is-update
                            is-section-update
                            :read-only="!canEdit || performanceRelatedOutput?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!performanceRelatedOutput" />
                        <v-row v-else>
                            <v-col cols="3">
                                <div v-if="performanceRelatedOutput?.type">
                                    {{ $t("performanceRelatedOutputTypeLabel") }}:
                                </div>
                                <div v-if="performanceRelatedOutput?.type" class="response">
                                    {{ getPerformanceRelatedOutputTypeTitleFromValueAutoLocale(performanceRelatedOutput.type) }}
                                </div>
                                <div v-if="(performanceRelatedOutput?.producer?.length || 0) > 0">
                                    {{ $t("producerLabel") }}:
                                </div>
                                <div v-if="(performanceRelatedOutput?.producer?.length || 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(performanceRelatedOutput?.producer) }}
                                </div>
                                <div v-if="(performanceRelatedOutput?.distributor?.length || 0) > 0">
                                    {{ $t("distributorLabel") }}:
                                </div>
                                <div v-if="(performanceRelatedOutput?.distributor?.length || 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(performanceRelatedOutput?.distributor) }}
                                </div>
                                <div v-if="(performanceRelatedOutput?.sourceTitle?.length || 0) > 0">
                                    {{ $t("sourceTitleLabel") }}:
                                </div>
                                <div v-if="(performanceRelatedOutput?.sourceTitle?.length || 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(performanceRelatedOutput?.sourceTitle) }}
                                </div>
                                <div v-if="(performanceRelatedOutput?.otherActors?.length || 0) > 0">
                                    {{ $t("otherActorsLabel") }}:
                                </div>
                                <div v-if="(performanceRelatedOutput?.producer?.length || 0) > 0" class="response">
                                    {{ returnCurrentLocaleContent(performanceRelatedOutput?.otherActors) }}
                                </div>
                                <div v-if="performanceRelatedOutput?.documentDate">
                                    {{ $t("dateOfPublicationLabel") }}:
                                </div>
                                <div v-if="performanceRelatedOutput?.documentDate" class="response">
                                    {{ localiseFlexibleDate(performanceRelatedOutput.documentDate) }}
                                </div>
                                <div v-if="performanceRelatedOutput?.languageTags && performanceRelatedOutput?.languageTags.length > 0">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div>
                                    <v-chip v-for="(languageTag, index) in performanceRelatedOutput?.languageTags" :key="index" outlined>
                                        {{ languageTag.display }}
                                    </v-chip>
                                </div>
                            </v-col>
                            
                            <document-common-fields-display
                                :document="performanceRelatedOutput"
                                :can-edit="canEdit"
                                :containing-entity-type="ApplicableEntityType.DOCUMENT"
                                :concrete-entity-type="ApplicableEntityType.PERFORMANCE_RELATED_OUTPUT"
                                :document-identifiers="documentIdentifiers"
                                @identifiers-updated="fetchIdentifiers"
                            />

                            <v-col cols="3">
                                <data-quality-remarks-dialog
                                    :entity-type="PublicationType.PERFORMANCE_RELATED_OUTPUT"
                                    :entity-id="performanceRelatedOutput?.id"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="performanceRelatedOutput?.doi"
            :can-edit="canEdit && !performanceRelatedOutput?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="performanceRelatedOutput?.isMetadataValid"
            :files-valid="performanceRelatedOutput?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(performanceRelatedOutput?.description)"
            :document="performanceRelatedOutput"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(performanceRelatedOutput?.id as number, performanceRelatedOutput as _Document)"
        />

        <tab-content-loader v-if="!performanceRelatedOutput" layout="sections" />
        <v-tabs
            v-show="performanceRelatedOutput"
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
            <v-tab v-show="(documentClassifications && documentClassifications.length > 0) || canClassify" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab v-show="displayConfiguration.shouldDisplayStatisticsTab()" value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
            <v-tab v-show="isAdmin" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="performanceRelatedOutput"
            v-model="currentTab">
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="performanceRelatedOutput?.id"
                    :contribution-list="performanceRelatedOutput?.contributions ? performanceRelatedOutput?.contributions : []"
                    :read-only="!canEdit || performanceRelatedOutput?.isArchived"
                    :document-type="PublicationType.PERFORMANCE_RELATED_OUTPUT"
                    :concrete-type="(performanceRelatedOutput?.type as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="performanceRelatedOutput"
                    :can-edit="canEdit && !performanceRelatedOutput?.isArchived"
                    :proofs="performanceRelatedOutput?.proofs"
                    :file-items="performanceRelatedOutput?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="performanceRelatedOutput?.keywords ? performanceRelatedOutput.keywords : []"
                    :can-edit="canEdit && !performanceRelatedOutput?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="performanceRelatedOutput?.description"
                    :can-edit="canEdit && !performanceRelatedOutput?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="performanceRelatedOutput?.remark"
                    :can-edit="canEdit && !performanceRelatedOutput?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="performanceRelatedOutput?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="performanceRelatedOutput?.fileItems && performanceRelatedOutput?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="performanceRelatedOutput?.id"
                    :can-edit="canClassify && !!performanceRelatedOutput?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.PERFORMANCE_RELATED_OUTPUT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(performanceRelatedOutput?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.PERFORMANCE_RELATED_OUTPUT"
                    :entity-id="performanceRelatedOutput?.id"
                    @restored="fetchPerformanceRelatedOutput"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="performanceRelatedOutput && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(performanceRelatedOutput.title) as string)"
            :document-id="(performanceRelatedOutput.id as number)"
            :document-type="PublicationType.PERFORMANCE_RELATED_OUTPUT"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Document as _Document, PerformanceRelatedOutput } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import StatisticsService from '@/services/StatisticsService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import { getPerformanceRelatedOutputTypeTitleFromValueAutoLocale } from '@/i18n/performanceRelatedOutputType';
import PerformanceRelatedOutputUpdateForm from '@/components/publication/update/PerformanceRelatedOutputUpdateForm.vue';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import DocumentCommonFieldsDisplay from '@/components/publication/DocumentCommonFieldsDisplay.vue';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityRemarksDialog from '@/components/core/revisions/DataQualityRemarksDialog.vue';


export default defineComponent({
    name: "PerformanceRelatedOutputLandingPage",
    components: { AttachmentSection, PersonDocumentContributionTabs, DescriptionSection, KeywordList, GenericCrudModal, Toast, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, DocumentCommonFieldsDisplay, RevisionHistoryTableComponent, DataQualityRemarksDialog },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const performanceRelatedOutput = ref<PerformanceRelatedOutput>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isResearcher, isAdmin, isCommission } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-desktop-classic");

        const documentIndicators = ref<EntityIndicatorResponse[]>();
        const documentClassifications = ref<EntityClassificationResponse[]>();
        const documentIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore = useLoginStore();

        const actionsRef = ref<typeof DocumentActionBox>();

        const displayConfiguration = useDocumentChartDisplay(parseInt(currentRoute.params.id as string));

        onMounted(() => {
            fetchDisplayData();
        });

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

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

            fetchPerformanceRelatedOutput();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchPerformanceRelatedOutput = () => {
            DocumentPublicationService.readPerformanceRelatedOutput(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                performanceRelatedOutput.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(performanceRelatedOutput.value.title) as string;

                performanceRelatedOutput.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
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
        }

        const updateKeywords = (keywords: MultilingualContent[]) => {
            performanceRelatedOutput.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            performanceRelatedOutput.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            performanceRelatedOutput.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: PerformanceRelatedOutput) => {
            performanceRelatedOutput.value!.distributor = basicInfo.distributor;
            performanceRelatedOutput.value!.producer = basicInfo.producer;
            performanceRelatedOutput.value!.sourceTitle = basicInfo.sourceTitle;
            performanceRelatedOutput.value!.otherActors = basicInfo.otherActors;
            performanceRelatedOutput.value!.type = basicInfo.type;
            performanceRelatedOutput.value!.languageTagIds = basicInfo.languageTagIds;

            updateCommonBasicInfo(performanceRelatedOutput, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updatePerformanceRelatedOutput(performanceRelatedOutput.value?.id as number, performanceRelatedOutput.value as PerformanceRelatedOutput).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchPerformanceRelatedOutput();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchPerformanceRelatedOutput();
                }
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
            performanceRelatedOutput.value!.remark = remark;
            performUpdate(true);
        };

        return {
            performanceRelatedOutput, icon, ApplicableEntityType,
            returnCurrentLocaleContent, currentTab, canClassify,
            languageTagMap, searchKeyword, goToURL, canEdit,
            updateKeywords, updateDescription, StatisticsType,
            snackbar, snackbarMessage, updateContributions,
            updateBasicInfo, isResearcher, displayConfiguration,
            handleResearcherUnbind, documentIndicators,
            actionsRef, currentRoute, createClassification,
            fetchClassifications, documentClassifications,
            fetchIndicators, createIndicator, PublicationType,
            fetchPerformanceRelatedOutput, fetchValidationStatus,
            getPerformanceRelatedOutputTypeTitleFromValueAutoLocale,
            PerformanceRelatedOutputUpdateForm, isAdmin, isCommission,
            fetchIdentifiers, documentIdentifiers, updateRemark,
            localiseFlexibleDate
        };
}})

</script>

<style scoped>
    #performanceRelatedOutput .large-performanceRelatedOutput-icon {
        font-size: 10em;
    }

    #performanceRelatedOutput .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
