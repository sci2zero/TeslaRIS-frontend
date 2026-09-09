<template>
    <div id="proceedings" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <entity-landing-header
            :loading="!proceedings"
            :subtitle="returnCurrentLocaleContent(proceedings?.subTitle)"
            :entity-label="$t('proceedingsLabel')"
            icon="mdi-newspaper-variant-multiple"
            :can-edit="canEdit && !proceedings?.isArchived"
            :edit-label="$t('updateProceedingsLabel')"
            :entity-type="PublicationType.PROCEEDINGS"
            :entity-id="proceedings?.id"
            @edit="openModal(updateModalRef)"
        >
            <template #modals>
                <generic-crud-modal
                    v-if="canEdit && !proceedings?.isArchived"
                    ref="updateModalRef"
                    hide-activator
                    :form-component="ProceedingsUpdateForm"
                    :form-props="{ presetProceedings: proceedings}"
                    entity-name="Proceedings"
                    is-update
                    is-section-update
                    :read-only="!canEdit"
                    @update="updateBasicInfo"
                />
            </template>
            <template #title>
                <rich-title-renderer :title="returnCurrentLocaleContent(proceedings?.title)" />
                <span v-if="proceedings?.acronym && proceedings.acronym.length > 0">
                    ({{ returnCurrentLocaleContent(proceedings.acronym) }})
                </span>
            </template>
            <template #meta>
                <landing-meta-item v-if="proceedings?.eventId" :label="$t('conferenceLabel')" icon="mdi-calendar-star" tone="violet">
                    <localized-link
                        v-if="(proceedings?.eventName?.length ?? 0) > 0"
                        :to="'events/conference/' + proceedings?.eventId"
                        class="underline"
                    >
                        {{ returnCurrentLocaleContent(proceedings?.eventName) }}
                    </localized-link>
                </landing-meta-item>
                <landing-meta-item v-if="proceedings?.publisherId || proceedings?.authorReprint" :label="$t('publisherLabel')" icon="mdi-domain" tone="emerald">
                    <localized-link
                        v-if="(proceedings?.publisherName?.length ?? 0) > 0"
                        :to="'publishers/' + proceedings?.publisherId"
                        class="underline"
                    >
                        {{ returnCurrentLocaleContent(proceedings?.publisherName) }}
                    </localized-link>
                    <localized-link
                        v-else-if="proceedings?.authorReprint"
                        to="scientific-results/author-reprints"
                        class="underline"
                    >
                        {{ $t("authorReprintLabel") }}
                    </localized-link>
                </landing-meta-item>
                <landing-meta-item v-if="proceedings?.documentDate" :label="$t('yearOfPublicationLabel')" icon="mdi-calendar" tone="slate">
                    {{ localiseFlexibleDate(proceedings.documentDate) }}
                </landing-meta-item>
                <landing-meta-item v-if="proceedings?.eISBN" label="eISBN" abbrev="eISBN" tone="blue">
                    {{ proceedings.eISBN }}
                </landing-meta-item>
                <landing-meta-item v-if="proceedings?.printISBN" label="Print ISBN" abbrev="ISBN" tone="indigo">
                    {{ proceedings.printISBN }}
                </landing-meta-item>
                <landing-meta-item v-if="proceedings?.publicationSeriesId" :label="$t('publicationSeriesLabel')" icon="mdi-book-multiple" tone="amber">
                    <localized-link
                        :to="`${publicationSeriesType.toString() === '0' ? 'journals' : 'book-series'}/` + proceedings?.publicationSeriesId"
                        class="underline"
                    >
                        {{ returnCurrentLocaleContent(publicationSeries?.title) }}
                    </localized-link>
                </landing-meta-item>
                <landing-meta-item v-if="proceedings?.publicationSeriesVolume" :label="$t('publicationSeriesVolumeLabel')" icon="mdi-book-open-variant" tone="emerald">
                    {{ proceedings.publicationSeriesVolume }}
                </landing-meta-item>
                <landing-meta-item v-if="proceedings?.publicationSeriesIssue" :label="$t('publicationSeriesIssueLabel')" icon="mdi-numeric" tone="amber">
                    {{ proceedings.publicationSeriesIssue }}
                </landing-meta-item>
            </template>
        </entity-landing-header>

        <document-action-box
            ref="actionsRef"
            :doi="proceedings?.doi"
            :can-edit="canEdit && !proceedings?.isArchived"
            :could-archive="canEdit"
            :metadata-valid="proceedings?.isMetadataValid"
            :files-valid="proceedings?.areFilesValid"
            :document-id="parseInt(currentRoute.params.id as string)"
            :description="returnCurrentLocaleContent(proceedings?.description)"
            :document="proceedings"
            :handle-researcher-unbind="handleResearcherUnbind"
            :display-citation="false"
            for-proceedings
            enable-metadata-scanning
        />

        <tab-content-loader v-if="!proceedings" :tab-number="3" layout="list" />
        <v-tabs
            v-show="proceedings"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
            show-arrows
            class="landing-tabs"
        >
            <v-tab value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="contributions">
                {{ $t("editorsAndReviewersLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-if="documentIndicators && documentIndicators.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
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
            v-show="proceedings"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="publications">
                <h2>{{ $t("proceedingsPublicationsLabel") }}</h2>
                <publication-table-component
                    :publications="publications"
                    :total-publications="totalPublications"
                    show-publication-concrete-type
                    enable-export
                    :allow-comparison="isInstitutionalEditor"
                    :endpoint-type="ExportableEndpointType.PROCEEDINGS_PUBLICATIONS"
                    :endpoint-token-parameters="[`${proceedings?.id}`]"
                    @switch-page="switchPage"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="contributions">
                <person-document-contribution-tabs
                    :document-id="proceedings?.id"
                    :contribution-list="proceedings?.contributions ? proceedings?.contributions : []"
                    :read-only="!canEdit"
                    shows-board-and-reviewers
                    :board-members-allowed="false"
                    :document-type="PublicationType.PROCEEDINGS"
                    @update="updateContributions"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="documents">
                <attachment-section
                    :document="proceedings"
                    :can-edit="canEdit"
                    :proofs="proceedings?.proofs"
                    :file-items="proceedings?.fileItems"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <landing-additional-info-tab
                    :keywords="proceedings?.keywords ? proceedings.keywords : []"
                    :description="proceedings?.description"
                    :remark="proceedings?.remark"
                    :can-edit="canEdit && !proceedings?.isArchived"
                    :document="proceedings"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.PROCEEDINGS"
                    :document-identifiers="documentIdentifiers"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-description="updateDescription"
                    @update-remark="updateRemark"
                    @identifiers-updated="fetchIdentifiers"
                >
                    <template #details>
                        <landing-detail-field v-if="proceedings?.languageIds && proceedings.languageIds.length > 0" :label="$t('languageLabel')">
                            {{ proceedings.languageIds.map(id => returnCurrentLocaleContent(languageMap.get(id)?.name)).filter(Boolean).join(', ') }}
                        </landing-detail-field>
                        <landing-detail-field v-if="proceedings?.numberOfPages" :label="$t('numberOfPagesLabel')" :value="proceedings.numberOfPages" />
                    </template>
                </landing-additional-info-tab>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="documentIndicators" 
                    :applicable-types="[ApplicableEntityType.DOCUMENT]" 
                    :entity-id="proceedings?.id" 
                    :entity-type="ApplicableEntityType.DOCUMENT" 
                    :can-edit="canEdit && (isAdmin || isCommission)"
                    show-statistics
                    :has-attached-files="proceedings?.fileItems && proceedings?.fileItems.length > 0"
                    @create="createIndicator"
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <document-visualizations
                    :document-id="(proceedings?.id as number)"
                    :display-settings="displayConfiguration.displaySettings.value"
                    :display-statistics-tab="displayConfiguration.shouldDisplayStatisticsTab()"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <revision-history-table-component
                    class="mt-5"
                    :entity-type="PublicationType.PROCEEDINGS"
                    :entity-id="proceedings?.id"
                    @restored="() => fetchProceedings(false)"
                />
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <data-quality-tabs-component
                    ref="dataQualityTabsRef"
                    class="mt-5"
                    :entity-type="PublicationType.PROCEEDINGS"
                    :entity-id="proceedings?.id"
                />
            </v-tabs-window-item>
        </v-tabs-window>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <share-buttons
            v-if="proceedings && isResearcher && canEdit"
            :title="(returnCurrentLocaleContent(proceedings.title) as string)"
            :document-id="(proceedings.id as number)"
            :document-type="PublicationType.PROCEEDINGS"
        />
    </div>
</template>

<script lang="ts">
import { ApplicableEntityType, ExportableEndpointType, type LanguageResponse, type MultilingualContent } from '@/models/Common';
import { onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { PublicationType, type DocumentPublicationIndex, type PersonDocumentContribution } from '@/models/PublicationModel';
import LanguageService from '@/services/LanguageService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import PersonDocumentContributionTabs from '@/components/core/PersonDocumentContributionTabs.vue';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import ProceedingsService from '@/services/ProceedingsService';
import { useRoute, useRouter } from 'vue-router';
import type { Proceedings } from '@/models/ProceedingsModel';
import { PublicationSeriesType, type PublicationSeries } from '@/models/PublicationSeriesModel';
import JournalService from '@/services/JournalService';
import BookSeriesService from '@/services/BookSeriesService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { localiseFlexibleDate } from '@/utils/DateUtil';
import AttachmentSection from '@/components/core/AttachmentSection.vue';
import ProceedingsUpdateForm from '@/components/proceedings/update/ProceedingsUpdateForm.vue';
import StatisticsService from '@/services/StatisticsService';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { type DocumentIndicator, StatisticsType, type EntityIndicatorResponse } from '@/models/AssessmentModel';
import Toast from '@/components/core/Toast.vue';
import { useLoginStore } from '@/stores/loginStore';
import { useUserRole } from '@/composables/useUserRole';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import RichTitleRenderer from '@/components/core/RichTitleRenderer.vue';
import DocumentActionBox from '@/components/publication/DocumentActionBox.vue';
import ShareButtons from '@/components/core/ShareButtons.vue';
import { type AxiosResponseHeaders } from 'axios';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import DocumentVisualizations from '@/components/publication/DocumentVisualizations.vue';
import { useDocumentChartDisplay } from '@/composables/useDocumentChartDisplay';
import type { EntityIdentifierResponse } from '@/models/IdentifierModel';
import EntityIdentifierService from '@/services/EntityIdentifierService';
import { updateCommonBasicInfo } from '@/utils/CommonDocumentFieldsUtil';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import EntityLandingHeader from '@/components/landing/EntityLandingHeader.vue';
import LandingMetaItem from '@/components/landing/LandingMetaItem.vue';
import LandingDetailField from '@/components/landing/LandingDetailField.vue';
import LandingAdditionalInfoTab from '@/components/landing/LandingAdditionalInfoTab.vue';


export default defineComponent({
    name: "ProceedingsLandingPage",
    components: { AttachmentSection, Toast, PersonDocumentContributionTabs, LocalizedLink, GenericCrudModal, PublicationTableComponent, TabContentLoader, DocumentActionBox, IndicatorsSection, RichTitleRenderer, ShareButtons, DocumentVisualizations, RevisionHistoryTableComponent, DataQualityTabsComponent, EntityLandingHeader, LandingMetaItem, LandingDetailField, LandingAdditionalInfoTab },
    setup() {
        const currentTab = ref("");

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

        const {
            isResearcher, isAdmin,
            isCommission, isInstitutionalEditor
        } = useUserRole();
        const canEdit = ref(false);

        const proceedings = ref<Proceedings>();
        const languageMap = ref<Map<number, LanguageResponse>>(new Map());
        
        const publicationSeries = ref<PublicationSeries>();
        const publicationSeriesType = ref<PublicationSeriesType>(PublicationSeriesType.JOURNAL);

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const i18n = useI18n();

        const documentIndicators = ref<EntityIndicatorResponse[]>();
        const documentIdentifiers = ref<EntityIdentifierResponse[]>([]);

        const loginStore= useLoginStore();

        const displayConfiguration = useDocumentChartDisplay(parseInt(currentRoute.params.id as string));

        const actionsRef = ref<typeof DocumentActionBox>();
        const updateModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        onMounted(() => {
            fetchDisplayData();
        });

        const fetchDisplayData = () => {
            if (loginStore.userLoggedIn) {
                DocumentPublicationService.canEdit(
                    parseInt(currentRoute.params.id as string)
                ).then((response) => {
                    canEdit.value = response.data;
                }).catch(() => canEdit.value = false);
            }

            fetchProceedings(true);
            fetchIdentifiers();
            StatisticsService.registerDocumentView(parseInt(currentRoute.params.id as string));
            fetchIndicators();
        };

        const fetchIndicators = () => {
            EntityIndicatorService.fetchDocumentIndicators(
                parseInt(currentRoute.params.id as string)
            ).then(response => {
                documentIndicators.value = response.data;
            });
        };

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchProceedings = (uponStartup: boolean) => {
            ProceedingsService.readProceedings(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                proceedings.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = returnCurrentLocaleContent(proceedings.value.title) as string;

                proceedings.value?.contributions?.sort((a, b) => a.orderNumber - b.orderNumber);
    
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

        const populateData = () => {
            LanguageService.getAllLanguages().then(response => {
                response.data.forEach(languageTag => {
                    languageMap.value.set(languageTag.id, languageTag);
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
            return DocumentPublicationService.findPublicationsInProceedings(
                parseInt(currentRoute.params.id as string),
                `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
            ).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
        };

        const fetchConnectedEntities = () => {
            if(proceedings.value?.publicationSeriesId) {
                JournalService.readJournal(proceedings.value.publicationSeriesId).then((journalResponse) => {
                    publicationSeries.value = journalResponse.data;
                    publicationSeriesType.value = PublicationSeriesType.JOURNAL;
                }).catch(() => {
                    BookSeriesService.readBookSeries(proceedings.value?.publicationSeriesId as number).then((bookSeriesResponse) => {
                        publicationSeries.value = bookSeriesResponse.data;
                        publicationSeriesType.value = PublicationSeriesType.BOOK_SERIES;
                    });
                });
            }
        };

        const fetchIdentifiers = () => {
            EntityIdentifierService.fetchDocumentIdentifiers(
                parseInt(currentRoute.params.id as string)
            ).then(response => {
                documentIdentifiers.value = response.data;
            });
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" }});
        };

        const goToURL = (uri: string) => {
            window.open(uri, "_blank");
        };

        const updateBasicInfo = (updatedInfo: Proceedings) => {
            proceedings.value!.eISBN = updatedInfo.eISBN;
            proceedings.value!.languageIds = updatedInfo.languageIds;
            proceedings.value!.numberOfPages = updatedInfo.numberOfPages;
            proceedings.value!.printISBN = updatedInfo.printISBN;
            proceedings.value!.publicationSeriesId = updatedInfo.publicationSeriesId;
            proceedings.value!.publicationSeriesIssue = updatedInfo.publicationSeriesIssue;
            proceedings.value!.publicationSeriesVolume = updatedInfo.publicationSeriesVolume;
            proceedings.value!.publisherId = updatedInfo.publisherId;
            proceedings.value!.acronym = updatedInfo.acronym;
            proceedings.value!.authorReprint = updatedInfo.authorReprint;

            updateCommonBasicInfo(proceedings, updatedInfo);

            performUpdate(true);
        };

        const updateKeywords = (keywords: MultilingualContent[]) => {
            proceedings.value!.keywords = keywords;
            performUpdate(false);
        };

        const updateDescription = (description: MultilingualContent[]) => {
            proceedings.value!.description = description;
            performUpdate(false);
        };

        const updateContributions = (contributions: PersonDocumentContribution[]) => {
            proceedings.value!.contributions = contributions;
            performUpdate(true);
        };

        const performUpdate = (reload: boolean) => {
            if (proceedings.value?.publicationSeriesId === 0) {
                proceedings.value.publicationSeriesId = undefined;
            }

            ProceedingsService.updateProceedings(
                proceedings.value?.id as number,
                proceedings.value as Proceedings
            ).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchConnectedEntities();
                if(reload) {
                    fetchProceedings(false);
                }
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
                if(reload) {
                    fetchProceedings(false);
                }
            }).finally(() => {
                fetchPublications();
            });
        };

        const setStartTab = () => {
            if(totalPublications.value > 0) {
                currentTab.value = "publications";
            } else {
                currentTab.value = "contributions";
            }
        };

        const handleResearcherUnbind = () => {
            snackbarMessage.value = i18n.t("unbindSuccessfullMessage");
            snackbar.value = true;
            fetchDisplayData();
        };

        const createIndicator = (documentIndicator: {indicator: DocumentIndicator, files: File[]}) => {
            EntityIndicatorService.createDocumentIndicator(
                documentIndicator.indicator
            ).then((response) => {
                EntityIndicatorService.uploadFilesAndFetchIndicators(
                    documentIndicator.files,
                    response.data.id
                ).then(() => {
                    fetchIndicators();
                });
            });
        };

        const updateRemark = (remark: MultilingualContent[]) => {
            proceedings.value!.remark = remark;
            performUpdate(true);
        };

        return {
            proceedings, fetchIndicators, PublicationType,
            publications, currentTab, createIndicator,
            totalPublications, switchPage, ApplicableEntityType,
            returnCurrentLocaleContent, localiseFlexibleDate, fetchIdentifiers,
            languageMap, publicationSeriesType, displayConfiguration,
            searchKeyword, goToURL, canEdit, documentIdentifiers,
            updateKeywords, updateDescription, snackbar, snackbarMessage,
            publicationSeries, updateBasicInfo, updateContributions,
            ProceedingsUpdateForm, handleResearcherUnbind, isResearcher,
            documentIndicators, StatisticsType, currentRoute, updateRemark,
            isAdmin, isCommission, ExportableEndpointType, isInstitutionalEditor,
            fetchProceedings,
            dataQualityTabsRef, showAssessmentDetails,
            updateModalRef, openModal, actionsRef
        };
}})

</script>
