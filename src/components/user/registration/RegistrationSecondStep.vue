<template>
    <div>
        <div>
            <v-text-field
                v-model="firstName"
                label="First Name"
                :rules="emailFieldRules"
                :disabled="isPersonSelected()"
            ></v-text-field>
            <v-text-field
                v-model="lastName"
                label="Last Name"
                :rules="emailFieldRules"
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
        </div>

        <v-btn block color="blue darken-1 large" @click="register">
            {{ $t("registerLabel") }}
        </v-btn>
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

export default defineComponent({
    name: "RegistrationSecondStep",
    components: {OrganisationUnitAutocompleteSearch, PasswordInputWithMeter},
    props: {
        firstName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: ""
        }
    },
    setup(props) {
        console.log(props)
        const registerStore = useRegisterStore();

        const i18n = useI18n();
        const firstName = ref(props.firstName || registerStore.registerPersonData?.personName.firstname);
        const lastName = ref(props.lastName || registerStore.registerPersonData?.personName.lastname);
        const email = ref("");
        const password = ref("");
        const languages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number } | number>({title: "SR", value: -1});
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const emailFormatMessage = computed(() => i18n.t("emailFormatMessage"));
        const emailFieldRules = [
                (value: string) => {
                    if (!value) return requiredFieldMessage.value;
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) return emailFormatMessage.value;
                    return true;
                }
            ];

            const passwordFieldRules = [
                (value: string) => {
                    if (!value) return requiredFieldMessage.value;
                    return true;
                }
            ];

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

                }
            AuthenticationService.registerResearcher(requestBody).then((response) => {
                console.log(response);
                
            }).catch(() => {
                alert("error")
            });
        };

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageResponse) => {
                    listOfLanguages.push({title: language.languageCode, value: language.id})
                    languages.value = listOfLanguages;
                    if (language.languageCode === "SR") {
                        selectedLanguage.value = language.id;
                    }
                })
            })
        });

        function isPersonSelected() {
           return registerStore.registerPersonData != null
        }

        return {email, emailFieldRules, passwordFieldRules, requiredFieldMessage, register, selectedLanguage, languages, firstName, lastName, selectedOrganisationUnit, setNewPassword, isPersonSelected}
    }
})
</script>

<style>

</style>