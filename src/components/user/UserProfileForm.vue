<template>
    <v-checkbox v-if="userRole !== 'ADMIN'" v-model="allowAccountTakeover" :label="$t('allowTakeoverLabel')" @click="updateAccountTakeoverPermission"></v-checkbox>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="6">
                <v-text-field
                    v-model="name"
                    :label="$t('firstNameLabel')"
                    :rules="requiredFieldRules"
                    :readonly="userRole === 'RESEARCHER'"
                ></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="surname"
                    :label="$t('surnameLabel')"
                    :rules="requiredFieldRules"
                    :readonly="userRole === 'RESEARCHER'"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-btn v-if="userRole === 'RESEARCHER'" color="blue darken-1" class="update-researcher">
            {{ $t("updateResearcherLabel") }}
        </v-btn>
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="email"
                    :label="$t('emailLabel')"
                    :rules="emailFieldRules"
                ></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-select
                    v-model="selectedLanguage"
                    :label="$t('preferredLanguageLabel')"
                    :items="languages"
                    return-object
                ></v-select>
            </v-col>
            <v-col v-if="userRole !== 'ADMIN'" cols="6">
                <v-autocomplete
                    v-model="selectedOrganisationUnit"
                    :label="$t('organisationUnitLabel')"
                    :items="organisationUnits"
                    :custom-filter="filterOUs"
                    :auto-select-first="true"
                    :rules="userRole === 'RESEARCHER' ? requiredSelectionRules : []"
                    :readonly="userRole === 'RESEARCHER'"
                    :no-data-text="$t('noDataMessage')"
                    return-object
                    @update:search="searchOUs($event)"
                ></v-autocomplete>
            </v-col>
        </v-row>
        <v-btn color="blue darken-1" @click="changePassword = !changePassword">
            {{ $t("changePasswordLabel") }} {{ changePassword ? "▲" : "▼" }}
        </v-btn>
        <v-container v-if="changePassword">
            <v-row>
                <v-col cols="12" sm="6" class="bg-blue-grey-lighten-5">
                    <v-text-field
                        v-model="oldPassword"
                        :label="$t('oldPasswordLabel')"
                        :rules="requiredSelectionRules"
                        validate-on-blur
                        :append-icon="showOldPassword ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="showOldPassword ? 'text' : 'password'"
                        @click:append="showOldPassword = !showOldPassword"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6" class="bg-blue-grey-lighten-5">
                    <password-input-with-meter :label="$t('newPasswordLabel')" @password-change="setNewPassword($event)" @show-repeated-password="showRepeatedPassword = !showRepeatedPassword"></password-input-with-meter>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="6" class="bg-blue-grey-lighten-5">
                    <v-text-field
                        v-model="repeatNewPassword"
                        :label="$t('repeatNewPasswordLabel')"
                        :rules="repeatPasswordRules"
                        validate-on-blur
                        :type="showRepeatedPassword ? 'text' : 'password'"
                    ></v-text-field>
                </v-col>
            </v-row>
        </v-container>
        <v-row justify="center">
            <v-btn color="blue darken-1" :disabled="!isFormValid" class="submission-action" @click="updateUser">
                {{ $t("saveLabel") }}
            </v-btn>
        </v-row>
    </v-form>
    <v-snackbar
        v-model="snackbar"
        :timeout="timeout">
        {{ snackbarText }}
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
import { ref } from "vue";
import { defineComponent } from "vue";
import LanguageService from "@/services/LanguageService";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import PasswordInputWithMeter from "@/components/core/PasswordInputWithMeter.vue";
import { onMounted } from "vue";
import type { AxiosError, AxiosResponse } from "axios";
import type { LanguageResponse, MultilingualContent } from "@/models/Common";
import type { OrganisationUnitIndex } from "@/models/OrganisationUnitModel";
import type { UserUpdateRequest } from "@/models/UserModel";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import UserService from "@/services/UserService";
import lodash from "lodash";
import { useValidationUtils } from "@/utils/ValidationUtils";

