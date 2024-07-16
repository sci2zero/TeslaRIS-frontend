<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ `${leftPerson?.personName.firstname} ${leftPerson?.personName.lastname}` }}
                </h2>
                <br />

                <person-update-form ref="updateLeftRef" :preset-person="leftPerson" @update="updateLeft"></person-update-form>

                <description-or-biography-update-form ref="updateLeftBioRef" :preset-description-or-biography="leftPerson?.biography ? leftPerson?.biography : []" @update="updateLeftBiography"></description-or-biography-update-form>

                <keyword-update-form ref="updateleftKeywordsRef" :preset-keywords="leftPerson?.keyword ? leftPerson?.keyword : []" @update="updateLeftKeywords"></keyword-update-form>

                <br />

                <!-- Left Involvement Lists -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><h2>{{ $t("involvementsLabel") }}</h2></div>
                        <strong v-if="leftEmployments.length === 0 && leftEducation.length === 0 && leftMemberships.length === 0">{{ $t("notYetSetMessage") }}</strong>
                        <br />
                        <div v-if="leftEmployments.length > 0">
                            <h3>{{ $t("employmentsLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list :involvements="leftEmployments" :person="leftPerson" in-comparator drag-group="employments"></involvement-list>
                        <div v-if="leftEducation.length > 0">
                            <v-divider class="mb-5"></v-divider><h3>{{ $t("educationLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list :involvements="leftEducation" :person="leftPerson" in-comparator drag-group="education"></involvement-list>
                        <div v-if="leftMemberships.length > 0">
                            <v-divider class="mb-5"></v-divider><h3>{{ $t("membershipsLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list :involvements="leftMemberships" :person="leftPerson" in-comparator drag-group="memberships"></involvement-list>
                    </v-card-text>
                </v-card>

                <br />
                <expertise-or-skill-list :expertise-or-skills="leftPerson?.expertisesOrSkills" :person="leftPerson" in-comparator></expertise-or-skill-list>

                <br />
                <prize-list :prizes="leftPerson?.prizes" :person="leftPerson" in-comparator></prize-list>
            </v-col>

            <v-col cols="1">
                <v-btn class="mb-1 middle-arrow" icon @click="moveAll(true)">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn class="mt-1 middle-arrow" icon @click="moveAll(false)">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
            </v-col>
            
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ `${rightPerson?.personName.firstname} ${rightPerson?.personName.lastname}` }}
                </h2>

                <br />

                <person-update-form ref="updateRightRef" :preset-person="rightPerson" @update="updateRight"></person-update-form>

                <description-or-biography-update-form ref="updateRightBioRef" :preset-description-or-biography="rightPerson?.biography ? rightPerson?.biography : []" @update="updateRightBiography"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="rightPerson?.keyword ? rightPerson?.keyword : []" @update="updateRightKeywords"></keyword-update-form>

                <br />

                <!-- Right Involvement Lists -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <div><h2>{{ $t("involvementsLabel") }}</h2></div>
                        <strong v-if="rightEmployments.length === 0 && rightEducation.length === 0 && rightMemberships.length === 0">{{ $t("notYetSetMessage") }}</strong>
                        <br />
                        <div v-if="rightEmployments.length > 0">
                            <h3>{{ $t("employmentsLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list :involvements="rightEmployments" :person="rightPerson" in-comparator drag-group="employments"></involvement-list>
                        <div v-if="rightEducation.length > 0">
                            <v-divider class="mb-5"></v-divider><h3>{{ $t("educationLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list :involvements="rightEducation" :person="rightPerson" in-comparator drag-group="education"></involvement-list>
                        <div v-if="rightMemberships.length > 0">
                            <v-divider class="mb-5"></v-divider><h3>{{ $t("membershipsLabel") }}</h3>
                        </div>
                        <br />
                        <involvement-list :involvements="rightMemberships" :person="rightPerson" in-comparator drag-group="memberships"></involvement-list>
                    </v-card-text>
                </v-card>
                
                <br />
                <expertise-or-skill-list :expertise-or-skills="rightPerson?.expertisesOrSkills" :person="rightPerson" in-comparator></expertise-or-skill-list>
            
                <br />
                <prize-list :prizes="rightPerson?.prizes" :person="rightPerson" in-comparator></prize-list>
            </v-col>
        </v-row>

        <v-row class="d-flex flex-row justify-center">
            <v-btn color="blue darken-1" @click="updateAll">
                {{ $t("updateLabel") }}
            </v-btn>
        </v-row>

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
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import PersonUpdateForm from '@/components/person/update/PersonUpdateForm.vue';
import InvolvementList from '@/components/person/involvement/InvolvementList.vue';
import PersonService from '@/services/PersonService';
import type { ExpertiseOrSkillResponse, PersonResponse, PersonalInfo, PrizeResponse } from '@/models/PersonModel';
import InvolvementService from '@/services/InvolvementService';
import type { Education, Employment, Membership } from '@/models/InvolvementModel';
import ExpertiseOrSkillList from '@/components/person/expertiseOrSkill/ExpertiseOrSkillList.vue';
import PrizeList from '@/components/person/prize/PrizeList.vue';
import DescriptionOrBiographyUpdateForm from '@/components/core/update/DescriptionOrBiographyUpdateForm.vue';
import KeywordUpdateForm from '@/components/core/update/KeywordUpdateForm.vue';


export default defineComponent({
    name: "PersonMetadataComparator",
    components: { PersonUpdateForm, InvolvementList, ExpertiseOrSkillList, PrizeList, DescriptionOrBiographyUpdateForm, KeywordUpdateForm },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();

        const leftPerson = ref<PersonResponse>();
        const leftEmployments = ref<Employment[]>([]);
        const leftEducation = ref<Education[]>([]);
        const leftMemberships = ref<Membership[]>([]);

        const rightPerson = ref<PersonResponse>();
        const rightEmployments = ref<Employment[]>([]);
        const rightEducation = ref<Education[]>([]);
        const rightMemberships = ref<Membership[]>([]);

        const updateLeftRef = ref<typeof PersonUpdateForm>();
        const updateRightRef = ref<typeof PersonUpdateForm>();
        

        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("personMetadataComparatorLabel");
            fetchPersons();
        });

        const fetchPersons = () => {
            PersonService.readPerson(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftPerson.value = response.data;
                fetchLeftDetails();
            });

            PersonService.readPerson(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightPerson.value = response.data;
                fetchRightDetails();
            });
        };

        const fetchLeftDetails = () => {
            leftEmployments.value = [];
            leftPerson.value?.employmentIds.forEach(employmentId => {
                InvolvementService.getEmployment(employmentId).then(response => {
                    leftEmployments.value.push(response.data);
                });
            });

            leftEducation.value = [];
            leftPerson.value?.educationIds.forEach(educationId => {
                InvolvementService.getEducation(educationId).then(response => {
                    leftEducation.value.push(response.data);
                });
            });

            leftMemberships.value = [];
            leftPerson.value?.membershipIds.forEach(membershipId => {
                InvolvementService.getMembership(membershipId).then(response => {
                    leftMemberships.value.push(response.data);
                });
            });
        };

        const fetchRightDetails = () => {
            rightEmployments.value = [];
            rightPerson.value?.employmentIds.forEach(employmentId => {
                InvolvementService.getEmployment(employmentId).then(response => {
                    rightEmployments.value.push(response.data);
                });
            });

            rightEducation.value = [];
            rightPerson.value?.educationIds.forEach(educationId => {
                InvolvementService.getEducation(educationId).then(response => {
                    rightEducation.value.push(response.data);
                });
            });

            rightMemberships.value = [];
            rightPerson.value?.membershipIds.forEach(membershipId => {
                InvolvementService.getMembership(membershipId).then(response => {
                    rightMemberships.value.push(response.data);
                });
            });
        };

        const mergePersonMetadata = (person1: PersonalInfo, person2: PersonalInfo) => {
            person2.postalAddress?.city.forEach(city => {
                let merged = false;
                person1.postalAddress?.city.forEach(currentCity => {
                    if (currentCity.languageTag === city.languageTag) {
                        currentCity.content += " | " + city.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    person1.postalAddress?.city.push(city);
                }
            });
            person2.postalAddress!.city = [];

            person2.postalAddress?.streetAndNumber.forEach(streetAndNumber => {
                let merged = false;
                person1.postalAddress?.streetAndNumber.forEach(currentStreetAndNumber => {
                    if (currentStreetAndNumber.languageTag === streetAndNumber.languageTag) {
                        currentStreetAndNumber.content += " | " + streetAndNumber.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    person1.postalAddress?.streetAndNumber.push(streetAndNumber);
                }
            });
            person2.postalAddress!.streetAndNumber = [];

            person1.placeOfBirth = person2.placeOfBirth;
            person2.placeOfBirth = "";
            person1.localBirthDate = person2.localBirthDate;
            person2.localBirthDate = "";
            person1.orcid = person2.orcid;
            person2.orcid = "";
            person1.eCrisId = person2.eCrisId;
            person2.eCrisId = "";
            person1.eNaukaId = person2.eNaukaId;
            person2.eNaukaId = "";
            person1.apvnt = person2.apvnt;
            person2.apvnt = "";
            person1.scopusAuthorId = person2.scopusAuthorId;
            person2.scopusAuthorId = "";
            person1.contact.contactEmail = person2.contact.contactEmail;
            person2.contact.contactEmail = "";
            person1.contact.phoneNumber = person2.contact.phoneNumber;
            person2.contact.phoneNumber = "";

            person1.postalAddress!.countryId = person2.postalAddress?.countryId as number;

            person1.sex = person2.sex;

            return [person1, person2];
        };

        const mergePersonCollectionAttributes = (person1: PersonResponse, person2: PersonResponse) => {
            person1.expertisesOrSkills = person1.expertisesOrSkills.concat(person2.expertisesOrSkills) as ExpertiseOrSkillResponse[];
            person2.expertisesOrSkills = [];

            person1.prizes = person1.prizes.concat(person2.prizes) as PrizeResponse[];
            person2.prizes = [];

            person1.employmentIds = person1.employmentIds.concat(person2.employmentIds) as number[];
            person2.employmentIds = [];

            person1.educationIds = person1.educationIds.concat(person2.educationIds) as number[];
            person2.educationIds = [];

            person1.membershipIds = person1.membershipIds.concat(person2.membershipIds) as number[];
            person2.membershipIds = [];

            return [person1, person2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.updatePerson();
            updateRightRef.value?.updatePerson();

            if (fromLeftToRight) {
                [rightPerson.value!.personalInfo, leftPerson.value!.personalInfo] = mergePersonMetadata(rightPerson.value?.personalInfo as PersonalInfo, leftPerson.value?.personalInfo as PersonalInfo);
                [rightPerson.value, leftPerson.value] = mergePersonCollectionAttributes(rightPerson.value as PersonResponse, leftPerson.value as PersonResponse);
            } else {
                [leftPerson.value!.personalInfo, rightPerson.value!.personalInfo] = mergePersonMetadata(leftPerson.value?.personalInfo as PersonalInfo, rightPerson.value?.personalInfo as PersonalInfo);
                [leftPerson.value, rightPerson.value] = mergePersonCollectionAttributes(leftPerson.value as PersonResponse, rightPerson.value as PersonResponse);
            }

            fetchLeftDetails();
            fetchRightDetails();

            updateLeftRef.value?.refreshForm();
            updateRightRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (updatedPersonalInfo: PersonalInfo) => {
            leftPerson.value!.personalInfo = updatedPersonalInfo;
            leftUpdateComplete.value = true;
            
            if (update.value) {
                finishUpdates();
            }
        };

        const updateRight = (updatedPersonalInfo: PersonalInfo) => {
            rightPerson.value!.personalInfo = updatedPersonalInfo;
            rightUpdateComplete.value = true;
            
            if (update.value) {
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftRef.value?.updatePerson();
            updateRightRef.value?.updatePerson();
        };

        const updateLeftBiography = () => {
            // TODO: implement method
        };

        const updateRightBiography = () => {
            // TODO: implement method
        };

        const updateLeftKeywords = () => {
            // TODO: implement method
        };

        const updateRightKeywords = () => {
            // TODO: implement method
        };

        const finishUpdates = () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;

                // JournalService.updateJournal(leftJournal.value?.id as number, leftJournal.value as Journal).then(() => {
                //     snackbarMessage.value = i18n.t("updatedSuccessMessage");
                //     snackbar.value = true;
                // }).catch((error) => {
                //     snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                //     snackbar.value = true;
                // });

                // JournalService.updateJournal(rightJournal.value?.id as number, rightJournal.value as Journal).then(() => {
                //     snackbarMessage.value = i18n.t("updatedSuccessMessage");
                //     snackbar.value = true;
                // }).catch((error) => {
                //     snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                //     snackbar.value = true;
                // });
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftPerson, rightPerson,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef, updateRight,
            leftEmployments, leftEducation, leftMemberships,
            rightEmployments, rightEducation, rightMemberships,
            updateLeftBiography, updateRightBiography,
            updateLeftKeywords, updateRightKeywords
        };
}})

</script>

<style scoped>

    .middle-arrow {
        margin-left: 25px;
        margin-top: 120px;
    }

</style>
