<template>
    <div id="thesis" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <thesis-landing-header
            :thesis="thesis"
            :organisation-unit="organisationUnit"
            :publisher="publisher"
            :can-edit="canEdit"
            @update="updateBasicInfo"
            @update-title="updateTitle"
        >
            <template #actions>
                <citation-selector
                    v-if="thesisId"
                    ref="citationRef"
                    hide-activator
                    :document-id="thesisId"
                />
                <generic-crud-modal
                    v-if="canCreateRegistryBookEntry"
                    ref="registryModalRef"
                    hide-activator
                    :form-component="RegistryBookEntryForm"
                    :form-props="{ thesisId: thesisId, canSave: (thesis?.publicReviewCompleted && !!thesis?.thesisDefenceDate) }"
                    entity-name="RegistryBookEntry"
                    :read-only="(!canCreateRegistryBookEntry) || thesis?.isOnPublicReview"
                    disable-submission
                    wide
                    @create="createRegistryBookEntry"
                />
                <generic-crud-modal
                    v-if="canDefineSubstitution"
                    ref="substitutionModalRef"
                    hide-activator
                    :form-component="ThesisSubstitutionForm"
                    :form-props="{ thesisId: thesis?.id, researcherId: thesis?.contributions?.find(c => c.contributionType === DocumentContributionType.AUTHOR)?.personId, existingSubstitutionId: thesis?.substitutedBy }"
                    entity-name="Substitution"
                    is-update
                    :read-only="!canEdit || !userCanPutOnPublicReview"
                    wide
                    @update="fetchThesis"
                />
                <publication-unbind-button
                    v-if="canEdit && isResearcher && thesisId"
                    ref="unbindRef"
                    hide-activator
                    :document-id="thesisId"
                    @unbind="handleResearcherUnbind"
                />

                <UiButton
                    v-if="thesisId"
                    variant="outline"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="openCitationDialog"
                >
                    <span class="mdi mdi-format-quote-close"></span>
                    {{ $t("citePublicationLabel") }}
                </UiButton>

                <UiButton
                    v-if="primaryLibrarianAction === 'putOn'"
                    variant="primary"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="changePublicReviewState(true, false)"
                >
                    <span class="mdi mdi-eye-outline"></span>
                    {{ $t("putOnPublicReviewLabel") }}
                </UiButton>
                <UiButton
                    v-else-if="primaryLibrarianAction === 'remove'"
                    variant="outline"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="changePublicReviewState(false, false)"
                >
                    <span class="mdi mdi-eye-off-outline"></span>
                    {{ $t("removeFromPublicReviewLabel") }}
                </UiButton>
                <UiButton
                    v-else-if="primaryLibrarianAction === 'continue'"
                    variant="primary"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="changePublicReviewState(true, true)"
                >
                    <span class="mdi mdi-play-outline"></span>
                    {{ $t("continuePublicReviewLabel") }}
                </UiButton>
                <UiButton
                    v-else-if="primaryLibrarianAction === 'archive'"
                    variant="outline"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="changeArchiveState(true)"
                >
                    <span class="mdi mdi-archive-outline"></span>
                    {{ $t("archiveLabel") }}
                </UiButton>
                <UiButton
                    v-else-if="primaryLibrarianAction === 'unarchive'"
                    variant="outline"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="changeArchiveState(false)"
                >
                    <span class="mdi mdi-archive-arrow-up-outline"></span>
                    {{ $t("unarchiveLabel") }}
                </UiButton>
                <UiButton
                    v-else-if="primaryLibrarianAction === 'examine'"
                    variant="outline"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="examineRegistryBookEntry"
                >
                    <span class="mdi mdi-book-open-page-variant-outline"></span>
                    {{ $t("examineRegistryBookEntryLabel") }}
                </UiButton>

                <v-menu v-if="hasMoreActions" location="bottom">
                    <template #activator="{ props: menuProps }">
                        <UiButton variant="outline" size="md" class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!" v-bind="menuProps">
                            <span class="mdi mdi-dots-horizontal"></span>
                            {{ $t("moreActionsLabel") }}
                            <span class="mdi mdi-chevron-down"></span>
                        </UiButton>
                    </template>
                    <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                        <v-list-item
                            v-if="showPutOnPublicReview && primaryLibrarianAction !== 'putOn'"
                            prepend-icon="mdi-eye-outline"
                            :title="$t('putOnPublicReviewLabel')"
                            @click="changePublicReviewState(true, false)"
                        />
                        <v-list-item
                            v-if="showPutOnPublicReviewShortened"
                            prepend-icon="mdi-eye-minus-outline"
                            :title="$t('putOnPublicReviewShortenedLabel')"
                            @click="changePublicReviewState(true, false, true)"
                        />
                        <v-list-item
                            v-if="showRemoveFromPublicReview && primaryLibrarianAction !== 'remove'"
                            prepend-icon="mdi-eye-off-outline"
                            :title="$t('removeFromPublicReviewLabel')"
                            @click="changePublicReviewState(false, false)"
                        />
                        <v-list-item
                            v-if="showContinuePublicReview && primaryLibrarianAction !== 'continue'"
                            prepend-icon="mdi-play-outline"
                            :title="$t('continuePublicReviewLabel')"
                            @click="changePublicReviewState(true, true)"
                        />
                        <v-list-item
                            v-if="showRestartPublicReview"
                            prepend-icon="mdi-restart"
                            :title="$t('restartPublicReviewLabel')"
                            @click="changePublicReviewState(true, false)"
                        />
                        <v-list-item
                            v-if="showArchive && primaryLibrarianAction !== 'archive'"
                            prepend-icon="mdi-archive-outline"
                            :title="$t('archiveLabel')"
                            @click="changeArchiveState(true)"
                        />
                        <v-list-item
                            v-if="showUnarchive && primaryLibrarianAction !== 'unarchive'"
                            prepend-icon="mdi-archive-arrow-up-outline"
                            :title="$t('unarchiveLabel')"
                            @click="changeArchiveState(false)"
                        />
                        <v-list-item
                            v-if="showExamineRegistry && primaryLibrarianAction !== 'examine'"
                            prepend-icon="mdi-book-open-page-variant-outline"
                            :title="$t('examineRegistryBookEntryLabel')"
                            @click="examineRegistryBookEntry"
                        />
                        <v-list-item
                            v-if="canCreateRegistryBookEntry"
                            prepend-icon="mdi-book-plus-outline"
                            :title="$t('createNewRegistryBookEntryLabel')"
                            @click="openModal(registryModalRef)"
                        />
                        <v-list-item
                            v-if="canDefineSubstitution"
                            prepend-icon="mdi-swap-horizontal"
                            :title="$t('updateSubstitutionLabel')"
                            @click="openModal(substitutionModalRef)"
                        />
                        <v-list-item
                            v-if="showRemoveSubstitution"
                            prepend-icon="mdi-swap-horizontal"
                            :title="$t('removeSubstitutionLabel')"
                            @click="removeSubstitution"
                        />
                        <v-list-item
                            v-if="isUserLoggedIn"
                            prepend-icon="mdi-download"
                            :title="$t('downloadRoCrateLabel')"
                            @click="downloadRoCrate"
                        />
                        <v-list-item
                            v-if="canEdit && isResearcher"
                            prepend-icon="mdi-account-remove-outline"
                            :title="$t('removeFromPublicationLabel')"
                            @click="openUnbindDialog"
                        />
                        <v-list-item
                            v-if="showValidateMetadata"
                            prepend-icon="mdi-check-decagram-outline"
                            :title="$t('validateMetadataLabel')"
                            @click="validateMetadata"
                        />
                        <v-list-item
                            v-if="showValidateFiles"
                            prepend-icon="mdi-file-check-outline"
                            :title="$t('validateUploadedFilesLabel')"
                            @click="validateUploadedFiles"
                        />
                    </v-list>
                </v-menu>
            </template>
        </thesis-landing-header>

        <publication-badge-section
            v-if="thesis"
            class="mb-8"
            :preloaded-doi="thesis?.doi"
            :document-id="thesisId"
            :description="returnCurrentLocaleContent(thesis?.description)"
        />

        <tab-content-loader v-if="!thesis" layout="sections" />
        <v-tabs
            v-show="thesis"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
            show-arrows
            class="landing-tabs"
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
            <v-tab
                v-show="thesis?.contributions && thesis.contributions.length > 0 && thesis?.contributions![0].personId"
                value="researchOutput">
                {{ $t("researchOutputLabel") }}
            </v-tab>
            <v-tab v-show="(documentIndicators && documentIndicators.length > 0) || canClassify" value="indicators">
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
            v-show="thesis"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="thesis?.id"
                    :contribution-list="thesis?.contributions ? thesis?.contributions : []"
                    :read-only="!canEdit || thesis?.isOnPublicReview"
                    board-members-allowed
                    limit-one-author
                    :document-type="PublicationType.THESIS"
                    :concrete-type="(thesis?.thesisType as string)"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section 
                    :document="thesis"
                    :can-edit="canEdit && !thesis?.isOnPublicReview"
                    :proofs="thesis?.proofs"
                    :file-items="thesis?.fileItems"
                    is-thesis-section
                    :is-archived="thesis?.isArchived"
                    :preliminary-files="thesis?.preliminaryFiles"
                    :preliminary-supplements="thesis?.preliminarySupplements"
                    :commission-reports="thesis?.commissionReports"
                    :is-on-public-review="thesis?.isOnPublicReview"
                    @update="fetchThesis"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <thesis-additional-info-tab
                    :thesis="thesis"
                    :can-edit="canEdit"
                    :event="event"
                    :language-map="languageMap"
                    :language-tag-map="languageTagMap"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-extended-abstract="updateExtendedAbstract"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="researchOutput">
                <thesis-research-output-section
                    :thesis-id="thesis?.id"
                    :can-edit="canEdit"
                    :researcher-id="thesis?.contributions![0].personId"
                >
                </thesis-research-output-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="thesis?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && !thesis?.isOnPublicReview && (isResearcher || isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="(thesis?.fileItems && thesis?.fileItems.length > 0) || (thesis?.preliminaryFiles && thesis?.preliminaryFiles.length > 0)"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="thesis?.id"
                    :can-edit="canClassify && !thesis?.isOnPublicReview && !!thesis?.documentDate?.year"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.THESIS]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(thesis?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.THESIS"
                    :entity-id="thesis?.id"
                    @restored="fetchThesis"
                    @show-assessment-details="showAssessmentDetails"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.THESIS"
                    :entity-id="thesis?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <persistent-question-dialog
            ref="publicDialogRef"
            :title="$t('areYouSureLabel')"
            :message="dialogMessage"
            :show-radio-options="thesis?.isOnPublicReviewPause && thesis?.publicReviewEndDates && thesis?.publicReviewEndDates.length > 0 && !continueLastReview"
            :radio-options="(thesis?.isOnPublicReviewPause && thesis?.publicReviewEndDates && thesis?.publicReviewEndDates.length > 0 && !continueLastReview) ? [{title: $t('regularLabel'), value: 1}, {title: $t('shortenedLabel'), value: 2}] : []"
            @continue="commitThesisStatusChange">
        </persistent-question-dialog>

        <share-buttons
            v-if="thesis && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(thesis.title) as string)"
            :document-id="(thesis.id as number)"
            :document-type="PublicationType.THESIS"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </div>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type LanguageResponse, type MultilingualContent } from '@/models/Common';
