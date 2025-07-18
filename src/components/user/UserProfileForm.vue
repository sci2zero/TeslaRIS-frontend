<template>
    <v-checkbox v-if="!isAdmin" v-model="allowAccountTakeover" :label="$t('allowTakeoverLabel')" @click="updateAccountTakeoverPermission"></v-checkbox>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="isCommission ? 12 : 6">
                <v-text-field
                    v-model="name"
                    :label="isCommission ? $t('nameLabel') : $t('firstNameLabel')"
                    :rules="requiredFieldRules"
                    :readonly="isResearcher"
                ></v-text-field>
            </v-col>
            <v-col v-if="!isCommission" cols="6">
                <v-text-field
                    v-model="surname"
                    :label="$t('surnameLabel')"
                    :rules="requiredFieldRules"
                    :readonly="isResearcher"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-btn v-if="isResearcher" color="blue darken-1" class="update-researcher" @click="navigateToResearcherPage()">
            {{ $t("updateResearcherLabel") }}
        </v-btn>
        <v-row>
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="email"
                    :label="$t('emailLabel')"
                    :rules="emailFieldRules"
                ></v-text-field>
            </v-col>
            <v-col v-if="!isAdmin && !isResearcher" cols="12" md="6">
                <v-autocomplete
                    v-model="selectedOrganisationUnit"
                    :label="$t('organisationUnitLabel')"
                    :items="organisationUnits"
                    :custom-filter="filterOUs"
                    :rules="(isResearcher || isInstitutionalEditor || isCommission || isViceDeanForScience || isInstitutionalLibrarian || isHeadOfLibrary || isPromotionRegistryAdministrator) ? requiredSelectionRules : []"
                    :readonly="true"
                    :no-data-text="$t('noDataMessage')"
                    return-object
                ></v-autocomplete>
            </v-col>
            <v-col v-else cols="0" md="6" />
            <v-col cols="12" md="6">
                <v-select
                    v-model="selectedLanguage"
                    :label="$t('preferredLanguageLabel')"
                    :items="languages"
                    return-object
                ></v-select>
            </v-col>
            <v-col cols="12" md="6">
                <v-select
                    v-model="selectedReferenceLanguage"
                    :label="$t('preferredReferenceLanguageLabel')"
                    :items="languages"
                    return-object
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedNotificationPeriod"
                    :items="notificationPeriods"
                    :label="$t('notificationPeriodLabel')"
                    return-object>
                </v-select>
            </v-col>
        </v-row>
        <v-btn color="blue darken-1" @click="changePassword = !changePassword">
            {{ $t("changePasswordLabel") }} {{ changePassword ? "▲" : "▼" }}
        </v-btn>

        <transition name="fade-slide">
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
                        <password-input-with-meter
                            :label="$t('newPasswordLabel')"
                            repeat-password
                            @password-change="setNewPassword($event)">
                        </password-input-with-meter>
                    </v-col>
                </v-row>
            </v-container>
        </transition>
        <v-row justify="center" class="mt-5">
            <v-btn
                color="blue darken-1"
                :disabled="!isFormValid"
                class="submission-action"
                @click="updateUser">
                {{ $t("saveLabel") }}
            </v-btn>
        </v-row>
    </v-form>
    <toast v-model="snackbar" :message="snackbarText" />
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import LanguageService from "@/services/LanguageService";
import PasswordInputWithMeter from "@/components/core/PasswordInputWithMeter.vue";
import { onMounted } from "vue";
import type { AxiosError, AxiosResponse } from "axios";
import type { LanguageResponse, MultilingualContent } from "@/models/Common";
import { UserNotificationPeriod, type UserUpdateRequest } from "@/models/UserModel";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import UserService from "@/services/UserService";
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getNotificationPeriodForGivenLocale, getTitleFromValueAutoLocale } from "@/i18n/notificationPeriod";
import { useRouter } from "vue-router";
import Toast from "../core/Toast.vue";
import { useLoginStore } from "@/stores/loginStore";
import { useUserRole } from "@/composables/useUserRole";


