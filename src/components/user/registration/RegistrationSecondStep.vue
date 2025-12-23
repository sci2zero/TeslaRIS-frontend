<template>
    <div>
        <v-form v-model="isFormValid" @submit.prevent>
            <v-text-field
                v-model="firstName"
                :label="$t('firstNameLabel') + '*'"
                :rules="requiredFieldRules"
                :disabled="isPersonSelected()"
            ></v-text-field>
            <v-text-field
                v-model="lastName"
                :label="$t('surnameLabel') + '*'"
                :rules="requiredFieldRules"
                :disabled="isPersonSelected()"
            ></v-text-field>
            <organisation-unit-autocomplete-search
                ref="ouAutocompleteRef"
                v-model="selectedOrganisationUnit"
                :disabled="isPersonSelected()"
                required
                only-client-institutions-cris>
            </organisation-unit-autocomplete-search>
            <v-select
                v-model="selectedLanguage"
                :label="$t('preferredLanguageLabel') + '*'"
                :items="languages"
            ></v-select>
            <v-text-field
                v-model="email"
                :label="$t('emailLabel') + '*'"
                :rules="emailFieldRules"
            ></v-text-field>
            <password-input-with-meter
                v-if="!inModal"
                :label="$t('newPasswordLabel') + '*'"
                @password-change="setNewPassword($event)"
                @show-repeated-password="true">
            </password-input-with-meter>
        </v-form>

        <v-btn
            v-if="!inModal"
            block
            color="blue darken-1 large"
            :disabled="!isFormValid"
            @click="register">
            {{ $t("registerLabel") }}
        </v-btn>

        <toast v-model="snackbar" :message="message" />
    </div>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import AuthenticationService from "@/services/AuthenticationService";
import LanguageService from "@/services/LanguageService";
import PasswordInputWithMeter from "@/components/core/PasswordInputWithMeter.vue";
import type { AxiosError, AxiosResponse } from "axios";
import type { LanguageTagResponse } from "@/models/Common";
import { useRegisterStore } from '@/stores/registerStore';
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getErrorMessageForErrorKey } from "@/i18n";
import { useRouter } from "vue-router";
import Toast from "@/components/core/Toast.vue";
import { type ResearcherRegistrationRequest } from "@/models/AuthenticationModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export default defineComponent({
    name: "RegistrationSecondStep",
    components: {OrganisationUnitAutocompleteSearch, PasswordInputWithMeter, Toast},
    props: {
        firstname: {
            type: String,
            default: ""
        },
        lastname: {
            type: String,
            default: ""
        },
        inModal: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const registerStore = useRegisterStore();

        const router = useRouter();

        const i18n = useI18n();
        const firstName = ref("");
        const lastName = ref("");
        const email = ref("");
        const password = ref("");
        const languages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number } | number>({title: "SR", value: -1});
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const { requiredFieldRules, emailFieldRules } = useValidationUtils();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const setNewPassword = (newPassword: string) => {
            password.value = newPassword;
        };

        onMounted(() => {
            prepopulateNameData();
        });

        watch([
            () => props.firstname,
            () => props.lastname,
            registerStore
        ], () => {
            prepopulateNameData();
        });

        const prepopulateNameData = () => {
            firstName.value = props.firstname || registerStore.registerPersonData?.personName.firstname;
            lastName.value = props.lastname || registerStore.registerPersonData?.personName.lastname;
            if (registerStore.registerPersonData?.employmentInstitutionId) {
                selectedOrganisationUnit.value = {
                    title: returnCurrentLocaleContent(registerStore.registerPersonData?.employmentInstitutionName) as string,
                    value: registerStore.registerPersonData?.employmentInstitutionId
                };
            }
        };

        const register = async () => {
            const requestBody: ResearcherRegistrationRequest = {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value,
                preferredLanguageId: selectedLanguage.value as number,
                organisationUnitId: selectedOrganisationUnit.value.value,
                personId: registerStore.registerPersonData?.personId
            };

            try {
                const service = props.inModal 
                    ? (requestBody: ResearcherRegistrationRequest) => AuthenticationService.registerResearcherAdmin(requestBody)
                    : (requestBody: ResearcherRegistrationRequest) => AuthenticationService.registerResearcher(requestBody);

                await service(requestBody);
                
                handleSuccess();
                
                if (!props.inModal) {
                    setTimeout(() => router.push({ name: "login" }), 5000);
                }
                
                return true;
            } catch (error: any) {
                handleError(error);
                return false;
            }
        };

        const handleError = (error: AxiosError<any>) => {
            if (!error.response) {
                return;
            }

            message.value = getErrorMessageForErrorKey(error.response.data.message);
            snackbar.value = true;
        };

        const handleSuccess = () => {
            message.value = i18n.t(!props.inModal ? "successfulRegistrationMessage" : "successfulRegistrationAdminMessage");
            snackbar.value = true;
        };

        onMounted(() => {
            LanguageService.getAllUILanguages().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageTagResponse) => {
                    listOfLanguages.push({title: language.languageCode, value: language.id})
                    languages.value = listOfLanguages;
                    if (language.languageCode === "SR") {
                        selectedLanguage.value = language.id;
                    }
                });
            });
        });

        const isPersonSelected = () => {
           return registerStore.registerPersonData != null
        };

        const clearForm = () => {
            email.value = "";
            firstName.value = "";
            lastName.value = "";
            selectedOrganisationUnit.value = {title: "", value: -1};
            password.value = "";
        };

        return {
            email, emailFieldRules, requiredFieldMessage,
            register, selectedLanguage, languages, firstName, lastName, 
            selectedOrganisationUnit, setNewPassword, isPersonSelected,
            requiredFieldRules, isFormValid, snackbar, message,
            clearForm
        };
    }
})
</script>
