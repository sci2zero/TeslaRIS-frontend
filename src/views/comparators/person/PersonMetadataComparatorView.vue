<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ `${leftPerson?.personName.firstname} ${leftPerson?.personName.lastname}` + (isLeftBoundToUser ? ` - ${$t("boundToUserLabel")}` : "") }}
                </h2>
                <br />

                <person-update-form ref="updateLeftRef" :preset-person="leftPerson" :in-modal="false" @update="updateLeft"></person-update-form>

                <description-or-biography-update-form ref="updateLeftBioRef" :preset-description-or-biography="(leftPerson?.biography as MultilingualContent[])" @update="updateLeftBiography"></description-or-biography-update-form>

                <keyword-update-form ref="updateleftKeywordsRef" :preset-keywords="(leftPerson?.keyword as MultilingualContent[])" @update="updateLeftKeywords"></keyword-update-form>

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
                    {{ `${rightPerson?.personName.firstname} ${rightPerson?.personName.lastname}` + (isRightBoundToUser ? ` - ${$t("boundToUserLabel")}` : "") }}
                </h2>

                <br />

                <person-update-form ref="updateRightRef" :preset-person="rightPerson" :in-modal="false" @update="updateRight"></person-update-form>

                <description-or-biography-update-form ref="updateRightBioRef" :preset-description-or-biography="(rightPerson?.biography as MultilingualContent[])" @update="updateRightBiography"></description-or-biography-update-form>

                <keyword-update-form ref="updateRightKeywordsRef" :preset-keywords="(rightPerson?.keyword as MultilingualContent[])" @update="updateRightKeywords"></keyword-update-form>

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

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            :supports-force-delete="isAdmin"
            @update="updateAll"
            @delete="deleteSide">
        </comparison-actions>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
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
import type { MultilingualContent } from '@/models/Common';
import MergeService from '@/services/MergeService';
import { getErrorMessageForErrorKey } from '@/i18n';
import { ComparisonSide } from '@/models/MergeModel';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import Toast from '@/components/core/Toast.vue';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "PersonMetadataComparator",
    components: { PersonUpdateForm, Toast, InvolvementList, ExpertiseOrSkillList, PrizeList, DescriptionOrBiographyUpdateForm, KeywordUpdateForm, ComparisonActions },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const isLeftBoundToUser = ref(false);
        const isRightBoundToUser = ref(false);

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
        const updateRightBioRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateLeftBioRef = ref<typeof DescriptionOrBiographyUpdateForm>();
        const updateRightKeywordsRef = ref<typeof KeywordUpdateForm>();
        const updateLeftKeywordsRef = ref<typeof KeywordUpdateForm>();
        
        const { isAdmin } = useUserRole();
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

            PersonService.isPersonBoundToAUser(parseInt(currentRoute.params.leftId as string)).then((response) => {
                isLeftBoundToUser.value = response.data;
            });

            PersonService.isPersonBoundToAUser(parseInt(currentRoute.params.rightId as string)).then((response) => {
                isRightBoundToUser.value = response.data;
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
            mergeMultilingualContentField(person1.postalAddress!.city, person2.postalAddress!.city);
            person2.postalAddress!.city = [];

            mergeMultilingualContentField(person1.postalAddress!.streetAndNumber, person2.postalAddress!.streetAndNumber);
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
            person1.openAlexId = person2.openAlexId;
            person2.openAlexId = "";
            person1.contact.contactEmail = person2.contact.contactEmail;
            person2.contact.contactEmail = "";
            person1.contact.phoneNumber = person2.contact.phoneNumber;
            person2.contact.phoneNumber = "";
            person2.uris!.forEach(uri => {
                if (!person1.uris!.includes(uri)) {
                    person1.uris!.push(uri);
                }
            });
            person2.uris = [];

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

            mergeMultilingualContentField(person1.biography, person2.biography);
            person2.biography = [];

            mergeMultilingualContentField(person1.keyword, person2.keyword);
            person2.keyword = [];

            return [person1, person2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftBioRef.value?.submit();
            updateRightBioRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

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
            updateLeftBioRef.value?.refreshForm();
            updateRightBioRef.value?.refreshForm();
            updateLeftKeywordsRef.value?.refreshForm();
            updateRightKeywordsRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (updatedPersonalInfo: PersonalInfo) => {
            leftPerson.value!.personalInfo = updatedPersonalInfo;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedPersonalInfo: PersonalInfo) => {
            rightPerson.value!.personalInfo = updatedPersonalInfo;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftKeywordsRef.value?.submit();
            updateRightKeywordsRef.value?.submit();
            updateLeftBioRef.value?.submit();
            updateRightBioRef.value?.submit();
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();
        };

        const updateLeftBiography = (biography: MultilingualContent[]) => {
            leftPerson.value!.biography = biography;
        };

        const updateRightBiography = (biography: MultilingualContent[]) => {
            rightPerson.value!.biography = biography;
        };

        const updateLeftKeywords = (keywords: MultilingualContent[]) => {
            leftPerson.value!.keyword = keywords;
        };

        const updateRightKeywords = (keywords: MultilingualContent[]) => {
            rightPerson.value!.keyword = keywords;
        };

        const finishUpdates = async () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;
                
                try {
                    await Promise.all([
                        // Left Person
                        PersonService.updateKeywords(leftPerson.value?.id as number, leftPerson.value?.keyword as MultilingualContent[]),
                        PersonService.updateBiography(leftPerson.value?.id as number, leftPerson.value?.biography as MultilingualContent[]),

                        // Right Person
                        PersonService.updateKeywords(rightPerson.value?.id as number, rightPerson.value?.keyword as MultilingualContent[]),
                        PersonService.updateBiography(rightPerson.value?.id as number, rightPerson.value?.biography as MultilingualContent[]),

                        // Merge employments
                        MergeService.switchInvolvementsToOtherPerson(leftEmployments.value.map(e => e.id) as number[], rightPerson.value?.id as number, leftPerson.value?.id as number),
                        MergeService.switchInvolvementsToOtherPerson(rightEmployments.value.map(e => e.id) as number[], leftPerson.value?.id as number, rightPerson.value?.id as number),

                        // Merge education
                        MergeService.switchInvolvementsToOtherPerson(leftEducation.value.map(e => e.id) as number[], rightPerson.value?.id as number, leftPerson.value?.id as number),
                        MergeService.switchInvolvementsToOtherPerson(rightEducation.value.map(e => e.id) as number[], leftPerson.value?.id as number, rightPerson.value?.id as number),

                        // Merge memberships
                        MergeService.switchInvolvementsToOtherPerson(leftMemberships.value.map(e => e.id) as number[], rightPerson.value?.id as number, leftPerson.value?.id as number),
                        MergeService.switchInvolvementsToOtherPerson(rightMemberships.value.map(e => e.id) as number[], leftPerson.value?.id as number, rightPerson.value?.id as number),

                        // Merge prizes
                        MergeService.switchPrizesToOtherPerson(leftPerson.value?.prizes.map(e => e.id) as number[], rightPerson.value?.id as number, leftPerson.value?.id as number),
                        MergeService.switchPrizesToOtherPerson(rightPerson.value?.prizes.map(e => e.id) as number[], leftPerson.value?.id as number, rightPerson.value?.id as number),

                        // Merge skills
                        MergeService.switchSkillsToOtherPerson(leftPerson.value?.expertisesOrSkills.map(e => e.id) as number[], rightPerson.value?.id as number, leftPerson.value?.id as number),
                        MergeService.switchSkillsToOtherPerson(rightPerson.value?.expertisesOrSkills.map(e => e.id) as number[], leftPerson.value?.id as number, rightPerson.value?.id as number)
                    ]);

                    // Personal information
                    await MergeService.saveMergedPersonsMetadata(
                        leftPerson.value?.id as number,
                        rightPerson.value?.id as number,
                        {
                            leftPerson: leftPerson.value?.personalInfo as PersonalInfo,
                            rightPerson: rightPerson.value?.personalInfo as PersonalInfo
                        }
                    );

                    snackbarMessage.value = i18n.t("updatedSuccessMessage");
                    snackbar.value = true;
                } catch (error: any) {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                }
            }
        };

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftPerson.value?.id as number : rightPerson.value?.id as number;
            const name = side === ComparisonSide.LEFT ? leftPerson.value?.personName.firstname : rightPerson.value?.personName.firstname;
            const transferTargetId = side === ComparisonSide.LEFT ? rightPerson.value?.id : leftPerson.value?.id;

            try {
                const deleteAction = isForceDelete 
                    ? PersonService.forceDeleteResearcher(id)
                    : PersonService.deleteResearcher(id);

                await deleteAction;

                await MergeService.switchAllIndicatorsToOtherPerson(id as number, transferTargetId as number);

                router.push({ name: "researcherLandingPage", query: { id: transferTargetId } });
            } catch (_error) {
                snackbarMessage.value =
                    isForceDelete ? i18n.t("personBoundToResearcherNotification", { name: name }) : i18n.t("deleteFailedNotification", { name: name });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftPerson, rightPerson, deleteSide,
            moveAll, updateAll, updateLeft, isAdmin,
            updateLeftRef, updateRightRef, updateRight,
            leftEmployments, leftEducation, leftMemberships,
            rightEmployments, rightEducation, rightMemberships,
            updateLeftBiography, updateRightBiography,
            updateLeftKeywords, updateRightKeywords,
            updateRightBioRef, updateLeftBioRef,
            updateRightKeywordsRef, updateLeftKeywordsRef,
            isLeftBoundToUser, isRightBoundToUser
        };
}})

</script>
