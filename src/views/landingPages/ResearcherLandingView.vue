<template>
    <div id="researcher" class="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        <ResearcherLandingHeader 
            :person="person"
            :researcher-name="researcherName"
            :employments="employments"
            :can-edit="canEdit"
            @update="updatePersonalInfo"
        >
            <template #actions>
                <person-other-name-modal
                    ref="personOtherNameModalRef"
                    hide-activator
                    :preset-person="person"
                    :read-only="!canEdit"
                    @update="updateNames"
                    @select-primary="selectPrimaryName"
                />
                <generic-crud-modal
                    ref="researchAreaModalRef"
                    hide-activator
                    :form-component="AssessmentResearchAreaForm"
                    :form-props="{ personId: person?.id, presetResearchArea: researchArea, researchAreasHierarchy: researchSubAreas }"
                    entity-name="ResearchArea"
                    is-update
                    :read-only="!canEdit"
                    @update="fetchAssessmentResearchArea"
                />
                <generic-crud-modal
                    v-if="canEdit && (isAdmin || isInstitutionalEditor || isResearcher)"
                    ref="visibilityConfigModalRef"
                    hide-activator
                    :form-component="PersonFieldVisibilityConfigurationForm"
                    :form-props="{ personId: person?.id }"
                    entity-name="PersonFieldVisibilityConfiguration"
                    is-update
                    :read-only="!canEdit"
                    @update="updateSuccess()"
                />

                <UiButton
                    v-if="canEdit || person?.personOtherNames?.length"
                    variant="outline"
                    size="md"
                    class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!"
                    @click="openModal(personOtherNameModalRef)"
                >
                    <span class="mdi mdi-account-multiple-outline"></span>
                    {{ $t("viewAllPersonNamesLabel") }}
                </UiButton>

                <v-menu v-if="canEdit" location="bottom">
                    <template #activator="{ props: menuProps }">
                        <UiButton variant="outline" size="md" class="w-full sm:w-auto whitespace-normal! sm:whitespace-nowrap!" v-bind="menuProps">
                            <span class="mdi mdi-dots-horizontal"></span>
                            {{ $t("moreActionsLabel") }}
                            <span class="mdi mdi-chevron-down"></span>
                        </UiButton>
                    </template>
                    <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                        <v-list-item
                            prepend-icon="mdi-flask-outline"
                            :title="$t('updateResearchAreaLabel')"
                            @click="openModal(researchAreaModalRef)"
                        />
                        <v-list-item
                            prepend-icon="mdi-download"
                            :title="$t('downloadRoCrateBibliographyLabel')"
                            @click="downloadRoCrateBibliography"
                        />
                        <v-list-item
                            v-if="isResearcher"
                            prepend-icon="mdi-file-check-outline"
                            :title="$t('documentClaimLabel')"
                            @click="performNavigation('documentClaim')"
                        />
                        <v-list-item
                            v-if="isResearcher"
                            prepend-icon="mdi-domain"
                            :title="$t('massInstitutionAssignmentLabel')"
                            @click="performNavigation('massInstitutionAssignment')"
                        />
                        <v-list-item
                            v-if="isResearcher"
                            prepend-icon="mdi-import"
                            :title="$t('importerLabel')"
                            @click="performNavigation('importer')"
                        />
                        <v-list-item
                            v-if="isAdmin || isInstitutionalEditor"
                            prepend-icon="mdi-cloud-download-outline"
                            :title="$t('harvestExternalIndicatorsLabel')"
                            @click="performIndicatorHarvest"
                        />
                        <v-list-item
                            v-if="isAdmin || isInstitutionalEditor || isResearcher"
                            prepend-icon="mdi-eye-outline"
                            :title="$t('updatePersonFieldVisibilityConfigurationLabel')"
                            @click="openModal(visibilityConfigModalRef)"
                        />
                    </v-list>
                </v-menu>
            </template>
        </ResearcherLandingHeader>

        <researcher-featured-indicators
            :person-id="(person?.id as number)"
        />

        <tab-content-loader v-if="!person" :tab-number="Math.random() * (4 - 2) + 2" layout="sections" />
        <v-tabs
            v-if="person"
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
            <v-tab v-show="personIndicators && personIndicators.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab value="visualizations">
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
            v-if="person"
            v-model="currentTab"
            class="min-w-0"
        >
            <v-tabs-window-item value="publications">
                <div class="mt-4 space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 class="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-slate-800">
                            {{ $t("scientificResultsListLabel") }}
                        </h3>
                        <div v-if="canEdit" class="flex flex-wrap items-center gap-2">
                            <add-publication-menu
                                :person-id="isResearcher ? undefined : personId"
                                compact
                            />
                            <v-btn
                                v-if="isResearcher"
                                color="primary"
                                density="compact"
                                @click="performNavigation('importer')">
                                {{ $t("importerLabel") }}
                            </v-btn>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-end gap-3">
                        <search-bar-component
                            class="w-full min-w-0 max-w-none!"
                            :transparent="false"
                            size="small"
                            @search="clearSortAndPerformPublicationSearch($event)"
                        />
                        <v-select
                            v-model="selectedPublicationTypes"
                            :items="publicationTypes"
                            :label="$t('typeOfPublicationLabel')"
                            return-object
                            hide-details
                            density="comfortable"
                            class="w-full sm:max-w-xs sm:min-w-56 shrink-0"
                            multiple
                        ></v-select>
                    </div>

                    <publication-table-component
                        ref="publicationsRef"
                        :publications="publications"
                        :total-publications="totalPublications"
                        enable-export
                        :endpoint-type="ExportableEndpointType.PERSON_OUTPUTS"
                        :endpoint-token-parameters="[`${person?.id}`, publicationSearchParams]"
                        :endpoint-body-parameters="
                            {
                                allowedTypes: selectedPublicationTypes?.map(publicationType => publicationType.value),
                                personId: person.id,
                                commissionId: null
                            }"
                        :allow-researcher-unbinding="canEdit && isResearcher"
                        @switch-page="switchPage">
                    </publication-table-component>
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <researcher-additional-info-tab
                    :person="person"
                    :keywords="keywords"
                    :biography="biography"
                    :can-edit="canEdit"
                    :is-admin="isAdmin"
                    :employments="employments"
                    :education="education"
                    :memberships="memberships"
                    :research-area="researchArea"
                    :country-name="personalInfo.country"
                    :private-country-name="personalInfo.countryPrivate"
                    @update="updatePersonalInfo"
                    @search-keyword="searchKeyword"
                    @update-keywords="updateKeywords"
                    @update-biography="updateBiography"
                    @refresh="fetchPerson()"
                    @add-involvement="addInvolvement"
                    @migrate-to-unmanaged="migrateToUnmanaged"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <div class="mt-4 min-w-0">
                    <indicators-section 
                        :indicators="personIndicators" 
                        :applicable-types="[ApplicableEntityType.PERSON]" 
                        :entity-id="person?.id"
                        :entity-type="ApplicableEntityType.PERSON" 
                        :can-edit="false"
                        show-statistics
                        @updated="fetchIndicators"
                    />
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <div class="mt-4 overflow-x-auto">
                    <person-assessments-view
                        :assessments="personAssessments"
                        :is-loading="assessmentsLoading"
                        @fetch="fetchAssessment">
                    </person-assessments-view>
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <div class="mt-4 min-w-0 overflow-x-auto">
                    <person-visualizations
                        :person-id="(person.id as number)"
                        :display-settings="displaySettings.displaySettings.value"
                        :display-publications-tab="displaySettings.shouldDisplayPublicationTab()"
                        :display-type-ratios-tab="displaySettings.shouldDisplayTypeTab()"
                        :display-citations-tab="displaySettings.shouldDisplayCitationsTab()"
                        :display-statistics-tab="displaySettings.shouldDisplayStatisticsTab()"
                    />
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="revisions">
                <div class="mt-5 overflow-x-auto">
                    <revision-history-table-component
                        :entity-type="EntityType.PERSON"
                        :entity-id="person?.id"
                        @restored="fetchPerson"
                        @show-assessment-details="showAssessmentDetails"
                    />
                </div>
            </v-tabs-window-item>
            <v-tabs-window-item v-if="isAdmin" value="dataQuality">
                <div class="mt-5 overflow-x-auto">
                    <data-quality-tabs-component
                        ref="dataQualityTabsRef"
                        :entity-type="EntityType.PERSON"
                        :entity-id="person?.id"
                    />
                </div>
            </v-tabs-window-item>
        </v-tabs-window>

        <persistent-question-dialog
            ref="dialogRef"
            :title="$t('areYouSureLabel')"
            :message="dialogMessage"
            @continue="performMigrationToUnmanaged">
        </persistent-question-dialog>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </div>
