<template>
    <v-col align-self="start" cols="2" class="ml-3">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-btn
                    color="primary" dark v-bind="scope.props" class="bottom-spacer"
                    v-on="scope.isActive">
                    {{ isCommission ? $t("addCommissionLabel") : $t("addInstitutionEditorLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ isCommission ? $t("addCommissionLabel") : $t("addInstitutionEditorLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="name"
                                        :label="(isCommission ? $t('nameLabel') : $t('firstNameLabel')) + '*'"
                                        :rules="requiredFieldRules"
                                    ></v-text-field>
                                </v-col>
                                <v-col v-if="!isCommission" cols="12">
                                    <v-text-field
                                        v-model="surname"
                                        :label="$t('surnameLabel') + '*'"
                                        :rules="requiredFieldRules"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="email"
                                        :label="$t('emailLabel') + '*'"
                                        :rules="emailFieldRules"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-select
                                        v-model="selectedLanguage"
                                        :label="$t('preferredLanguageLabel') + '*'"
                                        :items="languages"
                                        return-object
                                    ></v-select>
                                </v-col>
                                <v-col cols="12">
                                    <organisation-unit-autocomplete-search ref="ouAutocompleteRef" v-model="selectedOrganisationUnit" required></organisation-unit-autocomplete-search>
                                </v-col>
                                <v-col v-if="isCommission" cols="12">
                                    <commission-autocomplete-search ref="commissionAutocompleteRef" v-model="selectedCommission" required></commission-autocomplete-search>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea
                                        v-model="note"
                                        :label="$t('noteLabel')"
                                    ></v-textarea>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-container>
                    <p class="required-fields-message">
                        {{ $t("requiredFieldsMessage") }}
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="registerEmployee(false)">
                        {{ $t("saveLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="registerEmployee(true)">
                        {{ $t("saveAndAddAnotherLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-col>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import LanguageService from "@/services/LanguageService";
import AuthenticationService from "@/services/AuthenticationService";
import { onMounted } from "vue";
import type { AxiosError, AxiosResponse } from "axios";
import type { LanguageResponse } from "@/models/Common";
import type { EmployeeRegistrationRequest, CommissionRegistrationRequest } from "@/models/AuthenticationModel";
import OrganisationUnitAutocompleteSearch from "../organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import CommissionAutocompleteSearch from "../assessment/commission/CommissionAutocompleteSearch.vue";
import { useI18n } from "vue-i18n";


export default defineComponent({
    name: "RegisterEmployeeModal",
    components: { OrganisationUnitAutocompleteSearch, CommissionAutocompleteSearch },
    props: {
        isCommission: {
            type: Boolean,
            default: false
        }
    },
    emits: ["success", "failure"],
    setup(props, {emit}) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const i18n = useI18n();

        const name = ref("");
        const surname = ref("");
        const email = ref("");
        const note = ref("");
        const languages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number }>({title: "SR", value: -1});

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const commissionAutocompleteRef = ref<typeof CommissionAutocompleteSearch>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedCommission = ref<{ title: string, value: number }>(searchPlaceholder);

        const { requiredFieldRules, requiredSelectionRules, emailFieldRules } = useValidationUtils();

        const resetForm = () => {
            name.value = "";
            surname.value = "";
            email.value = "";
            note.value = "";
            ouAutocompleteRef.value?.clearInput();
            commissionAutocompleteRef.value?.clearInput();
        };

        const handleSuccess = (stayOnPage: boolean) => {
            emit("success");
            resetForm();
            if (!stayOnPage) {
                dialog.value = false;
            }
        };

        const handleError = (error: AxiosError<any, any>) => {
            emit("failure", i18n.t(error.response?.data.message, [email.value]));
        };

        const registerEmployee = (stayOnPage: boolean) => {
            const newEmployee: EmployeeRegistrationRequest = {
                name: name.value,
                surname: surname.value,
                email: email.value,
                note: note.value,
                preferredLanguageId: selectedLanguage.value.value,
                organisationUnitId: selectedOrganisationUnit.value.value
            };

            if (props.isCommission) {
                const newCommission = {
                    ...newEmployee,
                    commissionId: selectedCommission.value.value,
                } as CommissionRegistrationRequest;

                AuthenticationService.registerCommission(newCommission)
                    .then(() => handleSuccess(stayOnPage))
                    .catch(handleError);
            } else {
                AuthenticationService.registerEmployee(newEmployee)
                    .then(() => handleSuccess(stayOnPage))
                    .catch(handleError);
            }
        };

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageResponse) => {
                    listOfLanguages.push({title: language.languageCode, value: language.id})
                    languages.value = listOfLanguages;
                    if (language.languageCode === "SR") {
                        selectedLanguage.value = { title: language.languageCode, value: language.id };
                    }
                });
            });
        });

        return {
            dialog, name, surname, 
            ouAutocompleteRef, 
            selectedOrganisationUnit, 
            email, note, selectedCommission,
            languages, selectedLanguage, 
            registerEmployee, isFormValid,
            emailFieldRules, requiredFieldRules,
            requiredSelectionRules,
            commissionAutocompleteRef
        };
    }
});
</script>
