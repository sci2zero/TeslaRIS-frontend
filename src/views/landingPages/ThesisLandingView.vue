<template>
    <v-container id="thesis">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center edit-pen-container">
                        <v-skeleton-loader
                            :loading="!thesis"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(thesis?.title)"></rich-title-renderer>
                            <div>
                                <generic-crud-modal
                                    class="mb-6"
                                    :form-component="AlternateTitleForm"
                                    :form-props="{ presetTitle: thesis?.title, presetAlternateTitle: thesis?.alternateTitle }"
                                    entity-name="Title"
                                    is-update
                                    is-section-update
                                    :read-only="!canEdit || thesis?.isOnPublicReview"
                                    @update="updateTitle"
                                />
                            </div>
                            <rich-title-renderer v-if="thesis?.alternateTitle && thesis?.alternateTitle.length > 0" :title="`(${returnCurrentLocaleContent(thesis?.alternateTitle)})`"></rich-title-renderer>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ returnCurrentLocaleContent(thesis?.subTitle) }}
                        <br />
                        {{ $t("thesisLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Thesis Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon v-if="!thesis" size="x-large" class="large-thesis-icon">
                    {{ icon }}
                </v-icon>
                <wordcloud
                    v-else
                    :for-document-id="thesis?.id"
                    :document-type="PublicationType.THESIS"
                    compact-icon
                />
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="ThesisUpdateForm"
                            :form-props="{ presetThesis: thesis }"
                            entity-name="Thesis"
                            is-update
                            is-section-update
                            :read-only="!canEdit || thesis?.isOnPublicReview"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>

                        <basic-info-loader v-if="!thesis" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="thesis?.thesisType">
                                    {{ $t("typeOfPublicationLabel") }}:
                                </div>
                                <div v-if="thesis?.thesisType" class="response">
                                    {{ getThesisTitleFromValueAutoLocale(thesis.thesisType) }}
                                </div>
                                <div v-if="thesis?.documentDate">
                                    {{ $t("yearOfPublicationLabel") }}:
                                </div>
                                <div v-if="thesis?.documentDate" class="response">
                                    {{ localiseDate(thesis.documentDate) }}
                                </div>
                                <div v-if="thesis?.topicAcceptanceDate">
                                    {{ $t("topicAcceptanceDateLabel") }}:
                                </div>
                                <div v-if="thesis?.topicAcceptanceDate" class="response">
                                    {{ localiseDate(thesis.topicAcceptanceDate) }}
                                </div>
                                <div v-if="thesis?.thesisDefenceDate">
                                    {{ $t("defenceDateLabel") }}:
                                </div>
                                <div v-if="thesis?.thesisDefenceDate" class="response">
                                    {{ localiseDate(thesis.thesisDefenceDate) }}
                                </div>
                                <div v-if="thesis?.organisationUnitId || (thesis?.externalOrganisationUnitName && thesis?.externalOrganisationUnitName.length > 0)">
                                    {{ $t("organisationUnitLabel") }}:
                                </div>
                                <div v-if="thesis?.organisationUnitId" class="response">
                                    <localized-link :to="'organisation-units/' + thesis?.organisationUnitId">
                                        {{ returnCurrentLocaleContent(organisationUnit?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else class="response">
                                    {{ returnCurrentLocaleContent(thesis?.externalOrganisationUnitName) }}
                                </div>
                                <div v-if="thesis?.publisherId || thesis?.authorReprint">
                                    {{ $t("publisherLabel") }}:
                                </div>
                                <div v-if="thesis?.publisherId" class="response">
                                    <localized-link :to="'publishers/' + thesis?.publisherId">
                                        {{ returnCurrentLocaleContent(publisher?.name) }}
                                    </localized-link>
                                </div>
                                <div v-else-if="thesis?.authorReprint" class="response">
                                    <localized-link to="scientific-results/author-reprints">
                                        {{ $t("authorReprintLabel") }}
                                    </localized-link>
                                </div>
                                <div v-if="thesis?.eventId">
                                    {{ $t("conferenceLabel") }}:
                                </div>
                                <div v-if="thesis?.eventId" class="response">
                                    <localized-link :to="'events/conference/' + thesis?.eventId">
                                        {{ returnCurrentLocaleContent(event?.name) }}
                                    </localized-link>
                                </div>
                                <div v-if="thesis?.uris && thesis?.uris.length > 0">
                                    {{ $t("uriInputLabel") }}:
                                </div>
                                <div v-if="thesis?.uris && thesis?.uris.length > 0" class="response">
                                    <uri-list :uris="thesis?.uris"></uri-list>
                                </div>
                                <div v-if="thesis?.typeOfTitle && thesis?.typeOfTitle.length > 0">
                                    {{ $t("typeOfTitleLabel") }}:
                                </div>
                                <div v-if="thesis?.typeOfTitle && thesis?.typeOfTitle.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(thesis.typeOfTitle) }}
                                </div>
                            </v-col>
                            <v-col cols="3">
                                <div v-if="thesis?.eisbn">
                                    eISBN:
                                </div>
                                <div v-if="thesis?.eisbn" class="response">
                                    {{ thesis.eisbn }}
                                </div>
                                <div v-if="thesis?.printISBN">
                                    Print ISBN:
                                </div>
                                <div v-if="thesis?.printISBN" class="response">
                                    {{ thesis.printISBN }}
                                </div>
                                <div v-if="thesis?.doi">
                                    DOI:
                                </div>
                                <div v-if="thesis?.doi" class="response">
                                    <identifier-link :identifier="thesis.doi"></identifier-link>
                                </div>
                                <div v-if="thesis?.openAlexId">
                                    Open Alex ID:
                                </div>
                                <div v-if="thesis?.openAlexId" class="response">
                                    <identifier-link :identifier="thesis.openAlexId" type="open_alex"></identifier-link>
                                </div>
                                <div v-if="thesis?.webOfScienceId">
                                    Web of Science ID:
                                </div>
                                <div v-if="thesis?.webOfScienceId" class="response">
                                    <identifier-link :identifier="thesis.webOfScienceId" type="web_of_science"></identifier-link>
                                </div>
                                <div v-if="thesis?.udc">
                                    {{ $t("udcLabel") }}:
                                </div>
                                <div v-if="thesis?.udc" class="response">
                                    {{ thesis.udc }}
                                </div>
                                <div v-if="thesis?.languageId">
                                    {{ $t("languageLabel") }}:
                                </div>
                                <div v-if="thesis?.languageId">
                                    <v-chip outlined>
                                        {{ returnCurrentLocaleContent(languageMap.get(thesis?.languageId)?.name) }}
                                    </v-chip>
                                </div>
                                <div v-if="thesis?.writingLanguageTagId">
                                    {{ $t("writingLanguageLabel") }}:
                                </div>
                                <div v-if="thesis?.writingLanguageTagId">
                                    <v-chip outlined>
                                        {{ languageTagMap.get(thesis?.writingLanguageTagId)?.display }}
                                    </v-chip>
                                </div>
                                <div v-if="thesis?.placeOfKeep && thesis?.placeOfKeep.length > 0">
                                    {{ $t("placeOfKeepLabel") }}:
                                </div>
                                <div v-if="thesis?.placeOfKeep && thesis?.placeOfKeep.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(thesis.placeOfKeep) }}
                                </div>
                                <div v-if="thesis?.scientificArea && thesis?.scientificArea.length > 0">
                                    {{ $t("scientificAreaLabel") }}:
                                </div>
                                <div v-if="thesis?.scientificArea && thesis?.scientificArea.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(thesis.scientificArea) }}
                                </div>
                                <div v-if="thesis?.scientificSubArea && thesis?.scientificSubArea.length > 0">
                                    {{ $t("scientificSubAreaLabel") }}:
                                </div>
                                <div v-if="thesis?.scientificSubArea && thesis?.scientificSubArea.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(thesis.scientificSubArea) }}
                                </div>
                                <div v-if="thesis?.isOnPublicReview" class="response mt-5">
                                    {{ $t("onPublicReviewLabel", [localiseDate(thesis?.publicReviewEnd)]) }}
                                </div>

                                <div v-if="thesis?.publicReviewDates && thesis?.publicReviewDates.length > 0" class="response mt-5">
                                    <p>{{ $t("datesOfPublicReviewLabel") }}</p>
                                    <p v-for="date in thesis.publicReviewDates" :key="date">
                                        {{ localiseDate(date) }}
                                    </p>
                                </div>
                            </v-col>
                            <v-col cols="3">
                                <div v-if="thesis?.numberOfPages">
                                    {{ $t("numberOfPagesLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfPages" class="response">
                                    {{ thesis.numberOfPages }}
                                </div>
                                <div v-if="thesis?.numberOfChapters">
                                    {{ $t("numberOfChaptersLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfChapters" class="response">
                                    {{ thesis.numberOfChapters }}
                                </div>
                                <div v-if="thesis?.numberOfReferences">
                                    {{ $t("numberOfReferencesLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfReferences" class="response">
                                    {{ thesis.numberOfReferences }}
                                </div>
                                <div v-if="thesis?.numberOfIllustrations">
                                    {{ $t("numberOfIllustrationsLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfIllustrations" class="response">
                                    {{ thesis.numberOfIllustrations }}
                                </div>
                                <div v-if="thesis?.numberOfGraphs">
                                    {{ $t("numberOfGraphsLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfGraphs" class="response">
                                    {{ thesis.numberOfGraphs }}
                                </div>
                                <div v-if="thesis?.numberOfTables">
                                    {{ $t("numberOfTablesLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfTables" class="response">
                                    {{ thesis.numberOfTables }}
                                </div>
                                <div v-if="thesis?.numberOfAppendices">
                                    {{ $t("numberOfAppendicesLabel") }}:
                                </div>
                                <div v-if="thesis?.numberOfAppendices" class="response">
                                    {{ thesis.numberOfAppendices }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <div v-if="isAdmin || isHeadOfLibrary || userCanPutOnPublicReview" class="actions-box pa-4">
            <div class="text-subtitle-1 font-weight-medium mb-3">
                {{ $t("librarianActionsLabel") }}
            </div>
            <div class="d-flex flex-wrap gap-2">
                <v-btn
                    v-if="!thesis?.isOnPublicReview && canBePutOnPublicReview && userCanPutOnPublicReview && !thesis?.isArchived && !thesis?.isOnPublicReviewPause"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="changePublicReviewState(true, false)">
                    {{ $t("putOnPublicReviewLabel") }}
                </v-btn>
                <v-btn
                    v-if="(isAdmin || isHeadOfLibrary) && thesis?.isOnPublicReview && !thesis?.isArchived"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="changePublicReviewState(false, false)">
                    {{ $t("removeFromPublicReviewLabel") }}
                </v-btn>
                <v-btn
                    v-if="(isAdmin || isHeadOfLibrary) && thesis?.isOnPublicReviewPause"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="changePublicReviewState(true, true)">
                    {{ $t("continuePublicReviewLabel") }}
                </v-btn>
                <v-btn
                    v-if="(isAdmin || isHeadOfLibrary) && thesis?.isOnPublicReviewPause"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="changePublicReviewState(true, false)">
                    {{ $t("restartPublicReviewLabel") }}
                </v-btn>
                <v-btn
                    v-if="thesis?.thesisDefenceDate && userCanPutOnPublicReview && !thesis?.isArchived"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="changeArchiveState(true)">
                    {{ $t("archiveLabel") }}
                </v-btn>
                <v-btn
                    v-if="(isAdmin || isHeadOfLibrary) && thesis?.isArchived"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="changeArchiveState(false)">
                    {{ $t("unarchiveLabel") }}
                </v-btn>
                <v-btn
                    v-if="registryBookEntryId > 0"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="examineRegistryBookEntry()">
                    {{ $t("examineRegistryBookEntryLabel") }}
                </v-btn>
                <generic-crud-modal
                    v-if="canCreateRegistryBookEntry"
                    class="ml-2"
                    :form-component="RegistryBookEntryForm"
                    :form-props="{ thesisId: parseInt(currentRoute.params.id as string) }"
                    entity-name="RegistryBookEntry"
                    :read-only="(!canCreateRegistryBookEntry) || thesis?.isOnPublicReview"
                    primary-color compact
                    disable-submission
                    outlined wide
                    @create="createRegistryBookEntry"
                />
            </div>
        </div>

        <document-action-box
            ref="actionsRef"
            :doi="thesis?.doi"
            :can-edit="canEdit"
            :metadata-valid="thesis?.isMetadataValid"
            :files-valid="thesis?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(thesis?.description)"
            :display-archive-actions="false"
            :handle-researcher-unbind="handleResearcherUnbind"
            @update="fetchValidationStatus(thesis?.id as number, thesis as _Document)"
        />

        <tab-content-loader v-if="!thesis" layout="sections" />
        <v-tabs
            v-show="thesis"
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
            <v-tab
                v-show="thesis?.contributions && thesis.contributions.length > 0 && thesis?.contributions![0].personId"
                value="researchOutput">
                {{ $t("researchOutputLabel") }}
            </v-tab>
            <v-tab v-show="documentIndicators?.length > 0 || canClassify" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-show="documentClassifications?.length > 0 || canClassify" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-show="thesis"
            v-model="currentTab"
        >
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="thesis?.id"
                    :contribution-list="thesis?.contributions ? thesis?.contributions : []"
                    :read-only="!canEdit"
                    board-members-allowed
                    limit-one-author
                    @update="updateContributions">
                </person-document-contribution-tabs>
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section 
                    :document="thesis"
                    :can-edit="canEdit && !thesis?.isOnPublicReview"
                    :proofs="thesis?.proofs"
                    :file-items="thesis?.fileItems"
                    is-thesis-section
                    :preliminary-files="thesis?.preliminaryFiles"
                    :preliminary-supplements="thesis?.preliminarySupplements"
                    :commission-reports="thesis?.commissionReports"
                    :is-on-public-review="thesis?.isOnPublicReview"
                    @update="fetchThesis"
                ></attachment-section>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="thesis?.keywords ? thesis.keywords : []"
                    :can-edit="canEdit && !thesis?.isOnPublicReview"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Description -->
                <div>
                    <description-section
                        :description="thesis?.description"
                        :can-edit="canEdit && !thesis?.isOnPublicReview"
                        @update="updateDescription"
                    />
                    <description-section
                        :description="thesis?.extendedAbstract"
                        :can-edit="canEdit && !thesis?.isOnPublicReview"
                        is-extended-abstract
                        @update="updateExtendedAbstract"
                    />
                    <description-section
                        :description="thesis?.remark"
                        :can-edit="canEdit && !thesis?.isOnPublicReview && !thesis?.isArchived"
                        is-remark
                        @update="updateRemark"
                    />
                </div>
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
                    :can-edit="canEdit && !thesis?.isOnPublicReview"
                    show-statistics
                    :has-attached-files="thesis?.fileItems && thesis?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <entity-classification-view
                    :entity-classifications="documentClassifications"
                    :entity-id="thesis?.id"
                    :can-edit="canClassify && !thesis?.isOnPublicReview && thesis?.documentDate !== ''"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :applicable-types="[ApplicableEntityType.DOCUMENT]"
                    @create="createClassification"
                    @update="fetchClassifications"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(thesis?.id as number)"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <persistent-question-dialog
            ref="publicDialogRef"
            :title="$t('areYouSureLabel')"
            :message="dialogMessage"
            @continue="commitThesisStatusChange">
        </persistent-question-dialog>

        <share-buttons
            v-if="thesis && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(thesis.title) as string)"
            :document-id="(thesis.id as number)"
            :document-type="PublicationType.THESIS"
        />

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { ApplicableEntityType, type LanguageTagResponse, type LanguageResponse, type MultilingualContent } from '@/models/Common';
import { computed, onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { PublicationType, ThesisType, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Document as _Document, Thesis } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import { addAttachment, updateAttachment, deleteAttachment } from "@/utils/AttachmentUtil";
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import KeywordList from '@/components/core/KeywordList.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import UriList from '@/components/core/UriList.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import type { OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import { localiseDate } from '@/utils/DateUtil';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import { getThesisTitleFromValueAutoLocale } from '@/i18n/thesisType';
import ThesisUpdateForm from '@/components/publication/update/ThesisUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentAssessmentClassification, type DocumentIndicator, type EntityClassificationResponse, type EntityIndicatorResponse, StatisticsType } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import EntityClassificationView from '@/components/assessment/classifications/EntityClassificationView.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';
import { useUserRole } from '@/composables/useUserRole';
import ThesisResearchOutputSection from '@/components/publication/ThesisResearchOutputSection.vue';
import RegistryBookEntryForm from '@/components/thesisLibrary/RegistryBookEntryForm.vue';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import { type RegistryBookEntry } from '@/models/ThesisLibraryModel';
import Wordcloud from '@/components/core/Wordcloud.vue';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import { useDocumentAssessmentActions } from '@/composables/useDocumentAssessmentActions';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import AlternateTitleForm from '@/components/thesisLibrary/AlternateTitleForm.vue';
import { useTrustConfigurationActions } from '@/composables/useTrustConfigurationActions';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';


export default defineComponent({
    name: "ThesisLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, DescriptionSection, LocalizedLink, KeywordList, UriList, IdentifierLink, GenericCrudModal, EntityClassificationView, IndicatorsSection, RichTitleRenderer, PersistentQuestionDialog, ThesisResearchOutputSection, Wordcloud, BasicInfoLoader, TabContentLoader, DocumentActionBox, ShareButtons, DocumentVisualizations },
    setup() {
        const currentTab = ref("contributions");

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

        const { isAdmin, isResearcher, isInstitutionalLibrarian, isHeadOfLibrary } = useUserRole();
        const userCanPutOnPublicReview = computed(() => isAdmin.value || isInstitutionalLibrarian.value);
        const canEdit = ref(false);
        const canClassify = ref(false);
        const canBePutOnPublicReview = ref(false);
        const canCreateRegistryBookEntry = ref(false);
        const registryBookEntryId = ref(-1);

        const documentClassifications = ref<EntityClassificationResponse[]>([]);

        const icon = ref("mdi-certificate-outline");

        const documentIndicators = ref<EntityIndicatorResponse[]>([]);

        const loginStore = useLoginStore();

        const actionsRef = ref<typeof DocumentActionBox>();

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            if (loginStore.userLoggedIn) {
                checkIfUserCanEdit();

                EntityClassificationService.canClassifyDocument(parseInt(currentRoute.params.id as string)).then((response) => {
                    canClassify.value = response.data;
                });

                fetchRegistryBookData();

                fetchClassifications();
            }

            fetchThesis();
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
                canEdit.value = response.data;
            }).catch(() => canEdit.value = false);
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchThesis = () => {
            DocumentPublicationService.readThesis(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                thesis.value = response.data;
                if (thesis.value.isArchived) {
                    canEdit.value = false;
                }

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(thesis.value.title) as string;

                thesis.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);

                if (thesis.value.organisationUnitId) {
                    OrganisationUnitService.readOU(thesis.value.organisationUnitId).then((response) => {
                        organisationUnit.value = response.data;
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

                canBePutOnPublicReview.value = thesis.value.thesisType === ThesisType.PHD || thesis.value.thesisType === ThesisType.PHD_ART_PROJECT;
    
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

            actionsRef.value?.fetchCitations();
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        }

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
            thesis.value!.title = basicInfo.title;
            thesis.value!.subTitle = basicInfo.subTitle;
            thesis.value!.documentDate = basicInfo.documentDate;
            thesis.value!.doi = basicInfo.doi;
            thesis.value!.scopusId = basicInfo.scopusId;
            thesis.value!.uris = basicInfo.uris;
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
            thesis.value!.openAlexId = basicInfo.openAlexId;
            thesis.value!.webOfScienceId = basicInfo.webOfScienceId;
            thesis.value!.scientificArea = basicInfo.scientificArea;
            thesis.value!.scientificSubArea = basicInfo.scientificSubArea;
            thesis.value!.eisbn = basicInfo.eisbn;
            thesis.value!.printISBN = basicInfo.printISBN;
            thesis.value!.udc = basicInfo.udc;
            thesis.value!.placeOfKeep = basicInfo.placeOfKeep;
            thesis.value!.placeOfKeep = basicInfo.placeOfKeep;
            thesis.value!.typeOfTitle = basicInfo.typeOfTitle;
            thesis.value!.authorReprint = basicInfo.authorReprint;

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
        const changePublicReviewState = (putOnPublic: boolean, continueLast: boolean) => {
            if (putOnPublic) {
                if (thesis.value?.isOnPublicReviewPause) {
                    continueLastReview.value = continueLast;

                    if (continueLastReview.value) {
                        dialogMessage.value = i18n.t("continueLastReviewWarningMessage");
                    } else {
                        dialogMessage.value = i18n.t("restartLastReviewWarningMessage");
                    }

                } else {
                    dialogMessage.value = i18n.t("putOnPublicReviewWarningMessage");
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
                continueLast)
            .then(() => {
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

        const commitThesisStatusChange = () => {
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

        return {
            thesis, icon, publisher, createIndicator, languageTagMap,
            returnCurrentLocaleContent, currentTab, fetchIndicators,
            languageMap, searchKeyword, goToURL, canEdit, putOnPublicReview,
            addAttachment, updateAttachment, deleteAttachment, AlternateTitleForm,
            updateKeywords, updateDescription, localiseDate, examineRegistryBookEntry,
            snackbar, snackbarMessage, updateContributions, registryBookEntryId,
            updateBasicInfo, organisationUnit, ThesisUpdateForm, updateRemark,
            event, getThesisTitleFromValueAutoLocale, updateExtendedAbstract,
            handleResearcherUnbind, isAdmin, StatisticsType, documentIndicators,
            currentRoute, actionsRef, ApplicableEntityType, canClassify,
            createClassification, fetchClassifications, documentClassifications,
            removeFromPublicReview, dialogMessage, publicDialogRef, isResearcher,
            changePublicReviewState, canBePutOnPublicReview, userCanPutOnPublicReview,
            isHeadOfLibrary, commitThesisStatusChange, changeArchiveState, updateTitle,
            RegistryBookEntryForm, createRegistryBookEntry, canCreateRegistryBookEntry,
            fetchValidationStatus, fetchThesis, PublicationType
        };
}})

</script>

<style scoped>
    #thesis .large-thesis-icon {
        font-size: 10em;
    }

    #thesis .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