</template>

<script lang="ts">
import { type MultilingualContent, type Country, ExportableEndpointType, ApplicableEntityType } from '@/models/Common';
import PersonService from '@/services/PersonService';
import CountryService from '@/services/CountryService';
import { computed, onMounted, nextTick } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import type { PersonResponse, ExpertiseOrSkillResponse, PersonalInfo, PersonName } from '@/models/PersonModel';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import InvolvementService from '@/services/InvolvementService';
import type { Employment, Education, Membership } from '@/models/InvolvementModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { DocumentFile } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import PersonOtherNameModal from '@/components/person/otherName/PersonOtherNameModal.vue';
import { localiseDate } from '@/utils/DateUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/sex';
import { getErrorMessageForErrorKey } from '@/i18n';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';
import StatisticsService from '@/services/StatisticsService';
import { type AssessmentResearchArea, type EntityIndicatorResponse, type ResearcherAssessmentResponse, StatisticsType } from '@/models/AssessmentModel';
import EntityIndicatorService from '@/services/assessment/EntityIndicatorService';
import { useLoginStore } from '@/stores/loginStore';
import Toast from '@/components/core/Toast.vue';
import AssessmentResearchAreaForm from '@/components/assessment/assessmentMeasure/AssessmentResearchAreaForm.vue';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';
import EntityClassificationService from '@/services/assessment/EntityClassificationService';
import PersonAssessmentsView from '@/components/assessment/classifications/PersonAssessmentsView.vue';
import { useUserRole } from '@/composables/useUserRole';
import AddPublicationMenu from '@/components/publication/AddPublicationMenu.vue';
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import { getPublicationTypesForGivenLocale } from '@/i18n/publicationType';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';
import PersonVisualizations from '@/components/person/PersonVisualizations.vue';
import { usePersonChartDisplay } from '@/composables/usePersonChartDisplay';
import ResearcherLandingHeader from '@/components/researcher/landing/ResearcherLandingHeader.vue';
import ExternalIndicatorConfigurationService from '@/services/assessment/ExternalIndicatorConfigurationService';
import ResearcherFeaturedIndicators from '@/components/researcher/landing/ResearcherFeaturedIndicators.vue';
import RoCrateService from '@/services/export/RoCrateService';
import { type ResearchArea } from '@/models/OrganisationUnitModel';
import PersonFieldVisibilityConfigurationForm from '@/components/person/PersonFieldVisibilityConfigurationForm.vue';
import UserService from '@/services/UserService';
import RevisionHistoryTableComponent from '@/components/core/revisions/RevisionHistoryTableComponent.vue';
import { EntityType } from '@/models/MergeModel';
import DataQualityTabsComponent from '@/components/core/revisions/DataQualityTabsComponent.vue';
import { UiButton } from '@/components/ui/button';
import ResearcherAdditionalInfoTab from '@/components/researcher/landing/ResearcherAdditionalInfoTab.vue';


