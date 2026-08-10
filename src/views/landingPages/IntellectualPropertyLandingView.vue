<template>
    <v-container id="intellectualProperty">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!intellectualProperty"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(intellectualProperty?.title)" />
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(intellectualProperty?.subTitle) }}
                        <br />
                        {{ $t("intellectualPropertyLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- IntellectualProperty Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!intellectualProperty" size="x-large" class="large-intellectual-property-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="intellectualProperty?.id"
                    :document-type="PublicationType.INTELLECTUAL_PROPERTY"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="IntellectualPropertyUpdateForm"
                            :form-props="{ presetIntellectualProperty: intellectualProperty }"
                            entity-name="IntellectualProperty"
                            is-update
                            is-section-update
                            :read-only="!canEdit || intellectualProperty?.isArchived"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!intellectualProperty" />
                        <v-row v-else>
                            <v-col cols="3">
                                <div v-if="intellectualProperty?.type">
                                    {{ $t("intellectualPropertyTypeLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.type" class="response">
                                    {{ getIntellectualPropertyTypeTitleFromValueAutoLocale(intellectualProperty.type) }}
                                </div>
                                <div v-if="intellectualProperty?.applicationStatus">
                                    {{ $t("intellectualPropertyApplicationStatusLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.applicationStatus" class="response">
                                    {{ getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale(intellectualProperty.applicationStatus) }}
                                </div>
                                <div v-if="intellectualProperty?.dateRequested">
                                    {{ $t("dateRequestedLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.dateRequested" class="response">
                                    {{ localiseFlexibleDate(intellectualProperty.dateRequested) }}
                                </div>
                                <div v-if="intellectualProperty?.dateFilingPriority">
                                    {{ $t("dateFilingPriorityLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.dateFilingPriority" class="response">
                                    {{ localiseFlexibleDate(intellectualProperty.dateFilingPriority) }}
                                </div>
                                <div v-if="intellectualProperty?.dateTo">
                                    {{ $t("dateToLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.dateTo" class="response">
                                    {{ localiseFlexibleDate(intellectualProperty.dateTo) }}
                                </div>
                                <div v-if="intellectualProperty?.number">
                                    {{ $t("intellectualPropertyNumberLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.number" class="response">
                                    {{ intellectualProperty.number }}
                                </div>
                                <div v-if="intellectualProperty?.documentDate">
                                    {{ $t("dateOfPublicationLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.documentDate" class="response">
                                    {{ localiseFlexibleDate(intellectualProperty.documentDate) }}
                                </div>
                                <div v-if="intellectualProperty?.publisherId || intellectualProperty?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="intellectualProperty?.publisherName?.length ?? 0 > 0" class="response">
                                    <localized-link :to="'publishers/' + intellectualProperty?.publisherId">
                                        {{ returnCurrentLocaleContent(intellectualProperty?.publisherName) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="intellectualProperty?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                            </v-col>
                            
                            <document-common-fields-display
                                :document="intellectualProperty"
                                :can-edit="canEdit"
                                :containing-entity-type="ApplicableEntityType.DOCUMENT"
                                :concrete-entity-type="ApplicableEntityType.INTELLECTUAL_PROPERTY"
                                :document-identifiers="documentIdentifiers"
                                @identifiers-updated="fetchIdentifiers"
                            />

                            <v-col cols="3">
                                <data-quality-remarks-dialog
                                    :entity-type="PublicationType.INTELLECTUAL_PROPERTY"
                                    :entity-id="intellectualProperty?.id"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <document-action-box
            ref="actionsRef"
            :doi="intellectualProperty?.doi"
            :can-edit="canEdit && !intellectualProperty?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="intellectualProperty?.isMetadataValid"
            :files-valid="intellectualProperty?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(intellectualProperty?.description)"
            :document="intellectualProperty"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(intellectualProperty?.id as number, intellectualProperty as _Document)"
        />

        <tab-content-loader v-if="!intellectualProperty" layout="sections" />
        <v-tabs
            v-show="intellectualProperty"
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
            v-show="intellectualProperty"
            v-model="currentTab"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="intellectualProperty?.id"
                    :contribution-list="intellectualProperty?.contributions ? intellectualProperty?.contributions : []"
                    :read-only="!canEdit || intellectualProperty?.isArchived"
                    :document-type="PublicationType.INTELLECTUAL_PROPERTY"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="intellectualProperty"
                    :can-edit="canEdit && !intellectualProperty?.isArchived"
                    :proofs="intellectualProperty?.proofs"
                    :file-items="intellectualProperty?.fileItems">
                </attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="intellectualProperty?.keywords ? intellectualProperty.keywords : []"
                    :can-edit="canEdit && !intellectualProperty?.isArchived"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <description-section
                    :description="intellectualProperty?.description"
                    :can-edit="canEdit && !intellectualProperty?.isArchived"
                    @update="updateDescription">
                </description-section>

                <description-section
                    :description="intellectualProperty?.remark"
                    :can-edit="canEdit && !intellectualProperty?.isArchived"
                    is-remark
                    @update="updateRemark"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="intellectualProperty?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="intellectualProperty?.fileItems && intellectualProperty?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="intellectualProperty?.id"
                    :can-edit="canClassify && !!intellectualProperty?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.INTELLECTUAL_PROPERTY]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(intellectualProperty?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.INTELLECTUAL_PROPERTY"
                    :entity-id="intellectualProperty?.id"
                    @restored="fetchIntellectualProperty"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <share-buttons
            v-if="intellectualProperty && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(intellectualProperty.title) as string)"
            :document-id="(intellectualProperty.id as number)"
            :document-type="PublicationType.INTELLECTUAL_PROPERTY"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, type Document as _Document, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { IntellectualProperty } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import IntellectualPropertyUpdateForm from '@/components/publication/update/IntellectualPropertyUpdateForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type EntityClassificationResponse, StatisticsType, type EntityIndicatorResponse, type DocumentIndicator } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import { ApplicableEntityType } from '@/models/Common';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import Wordcloud from '@/components/core/Wordcloud.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import DocumentCommonFieldsDisplay from '@/components/publication/DocumentCommonFieldsDisplay.vue';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import { getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale } from '@/i18n/intellectualPropertyApplicationStatus';
import { getIntellectualPropertyTypeTitleFromValueAutoLocale } from '@/i18n/intellectualPropertyType';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityRemarksDialog from '@/components/core/revisions/DataQualityRemarksDialog.vue';


export default defineComponent({
    name: "IntellectualPropertyLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, GenericCrudModal, EntityClassificationView, IndicatorsSection, RichTitleRenderer, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations, DocumentCommonFieldsDisplay, RevisionHistoryTableComponent, DataQualityRemarksDialog },
    setup() {
        const currentTab = ref("contributions");

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const intellectualProperty = ref<IntellectualProperty>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isResearcher, isAdmin, isCommission } = useUserRole();
        const canEdit = ref(false);
        const canClassify = ref(false);

        const i18n = useI18n();

        const icon = ref("mdi-seal-variant");

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

            fetchIntellectualProperty();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchIntellectualProperty = () => {
            DocumentPublicationService.readIntellectualProperty(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                intellectualProperty.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(intellectualProperty.value.title) as string;

                intellectualProperty.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
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
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            intellectualProperty.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            intellectualProperty.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            intellectualProperty.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: IntellectualProperty) => {
            intellectualProperty.value!.publisherId = basicInfo.publisherId;
            intellectualProperty.value!.number = basicInfo.number;
            intellectualProperty.value!.authorReprint = basicInfo.authorReprint;
            intellectualProperty.value!.dateRequested = basicInfo.dateRequested;
            intellectualProperty.value!.dateFilingPriority = basicInfo.dateFilingPriority;
            intellectualProperty.value!.dateTo = basicInfo.dateTo;
            intellectualProperty.value!.type = basicInfo.type;
            intellectualProperty.value!.applicationStatus = basicInfo.applicationStatus;

            updateCommonBasicInfo(intellectualProperty, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateIntellectualProperty(intellectualProperty.value?.id as number, intellectualProperty.value as IntellectualProperty).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchIntellectualProperty();
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchIntellectualProperty();
                }
            });
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
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
            intellectualProperty.value!.remark = remark;
            performUpdate(true);
        };

        return {
            intellectualProperty, icon, currentTab, ApplicableEntityType,
            returnCurrentLocaleContent, IntellectualPropertyUpdateForm, canClassify,
            languageTagMap, searchKeyword, goToURL, canEdit, isResearcher,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            updateContributions, updateBasicInfo, handleResearcherUnbind,
            StatisticsType, documentIndicators, actionsRef, currentRoute,
            createClassification, fetchClassifications, documentClassifications,
            createIndicator, fetchIndicators, fetchValidationStatus,
            PublicationType, updateRemark, displayConfiguration, isAdmin, isCommission,
            fetchIdentifiers, documentIdentifiers, localiseFlexibleDate,
            getIntellectualPropertyTypeTitleFromValueAutoLocale,
            getIntellectualPropertyApplicationStatusTitleFromValueAutoLocale,
            fetchIntellectualProperty
        };
}})

</script>

<style scoped>
    #intellectualProperty .large-intellectual-property-icon {
        font-size: 10em;
    }

    #intellectualProperty .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }

</style>
