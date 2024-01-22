<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="8">
                <v-row>
                    <v-col>
                        <v-text-field v-model="firstName" :label="$t('firstNameLabel') + '*'" :placeholder="$t('firstNameLabel')" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="middleName" :label="$t('middleNameLabel')" :placeholder="$t('middleNameLabel')"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="lastName" :label="$t('surnameLabel') + '*'" :placeholder="$t('surnameLabel')" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete
                            v-model="selectedOrganisationUnit"
                            :label="$t('organisationUnitLabel') + '*'"
                            :items="organisationUnits"
                            :custom-filter="(() => true)"
                            :auto-select-first="true"
                            :rules="requiredSelectionRules"
                            :no-data-text="$t('noDataMessage')"
                            return-object
                            @update:search="searchOUs($event)"
                        ></v-autocomplete>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="selectedEmploymentPosition"
                                :items="employmentPositions"
                                :label="$t('employmentPositionLabel')">
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="selectedSex"
                                :items="sexes"
                                :label="$t('sexLabel')">
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="birthdate" type="date" :label="$t('birthdateLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="orcid" label="ORCID" placeholder="ORCID"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="mnid" label="MNID" placeholder="MNID"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="apvnt" label="APVNT" placeholder="APVNT"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="scopus" label="Scopus Author ID" placeholder="Scopus Author ID"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>

        <v-row>
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import PersonService from "@/services/PersonService";
import type { LanguageTagResponse } from '@/models/Common';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import lodash from "lodash";
import type { OrganisationUnitIndex } from '@/models/OrganisationUnitModel';
import { EmploymentPosition, Sex } from "@/models/PersonModel";
import type { BasicPerson } from "@/models/PersonModel";

