<template>
    <div id="researcher" class="mx-auto max-w-7xl w-full py-12">
        <ResearcherLandingHeader 
            :person="person"
            :researcher-name="researcherName"
            :employments="employments"
            :can-edit="canEdit"
            :research-area="researchArea"
            :country-name="personalInfo.country"
            @update="updatePersonalInfo"
        >
            <template #actions>
                <div class="mt-4">
                    <div class="d-flex flex-wrap gap-2">
                        <person-other-name-modal
                            :preset-person="person"
                            :read-only="!canEdit"
                            @update="updateNames"
                            @select-primary="selectPrimaryName"
                        />
                        <generic-crud-modal
                            class="ml-2" 
                            :form-component="AssessmentResearchAreaForm"
                            :form-props="{ personId: person?.id, presetResearchArea: researchArea, researchAreasHierarchy: researchSubAreas }"
                            entity-name="ResearchArea"
                            is-update compact
                            primary-color outlined
                            :read-only="!canEdit"
                            @update="fetchAssessmentResearchArea"
                        />
                        <v-btn
                            v-if="canEdit"
                            class="mb-5 ml-2" color="primary" density="compact"
                            variant="outlined"
                            @click="downloadRoCrateBibliography">
                            {{ $t("downloadRoCrateBibliographyLabel") }}
                        </v-btn>
                        <v-btn
                            v-if="isResearcher && canEdit"
                            class="mb-5 ml-2" color="primary" density="compact"
                            variant="outlined"
                            @click="performNavigation('documentClaim')">
                            {{ $t("documentClaimLabel") }}
                        </v-btn>
                        <v-btn
                            v-if="isResearcher && canEdit"
                            class="mb-5 ml-2" color="primary" density="compact"
                            variant="outlined"
                            @click="performNavigation('massInstitutionAssignment')">
                            {{ $t("massInstitutionAssignmentLabel") }}
                        </v-btn>
                        <v-btn
                            v-if="isResearcher && canEdit"
                            class="mb-5 ml-2" color="primary" density="compact"
                            variant="outlined"
                            @click="performNavigation('importer')">
                            {{ $t("importerLabel") }}
                        </v-btn>
                        <v-btn
                            v-if="(isAdmin || isInstitutionalEditor) && canEdit"
                            class="mb-5 ml-2" color="primary" density="compact"
                            variant="outlined"
                            @click="performIndicatorHarvest">
                            {{ $t("harvestExternalIndicatorsLabel") }}
                        </v-btn>
                    </div>
                </div>
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
        >
            <v-tab value="publications">
                {{ $t("scientificResultsListLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
            <v-tab v-if="personIndicators?.length > 0" value="indicators">
                {{ $t("indicatorListLabel") }}
            </v-tab>
            <v-tab v-if="personAssessments?.length > 0" value="assessments">
                {{ $t("assessmentsLabel") }}
            </v-tab>
            <v-tab value="visualizations">
                {{ $t("visualizationsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window
            v-if="person"
            v-model="currentTab"
        >
            <v-tabs-window-item value="publications">
                <h3 class="mt-4 text-2xl lg:text-3xl font-serif font-bold text-slate-800">
                    Naučni Rezultati
                </h3>
                <div class="flex justify-between gap-2 mt-4">
                    <div class="flex gap-2 items-center w-full">
                        <search-bar-component
                            :transparent="false"
                            size="small"
                            @search="clearSortAndPerformPublicationSearch($event)"
                        />
                        <v-select
                            v-model="selectedPublicationTypes"
                            :items="publicationTypes"
                            :label="$t('typeOfPublicationLabel')"
                            return-object
                            class="max-w-xs mt-5"
                            multiple
                        ></v-select>
                    </div>
                    <div class="mb-5 mt-5">
                        <add-publication-menu
                            v-if="canEdit"
                            :person-id="isResearcher ? undefined : personId"
                            compact
                        />
                        <v-btn
                            v-if="isResearcher && canEdit"
                            class="mt-2" color="primary" density="compact"
                            @click="performNavigation('importer')">
                            {{ $t("importerLabel") }}
                        </v-btn>
                    </div>
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
            </v-tabs-window-item>
            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="keywords"
                    :can-edit="canEdit"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords">
                </keyword-list>

                <!-- Biography -->
                <description-section
                    :description="biography"
                    :can-edit="canEdit"
                    is-biography
                    @update="updateBiography">
                </description-section>

                <v-row>
                    <v-col cols="6">
                        <!-- Expertises and Skills -->
                        <expertise-or-skill-list
                            :expertise-or-skills="person?.expertisesOrSkills"
                            :person="person"
                            :can-edit="canEdit"
                            @crud="fetchPerson">
                        </expertise-or-skill-list>
                        
                        <br />

                        <!-- Prizes -->
                        <prize-list
                            :prizes="person?.prizes"
                            :person="person"
                            :can-edit="canEdit"
                            @crud="fetchPerson">
                        </prize-list>
                    </v-col>


                    <!-- Involvements -->
                    <v-col cols="6">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <person-involvement-modal :read-only="!canEdit" @create="addInvolvement"></person-involvement-modal>

                                <div><h2>{{ $t("involvementsLabel") }}</h2></div>
                                <strong v-if="employments.length === 0 && education.length === 0 && memberships.length === 0">{{ $t("notYetSetMessage") }}</strong>
                                <br />
                                <div v-if="employments.length > 0">
                                    <h3>{{ $t("employmentsLabel") }}</h3>
                                </div>
                                <br />
                                <involvement-list
                                    :involvements="employments"
                                    :person="person"
                                    :can-edit="canEdit"
                                    @refresh-involvements="fetchPerson">
                                </involvement-list>
                                <div v-if="education.length > 0">
                                    <v-divider class="mb-5"></v-divider><h3>{{ $t("educationLabel") }}</h3>
                                </div>
                                <br />
                                <involvement-list
                                    :involvements="education"
                                    :person="person"
                                    :can-edit="canEdit"
                                    @refresh-involvements="fetchPerson">
                                </involvement-list>
                                <div v-if="memberships.length > 0">
                                    <v-divider class="mb-5"></v-divider><h3>{{ $t("membershipsLabel") }}</h3>
                                </div>
                                <br />
                                <involvement-list
                                    :involvements="memberships"
                                    :person="person"
                                    :can-edit="canEdit"
                                    @refresh-involvements="fetchPerson">
                                </involvement-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <v-btn
                    v-if="isAdmin" 
                    density="compact" class="mt-5" 
                    color="blue darken-1"
                    @click="migrateToUnmanaged">
                    {{ $t("migrateToUnmanagedResearcherLabel") }}
                </v-btn>
            </v-tabs-window-item>
            <v-tabs-window-item value="indicators">
                <indicators-section 
                    :indicators="personIndicators" 
                    :applicable-types="[ApplicableEntityType.PERSON]" 
                    :entity-id="person?.id"
                    :entity-type="ApplicableEntityType.PERSON" 
                    :can-edit="false"
                    show-statistics
                    @updated="fetchIndicators"
                />
            </v-tabs-window-item>
            <v-tabs-window-item value="assessments">
                <person-assessments-view
                    :assessments="personAssessments"
                    :is-loading="assessmentsLoading"
                    @fetch="fetchAssessment">
                </person-assessments-view>
            </v-tabs-window-item>
            <v-tabs-window-item value="visualizations">
                <person-visualizations
                    :person-id="(person.id as number)"
                    :display-settings="displaySettings.displaySettings.value"
                    :display-publications-tab="displaySettings.shouldDisplayPublicationTab()"
                    :display-type-ratios-tab="displaySettings.shouldDisplayTypeTab()"
                    :display-citations-tab="displaySettings.shouldDisplayCitationsTab()"
                    :display-statistics-tab="displaySettings.shouldDisplayStatisticsTab()"
                />
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
import { computed, onMounted } from 'vue';
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
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import PersonInvolvementModal from '@/components/person/involvement/PersonInvolvementModal.vue';
import InvolvementList from '@/components/person/involvement/InvolvementList.vue';
import PersonOtherNameModal from '@/components/person/otherName/PersonOtherNameModal.vue';
import PrizeList from '@/components/person/prize/PrizeList.vue';
import ExpertiseOrSkillList from '@/components/person/expertiseOrSkill/ExpertiseOrSkillList.vue';
import { localiseDate } from '@/utils/DateUtil';
import { getTitleFromValueAutoLocale } from '@/i18n/sex';
import { getErrorMessageForErrorKey } from '@/i18n';
import PersonUpdateForm from '@/components/person/update/PersonUpdateForm.vue';
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


export default defineComponent({
    name: "ResearcherLandingPage",
    components: { PublicationTableComponent, KeywordList, Toast, DescriptionSection, GenericCrudModal, PersonInvolvementModal, InvolvementList, PersonOtherNameModal, PrizeList, ExpertiseOrSkillList, PersistentQuestionDialog, PersonAssessmentsView, AddPublicationMenu, TabContentLoader, IndicatorsSection, SearchBarComponent, PersonVisualizations, ResearcherLandingHeader, ResearcherFeaturedIndicators },
    setup() {
        const currentTab = ref("additionalInfo");

        const dialogRef = ref<typeof PersistentQuestionDialog>();
        const dialogMessage = computed(() => i18n.t("migrateToUnmanagedMessage"));

        const snackbar = ref(false);
        const snackbarMessage = ref("");
        
        const router = useRouter();
        const currentRoute = useRoute();

        const person = ref<PersonResponse>();
        const country = ref<Country>();

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

        const personIndicators = ref<EntityIndicatorResponse[]>([]);

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
            EntityClassificationService.fetchPersonAssessment(parseInt(currentRoute.params.id as string), startDate, endDate).then(response => {
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
            if (person.value?.personalInfo.postalAddress?.countryId === null) {
                return;
            }

            CountryService.readCountry(person.value?.personalInfo.postalAddress?.countryId as number).then((response) => {
                country.value = response.data;
                personalInfo.value.country = returnCurrentLocaleContent(response.data.name);
            });
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
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const updateBiography = (updatedBiography: MultilingualContent[]) => {
            biography.value = updatedBiography;
            PersonService.updateBiography(person.value?.id as number, updatedBiography).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const updatePersonalInfo = (updatedInfo: PersonalInfo) => {
            PersonService.updatePersonalInfo(person.value?.id as number, updatedInfo).then(() => {
                fetchPerson();
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
            }).catch((error) => {
                snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const addInvolvement = (involvement: Education | Membership | Employment) => {
            if("title" in involvement) {
                InvolvementService.addEducation(involvement, person.value?.id as number).then(() => {
                    fetchPerson();
                    snackbarMessage.value = i18n.t("updatedSuccessMessage");
                    snackbar.value = true;
                }).catch(() => {
                    snackbarMessage.value = i18n.t("genericErrorMessage");
                    snackbar.value = true;
                });
            } else if("contributionDescription" in involvement) {
                InvolvementService.addMembership(involvement, person.value?.id as number).then(() => {
                    fetchPerson();
                    snackbarMessage.value = i18n.t("updatedSuccessMessage");
                    snackbar.value = true;
                }).catch(() => {
                    snackbarMessage.value = i18n.t("genericErrorMessage");
                    snackbar.value = true;
                });
            } else if("employmentPosition" in involvement) {
                InvolvementService.addEmployment(involvement, person.value?.id as number).then(() => {
                    fetchPerson();
                    snackbarMessage.value = i18n.t("updatedSuccessMessage");
                    snackbar.value = true;
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
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
            } catch (_error) {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            }
        };

        const selectPrimaryName = (personNameId: number) => {
            PersonService.selectPrimaryName(personNameId as number, person.value?.id as number).then(() => {
                fetchPerson();
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
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

        return {
            researcherName, person, personalInfo, keywords, loginStore, researchArea,
            biography, publications,  totalPublications, switchPage, searchKeyword, researchSubAreas,
            returnCurrentLocaleContent, canEdit, employments, education, memberships,
            addExpertiseOrSkillProof, updateExpertiseOrSkillProof, deleteExpertiseOrSkillProof,
            updateKeywords, updateBiography, updateNames, selectPrimaryName, getTitleFromValueAutoLocale,
            snackbar, snackbarMessage, updatePersonalInfo, addInvolvement, fetchPerson, localiseDate,
            currentTab, PersonUpdateForm, migrateToUnmanaged, performMigrationToUnmanaged, isAdmin,
            dialogRef, dialogMessage, personIndicators, StatisticsType, AssessmentResearchAreaForm,
            fetchAssessmentResearchArea, personAssessments, fetchAssessment, assessmentsLoading,
            ExportableEndpointType, isResearcher, performNavigation, ApplicableEntityType, publicationsRef,
            getEmploymentPositionTitleFromValueAutoLocale, fetchIndicators, clearSortAndPerformPublicationSearch,
            publicationSearchParams, publicationTypes, selectedPublicationTypes, activeEmployments, displaySettings,
            isInstitutionalEditor, performIndicatorHarvest, personId, downloadRoCrateBibliography
        };
}});
</script>

<style scoped>

    #researcher .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }

    .edit-pen-container .edit-pen {
        top: 0px;
        right: 0px;
        position: absolute;
        z-index: 10;
        opacity: 0;
    }

    .edit-pen-container:hover .edit-pen {
        opacity: 0.3;
    }

    .edit-pen-container .edit-pen:hover {
        opacity: 1;
    }


</style>
