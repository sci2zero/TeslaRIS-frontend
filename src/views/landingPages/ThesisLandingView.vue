<template>
    <landing-page-layout
        id="thesis"
        v-model="currentTab"
        :loading="!thesis"
    >
        <template #header>
            <entity-landing-header
                :loading="!thesis"
                :entity-label="$t('thesisLabel')"
                :badge="thesis?.thesisType ? getThesisTitleFromValueAutoLocale(thesis.thesisType) : ''"
                :year="thesis?.documentDate?.year"
                icon="mdi-certificate-outline"
                :can-edit="canEdit && !thesis?.isOnPublicReview"
                :edit-label="$t('updateThesisLabel')"
                :entity-type="PublicationType.THESIS"
                :entity-id="thesis?.id"
                @edit="openModal(thesisUpdateModalRef)"
            >
                <template #modals>
                    <generic-crud-modal
                        v-if="canEdit && !thesis?.isOnPublicReview"
                        ref="thesisUpdateModalRef"
                        hide-activator
                        :form-component="ThesisUpdateForm"
                        :form-props="{ presetThesis: thesis }"
                        entity-name="Thesis"
                        is-update
                        is-section-update
                        :read-only="!canEdit || thesis?.isOnPublicReview"
                        @update="updateBasicInfo"
                    />
                    <generic-crud-modal
                        v-if="canEdit && !thesis?.isOnPublicReview"
                        ref="titleUpdateModalRef"
                        hide-activator
                        :form-component="AlternateTitleForm"
                        :form-props="{ presetTitle: thesis?.title, presetAlternateTitle: thesis?.alternateTitle }"
                        entity-name="Title"
                        is-update
                        is-section-update
                        :read-only="!canEdit || thesis?.isOnPublicReview"
                        @update="updateTitle"
                    />
                </template>
                <template #title>
                    <rich-title-renderer :title="returnCurrentLocaleContent(thesis?.title)" />
                </template>
                <template #subtitle>
                    <p
                        v-if="thesis?.alternateTitle && thesis.alternateTitle.length > 0"
                        class="text-lg sm:text-xl text-slate-500 italic mb-2"
                    >
                        <rich-title-renderer :title="`(${returnCurrentLocaleContent(thesis.alternateTitle)})`" />
                    </p>
                    <p
                        v-if="returnCurrentLocaleContent(thesis?.subTitle)"
                        class="text-lg sm:text-xl text-slate-600 mb-2"
                    >
                        {{ returnCurrentLocaleContent(thesis?.subTitle) }}
                    </p>
                </template>
                <template #affiliation>
                    <p v-if="thesis?.organisationUnitId || (thesis?.externalOrganisationUnitName && thesis.externalOrganisationUnitName.length > 0)" class="text-lg sm:text-xl font-semibold text-slate-600 font-sans">
                        <localized-link
                            v-if="thesis?.organisationUnitId"
                            :to="'organisation-units/' + thesis.organisationUnitId"
                            class="font-medium text-gray-900 underline"
                        >
                            {{ returnCurrentLocaleContent(organisationUnit?.name) }}
                        </localized-link>
                        <span v-else>
                            {{ returnCurrentLocaleContent(thesis?.externalOrganisationUnitName) }}
                        </span>
                    </p>
                    <p v-if="thesis?.publisherId || thesis?.authorReprint" class="text-sm text-slate-500 font-sans">
                        <localized-link
                            v-if="thesis?.publisherId"
                            :to="'publishers/' + thesis.publisherId"
                            class="underline"
                        >
                            {{ returnCurrentLocaleContent(publisher?.name) }}
                        </localized-link>
                        <localized-link
                            v-else-if="thesis?.authorReprint"
                            to="scientific-results/author-reprints"
                            class="underline"
                        >
                            {{ $t("authorReprintLabel") }}
                        </localized-link>
                    </p>
                </template>
                <template #meta>
                    <landing-meta-item v-if="thesis?.documentDate" :label="$t('dateOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                        {{ localiseFlexibleDate(thesis.documentDate) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="thesis?.thesisDefenceDate" :label="$t('defenceDateLabel')" icon="mdi-school" tone="emerald">
                        {{ localiseDate(thesis.thesisDefenceDate) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="thesis?.topicAcceptanceDate" :label="$t('topicAcceptanceDateLabel')" icon="mdi-file-check-outline" tone="amber">
                        {{ localiseDate(thesis.topicAcceptanceDate) }}
                    </landing-meta-item>
                    <landing-meta-item v-if="thesis?.doi" label="DOI" abbrev="DOI" tone="blue">
                        <identifier-link :identifier="thesis.doi" compact />
                    </landing-meta-item>
                    <landing-meta-item v-if="thesis?.eisbn" label="eISBN" abbrev="eISBN" tone="indigo">
                        {{ thesis.eisbn }}
                    </landing-meta-item>
                    <landing-meta-item v-if="thesis?.printISBN" label="Print ISBN" abbrev="ISBN" tone="violet">
                        {{ thesis.printISBN }}
                    </landing-meta-item>
                </template>
                <template #status>
                    <div v-if="thesis?.substituteFor || thesis?.substitutedBy" class="mb-4 space-y-1 text-sm">
                        <p v-if="thesis.substituteFor">
                            <span class="text-slate-500">{{ $t("substituteForLabel") }}:</span>
                            <localized-link
                                :to="'scientific-results/thesis/' + thesis.substituteFor"
                                class="ml-1 font-medium text-gray-900 underline"
                            >
                                {{ returnCurrentLocaleContent(thesis.substitutedTitle) }}
                            </localized-link>
                        </p>
                        <p v-if="thesis.substitutedBy">
                            <span class="text-slate-500">{{ $t("substitutedByLabel") }}:</span>
                            <localized-link
                                :to="'scientific-results/thesis/' + thesis.substitutedBy"
                                class="ml-1 font-medium text-gray-900 underline"
                            >
                                {{ returnCurrentLocaleContent(thesis.substituteTitle) }}
                            </localized-link>
                        </p>
                    </div>
                    <div
                        v-if="thesis?.isOnPublicReview"
                        class="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-full border border-amber-200 mb-6"
                    >
                        <span class="mdi mdi-eye-outline"></span>
                        {{ $t("onPublicReviewLabel", [localiseDate(thesis.publicReviewEnd)]) }}
                    </div>
                </template>
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
                        :form-props="{ thesisId: thesisId, presetAuthorName: thesisAuthorName, canSave: (thesis?.publicReviewCompleted && !!thesis?.thesisDefenceDate), cannotSaveReason: (thesis?.publicReviewCompleted && !!thesis?.thesisDefenceDate) ? '' : $t('registryEntryThesisNotEligibleMessage') }"
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
                        variant="outline"
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
            </entity-landing-header>
        </template>

        <template #before-tabs>
            <publication-badge-section
                v-if="thesis"
                class="mb-8"
                :preloaded-doi="thesis?.doi"
                :document-id="thesisId"
                :description="returnCurrentLocaleContent(thesis?.description)"
            />
        </template>

        <template #tabs>
            <v-tab v-if="showOverviewTab" value="overview">
                {{ $t("overviewLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t("contributionsLabel") }}
            </v-tab>
            <v-tab v-show="isDigitalRepositoryEnabled" value="documents">
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
            <v-tab v-show="canReviewDataQuality && canAssessDataQuality" value="revisions">
                {{ $t("revisionHistoryLabel") }}
            </v-tab>
            <v-tab v-show="canReviewDataQuality && canAssessDataQuality" value="dataQuality">
                {{ $t("dataQualityLabel") }}
            </v-tab>
        </template>

        <template #default>
            <v-tabs-window-item value="overview">
                <landing-overview-tab
                    v-show="showOverview"
                    @has-content="onOverviewContent"
                    :description="thesis?.description"
                    :contributions="thesis?.contributions"
                    :contribution-types="['AUTHOR']"
                    :for-document-id="thesis?.id"
                    :document-type="PublicationType.THESIS"
                    @see-all="currentTab = $event"
                />
            </v-tabs-window-item>
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
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <landing-section-card
                    :title="$t('indicatorListLabel')"
                    icon="mdi-chart-box-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
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
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <landing-section-card
                    :title="$t('assessmentsLabel')"
                    icon="mdi-certificate-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <entity-classification-view
                        :entity-classifications="documentClassifications"
                        :entity-id="thesis?.id"
                        :can-edit="canClassify && !thesis?.isOnPublicReview && !!thesis?.documentDate?.year"
                        :containing-entity-type="ApplicableEntityType.DOCUMENT"
                        :applicable-types="[ApplicableEntityType.THESIS]"
                        @create="createClassification"
                        @update="fetchClassifications"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <landing-section-card
                    :title="$t('visualizationsLabel')"
                    icon="mdi-chart-bar"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <document-visualizations
                        :document-id="(thesis?.id as number)"
                        :display-settings="displayConfiguration.displaySettings.value"
                        :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="revisions">
                <landing-section-card
                    :title="$t('revisionHistoryLabel')"
                    icon="mdi-history"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <revision-history-table-component
                        :entity-type="PublicationType.THESIS"
                        :entity-id="thesis?.id"
                        :restore-blocked-reason="restoreBlockedReason"
                        @restored="fetchThesis"
                        @show-assessment-details="showAssessmentDetails"
                    />
                </landing-section-card>
            </v-tabs-window-item>
            <v-tabs-window-item value="dataQuality">
                <landing-section-card
                    :title="$t('dataQualityLabel')"
                    icon="mdi-shield-check-outline"
                    icon-class="bg-indigo-50 text-indigo-600"
                    padded>
                    <data-quality-tabs-component
                        ref="dataQualityTabsRef"
                        :entity-type="PublicationType.THESIS"
                        :entity-id="thesis?.id"
                    />
                </landing-section-card>
            </v-tabs-window-item>
        </template>

        <template #footer>
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
        </template>
    </landing-page-layout>
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
import DataQualityService from '@/services/revision/DataQualityService';
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
import ThesisAdditionalInfoTab from '@/components/publication/landing/ThesisAdditionalInfoTab.vue';
import CitationSelector from '@/components/publication/CitationSelector.vue';
import PublicationUnbindButton from '@/components/publication/PublicationUnbindButton.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';
import { UiButton } from '@/components/ui/button';
import RoCrateService from '@/services/export/RoCrateService';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';
import LandingPageLayout from '@/components/landing/LandingPageLayout.vue';
import LandingSectionCard from '@/components/landing/LandingSectionCard.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import ThesisUpdateForm from '@/components/publication/update/ThesisUpdateForm.vue';
import AlternateTitleForm from '@/components/thesisLibrary/AlternateTitleForm.vue';
import LandingOverviewTab from '@/components/landing/LandingOverviewTab.vue';
import { useLandingOverview } from '@/composables/useLandingOverview';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import { getThesisTitleFromValueAutoLocale } from '@/i18n/thesisType';
import { localiseDate, localiseFlexibleDate } from '@/utils/DateUtil';
import { useCrisContextInformation } from '@/composables/useCrisContextInformation';

export default defineComponent({
    name: "ThesisLandingPage",
    components: { LandingSectionCard, LandingPageLayout, AttachmentSection, Toast, PersonDocumentContributionTabs, GenericCrudModal, EntityClassificationView, IndicatorsSection, PersistentQuestionDialog, ThesisResearchOutputSection, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, ThesisAdditionalInfoTab, CitationSelector, PublicationUnbindButton, PublicationBadgeSection, UiButton, EntityLandingHeader, LandingMetaItem, LandingOverviewTab, RichTitleRenderer, LocalizedLink, IdentifierLink },
    setup() {
        const currentTab = ref("overview");

        const dataQualityTabsRef = ref<typeof DataQualityTabsComponent>();

        const showAssessmentDetails = (
            version: { majorVersion: number, minorVersion: number }) => {
            currentTab.value = "dataQuality";

            nextTick(() => dataQualityTabsRef.value?.selectVersion(
                version.majorVersion, version.minorVersion));
        };

        const {
            isDigitalLibraryEnabled,
            isDigitalRepositoryEnabled
        } = useCrisContextInformation();

        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const i18n = useI18n();

        const publicDialogRef = ref<typeof PersistentQuestionDialog>();
        const dialogMessage = ref(i18n.t("putOnPublicReviewWarningMessage"));

        const thesis = ref<Thesis>();
        const { showOverview, showOverviewTab, onOverviewContent } = useLandingOverview(
            thesis,
            currentTab,
            "contributions",
        );
        const publisher = ref<Publisher>();
        const organisationUnit = ref<OrganisationUnitResponse>();
        const event = ref<Conference>();
        const languageMap = ref<Map<number, LanguageResponse>>(new Map());
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isAdmin, isResearcher, isInstitutionalLibrarian, isHeadOfLibrary, isCommission, isInstitutionalEditor, isUserLoggedIn, canReviewDataQuality } = useUserRole();
        const userCanPutOnPublicReview = computed(() => isAdmin.value || isInstitutionalLibrarian.value || isHeadOfLibrary.value);
        const canEdit = ref(false);
        const canAssessDataQuality = ref(false);
        const canClassify = ref(false);
        const canBePutOnPublicReview = ref(false);

        const restoreBlockedReason = computed(() => {
            if (thesis.value?.isArchived) {
                return i18n.t("restoreArchivedDocumentMessage");
            }

            if (thesis.value?.isOnPublicReview || thesis.value?.isOnPublicReviewPause) {
                return i18n.t("restoreThesisOnPublicReviewMessage");
            }

            return undefined;
        });
        const canCreateRegistryBookEntry = ref(false);
        const registryBookEntryId = ref(-1);

        const thesisAuthorName = computed(() => thesis.value?.contributions
            ?.find(contribution => contribution.contributionType === DocumentContributionType.AUTHOR)
            ?.personName);

        const documentClassifications = ref<EntityClassificationResponse[]>();
        const documentIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const documentIndicators = ref<EntityIndicatorResponse[]>();

        const loginStore = useLoginStore();

        const citationRef = ref<{ dialog: boolean, fetchCitations: () => void } | null>(null);
        const registryModalRef = ref<{ dialog: boolean } | null>(null);
        const substitutionModalRef = ref<{ dialog: boolean } | null>(null);
        const unbindRef = ref<{ unbindResearcherFromDocument: () => void } | null>(null);
        const thesisUpdateModalRef = ref<{ dialog: boolean } | null>(null);
        const titleUpdateModalRef = ref<{ dialog: boolean } | null>(null);

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
                DataQualityService.canAssessDataQuality(
                    PublicationType.THESIS,
                    parseInt(currentRoute.params.id as string)
                ).then((response) => {
                    canAssessDataQuality.value = response.data;
                });

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
            thesis, publisher, createIndicator, languageTagMap, canAssessDataQuality, isDigitalLibraryEnabled, restoreBlockedReason,
            returnCurrentLocaleContent, currentTab, showOverview, showOverviewTab, onOverviewContent, fetchIndicators,
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
            thesisAuthorName,
            fetchValidationStatus, fetchThesis, PublicationType, displayConfiguration,
            continueLastReview, shortenedReview, isCommission, ThesisSubstitutionForm,
            DocumentContributionType, removeSubstitution,
            fetchIdentifiers, documentIdentifiers,
            dataQualityTabsRef, showAssessmentDetails,
            citationRef, registryModalRef, substitutionModalRef, unbindRef,
            thesisUpdateModalRef, titleUpdateModalRef,
            ThesisUpdateForm, AlternateTitleForm,
            getThesisTitleFromValueAutoLocale, localiseDate, localiseFlexibleDate,
            thesisId, isUserLoggedIn,
            showPutOnPublicReview, showPutOnPublicReviewShortened,
            showRemoveFromPublicReview, showContinuePublicReview, showRestartPublicReview,
            showArchive, showUnarchive, showExamineRegistry,
            canDefineSubstitution, showRemoveSubstitution,
            showValidateMetadata, showValidateFiles,
            primaryLibrarianAction, hasMoreActions,
            openModal, openCitationDialog, openUnbindDialog,
            downloadRoCrate, validateMetadata, validateUploadedFiles,

            canReviewDataQuality,
            isDigitalRepositoryEnabled,
        };
}})

</script>