export default defineComponent({
    name: "PersonSubmissionForm",
    setup() {
        const isFormValid = ref(false);
        const additionalFields = ref(false);
        const snackbar = ref(false);

        const router = useRouter();
        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const languageList = ref<LanguageTagResponse[]>();

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });
        })

        const firstName = ref("");
        const middleName = ref("");
        const lastName = ref("");
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const ouPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(ouPlaceholder);

        const email = ref("");
        const phoneNumber = ref("");
        const birthdate = ref(null);
        const orcid = ref("");
        const mnid = ref("");
        const apvnt = ref("");
        const scopus = ref("");

        const requiredFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                return true;
            }
        ];

        const requiredSelectionRules = [
            (value: { title: string, value: number } | number) => {
                if (!value || (value as { title: string, value: number }).value === -1) return requiredFieldMessage.value;
                return true;
            }
        ];

        const searchOUs = lodash.debounce((input: string) => {
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";
                OrganisationUnitService.searchOUs(params).then((response) => {
                    const listOfOUs: { title: string, value: number }[] = [];
                    response.data.content.forEach((organisationUnit: OrganisationUnitIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfOUs.push({title: organisationUnit.nameSr, value: organisationUnit.databaseId});
                        } else {
                            listOfOUs.push({title: organisationUnit.nameOther, value: organisationUnit.databaseId});
                        }
                    })
                    organisationUnits.value = listOfOUs;
                });
            }
        }, 300);

        const employmentPositionsEn = [
            { title: "Scientific Advisor", value: EmploymentPosition.SCIENTIFIC_ADVISOR },
            { title: "Assistant Trainee", value: EmploymentPosition.ASSISTANT_TRAINEE },
            { title: "Expert Associate", value: EmploymentPosition.EXPERT_ASSOCIATE },
            { title: "Assistant", value: EmploymentPosition.ASSISTANT },
            { title: "Senior Expert Associate", value: EmploymentPosition.SENIOR_EXPERT_ASSOCIATE },
            { title: "Instructor", value: EmploymentPosition.INSTRUCTOR },
            { title: "Expert Advisor", value: EmploymentPosition.EXPERT_ADVISOR },
            { title: "Collaborator", value: EmploymentPosition.COLLABORATOR },
            { title: "Senior Instructor", value: EmploymentPosition.SENIOR_INSTRUCTOR },
            { title: "Teacher", value: EmploymentPosition.TEACHER },
            { title: "Teacher of Foreign Languages and Skills", value: EmploymentPosition.TEACHER_OF_FOREIGN_LANGUAGES_AND_SKILLS },
            { title: "Researcher", value: EmploymentPosition.RESEARCHER },
            { title: "Professor Engineer Habilitated", value: EmploymentPosition.PROFESSOR_ENGINEER_HABILITATED },
            { title: "Assistant with Master", value: EmploymentPosition.ASSISTANT_WITH_MASTER },
            { title: "Assistant with Magistrate", value: EmploymentPosition.ASSISTANT_WITH_MAGISTRATE },
            { title: "Assistant with Doctorate", value: EmploymentPosition.ASSISTANT_WITH_DOCTORATE },
            { title: "Lecturer", value: EmploymentPosition.LECTURER },
            { title: "Senior Lecturer", value: EmploymentPosition.SENIOR_LECTURER },
            { title: "Professor of Vocational Studies", value: EmploymentPosition.PROFESSOR_OF_VOCATIONAL_STUDIES },
            { title: "Assistant Professor", value: EmploymentPosition.ASSISTANT_PROFESSOR },
            { title: "Associate Professor", value: EmploymentPosition.ASSOCIATE_PROFESSOR },
            { title: "Teaching Assistant", value: EmploymentPosition.TEACHING_ASSISTANT },
            { title: "Full Professor", value: EmploymentPosition.FULL_PROFESSOR },
            { title: "Professor Emeritus", value: EmploymentPosition.PROFESSOR_EMERITUS },
            { title: "Retired Professor", value: EmploymentPosition.RETIRED_PROFESSOR },
            { title: "Research Trainee", value: EmploymentPosition.RESEARCH_TRAINEE },
            { title: "Research Associate", value: EmploymentPosition.RESEARCH_ASSOCIATE },
            { title: "Scientific Collaborator", value: EmploymentPosition.SCIENTIFIC_COLLABORATOR },
            { title: "Senior Scientific Collaborator", value: EmploymentPosition.SENIOR_SCIENTIFIC_COLLABORATOR }
        ];

        const employmentPositionsSr = [
            { title: "Naučni Savetnik", value: EmploymentPosition.SCIENTIFIC_ADVISOR },
            { title: "Asistent Praktikant", value: EmploymentPosition.ASSISTANT_TRAINEE },
            { title: "Ekspert-saradnik", value: EmploymentPosition.EXPERT_ASSOCIATE },
            { title: "Asistent", value: EmploymentPosition.ASSISTANT },
            { title: "Stariji Ekspert-saradnik", value: EmploymentPosition.SENIOR_EXPERT_ASSOCIATE },
            { title: "Instruktor", value: EmploymentPosition.INSTRUCTOR },
            { title: "Ekspert-savetnik", value: EmploymentPosition.EXPERT_ADVISOR },
            { title: "Saradnik", value: EmploymentPosition.COLLABORATOR },
            { title: "Stariji Instruktor", value: EmploymentPosition.SENIOR_INSTRUCTOR },
            { title: "Nastavnik", value: EmploymentPosition.TEACHER },
            { title: "Nastavnik stranih jezika i veština", value: EmploymentPosition.TEACHER_OF_FOREIGN_LANGUAGES_AND_SKILLS },
            { title: "Istraživač", value: EmploymentPosition.RESEARCHER },
            { title: "Profesor inženjer habilitovan", value: EmploymentPosition.PROFESSOR_ENGINEER_HABILITATED },
            { title: "Asistent sa masterom", value: EmploymentPosition.ASSISTANT_WITH_MASTER },
            { title: "Asistent sa magistraturom", value: EmploymentPosition.ASSISTANT_WITH_MAGISTRATE },
            { title: "Asistent sa doktoratom", value: EmploymentPosition.ASSISTANT_WITH_DOCTORATE },
            { title: "Predavač", value: EmploymentPosition.LECTURER },
            { title: "Stariji predavač", value: EmploymentPosition.SENIOR_LECTURER },
            { title: "Profesor strukovnih studija", value: EmploymentPosition.PROFESSOR_OF_VOCATIONAL_STUDIES },
            { title: "Asistent profesor", value: EmploymentPosition.ASSISTANT_PROFESSOR },
            { title: "Vanredni profesor", value: EmploymentPosition.ASSOCIATE_PROFESSOR },
            { title: "Asistent u nastavi", value: EmploymentPosition.TEACHING_ASSISTANT },
            { title: "Redovni profesor", value: EmploymentPosition.FULL_PROFESSOR },
            { title: "Profesor emeritus", value: EmploymentPosition.PROFESSOR_EMERITUS },
            { title: "Profesor u penziji", value: EmploymentPosition.RETIRED_PROFESSOR },
            { title: "Istraživač-praktikant", value: EmploymentPosition.RESEARCH_TRAINEE },
            { title: "Istraživač-saradnik", value: EmploymentPosition.RESEARCH_ASSOCIATE },
            { title: "Naučni saradnik", value: EmploymentPosition.SCIENTIFIC_COLLABORATOR },
            { title: "Stariji naučni saradnik", value: EmploymentPosition.SENIOR_SCIENTIFIC_COLLABORATOR },
        ];

        const sexSr = [
            { title: "Muški", value: Sex.MALE },
            { title: "Ženski", value: Sex.FEMALE },
        ];

        const sexEn = [
            { title: "Male", value: Sex.MALE },
            { title: "Female", value: Sex.FEMALE },
        ];

        const employmentPositions = computed(() => i18n.locale.value === "sr" ? employmentPositionsSr : employmentPositionsEn);
        const selectedEmploymentPosition = ref();

        const sexes = computed(() => i18n.locale.value === "sr" ? sexSr : sexEn);
        const selectedSex = ref();

        const submitPerson = (stayOnPage: boolean) => {
            const newPerson: BasicPerson = {
                personName: {firstname: firstName.value, otherName: middleName.value, lastname: lastName.value, dateFrom: birthdate.value, dateTo: null},
                contactEmail: email.value,
                phoneNumber: phoneNumber.value,
                apvnt: apvnt.value,
                mnid: mnid.value,
                orcid: orcid.value,
                scopusAuthorId: scopus.value,
                sex: selectedSex.value,
                localBirthDate: birthdate.value,
                organisationUnitId: selectedOrganisationUnit.value.value,
                employmentPosition: selectedEmploymentPosition.value
            };

            PersonService.createPerson(newPerson).then(() => {
                if (stayOnPage) {
                    firstName.value = "";
                    middleName.value = "";
                    lastName.value = "";
                    birthdate.value = null;
                    email.value = "";
                    phoneNumber.value = "";
                    apvnt.value = "";
                    mnid.value = "";
                    orcid.value = "";
                    scopus.value = "";
                    selectedSex.value = null;
                    selectedOrganisationUnit.value = ouPlaceholder;
                    selectedEmploymentPosition.value = null;
                    
                    snackbar.value = true;
                } else {
                    router.push({ name: "persons" });
                }
            });
        };

        return {isFormValid, additionalFields, snackbar,
            firstName, middleName, lastName, organisationUnits, selectedOrganisationUnit, searchOUs,
            email, birthdate, orcid, mnid, apvnt,  scopus, employmentPositions, selectedEmploymentPosition,
            sexes, selectedSex, phoneNumber, requiredFieldRules, requiredSelectionRules, submitPerson};
    }
});
</script>