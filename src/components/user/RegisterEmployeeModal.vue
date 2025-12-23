<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <v-list-item dark v-bind="scope.props" class="inline-action w-80" v-on="scope.isActive">
                    <v-list-item-title>
                        {{ getTitleLabel() }}
                    </v-list-item-title>
                </v-list-item>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ getTitleLabel() }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="name"
                                        :label="(registeringCommission ? $t('nameLabel') : $t('firstNameLabel')) + '*'"
                                        :rules="requiredFieldRules"
                                    ></v-text-field>
                                </v-col>
                                <v-col v-if="!registeringCommission" cols="12">
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
                                    <organisation-unit-autocomplete-search
                                        ref="ouAutocompleteRef"
                                        v-model="selectedOrganisationUnit"
                                        required
                                        disable-submission
                                        :only-client-institutions-cris="!fetchOnlyDlClients"
                                        :only-client-institutions-dl="fetchOnlyDlClients">
                                    </organisation-unit-autocomplete-search>
                                </v-col>
                                <v-col v-if="registeringCommission" cols="12">
                                    <commission-autocomplete-search
                                        ref="commissionAutocompleteRef"
                                        v-model="selectedCommission"
                                        required>
                                    </commission-autocomplete-search>
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
    </v-row>
</template>

<script lang="ts">
import { computed, type PropType, ref } from "vue";
import { defineComponent } from "vue";
import LanguageService from "@/services/LanguageService";
import AuthenticationService from "@/services/AuthenticationService";
import { onMounted } from "vue";
import type { AxiosError, AxiosResponse } from "axios";
import type { LanguageTagResponse } from "@/models/Common";
import type { EmployeeRegistrationRequest, CommissionRegistrationRequest } from "@/models/AuthenticationModel";
import OrganisationUnitAutocompleteSearch from "../organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import CommissionAutocompleteSearch from "../assessment/commission/CommissionAutocompleteSearch.vue";
import { useI18n } from "vue-i18n";
import { UserRole } from "@/models/UserModel";


export default defineComponent({
    name: "RegisterEmployeeModal",
    components: { OrganisationUnitAutocompleteSearch, CommissionAutocompleteSearch },
    props: {
        employeeRole: {
            type: Object as PropType<UserRole>,
            required: true
        }
    },
    emits: ["success", "failure"],
    setup(props, {emit}) {
        const dialog = ref(false);
        const isFormValid = ref(false);
        
        const i18n = useI18n();

        const registeringCommission = computed(() => props.employeeRole === UserRole.COMMISSION);

        const fetchOnlyDlClients = computed(() => [
                UserRole.INSTITUTIONAL_LIBRARIAN,
                UserRole.HEAD_OF_LIBRARY,
                UserRole.PROMOTION_REGISTRY_ADMINISTRATOR
            ].includes(props.employeeRole)
        );

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

            if (registeringCommission.value) {
                const newCommission = {
                    ...newEmployee,
                    commissionId: selectedCommission.value.value,
                } as CommissionRegistrationRequest;

                AuthenticationService.registerCommission(newCommission)
                    .then(() => handleSuccess(stayOnPage))
                    .catch(handleError);
            } else {
                AuthenticationService.registerEmployee(newEmployee, getEmploeeEndpointPath())
                    .then(() => handleSuccess(stayOnPage))
                    .catch(handleError);
            }
        };

        onMounted(() => {
            LanguageService.getAllUILanguages().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageTagResponse) => {
                    listOfLanguages.push({title: language.display, value: language.id})
                    languages.value = listOfLanguages;
                    if (language.languageCode === "SR") {
                        selectedLanguage.value = { title: language.display, value: language.id };
                    }
                });
            });
        });

        const getTitleLabel = () => {
            switch (props.employeeRole) {
                case UserRole.INSTITUTIONAL_EDITOR:
                    return i18n.t("addInstitutionEditorLabel");
                case UserRole.COMMISSION:
                    return i18n.t("addCommissionLabel");
                case UserRole.VICE_DEAN_FOR_SCIENCE:
                    return i18n.t("addViceDeanForScienceLabel");
                case UserRole.INSTITUTIONAL_LIBRARIAN:
                    return i18n.t("addInstitutionLibrarianLabel");
                case UserRole.HEAD_OF_LIBRARY:
                    return i18n.t("addHeadOfLibraryLabel");
                case UserRole.PROMOTION_REGISTRY_ADMINISTRATOR:
                    return i18n.t("addRegistryBookAdminLabel");
            }
        };

        const getEmploeeEndpointPath = (): string => {
            switch (props.employeeRole) {
                case UserRole.INSTITUTIONAL_EDITOR:
                    return "institution-admin";
                case UserRole.VICE_DEAN_FOR_SCIENCE:
                    return "vice-dean-for-science";
                case UserRole.INSTITUTIONAL_LIBRARIAN:
                    return "institution-librarian";
                case UserRole.HEAD_OF_LIBRARY:
                    return "head-of-library";
                case UserRole.PROMOTION_REGISTRY_ADMINISTRATOR:
                    return "promotion-registry-administrator";
            }

            return ""; // should never happen
        };

        return {
            dialog, name, surname, 
            ouAutocompleteRef, fetchOnlyDlClients,
            selectedOrganisationUnit, 
            email, note, selectedCommission,
            languages, selectedLanguage, 
            registerEmployee, isFormValid,
            emailFieldRules, requiredFieldRules,
            requiredSelectionRules, getTitleLabel,
            commissionAutocompleteRef,
            registeringCommission
        };
    }
});
</script>