export default defineComponent({
    name: "UserProfileForm",
    components: { PasswordInputWithMeter, Toast },
    setup() {
        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const router = useRouter();
        const loginStore = useLoginStore();

        const changePassword = ref(false);
        const isFormValid = ref(false);
        const showOldPassword = ref(false);

        const name = ref("");
        const surname = ref("");
        const originalEmail = ref("");
        const email = ref("");
        const languages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number }>({title: "SR", value: -1});
        const selectedReferenceLanguage = ref<{ title: string, value: number }>({title: "EN", value: -1});
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const ouPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(ouPlaceholder);
        const allowAccountTakeover = ref(false);
        const researcherId = ref(-1);

        const oldPassword = ref("");
        const newPassword = ref("");

        const {isResearcher, isAdmin, isCommission, isViceDeanForScience, isInstitutionalLibrarian, isHeadOfLibrary, isInstitutionalEditor, isPromotionRegistryAdministrator} = useUserRole();

        const i18n = useI18n();
        const savedMessage = computed(() => i18n.t("savedMessage"));
        const savedAndEmailUpdateRequestedMessage = computed(() => i18n.t("savedAndEmailUpdateRequestedMessage"));

        const selectionPlaceholder: { title: string, value: any } = { title: "", value: UserNotificationPeriod.NEVER };
        const notificationPeriods = getNotificationPeriodForGivenLocale();
        const selectedNotificationPeriod = ref(selectionPlaceholder);

        const { requiredFieldRules, requiredSelectionRules, emailFieldRules } = useValidationUtils();

        const populateUserData = () => {
            UserService.getLoggedInUser().then((response) => {
                name.value = response.data.firstname;
                surname.value = response.data.lastName;

                originalEmail.value = response.data.email;
                email.value = response.data.email;
                
                allowAccountTakeover.value = response.data.canTakeRole;
                selectedNotificationPeriod.value = {title: getTitleFromValueAutoLocale(response.data.notificationPeriod) as string, value: response.data.notificationPeriod};
                
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

                researcherId.value = response.data.personId;
                
                populateLanguageData(response.data.preferredUILanguage, response.data.preferredReferenceCataloguingLanguage);
            });
        };

        const populateLanguageData = (preferredUILanguage: string, preferredReferenceCataloguingLanguage: string) => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                response.data.forEach((language: LanguageResponse) => {
                    listOfLanguages.push({title: language.languageCode, value: language.id})
                    languages.value = listOfLanguages;
                    
                    if (language.languageCode === preferredUILanguage) {
                        selectedLanguage.value = { title: language.languageCode, value: language.id};
                    }
                    
                    if (language.languageCode === preferredReferenceCataloguingLanguage) {
                        selectedReferenceLanguage.value = { title: language.languageCode, value: language.id};
                    }
                })
            })
        };

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
                preferredUILanguageId: selectedLanguage.value.value,
                preferredReferenceCataloguingLanguageId: selectedReferenceLanguage.value.value,
                organisationUnitId: organisationUnitId,
                oldPassword: changePassword.value ? oldPassword.value : "",
                newPassword: changePassword.value ? newPassword.value : "",
                notificationPeriod: selectedNotificationPeriod.value.value
            };

            UserService.updateUser(userUpdateRequest).then((response) => {
                localStorage.setItem("jwt", response.data.token);
                localStorage.setItem("refreshToken", response.data.refreshToken);

                if (originalEmail.value !== email.value) {
                    snackbarText.value = savedAndEmailUpdateRequestedMessage.value;
                    email.value = originalEmail.value;
                } else {
                    snackbarText.value = savedMessage.value;
                }
                
                snackbar.value = true;

                UserService.invalidateCaches();
                loginStore.emitReloadUsername();

                i18n.locale.value = selectedLanguage.value.title.toLocaleLowerCase();
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

        const navigateToResearcherPage = () => {
            router.push({name: "researcherLandingPage", params: {id: researcherId.value}});
        };

        return {
            changePassword, name, surname, selectedReferenceLanguage,
            organisationUnits, selectedOrganisationUnit, 
            email, showOldPassword, languages, selectedLanguage, 
            filterOUs, allowAccountTakeover, isInstitutionalEditor,
            updateUser, setNewPassword, selectedNotificationPeriod,
            emailFieldRules, requiredFieldRules, requiredSelectionRules,
            isFormValid, notificationPeriods, oldPassword, newPassword,
            updateAccountTakeoverPermission, snackbar, snackbarText, timeout,
            navigateToResearcherPage, isAdmin, isResearcher, isCommission,
            isViceDeanForScience, isInstitutionalLibrarian, isHeadOfLibrary,
            isPromotionRegistryAdministrator
        };
    }
});
</script>

<style scoped>

.update-researcher {
    margin-top: -15px;
    margin-bottom: 20px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

</style>
