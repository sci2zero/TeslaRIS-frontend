<template>
    <v-container id="researcher">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ researcherName }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("researcherLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Researcher Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-researcher-icon">
                    {{ accountIcon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <person-update-modal :preset-person="person" :read-only="!canEdit" @update="updatePersonalInfo"></person-update-modal>

                        <!-- Personal Info -->
                        <div class="mb-5">
                            <b>{{ $t("personalInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <div class="response">
                                    <person-other-name-modal :preset-other-names="person?.personOtherNames" :read-only="!canEdit" @update="updateOtherNames" @select-primary="selectPrimaryName"></person-other-name-modal>
                                </div>
                                <div v-if="personalInfo.localBirthDate">
                                    {{ $t("birthdateLabel") }}:
                                </div>
                                <div v-if="personalInfo.localBirthDate" class="response">
                                    {{ localiseDate(personalInfo.localBirthDate) }}
                                </div>
                                <div v-if="personalInfo.sex">
                                    {{ $t("sexLabel") }}:
                                </div>
                                <div v-if="personalInfo.sex" class="response">
                                    {{ getTitleFromValueAutoLocale(personalInfo.sex) }}
                                </div>
                                <div v-if="personalInfo.country">
                                    {{ $t("countryLabel") }}:
                                </div>
                                <div v-if="personalInfo.country" class="response">
                                    {{ personalInfo.country }}
                                </div>
                                <div>APVNT:</div>
                                <div class="response">
                                    {{ personalInfo.apvnt ? personalInfo.apvnt : $t("notYetSetMessage") }}
                                </div>
                                <div>eCRIS-ID:</div>
                                <div class="response">
                                    {{ personalInfo.eCrisId ? personalInfo.eCrisId : $t("notYetSetMessage") }}
                                </div>
                                <div>enaukaID:</div>
                                <div class="response">
                                    {{ personalInfo.eNaukaId ? personalInfo.eNaukaId : $t("notYetSetMessage") }}
                                </div>
                                <div>ORCID:</div>
                                <div class="response">
                                    {{ personalInfo.orcid ? personalInfo.orcid : $t("notYetSetMessage") }}
                                </div>
                                <div>Scopus Author ID:</div>
                                <div class="response">
                                    {{ personalInfo.scopusAuthorId ? personalInfo.scopusAuthorId : $t("notYetSetMessage") }}
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div v-if="personalInfo.streetAndNumber">
                                    {{ $t("streetAndNumberLabel") }}:
                                </div>
                                <div v-if="personalInfo.streetAndNumber" class="response">
                                    {{ personalInfo.streetAndNumber }}
                                </div>
                                <div v-if="personalInfo.city">
                                    {{ $t("cityLabel") }}:
                                </div>
                                <div v-if="personalInfo.city" class="response">
                                    {{ personalInfo.city }}
                                </div>
                                <div v-if="personalInfo.placeOfBrith">
                                    {{ $t("placeOfBirthLabel") }}:
                                </div>
                                <div v-if="personalInfo.placeOfBrith" class="response">
                                    {{ personalInfo.placeOfBrith }}
                                </div>
                                <div v-if="personalInfo.contact.contactEmail">
                                    {{ $t("emailLabel") }}:
                                </div>
                                <div v-if="personalInfo.contact.contactEmail" class="response">
                                    {{ personalInfo.contact.contactEmail }}
                                </div>
                                <div v-if="personalInfo.contact.phoneNumber">
                                    {{ $t("phoneNumberLabel") }}:
                                </div>
                                <div v-if="personalInfo.contact.phoneNumber" class="response">
                                    {{ personalInfo.contact.phoneNumber }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Keywords -->
        <keyword-list :keywords="keywords" :can-edit="canEdit" @search-keyword="searchKeyword($event)" @update="updateKeywords"></keyword-list>

        <!-- Biography -->
        <description-section :description="biography" :can-edit="canEdit" is-biography @update="updateBiography"></description-section>

        <v-row>
            <v-col cols="6">
                <!-- Expertises and Skills -->
                <expertise-or-skill-list :expertise-or-skills="person?.expertisesOrSkills" :person="person" :can-edit="canEdit" @crud="fetchPerson"></expertise-or-skill-list>
                <br />
                <!-- Prizes -->
                <prize-list :prizes="person?.prizes" :person="person" :can-edit="canEdit" @crud="fetchPerson"></prize-list>
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

        <!-- Publication Table -->
        <br />
        <publication-table-component :publications="publications" :total-publications="totalPublications" @switch-page="switchPage"></publication-table-component>
    
        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts">
import type { MultilingualContent, Country } from '@/models/Common';
import PersonService from '@/services/PersonService';
import CountryService from '@/services/CountryService';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import type { PersonResponse, ExpertiseOrSkillResponse, PersonalInfo, PersonName } from '@/models/PersonModel';
import { watch } from 'vue';
import PublicationTableComponent from '@/components/publication/PublicationTableComponent.vue';
import type { DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from "@/services/DocumentPublicationService";
import InvolvementService from '@/services/InvolvementService';
import type { Employment, Education, Membership } from '@/models/InvolvementModel';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { DocumentFile } from '@/models/DocumentFileModel';
import DocumentFileService from '@/services/DocumentFileService';
import KeywordList from '@/components/core/KeywordList.vue';
import DescriptionSection from '@/components/core/DescriptionSection.vue';
import PersonUpdateModal from '@/components/person/update/PersonUpdateModal.vue';
import PersonInvolvementModal from '@/components/person/involvement/PersonInvolvementModal.vue';
import InvolvementList from '@/components/person/involvement/InvolvementList.vue';
import PersonOtherNameModal from '@/components/person/otherName/PersonOtherNameModal.vue';
import PrizeList from '@/components/person/prize/PrizeList.vue';
import ExpertiseOrSkillList from '@/components/person/expertiseOrSkill/ExpertiseOrSkillList.vue';
import { localiseDate } from '@/i18n/dateLocalisation';
import { getTitleFromValueAutoLocale } from '@/i18n/sex';
import { getErrorMessageForErrorKey } from '@/i18n';
import StatisticsService from '@/services/StatisticsService';


export default defineComponent({
    name: "ResearcherLandingPage",
    components: { PublicationTableComponent, KeywordList, DescriptionSection, PersonUpdateModal, PersonInvolvementModal, InvolvementList, PersonOtherNameModal, PrizeList, ExpertiseOrSkillList },
    setup() {
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

        const i18n = useI18n();

        const researcherName = ref("");
        const accountIcon = ref('mdi-account-circle')

        const personalInfo = ref<any>({contact: {}});
        
        const keywords = ref<MultilingualContent[]>([]);
        const biography = ref<MultilingualContent[]>([]);

        const employments = ref<Employment[]>([]);
        const education = ref<Education[]>([]);
        const memberships = ref<Membership[]>([]);

        const canEdit = ref(false);

        onMounted(() => {
            PersonService.canEdit(parseInt(currentRoute.params.id as string)).then((response) => {
                canEdit.value = response.data;
            });

            fetchPerson();
            StatisticsService.registerPersonView(parseInt(currentRoute.params.id as string));
        });

        watch(i18n.locale, () => {
            populateData();
        });

        const fetchPerson = () => {
            PersonService.readPerson(parseInt(currentRoute.params.id as string)).then((response) => {
                person.value = response.data;

                document.title = `${person.value.personName.firstname} ${person.value.personName.lastname}`;

                if (response.data.personName.otherName !== null && response.data.personName.otherName !== "") {
                    researcherName.value = `${response.data.personName.firstname} ${response.data.personName.otherName} ${response.data.personName.lastname}`;
                } else {
                    researcherName.value = `${response.data.personName.firstname} ${response.data.personName.lastname}`;
                }

                keywords.value = person.value.keyword;
                biography.value = person.value.biography;

                employments.value = [];
                response.data.employmentIds.forEach(employmentId => {
                    InvolvementService.getEmployment(employmentId).then(response => {
                        employments.value.push(response.data);
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

                fetchPublications();                
                populateData();
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
            if (country.value !== undefined) {
                personalInfo.value.country = returnCurrentLocaleContent(country.value.name);
                return;
            }

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

        const fetchPublications = () => {
            if (!person.value?.id) {
                return;
            }

            DocumentPublicationService.findResearcherPublications(person.value?.id as number, `page=${page.value}&size=${size.value}&sort=${sort.value}`).then((publicationResponse) => {
                publications.value = publicationResponse.data.content;
                totalPublications.value = publicationResponse.data.totalElements
            });
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

        const updateOtherNames = (otherNames: PersonName[]) => {
            PersonService.updateOtherNames(otherNames, person.value?.id as number).then(() => {
                fetchPerson();
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
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

        return {
            researcherName, accountIcon, person, personalInfo, keywords,
            biography, publications,  totalPublications, switchPage, searchKeyword,
            returnCurrentLocaleContent, canEdit, employments, education, memberships,
            addExpertiseOrSkillProof, updateExpertiseOrSkillProof, deleteExpertiseOrSkillProof,
            updateKeywords, updateBiography, updateOtherNames, selectPrimaryName, getTitleFromValueAutoLocale,
            snackbar, snackbarMessage, updatePersonalInfo, addInvolvement, fetchPerson, localiseDate
        };
}})

</script>

<style scoped>
    #researcher .large-researcher-icon {
        font-size: 10em;
    }

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
