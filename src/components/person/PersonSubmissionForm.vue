<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col>
                        <v-text-field v-model="firstName" :label="$t('firstNameLabel') + '*'" :placeholder="$t('firstNameLabel')" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="lastName" :label="$t('surnameLabel') + '*'" :placeholder="$t('surnameLabel')" :rules="requiredFieldRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <organisation-unit-autocomplete-search ref="ouAutocompleteRef" v-model:model-value="selectedOrganisationUnit" required></organisation-unit-autocomplete-search>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col>
                            <v-text-field v-model="middleName" :label="$t('middleNameLabel')" :placeholder="$t('middleNameLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="selectedEmploymentPosition"
                                :items="employmentPositions"
                                :label="$t('employmentPositionLabel')"
                                return-object>
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="selectedSex"
                                :items="sexes"
                                :label="$t('sexLabel')"
                                return-object>
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
                            <date-picker
                                v-model="birthdate"
                                :label="$t('birthdateLabel')"
                                color="primary"
                            ></date-picker>
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
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
    <v-snackbar
        v-model="snackbar"
        :timeout="5000">
        {{ !error ? $t("savedMessage") : $t("genericErrorMessage") }}
        <template #actions>
            <v-btn
                color="blue"
                variant="text"
                @click="snackbar = false">
                {{ $t("closeLabel") }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { computed } from 'vue';
import PersonService from "@/services/PersonService";
import type { LanguageTagResponse } from '@/models/Common';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { BasicPerson } from "@/models/PersonModel";
import OrganisationUnitAutocompleteSearch from "../organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getSexForGivenLocale } from '@/i18n/sex';
import { getEmploymentPositionsForGivenLocale } from '@/i18n/employmentPosition';
import DatePicker from '../core/DatePicker.vue';


export default defineComponent({
    name: "PersonSubmissionForm",
    components: { OrganisationUnitAutocompleteSearch, DatePicker },
    props: {
        inModal: {
            type: Boolean,
            default: false
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const error = ref(false);

        const router = useRouter();

        const languageList = ref<LanguageTagResponse[]>();

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });
        })

        const firstName = ref("");
        const middleName = ref("");
        const lastName = ref("");

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const email = ref("");
        const phoneNumber = ref("");
        const birthdate = ref("");
        const orcid = ref("");
        const mnid = ref("");
        const apvnt = ref("");
        const scopus = ref("");

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const selectionPlaceholder: { title: string, value: any } = { title: "", value: undefined };

        const employmentPositions = computed(() => getEmploymentPositionsForGivenLocale());
        const selectedEmploymentPosition = ref(selectionPlaceholder);

        const sexes = getSexForGivenLocale();
        const selectedSex = ref(selectionPlaceholder);

        const submitPerson = (stayOnPage: boolean) => {
            const newPerson: BasicPerson = {
                personName: {firstname: firstName.value, otherName: middleName.value, lastname: lastName.value, dateFrom: birthdate.value, dateTo: null},
                contactEmail: email.value,
                phoneNumber: phoneNumber.value,
                apvnt: apvnt.value,
                mnid: mnid.value,
                orcid: orcid.value,
                scopusAuthorId: scopus.value,
                sex: selectedSex.value.value,
                localBirthDate: birthdate.value,
                organisationUnitId: selectedOrganisationUnit.value.value,
                employmentPosition: selectedEmploymentPosition.value.value
            };

            PersonService.createPerson(newPerson).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

                if (stayOnPage) {
                    firstName.value = "";
                    middleName.value = "";
                    lastName.value = "";
                    birthdate.value = "";
                    email.value = "";
                    phoneNumber.value = "";
                    apvnt.value = "";
                    mnid.value = "";
                    orcid.value = "";
                    scopus.value = "";
                    selectedSex.value = selectionPlaceholder;
                    ouAutocompleteRef.value?.clearInput();
                    selectedEmploymentPosition.value = selectionPlaceholder;
                    
                    error.value = false;
                    snackbar.value = true;
                } else {
                    router.push({ name: "researcherLandingPage", params: {id: response.data.id} });
                }
            }).catch(() => {
                error.value = true;
                snackbar.value = true;
            });
        };

        return {isFormValid, additionalFields, snackbar, error,
            firstName, middleName, lastName, selectedOrganisationUnit, ouAutocompleteRef,
            email, birthdate, orcid, mnid, apvnt,  scopus, employmentPositions, selectedEmploymentPosition,
            sexes, selectedSex, phoneNumber, requiredFieldRules, requiredSelectionRules, submitPerson};
    }
});
</script>