import { computed, onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { DocumentContributionType, PublicationType, ThesisType, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Document as _Document, Thesis } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import type { OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';
import { useUserRole } from '@/composables/useUserRole';
import ThesisResearchOutputSection from '@/components/publication/ThesisResearchOutputSection.vue';
import RegistryBookEntryForm from '@/components/thesisLibrary/RegistryBookEntryForm.vue';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import { type RegistryBookEntry } from '@/models/ThesisLibraryModel';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import ThesisSubstitutionForm from '@/components/publication/ThesisSubstitutionForm.vue';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import ThesisLandingHeader from '@/components/publication/landing/ThesisLandingHeader.vue';
import ThesisAdditionalInfoTab from '@/components/publication/landing/ThesisAdditionalInfoTab.vue';
import CitationSelector from '@/components/publication/CitationSelector.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';
import { UiButton } from '@/components/ui/button';
import RoCrateService from '@/services/export/RoCrateService';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';


export default defineComponent({
    name: "ThesisLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, GenericCrudModal, EntityClassificationView, IndicatorsSection, PersistentQuestionDialog, ThesisResearchOutputSection, TabContentLoader, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, ThesisLandingHeader, ThesisAdditionalInfoTab, CitationSelector, PublicationUnbindButton, PublicationBadgeSection, UiButton },
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

        const i18n = useI18n();

        const publicDialogRef = ref<typeof PersistentQuestionDialog>();
        const dialogMessage = ref(i18n.t("putOnPublicReviewWarningMessage"));

        const thesis = ref<Thesis>();
        const publisher = ref<Publisher>();
        const organisationUnit = ref<OrganisationUnitResponse>();
        const event = ref<Conference>();
        const languageMap = ref<Map<number, LanguageResponse>>(new Map());
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isAdmin, isResearcher, isInstitutionalLibrarian, isHeadOfLibrary, isCommission, isInstitutionalEditor, isUserLoggedIn } = useUserRole();
        const userCanPutOnPublicReview = computed(() => isAdmin.value || isInstitutionalLibrarian.value || isHeadOfLibrary.value);
        const canEdit = ref(false);
        const canClassify = ref(false);
        const canBePutOnPublicReview = ref(false);
        const canCreateRegistryBookEntry = ref(false);
        const registryBookEntryId = ref(-1);

        const documentClassifications = ref<EntityClassificationResponse[]>();
        const documentIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const documentIndicators = ref<EntityIndicatorResponse[]>();

        const loginStore = useLoginStore();

        const citationRef = ref<{ dialog: boolean, fetchCitations: () => void } | null>(null);
        const registryModalRef = ref<{ dialog: boolean } | null>(null);
        const substitutionModalRef = ref<{ dialog: boolean } | null>(null);
        const unbindRef = ref<{ unbindResearcherFromDocument: () => void } | null>(null);

        const thesisId = computed(() => parseInt(currentRoute.params.id as string));
        const canValidate = computed(() => isAdmin.value || isInstitutionalEditor.value || isInstitutionalLibrarian.value);

        const showPutOnPublicReview = computed(() =>
            !thesis.value?.isOnPublicReview && canBePutOnPublicReview.value && userCanPutOnPublicReview.value
            && !thesis.value?.isArchived && !thesis.value?.isOnPublicReviewPause
        );
        const showPutOnPublicReviewShortened = computed(() =>
            showPutOnPublicReview.value && !!thesis.value?.publicReviewCompleted
        );
        const showRemoveFromPublicReview = computed(() =>
            (isAdmin.value || isHeadOfLibrary.value) && !!thesis.value?.isOnPublicReview && !thesis.value?.isArchived
        );
        const showContinuePublicReview = computed(() =>
            (isAdmin.value || isHeadOfLibrary.value) && !!thesis.value?.isOnPublicReviewPause
        );
        const showRestartPublicReview = computed(() => showContinuePublicReview.value);
        const showArchive = computed(() =>
            !!thesis.value?.thesisDefenceDate && userCanPutOnPublicReview.value && !thesis.value?.isArchived
            && !thesis.value.isOnPublicReview && !thesis.value.isOnPublicReviewPause
        );
        const showUnarchive = computed(() =>
            (isAdmin.value || isHeadOfLibrary.value) && !!thesis.value?.isArchived
        );
        const showExamineRegistry = computed(() => registryBookEntryId.value > 0);
        const canDefineSubstitution = computed(() =>
            !thesis.value?.substitutedBy
            && !!thesis.value?.contributions?.find(c => c.contributionType === DocumentContributionType.AUTHOR)
            && canEdit.value
            && userCanPutOnPublicReview.value
        );
        const showRemoveSubstitution = computed(() =>
            !!thesis.value?.substitutedBy && canEdit.value && userCanPutOnPublicReview.value
        );
        const showValidateMetadata = computed(() =>
            !thesis.value?.isMetadataValid && canEdit.value && canValidate.value
        );
        const showValidateFiles = computed(() =>
            !thesis.value?.areFilesValid && canEdit.value && canValidate.value
        );

        const primaryLibrarianAction = computed(() => {
            if (showContinuePublicReview.value) return "continue";
            if (showRemoveFromPublicReview.value) return "remove";
            if (showPutOnPublicReview.value) return "putOn";
            if (showArchive.value) return "archive";
            if (showUnarchive.value) return "unarchive";
            if (showExamineRegistry.value) return "examine";
            return null;
        });

        const hasMoreActions = computed(() =>
            showPutOnPublicReviewShortened.value
            || showRestartPublicReview.value
            || (showPutOnPublicReview.value && primaryLibrarianAction.value !== "putOn")
            || (showRemoveFromPublicReview.value && primaryLibrarianAction.value !== "remove")
            || (showContinuePublicReview.value && primaryLibrarianAction.value !== "continue")
            || (showArchive.value && primaryLibrarianAction.value !== "archive")
            || (showUnarchive.value && primaryLibrarianAction.value !== "unarchive")
            || (showExamineRegistry.value && primaryLibrarianAction.value !== "examine")
            || canCreateRegistryBookEntry.value
            || canDefineSubstitution.value
            || showRemoveSubstitution.value
            || isUserLoggedIn.value
            || (canEdit.value && isResearcher.value)
            || showValidateMetadata.value
            || showValidateFiles.value
        );

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        const openCitationDialog = () => {
            if (citationRef.value) {
                citationRef.value.dialog = true;
            }
        };

        const openUnbindDialog = () => {
            unbindRef.value?.unbindResearcherFromDocument();
        };

        const displayConfiguration = useDocumentChartDisplay(parseInt(currentRoute.params.id as string));

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            if (loginStore.userLoggedIn) {
                EntityClassificationService.canClassifyDocument(
                    parseInt(currentRoute.params.id as string)
                ).then((response) => {
                    canClassify.value = response.data;
                });

                fetchRegistryBookData();

                fetchClassifications();
            }

            fetchThesis();
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        const fetchRegistryBookData = () => {
            RegistryBookService.canAddToRegistryBook(parseInt(currentRoute.params.id as string)).then((response) => {
                canCreateRegistryBookEntry.value = response.data ? false : true;
                registryBookEntryId.value = response.data;
            }).catch(() => {
                canCreateRegistryBookEntry.value = false;
                registryBookEntryId.value = -1;
            });
        };

        const checkIfUserCanEdit = () => {
            DocumentPublicationService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                if (thesis.value?.isArchived) {
                    canEdit.value = false;
                } else {
                    canEdit.value = response.data;
                }
            }).catch(() => canEdit.value = false);
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchThesis = () => {
            DocumentPublicationService.readThesis(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                if (parseInt(currentRoute.params.id as string) !== response.data.id) {
                    router.push({ name: "thesisLandingPage", params: {id: response.data.id} });
                    return;
                }

                thesis.value = response.data;
                if (loginStore.userLoggedIn) {
                    checkIfUserCanEdit();
                }

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(thesis.value.title) as string;

                thesis.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if (thesis.value.organisationUnitId) {
                    OrganisationUnitService.readOU(thesis.value.organisationUnitId).then((response) => {
                        organisationUnit.value = response.data;

                        canBePutOnPublicReview.value = organisationUnit.value?.clientInstitutionDl === true &&
                            (thesis.value?.thesisType === ThesisType.PHD || thesis.value?.thesisType === ThesisType.PHD_ART_PROJECT);
                    });
                }

                if(thesis.value.publisherId) {
                    PublisherService.readPublisher(thesis.value.publisherId).then((publisherResponse) => {
                        publisher.value = publisherResponse.data;
                    });
                }

                if(thesis.value.eventId) {
                    EventService.readConference(thesis.value.eventId).then((response) => {
                        event.value = response.data;
                    });
                }
    
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
            LanguageService.getAllLanguages().then(response => {
                response.data.forEach(language => {
                    languageMap.value.set(language.id, language);
                })
            });

            LanguageService.getAllLanguageTags().then(response => {
                response.data.forEach(languageTag => {
                    languageTagMap.value.set(languageTag.id, languageTag);
                })
            });

            citationRef.value?.fetchCitations();
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" }});
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            thesis.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            thesis.value!.description = description;
            performUpdate(false);
        };

        const updateExtendedAbstract = (extendedAbstract: MultilingualContent[]) => {
            thesis.value!.extendedAbstract = extendedAbstract;
            performUpdate(false);
        };

        const updateRemark = (remark: MultilingualContent[]) => {
            thesis.value!.remark = remark;
            performUpdate(true);
        };

        const updateTitle = (titleInformation: {title: MultilingualContent[], alternateTitle: MultilingualContent[]}) => {
            thesis.value!.title = titleInformation.title;
            thesis.value!.alternateTitle = titleInformation.alternateTitle;
            performUpdate(true);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            thesis.value!.contributions = contributions;
            performUpdate(true);
        };

        const updateBasicInfo = (basicInfo: Thesis) => {
            thesis.value!.publisherId = basicInfo.publisherId;
            thesis.value!.organisationUnitId = basicInfo.organisationUnitId;
            thesis.value!.numberOfPages = basicInfo.numberOfPages;
            thesis.value!.numberOfChapters = basicInfo.numberOfChapters;
            thesis.value!.numberOfReferences = basicInfo.numberOfReferences;
            thesis.value!.numberOfIllustrations = basicInfo.numberOfIllustrations;
            thesis.value!.numberOfTables = basicInfo.numberOfTables;
            thesis.value!.numberOfGraphs = basicInfo.numberOfGraphs;
            thesis.value!.numberOfAppendices = basicInfo.numberOfAppendices;
            thesis.value!.languageId = basicInfo.languageId;
            thesis.value!.writingLanguageTagId = basicInfo.writingLanguageTagId;
            thesis.value!.externalOrganisationUnitName = basicInfo.externalOrganisationUnitName;
            thesis.value!.topicAcceptanceDate = basicInfo.topicAcceptanceDate;
            thesis.value!.thesisDefenceDate = basicInfo.thesisDefenceDate;
            thesis.value!.thesisType = basicInfo.thesisType;
            thesis.value!.scientificArea = basicInfo.scientificArea;
            thesis.value!.scientificSubArea = basicInfo.scientificSubArea;
            thesis.value!.eisbn = basicInfo.eisbn;
            thesis.value!.printISBN = basicInfo.printISBN;
            thesis.value!.udc = basicInfo.udc;
            thesis.value!.placeOfKeep = basicInfo.placeOfKeep;
            thesis.value!.placeOfKeep = basicInfo.placeOfKeep;
            thesis.value!.typeOfTitle = basicInfo.typeOfTitle;
            thesis.value!.authorReprint = basicInfo.authorReprint;

            updateCommonBasicInfo(thesis, basicInfo);

            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            DocumentPublicationService.updateThesis(thesis.value?.id as number, thesis.value as Thesis).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                if(reload) {
                    fetchThesis();
                }
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
                if(reload) {
                    fetchThesis();
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

        const continueLastReview = ref(false);
        const shortenedReview = ref(false);
        const changePublicReviewState = (putOnPublic: boolean, continueLast: boolean, shortened: boolean = false) => {
            if (putOnPublic) {
                shortenedReview.value = shortened;

                if (thesis.value?.isOnPublicReviewPause) {
                    continueLastReview.value = continueLast;

                    if (continueLastReview.value) {
                        dialogMessage.value = i18n.t("continueLastReviewWarningMessage");
                    } else {
                        dialogMessage.value = i18n.t("restartLastReviewWarningMessage");
                    }

                } else {
                    dialogMessage.value = i18n.t(shortened ? "putOnShortenedPublicReviewWarningMessage" : "putOnPublicReviewWarningMessage");
                }
            } else {
                dialogMessage.value = i18n.t("removeFromPublicReviewWarningMessage");
            }

            publicDialogRef.value?.toggle();
        };

        const changingArchiveState = ref(false);
        const changeArchiveState = (archive: boolean) => {
            changingArchiveState.value = true;

            if (archive) {
                dialogMessage.value = i18n.t("archiveWarningMessage");
            } else {
                dialogMessage.value = i18n.t("unarchiveWarningMessage");
            }

            publicDialogRef.value?.toggle();
        };

        const putOnPublicReview = (continueLast: boolean) => {
            DocumentPublicationService.putThesisOnPublicReview(
                parseInt(currentRoute.params.id as string),
                continueLast, continueLast ? (thesis.value?.isShortenedReview as boolean) : shortenedReview.value
            ).then(() => {
                fetchThesis();
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const removeFromPublicReview = () => {
            DocumentPublicationService.removeThesisFromPublicReview(
                parseInt(currentRoute.params.id as string))
            .then(() => {
                fetchThesis();
            });
        };

        const commitThesisStatusChange = (option: number) => {
            if (option) {
                shortenedReview.value = option === 2;
            }

            if (changingArchiveState.value) {
                changingArchiveState.value = false;
                commitArchiveStateChange();
            }
            else if (thesis.value?.isOnPublicReview) {
                removeFromPublicReview()
            } else if (thesis.value?.isOnPublicReviewPause) {
                putOnPublicReview(continueLastReview.value);
            } else {
                putOnPublicReview(false);
            }
        };

        const commitArchiveStateChange = () => {
            if (thesis.value?.isArchived) {
                DocumentPublicationService.unarchiveThesis(
                    parseInt(currentRoute.params.id as string))
                .then(() => {
                    thesis.value!.isArchived = false;
                    checkIfUserCanEdit();
                    fetchRegistryBookData();
                });
            } else {
                DocumentPublicationService.archiveThesis(
                    parseInt(currentRoute.params.id as string))
                .then(() => {
                    thesis.value!.isArchived = true;
                    canEdit.value = false;
                    fetchRegistryBookData();
                })
                .catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                });
            }
        };

        const createRegistryBookEntry = (registryEntry: RegistryBookEntry) => {
            RegistryBookService.createRegistryBookEntry(registryEntry, parseInt(currentRoute.params.id as string))
            .then((response) => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                canCreateRegistryBookEntry.value = false;
                fetchRegistryBookData();
                if (isAdmin.value) {
                    router.push({name: "registryBookLandingPage", params: {id: response.data.id}});
                }
            });
        };

        const examineRegistryBookEntry = () => {
            if (registryBookEntryId.value > 0) {
                router.push({name: "registryBookLandingPage", params: {id: registryBookEntryId.value}});
            }
        };

        const { fetchValidationStatus } = useTrustConfigurationActions();

        const downloadRoCrate = () => {
            RoCrateService.downloadRoCrateForSingleDocument(thesisId.value);
        };

        const validateMetadata = () => {
            OrganisationUnitTrustConfigurationService.validateDocumentMetadata(thesisId.value).then(() => {
                fetchValidationStatus(thesis.value?.id as number, thesis.value as _Document);
            });
        };

        const validateUploadedFiles = () => {
            OrganisationUnitTrustConfigurationService.validateDocumentFiles(thesisId.value).then(() => {
                fetchValidationStatus(thesis.value?.id as number, thesis.value as _Document);
            });
        };

        const removeSubstitution = () => {
            DocumentPublicationService.removeSubstitution(
                thesis.value?.id as number
            ).then(() => {
                fetchThesis();
            })
        };

        return {
            thesis, publisher, createIndicator, languageTagMap,
            returnCurrentLocaleContent, currentTab, fetchIndicators,
            languageMap, searchKeyword, canEdit, putOnPublicReview,
            updateKeywords, updateDescription, examineRegistryBookEntry,
            snackbar, snackbarMessage, updateContributions, registryBookEntryId,
            updateBasicInfo, organisationUnit, updateRemark,
            event, updateExtendedAbstract,
            handleResearcherUnbind, isAdmin, StatisticsType, documentIndicators,
            currentRoute, ApplicableEntityType, canClassify,
            createClassification, fetchClassifications, documentClassifications,
            removeFromPublicReview, dialogMessage, publicDialogRef, isResearcher,
            changePublicReviewState, canBePutOnPublicReview, userCanPutOnPublicReview,
            isHeadOfLibrary, commitThesisStatusChange, changeArchiveState, updateTitle,
            RegistryBookEntryForm, createRegistryBookEntry, canCreateRegistryBookEntry,
            fetchValidationStatus, fetchThesis, PublicationType, displayConfiguration,
            continueLastReview, shortenedReview, isCommission, ThesisSubstitutionForm,
            DocumentContributionType, removeSubstitution,
            fetchIdentifiers, documentIdentifiers,
            dataQualityTabsRef, showAssessmentDetails,
            citationRef, registryModalRef, substitutionModalRef, unbindRef,
            thesisId, isUserLoggedIn,
            showPutOnPublicReview, showPutOnPublicReviewShortened,
            showRemoveFromPublicReview, showContinuePublicReview, showRestartPublicReview,
            showArchive, showUnarchive, showExamineRegistry,
            canDefineSubstitution, showRemoveSubstitution,
            showValidateMetadata, showValidateFiles,
            primaryLibrarianAction, hasMoreActions,
            openModal, openCitationDialog, openUnbindDialog,
            downloadRoCrate, validateMetadata, validateUploadedFiles
        };
}})

</script>
