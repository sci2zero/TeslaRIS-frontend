<template>
    <v-container id="researcher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title>
                        <v-skeleton-loader
                            :loading="!person"
                            type="heading"
                            color="blue-lighten-3"
                            class="d-flex justify-center align-center"
                        >
                            <p class="text-h5">
                                {{ researcherName }}
                            </p>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ person?.personalInfo.displayTitle && person.personalInfo.displayTitle.length > 0 ? returnCurrentLocaleContent(person?.personalInfo.displayTitle) as string : $t("researcherLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Researcher Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <person-profile-image
                    :filename="person?.imageServerFilename"
                    :person-id="person?.id"
                    :can-edit="canEdit">
                </person-profile-image>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="PersonUpdateForm"
                            :form-props="{ presetPerson: person }"
                            entity-name="Person"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updatePersonalInfo"
                        />

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("personalInfoLabel") }}</b>
                        </div>
                        <basic-info-loader v-if="!person" :citation-button="false" />
                        <v-row v-else>
                            <v-col cols="6">
                                <div v-if="loginStore.userLoggedIn && personalInfo.localBirthDate">
                                    {{ $t("birthdateLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.localBirthDate" class="response">
                                    {{ localiseDate(personalInfo.localBirthDate) }}
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.sex">
                                    {{ $t("sexLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.sex" class="response">
                                    {{ getTitleFromValueAutoLocale(personalInfo.sex) }}
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.country">
                                    {{ $t("countryLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.country" class="response">
                                    {{ personalInfo.country }}
                                </div>
                                <div>APVNT:</div>
                                <div class="response">
                                    {{ personalInfo.apvnt ? personalInfo.apvnt : $t("notYetSetMessage") }}
                                </div>
                                <div>eCRIS-ID:</div>
                                <div class="response">
                                    <identifier-link v-if="personalInfo.eCrisId" :identifier="personalInfo.eCrisId" type="ecris"></identifier-link>
                                    <span v-else>
                                        {{ $t("notYetSetMessage") }}
                                    </span>
                                </div>
                                <div>enaukaID:</div>
                                <div class="response">
                                    {{ personalInfo.eNaukaId ? personalInfo.eNaukaId : $t("notYetSetMessage") }}
                                </div>
                                <div>ORCID:</div>
                                <div v-if="personalInfo.orcid" class="response">
                                    <identifier-link :identifier="personalInfo.orcid" type="orcid"></identifier-link>
                                </div>
                                <div v-else class="response">
                                    {{ $t("notYetSetMessage") }}
                                </div>
                                <div>Scopus Author ID:</div>
                                <div class="response">
                                    <identifier-link v-if="personalInfo.scopusAuthorId" :identifier="personalInfo.scopusAuthorId" type="scopus_author"></identifier-link>
                                    <span v-else>
                                        {{ $t("notYetSetMessage") }}
                                    </span>
                                </div>
                                <div>Open Alex ID:</div>
                                <div class="response">
                                    <identifier-link v-if="personalInfo.openAlexId" :identifier="personalInfo.openAlexId" type="open_alex"></identifier-link>
                                    <span v-else>
                                        {{ $t("notYetSetMessage") }}
                                    </span>
                                </div>
                                <div>ResearcherID (WoS):</div>
                                <div class="response">
                                    <identifier-link v-if="personalInfo.webOfScienceResearcherId" :identifier="personalInfo.webOfScienceResearcherId" type="researcher_id"></identifier-link>
                                    <span v-else>
                                        {{ $t("notYetSetMessage") }}
                                    </span>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="loginStore.userLoggedIn && personalInfo.streetAndNumber">
                                    {{ $t("streetAndNumberLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.streetAndNumber" class="response">
                                    {{ personalInfo.streetAndNumber }}
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.city">
                                    {{ $t("cityLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.city" class="response">
                                    {{ personalInfo.city }}
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.placeOfBirth">
                                    {{ $t("placeOfBirthLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.placeOfBirth" class="response">
                                    {{ personalInfo.placeOfBirth }}
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.contact.contactEmail">
                                    {{ $t("emailLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.contact.contactEmail" class="response">
                                    <identifier-link :identifier="personalInfo.contact.contactEmail" type="email"></identifier-link>
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.contact.phoneNumber">
                                    {{ $t("phoneNumberLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn && personalInfo.contact.phoneNumber" class="response">
                                    {{ personalInfo.contact.phoneNumber }}
                                </div>
                                <div v-if="loginStore.userLoggedIn">
                                    {{ $t("researchAreaLabel") }}:
                                </div>
                                <div v-if="loginStore.userLoggedIn" class="response">
                                    {{ researchArea ? returnCurrentLocaleContent(researchArea.name) : $t("notYetSetMessage") }}
                                </div>
                                <div v-if="person?.personalInfo.uris && person.personalInfo.uris.length > 0">
                                    {{ $t("websiteLabel") }}:
                                </div>
                                <div class="response">
                                    <uri-list :uris="person?.personalInfo.uris"></uri-list>
                                </div>
                                <div v-if="activeEmployments.length > 0">
                                    {{ $t("employmentsLabel") }}:
                                </div>
                                <div v-for="employment in activeEmployments.slice(0, 3)" :key="employment.id" class="response">
                                    <localized-link
                                        v-if="employment.organisationUnitId"
                                        :to="'organisation-units/' + employment.organisationUnitId">
                                        <strong>{{ returnCurrentLocaleContent(employment.organisationUnitName) }} {{ employment.employmentPosition ? `(${getEmploymentPositionTitleFromValueAutoLocale(employment.employmentPosition)})` : "" }}</strong>
                                    </localized-link>
                                    <p v-else>
                                        {{ returnCurrentLocaleContent(employment.affiliationStatement) }} {{ employment.employmentPosition ? `(${getEmploymentPositionTitleFromValueAutoLocale(employment.employmentPosition)})` : "" }}
                                    </p>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    
        <div class="actions-box pa-4">
            <div class="text-subtitle-1 font-weight-medium mb-3">
                {{ $t("additionalActionsLabel") }}
            </div>
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
                    :form-props="{ personId: person?.id, presetResearchArea: researchArea }"
                    entity-name="ResearchArea"
                    is-update compact
                    primary-color outlined
                    :read-only="!canEdit"
                    @update="fetchAssessmentResearchArea"
                />
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
            </div>
        </div>

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
        </v-tabs>

        <v-tabs-window
            v-if="person"
            v-model="currentTab"
        >
            <v-tabs-window-item value="publications">
                <search-bar-component
                    class="mt-5"
                    @search="clearSortAndPerformPublicationSearch($event)"
                />
                <div class="mb-5 mt-5">
                    <add-publication-menu v-if="canEdit" compact />
                    <v-btn
                        v-if="isResearcher && canEdit"
                        class="ml-2" color="primary" density="compact"
                        @click="performNavigation('importer')">
                        {{ $t("importerLabel") }}
                    </v-btn>
                </div>
                <v-select
                    v-model="selectedPublicationTypes"
                    :items="publicationTypes"
                    :label="$t('typeOfPublicationLabel')"
                    return-object
                    class="publication-type-select mt-3"
                    multiple
                ></v-select>
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
                                <involvement-list :involvements="employments" :person="person" :can-edit="canEdit" @refresh-involvements="fetchPerson"></involvement-list>
                                <div v-if="education.length > 0">
                                    <v-divider class="mb-5"></v-divider><h3>{{ $t("educationLabel") }}</h3>
                                </div>
                                <br />
                                <involvement-list :involvements="education" :person="person" :can-edit="canEdit" @refresh-involvements="fetchPerson"></involvement-list>
                                <div v-if="memberships.length > 0">
                                    <v-divider class="mb-5"></v-divider><h3>{{ $t("membershipsLabel") }}</h3>
                                </div>
                                <br />
                                <involvement-list :involvements="memberships" :person="person" :can-edit="canEdit" @refresh-involvements="fetchPerson"></involvement-list>
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
        </v-tabs-window>

        <persistent-question-dialog
            ref="dialogRef"
            :title="$t('areYouSureLabel')"
            :message="dialogMessage"
            @continue="performMigrationToUnmanaged">
        </persistent-question-dialog>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
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
import IdentifierLink from '@/components/core/IdentifierLink.vue';
import UriList from '@/components/core/UriList.vue';
import PersonUpdateForm from '@/components/person/update/PersonUpdateForm.vue';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';
import PersonProfileImage from '@/components/person/PersonProfileImage.vue';
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
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import { getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import BasicInfoLoader from '@/components/core/BasicInfoLoader.vue';
import TabContentLoader from '@/components/core/TabContentLoader.vue';
import IndicatorsSection from '@/components/assessment/indicators/IndicatorsSection.vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import { getPublicationTypesForGivenLocale } from '@/i18n/publicationType';
import { injectFairSignposting } from '@/utils/FairSignpostingHeadUtil';
import { type AxiosResponseHeaders } from 'axios';


export default defineComponent({
    name: "ResearcherLandingPage",
    components: { PublicationTableComponent, KeywordList, Toast, DescriptionSection, GenericCrudModal, PersonInvolvementModal, InvolvementList, PersonOtherNameModal, PrizeList, ExpertiseOrSkillList, IdentifierLink, UriList, PersistentQuestionDialog, PersonProfileImage, PersonAssessmentsView, AddPublicationMenu, LocalizedLink, BasicInfoLoader, TabContentLoader, IndicatorsSection, SearchBarComponent },
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

        const { isAdmin, isResearcher } = useUserRole();

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

        const personAssessments = ref<ResearcherAssessmentResponse[]>([]);

        const assessmentsLoading = ref(false);

        onMounted(() => {
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
            publicationTypes.value?.forEach(publicationType => {
                selectedPublicationTypes.value.push(
                    {title: publicationType.title, value: publicationType.value}
                );
            });
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

                    if (switchTab && totalPublications.value > 0) {
                        currentTab.value = "publications";
                    }
                }
            );
        };

        const searchKeyword = (keyword: string) => {
            router.push({name:"advancedSearch", query: { searchQuery: keyword.trim(), tab: "persons" }});
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

        return {
            researcherName, person, personalInfo, keywords, loginStore, researchArea,
            biography, publications,  totalPublications, switchPage, searchKeyword,
            returnCurrentLocaleContent, canEdit, employments, education, memberships,
            addExpertiseOrSkillProof, updateExpertiseOrSkillProof, deleteExpertiseOrSkillProof,
            updateKeywords, updateBiography, updateNames, selectPrimaryName, getTitleFromValueAutoLocale,
            snackbar, snackbarMessage, updatePersonalInfo, addInvolvement, fetchPerson, localiseDate,
            currentTab, PersonUpdateForm, migrateToUnmanaged, performMigrationToUnmanaged, isAdmin,
            dialogRef, dialogMessage, personIndicators, StatisticsType, AssessmentResearchAreaForm,
            fetchAssessmentResearchArea, personAssessments, fetchAssessment, assessmentsLoading,
            ExportableEndpointType, isResearcher, performNavigation, ApplicableEntityType, publicationsRef,
            getEmploymentPositionTitleFromValueAutoLocale, fetchIndicators, clearSortAndPerformPublicationSearch,
            publicationSearchParams, publicationTypes, selectedPublicationTypes, activeEmployments
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

    .publication-type-select {
        max-width: 500px;
    }

</style>