export default defineComponent({
    name: "UserProfileForm",
    components: {PasswordInputWithMeter},
    setup() {
        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const changePassword = ref(false);
        const isFormValid = ref(false);
        const showOldPassword = ref(false);
        const showRepeatedPassword = ref(false);

        const name = ref("");
        const surname = ref("");
        const email = ref("");
        const languages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number }>({title: "SR", value: -1});
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const ouPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(ouPlaceholder);
        const allowAccountTakeover = ref(false);

        const oldPassword = ref("");
        const newPassword = ref("");
        const repeatNewPassword = ref("");

        const userRole = ref("");

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const emailFormatMessage = computed(() => i18n.t("emailFormatError"));
        const passwordsDontMatchMessage = computed(() => i18n.t("passwordsDontMatchMessage"));
        const savedMessage = computed(() => i18n.t("savedMessage"));

        const emailFieldRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return emailFormatMessage.value;
                return true;
            }
        ];

        const repeatPasswordRules = [
            (value: string) => {
                if (!value) return requiredFieldMessage.value;
                if (newPassword.value !== repeatNewPassword.value) return passwordsDontMatchMessage.value;
                return true;
            }
        ];

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const populateUserData = () => {
            UserService.getLoggedInUser().then((response) => {
                name.value = response.data.firstname;
                surname.value = response.data.lastName;
                email.value = response.data.email;
                allowAccountTakeover.value = response.data.canTakeRole;

                userRole.value = UserService.provideUserRole();
                
                let ouNameSr = "";
                let ouNameOther = "";
                response.data.organisationUnitName.forEach((mc: MultilingualContent) => {
                    if(mc.languageTag === "SR") {
                        ouNameSr = mc.content;
                    } else {
                        ouNameOther = mc.content;
                    }
                });

                ouNameSr = ouNameSr === "" ? ouNameOther : ouNameSr;
                ouNameOther = ouNameOther === "" ? ouNameSr : ouNameOther;

                if(response.data.organisationUnitId !== -1) {
                    if (i18n.locale.value === "sr") {
                        selectedOrganisationUnit.value = { title: ouNameSr, value: response.data.organisationUnitId }
                    } else {
                        selectedOrganisationUnit.value = { title: ouNameOther, value: response.data.organisationUnitId }
                    }
                }
                
                populateLanguageData(response.data.preferredLanguage);
            });
        };

        const populateLanguageData = (preferredLanguage: string) => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageResponse) => {
                    listOfLanguages.push({title: language.languageCode, value: language.id})
                    languages.value = listOfLanguages;
                    if (language.languageCode === preferredLanguage) {
                        selectedLanguage.value = { title: language.languageCode, value: language.id};
                    }
                })
            })
        };

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

        const filterOUs = (): boolean => {
            return true;
        };

        const setNewPassword = (password: string) => {
            newPassword.value = password;
        };

        const updateUser = () => {
            let organisationUnitId = -1;
            if (typeof selectedOrganisationUnit.value === "number") {
                organisationUnitId = selectedOrganisationUnit.value;
            } else {
                organisationUnitId = selectedOrganisationUnit.value.value;
            }

            const userUpdateRequest: UserUpdateRequest = {
                firstname: name.value,
                lastName: surname.value,
                email: email.value,
                preferredLanguageId: selectedLanguage.value.value,
                organisationUnitId: organisationUnitId,
                oldPassword: oldPassword.value,
                newPassword: newPassword.value
            }
            UserService.updateUser(userUpdateRequest).then((response) => {
                sessionStorage.setItem("jwt", response.data.token);
                sessionStorage.setItem("refreshToken", response.data.refreshToken);
                snackbarText.value = savedMessage.value;
                snackbar.value = true;
            }).catch((error: AxiosError<any, any>) => {
                snackbarText.value = i18n.t(error.response?.data.message);
                snackbar.value = true;
            });
        };

        const updateAccountTakeoverPermission = () => {
            UserService.allowRoleTaking().then(() => {
                snackbarText.value = savedMessage.value;
                snackbar.value = true;
            });
        };

        onMounted(() => {
            populateUserData();
        });

        return {changePassword, 
                name,
                surname,
                organisationUnits, 
                selectedOrganisationUnit, 
                email, showOldPassword, showRepeatedPassword,
                languages, selectedLanguage, 
                searchOUs, filterOUs,
                allowAccountTakeover,
                updateUser, setNewPassword, 
                emailFieldRules, requiredFieldRules, requiredSelectionRules, repeatPasswordRules,
                isFormValid, userRole,
                oldPassword, newPassword, repeatNewPassword,
                updateAccountTakeoverPermission, snackbar, snackbarText, timeout};
    }
});
</script>

<style scoped>

.update-researcher {
    margin-top: -15px;
    margin-bottom: 20px;
}

</style>