export default defineComponent({
    name: "ResearcherLandingPage",
    components: { PublicationTableComponent, Toast, GenericCrudModal, PersonOtherNameModal, PersistentQuestionDialog, PersonAssessmentsView, AddPublicationMenu, TabContentLoader, IndicatorsSection, SearchBarComponent, PersonVisualizations, ResearcherLandingHeader, ResearcherFeaturedIndicators, RevisionHistoryTableComponent, DataQualityTabsComponent, UiButton, ResearcherAdditionalInfoTab },
    setup() {
        const currentTab = ref("additionalInfo");

        const dataQualityTabsRef = ref<typeof DataQualityTabsComponent>();

        const showAssessmentDetails = (
            version: { majorVersion: number, minorVersion: number }) => {
            currentTab.value = "dataQuality";

            nextTick(() => dataQualityTabsRef.value?.selectVersion(
                version.majorVersion, version.minorVersion));
        };

        const dialogRef = ref<typeof PersistentQuestionDialog>();
        const dialogMessage = computed(() => i18n.t("migrateToUnmanagedMessage"));
        const personOtherNameModalRef = ref<{ dialog: boolean } | null>(null);
        const researchAreaModalRef = ref<{ dialog: boolean } | null>(null);
        const visibilityConfigModalRef = ref<{ dialog: boolean } | null>(null);

        const openModal = (modal: { dialog: boolean } | null) => {
            if (modal) {
                modal.dialog = true;
            }
        };

        const snackbar = ref(false);
        const snackbarMessage = ref("");
        
        const router = useRouter();
        const currentRoute = useRoute();

        const person = ref<PersonResponse>();
        const country = ref<Country>();
        const countryPrivate = ref<Country>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");
        const publicationSearchParams = ref("tokens=*");
        const publicationsRef = ref<typeof PublicationTableComponent>();
        const publicationTypes = computed(() => getPublicationTypesForGivenLocale()?.filter(type => type.value !== PublicationType.PROCEEDINGS));
        const selectedPublicationTypes = ref<{ title: string, value: PublicationType }[]>([]);

        const i18n = useI18n();

        const { isAdmin, isResearcher, isInstitutionalEditor } = useUserRole();

        const researcherName = ref("");

        const personalInfo = ref<any>({contact: {}});
        
        const keywords = ref<MultilingualContent[]>([]);
        const biography = ref<MultilingualContent[]>([]);

        const employments = ref<Employment[]>([]);
        const activeEmployments = ref<Employment[]>([]);
        const education = ref<Education[]>([]);
        const memberships = ref<Membership[]>([]);

        const canEdit = ref(false);

        const personIndicators = ref<EntityIndicatorResponse[]>();

        const loginStore = useLoginStore();

        const researchArea = ref<AssessmentResearchArea>();
        const researchSubAreas = ref<ResearchArea[]>([]);

        const personAssessments = ref<ResearcherAssessmentResponse[]>([]);

        const assessmentsLoading = ref(false);

        const shouldDisplayCollaborationNetworkFirst = ref(false);

        const displaySettings = usePersonChartDisplay(parseInt(currentRoute.params.id as string));

        const personId = computed(() => parseInt(currentRoute.params.id as string));

        onMounted(async () => {
            if ((currentRoute.query.displayCollaborationNetwork as string) === "true") {
                shouldDisplayCollaborationNetworkFirst.value = true;
                currentTab.value = "visualizations";
            }

            if (loginStore.userLoggedIn) {
                PersonService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                    canEdit.value = response.data;
                });
                
                fetchAssessmentResearchArea();
            }

            fetchPerson(true);
            StatisticsService.registerPersonView(parseInt(currentRoute.params.id as string));
            
            fetchIndicators();
            fetchAssessment("1970-01-01", ((new Date()).toISOString()).split("T")[0]);

            selectedPublicationTypes.value.splice(0);
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchIndicators = () => {
            EntityIndicatorService.fetchPersonIndicators(
                parseInt(currentRoute.params.id as string)
            ).then(response => {
                personIndicators.value = response.data;
            });
        };

        const fetchAssessment = (startDate: string, endDate: string) => {
            assessmentsLoading.value = true;
            personAssessments.value.splice(0);

            EntityClassificationService.fetchPersonAssessment(
                parseInt(currentRoute.params.id as string), 
                startDate, endDate
            ).then(response => {
                personAssessments.value = response.data;
                assessmentsLoading.value = false;
            });
        };

        const fetchPerson = (switchTab: boolean = false) => {
            PersonService.readPerson(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                person.value = response.data;

                injectFairSignposting(response.headers as AxiosResponseHeaders);

                document.title = `${person.value.personName.firstname} ${person.value.personName.lastname}`;

                if (response.data.personName.otherName !== null && response.data.personName.otherName !== "") {
                    researcherName.value =
                        `${response.data.personName.firstname} (${response.data.personName.otherName}) ${response.data.personName.lastname}`;
                } else {
                    researcherName.value =
                        `${response.data.personName.firstname} ${response.data.personName.lastname}`;
                }

                keywords.value = person.value.keyword;
                biography.value = person.value.biography;

                employments.value.splice(0);
                activeEmployments.value.splice(0);
                response.data.employmentIds.forEach(employmentId => {
                    InvolvementService.getEmployment(employmentId).then(response => {
                        employments.value.push(response.data);
                        if (!response.data.dateTo) {
                            activeEmployments.value.push(response.data);
                        }
                    });
                });

                education.value = [];
                response.data.educationIds.forEach(educationId => {
                    InvolvementService.getEducation(educationId).then(response => {
                        education.value.push(response.data);
                    });
                });

                memberships.value = [];
                response.data.membershipIds.forEach(membershipId => {
                    InvolvementService.getMembership(membershipId).then(response => {
                        memberships.value.push(response.data);
                    });
                });

                fetchPublications(switchTab);                
                populateData();
            }).catch(() => {
                router.push({ name: "notFound" });
            });
        };

        const fetchAssessmentResearchArea = () => {
            AssessmentResearchAreaService.readPersonAssessmentResearchArea(parseInt(currentRoute.params.id as string)).then(response => {
                researchArea.value = response.data;
                researchSubAreas.value = response.data.researchSubAreas;
            });
        };

        const populateData = () => {
            if (person.value === undefined) {
                return;
            }

            personalInfo.value = person.value.personalInfo;
            personalInfo.value.streetAndNumber = returnCurrentLocaleContent(person.value.personalInfo.postalAddress?.streetAndNumber as MultilingualContent[]);
            personalInfo.value.city = returnCurrentLocaleContent(person.value.personalInfo.postalAddress?.city as MultilingualContent[]);

            fetchAndSetCountryInfo();
        };

        const fetchAndSetCountryInfo = () => {
            if (person.value?.personalInfo.postalAddress?.countryId) {
                CountryService.readCountry(person.value?.personalInfo.postalAddress?.countryId as number).then((response) => {
                    country.value = response.data;
                    personalInfo.value.country = returnCurrentLocaleContent(response.data.name);
                });
            }

            if (person.value?.personalInfo.privatePostalAddress?.countryId) {
                CountryService.readCountry(person.value?.personalInfo.privatePostalAddress?.countryId as number).then((response) => {
                    countryPrivate.value = response.data;
                    personalInfo.value.countryPrivate = returnCurrentLocaleContent(response.data.name);
                });
            }
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPublications();
        };

        const fetchPublications = (switchTab: boolean = false) => {
            if (!person.value?.id) {
                return;
            }

            DocumentPublicationService.findResearcherPublications(
                person.value?.id as number,
                selectedPublicationTypes.value.map(publicationType => publicationType.value),
                `${publicationSearchParams.value}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`)
                .then((publicationResponse) => {
                    publications.value = publicationResponse.data.content;
                    totalPublications.value = publicationResponse.data.totalElements;

                    if (switchTab && totalPublications.value > 0 && !shouldDisplayCollaborationNetworkFirst.value) {
                        currentTab.value = "publications";
                    } else if (shouldDisplayCollaborationNetworkFirst.value) {
                        shouldDisplayCollaborationNetworkFirst.value = false;
                    }
                }
            );
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "persons", search: "simple" }});
        };

        const addExpertiseOrSkillProof = (proof: DocumentFile, expertiseOrSkill: ExpertiseOrSkillResponse) => {
            DocumentFileService.addExpertiseOrSkillProof(proof, expertiseOrSkill.id as number, person.value?.id as number).then((response => {
                expertiseOrSkill.proofs?.push(response.data);
            }));
        };

        const updateExpertiseOrSkillProof = (expertiseOrSkill: ExpertiseOrSkillResponse, proof: DocumentFile) => {
            DocumentFileService.updateExpertiseOrSkillProof(proof, person.value?.id as number).then((response) => {
                if (expertiseOrSkill.proofs) {
                    expertiseOrSkill.proofs = expertiseOrSkill.proofs.filter(proof => proof.id !== response.data.id);
                }
                expertiseOrSkill.proofs?.push(response.data);
            });
        };

        const deleteExpertiseOrSkillProof = (expertiseOrSkill: ExpertiseOrSkillResponse, proofId: number) => {
            DocumentFileService.deleteExpertiseOrSkillProof(proofId, expertiseOrSkill.id as number, person.value?.id as number).then(() => {
                if (expertiseOrSkill.proofs) {
                    expertiseOrSkill.proofs = expertiseOrSkill.proofs.filter(proof => proof.id !== proofId);
                }
            });
        };

        const updateKeywords = (updatedKeywords: MultilingualContent[]) => {
            keywords.value = updatedKeywords;
            PersonService.updateKeywords(person.value?.id as number, updatedKeywords).then(() => {
                updateSuccess();
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const updateBiography = (updatedBiography: MultilingualContent[]) => {
            biography.value = updatedBiography;
            PersonService.updateBiography(person.value?.id as number, updatedBiography).then(() => {
                updateSuccess();
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const updatePersonalInfo = (updatedInfo: PersonalInfo) => {
            PersonService.updatePersonalInfo(person.value?.id as number, updatedInfo).then(() => {
                fetchPerson();
                updateSuccess();
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const addInvolvement = (involvement: Education | Membership | Employment) => {
            if("title" in involvement) {
                InvolvementService.addEducation(involvement, person.value?.id as number).then(() => {
                    fetchPerson();
                    updateSuccess();
                }).catch(() => {
                    snackbarMessage.value = i18n.t("genericErrorMessage");
                    snackbar.value = true;
                });
            } else if("contributionDescription" in involvement) {
                InvolvementService.addMembership(involvement, person.value?.id as number).then(() => {
                    fetchPerson();
                    updateSuccess();
                }).catch(() => {
                    snackbarMessage.value = i18n.t("genericErrorMessage");
                    snackbar.value = true;
                });
            } else if("employmentPosition" in involvement) {
                InvolvementService.addEmployment(involvement, person.value?.id as number).then(() => {
                    fetchPerson();
                    updateSuccess();
                }).catch(() => {
                    snackbarMessage.value = i18n.t("genericErrorMessage");
                    snackbar.value = true;
                });
            }
        };

        const updateNames = async (personMainName: PersonName, otherNames: PersonName[]) => {
            try {
                await PersonService.updatePrimaryName(person.value?.id as number, personMainName);
                await PersonService.updateOtherNames(otherNames, person.value?.id as number);

                fetchPerson();
                updateSuccess();

                UserService.invalidateCaches();
                loginStore.emitReloadUsername();
            } catch (_error) {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            }
        };

        const selectPrimaryName = (personNameId: number) => {
            PersonService.selectPrimaryName(personNameId as number, person.value?.id as number).then(() => {
                fetchPerson();
                updateSuccess();

                UserService.invalidateCaches();
                loginStore.emitReloadUsername();
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const migrateToUnmanaged = () => {
            dialogRef.value?.toggle();
        };

        const performMigrationToUnmanaged = () => {
            PersonService.migrateToUnmanagedResearcher(person.value?.id as number).then(() => {
                router.push({name:"persons"});
            }).catch(error => {
                if (error.response.status === 409) {
                    snackbarMessage.value = i18n.t("researcherBindedMessage");
                    snackbar.value = true;
                }
            });
        };

        const performNavigation = (pageName: string) => {
            router.push({name: pageName});
        };

        const clearSortAndPerformPublicationSearch = (tokenParams: string) => {
            publicationSearchParams.value = tokenParams;
            publicationsRef.value?.setSortAndPageOption([], 1);
            page.value = 0;
            sort.value = "";
            direction.value = "";
            fetchPublications();
        };

        watch(selectedPublicationTypes, () => {
            fetchPublications();
        });

        const performIndicatorHarvest = async () => {
            ExternalIndicatorConfigurationService.harvestIndicatorsForPerson(person.value?.id as number);

            snackbarMessage.value = i18n.t("indicatorHarvestStartedMessage");
            snackbar.value = true;
        };

        const downloadRoCrateBibliography = () => {
            RoCrateService.downloadRoCrateBibliography(person.value?.id as number);
        };

        const updateSuccess = () => {
            snackbarMessage.value = i18n.t("updatedSuccessMessage");
            snackbar.value = true;
        };

        return {
            researcherName, person, personalInfo, keywords, loginStore, researchArea,
            biography, publications,  totalPublications, switchPage, searchKeyword, researchSubAreas,
            returnCurrentLocaleContent, canEdit, employments, education, memberships,
            addExpertiseOrSkillProof, updateExpertiseOrSkillProof, deleteExpertiseOrSkillProof,
            updateKeywords, updateBiography, updateNames, selectPrimaryName, getTitleFromValueAutoLocale,
            snackbar, snackbarMessage, updatePersonalInfo, addInvolvement, fetchPerson, localiseDate,
            currentTab, migrateToUnmanaged, performMigrationToUnmanaged, isAdmin,
            dialogRef, dialogMessage, personIndicators, StatisticsType, AssessmentResearchAreaForm,
            fetchAssessmentResearchArea, personAssessments, fetchAssessment, assessmentsLoading,
            ExportableEndpointType, isResearcher, performNavigation, ApplicableEntityType, publicationsRef,
            getEmploymentPositionTitleFromValueAutoLocale, fetchIndicators, clearSortAndPerformPublicationSearch,
            publicationSearchParams, publicationTypes, selectedPublicationTypes, activeEmployments, displaySettings,
            isInstitutionalEditor, performIndicatorHarvest, personId, downloadRoCrateBibliography,
            PersonFieldVisibilityConfigurationForm, updateSuccess, countryPrivate,
            EntityType,
            dataQualityTabsRef, showAssessmentDetails,
            personOtherNameModalRef, researchAreaModalRef, visibilityConfigModalRef,
            openModal
        };
}});
</script>

<style scoped>
    #researcher .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }
</style>
