<template>
    <div>
        <v-form v-model="isFormValid" @submit.prevent>
            <div v-if="personSelection">
                <person-autocomplete-search
                    v-model="selectedPerson"
                    required
                    :read-only="!newResearcherCreationAllowed"
                    disable-submission />
            </div>
            <div v-if="newResearcherCreationAllowed">
                <v-btn
                    density="compact" class="bottom-spacer"
                    @click="personSelection = !personSelection">
                    {{ personSelection ? $t("addNewResearcherLabel") : $t("selectFromListLabel") }}
                </v-btn>
            </div>
            
            <ui-input
                v-model="firstName"
                :label="$t('firstNameLabel') + '*'"
                :placeholder="$t('firstNameLabel')"
                :rules="requiredFieldRules"
                class="register-field"
            />
            <ui-input
                v-model="lastName"
                :label="$t('surnameLabel') + '*'"
                :placeholder="$t('surnameLabel')"
                :rules="requiredFieldRules"
                class="register-field"
            />
            <div class="register-ou">
                <organisation-unit-autocomplete-search
                    ref="ouAutocompleteRef"
                    v-model="selectedOrganisationUnit"
                    required
                    only-client-institutions-cris
                    :readonly="disableOUSelection" />
            </div>
            <ui-input
                v-model="selectedLanguage"
                control="select"
                :label="$t('preferredLanguageLabel') + '*'"
                :items="languages"
                return-object
                class="register-field"
            />
            <ui-input
                v-model="email"
                :label="$t('emailLabel') + '*'"
                :placeholder="$t('emailLabel')"
                :rules="emailFieldRules"
                class="register-field"
            />
        </v-form>

        <v-btn
            class="register-submit" block size="large"
            rounded="lg" color="#3b6fe0" :disabled="!isFormValid" @click="register">
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
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getErrorMessageForErrorKey } from "@/i18n";
import { useRoute, useRouter } from "vue-router";
import Toast from "@/components/core/Toast.vue";
import { type ResearcherRegistrationRequest } from "@/models/AuthenticationModel";
import PersonAutocompleteSearch from "@/components/person/PersonAutocompleteSearch.vue";
import PersonService from "@/services/PersonService";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import LanguageService from "@/services/LanguageService";
import { type LanguageTagResponse } from "@/models/Common";
import { type AxiosResponse } from "axios";
import UiInput from "@/components/ui/input/Input.vue";


export default defineComponent({
    name: "OAuthRegistrationForm",
    components: { OrganisationUnitAutocompleteSearch, PersonAutocompleteSearch, Toast, UiInput },
    props: {
        newResearcherCreationAllowed: {
            type: Boolean,
            required: true
        }
    },
    setup() {
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const router = useRouter();
        const route = useRoute();

        const i18n = useI18n();
        const firstName = ref("");
        const lastName = ref("");
        const email = ref("");
        const selectedLanguage = ref<{ title: string, value: number }>({title: "SR", value: -1});

        const searchPlaceholder = {title: "", value: -1};
        const selectedPerson = ref<{ title: string, value: number }>(searchPlaceholder);
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(searchPlaceholder);

        const { requiredFieldRules, emailFieldRules } = useValidationUtils();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));

        const languages = ref<{ title: string, value: number }[]>([]);

        const disableOUSelection = ref(false);
        const personSelection = ref(true);

        onMounted(() => {
            PersonService.findResearcherByImportIdentifier(
                route.query.identifier as string
            ).then(response => {
                if (!response.data) {
                    return;
                }

                selectedPerson.value = {
                    title: response.data.name,
                    value: response.data?.databaseId
                };

                if (response.data.employmentInstitutionsId?.length > 0) {
                    OrganisationUnitService.readOU(
                        response.data.employmentInstitutionsId[0]
                    ).then(response => {
                        selectedOrganisationUnit.value = {
                            title: returnCurrentLocaleContent(response.data.name) as string,
                            value: response.data?.id
                        };
                        disableOUSelection.value = true;
                    });
                }
            });

            const name = route.query.name as string;
            if (name) {
                const nameParts = name.split(" ");
                firstName.value = nameParts[0];
                lastName.value = nameParts[1];
            }

            LanguageService.getAllUILanguages().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageTagResponse) => {
                    listOfLanguages.push({title: language.display, value: language.id})
                    languages.value = listOfLanguages;
                    if (language.languageCode === "SR") {
                        selectedLanguage.value = {title: language.display, value: language.id};
                    }
                });
            });
        });

        const register = () => {
            const requestBody: ResearcherRegistrationRequest = {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: "NOT_IMPORTANT",
                preferredLanguageId: selectedLanguage.value.value as number,
                organisationUnitId: selectedOrganisationUnit.value.value,
                personId: selectedPerson.value.value > 0 ? selectedPerson.value.value : undefined
            };

            AuthenticationService.registerResearcherOAuth(
                requestBody,
                route.query.provider as string,
                route.query.identifier as string
            ).then(() => {
                message.value = i18n.t("successfulRegistrationMessage");
                snackbar.value = true;

                setTimeout(() => {
                    router.push({ name: "login" });
                }, 5000);
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;

                if (error.response.data.message === "personAlreadyHasAccountMessage" && selectedPerson.value.value > 0) {
                    PersonService.getPersonWithUser(selectedPerson.value.value).then(response => {
                        const email = response.data.user.email;
                        router.push({name:"login", path:'/login/', query: { "email": email }})
                    });
                }
            });
        };

        return {
            email, emailFieldRules, requiredFieldMessage, personSelection,
            register, selectedLanguage, languages, firstName, lastName, 
            selectedOrganisationUnit, selectedPerson, disableOUSelection,
            requiredFieldRules, isFormValid, snackbar, message
        };
    }
})
</script>

<style scoped>
    .register-field {
        margin-bottom: 1rem;
    }

    .register-ou {
        margin-bottom: 1rem;
    }

    .register-submit {
        margin-top: 0.75rem;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0;
    }

    .register-submit:not(.v-btn--disabled) {
        box-shadow: 0 10px 24px rgba(59, 111, 224, 0.28);
    }
</style>
