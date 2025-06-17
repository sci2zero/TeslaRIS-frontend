<template>
    <div>
        <v-form v-model="isFormValid" @submit.prevent>
            <v-text-field
                v-model="firstName"
                label="First Name"
                :rules="requiredFieldRules"
                :disabled="isPersonSelected()"
            ></v-text-field>
            <v-text-field
                v-model="lastName"
                label="Last Name"
                :rules="requiredFieldRules"
                :disabled="isPersonSelected()"
            ></v-text-field>
            <organisation-unit-autocomplete-search ref="ouAutocompleteRef" v-model="selectedOrganisationUnit" :disabled="isPersonSelected()" required></organisation-unit-autocomplete-search>
            <v-select
                v-model="selectedLanguage"
                :label="$t('preferredLanguageLabel') + '*'"
                :items="languages"
            ></v-select>
            <v-text-field
                v-model="email"
                label="Email"
                :rules="emailFieldRules"
            ></v-text-field>
            <password-input-with-meter :label="$t('newPasswordLabel')" @password-change="setNewPassword($event)" @show-repeated-password="true"></password-input-with-meter>
        </v-form>

        <v-btn block color="blue darken-1 large" :disabled="!isFormValid" @click="register">
            {{ $t("registerLabel") }}
        </v-btn>

        <toast v-model="snackbar" :message="message" />
    </div>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import { computed, defineComponent, onMounted, ref } from "vue";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import AuthenticationService from "@/services/AuthenticationService";
import LanguageService from "@/services/LanguageService";
import PasswordInputWithMeter from "@/components/core/PasswordInputWithMeter.vue";
import type { AxiosResponse } from "axios";
import type { LanguageResponse } from "@/models/Common";
import { useRegisterStore } from '@/stores/registerStore';
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getErrorMessageForErrorKey } from "@/i18n";
import { useRouter } from "vue-router";
import Toast from "@/components/core/Toast.vue";


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
        }
    },
    setup(props) {
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const registerStore = useRegisterStore();

        const router = useRouter();

        const i18n = useI18n();
        const firstName = ref(props.firstname || registerStore.registerPersonData?.personName.firstname);
        const lastName = ref(props.lastname || registerStore.registerPersonData?.personName.lastname);
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

        const register = () => {
            const requestBody = {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value,
                preferredLanguageId: selectedLanguage.value as number,
                organisationUnitId: selectedOrganisationUnit.value.value
            };

            AuthenticationService.registerResearcher(requestBody).then(() => {
                message.value = i18n.t("successfulRegistrationMessage");
                snackbar.value = true;

                setTimeout(() => {
                    router.push({ name: "login" });
                }, 5000);
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        onMounted(() => {
            LanguageService.getAllUILanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageResponse) => {
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

        return {email, emailFieldRules, requiredFieldMessage,
            register, selectedLanguage, languages, firstName, lastName, 
            selectedOrganisationUnit, setNewPassword, isPersonSelected,
            requiredFieldRules, isFormValid, snackbar, message
        }
    }
})
</script>
