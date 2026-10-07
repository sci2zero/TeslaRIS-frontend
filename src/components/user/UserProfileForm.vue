<template>
    <ui-checkbox
        v-if="!isAdmin"
        v-model="allowAccountTakeover"
        :label="$t('allowTakeoverLabel')"
        class="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2"
        @click="updateAccountTakeoverPermission"
    />
    <v-form v-model="isFormValid" class="space-y-8" @submit.prevent>
        <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ui-input
                    v-model="name"
                    :class="isCommission ? 'md:col-span-2' : ''"
                    :label="isCommission ? $t('nameLabel') : $t('firstNameLabel')"
                    :placeholder="isCommission ? $t('nameLabel') : $t('firstNameLabel')"
                    :rules="requiredFieldRules"
                    :readonly="isResearcher"
                />
                <ui-input
                    v-if="!isCommission"
                    v-model="surname"
                    :label="$t('surnameLabel')"
                    :placeholder="$t('surnameLabel')"
                    :rules="requiredFieldRules"
                    :readonly="isResearcher"
                />
            </div>

            <UiButton
                v-if="isResearcher"
                variant="outline"
                @click="navigateToResearcherPage()"
            >
                <span class="mdi mdi-account-edit-outline" aria-hidden="true"></span>
                {{ $t("updateResearcherLabel") }}
            </UiButton>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ui-input
                    v-model="email"
                    :label="$t('emailLabel')"
                    :placeholder="$t('emailLabel')"
                    :rules="emailFieldRules"
                />
                <ui-input
                    v-if="!isAdmin && !isResearcher && hasInstitution"
                    v-model="selectedOrganisationUnit"
                    control="autocomplete"
                    :label="$t('organisationUnitLabel')"
                    :items="organisationUnits"
                    :custom-filter="filterOUs"
                    :rules="organisationUnitRules"
                    readonly
                    :no-data-text="$t('noDataMessage')"
                    return-object
                />
                <ui-input
                    v-model="selectedLanguage"
                    control="select"
                    :label="$t('preferredLanguageLabel')"
                    :items="uiLanguages"
                    return-object
                />
                <ui-input
                    v-model="selectedReferenceLanguage"
                    control="select"
                    :label="$t('preferredReferenceLanguageLabel')"
                    :items="languages"
                    return-object
                />
            </div>
        </div>

        <div class="grid grid-cols-1 items-end gap-4 border-t border-slate-200 pt-8 md:grid-cols-2">
            <ui-input
                v-model="selectedNotificationPeriod"
                control="select"
                :items="notificationPeriods"
                :label="$t('notificationPeriodLabel')"
                return-object
            />
            <ui-checkbox
                v-model="onlyNewNotifications"
                :label="$t('sendOnlyNewNotificationsLabel')"
                class="md:mb-2"
            />
        </div>

        <transition name="fade-slide">
            <div
                v-if="changePassword"
                class="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
            >
                <ui-input
                    v-model="oldPassword"
                    :label="$t('oldPasswordLabel')"
                    :placeholder="$t('oldPasswordLabel')"
                    :rules="requiredSelectionRules"
                    validate-on="blur"
                    :type="showOldPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                >
                    <template #append-inner>
                        <v-icon
                            :icon="showOldPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                            @click="showOldPassword = !showOldPassword"
                        />
                    </template>
                </ui-input>
                <div>
                    <password-input-with-meter
                        embedded
                        :label="$t('newPasswordLabel')"
                        repeat-password
                        @password-change="setNewPassword($event)"
                    />
                </div>
            </div>
        </transition>

        <div class="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <UiButton
                variant="outline"
                type="button"
                @click="changePassword = !changePassword"
            >
                <span
                    class="mdi"
                    :class="changePassword ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    aria-hidden="true"
                ></span>
                {{ $t("changePasswordLabel") }}
            </UiButton>
            <v-menu location="bottom start">
                <template #activator="{ props: menuProps }">
                    <UiButton
                        v-bind="menuProps"
                        variant="outline"
                        type="button"
                    >
                        {{ $t("advancedOptionsLabel") }}
                        <span class="mdi mdi-chevron-down" aria-hidden="true"></span>
                    </UiButton>
                </template>
                <v-list density="compact" class="min-w-64 rounded-lg border border-slate-200 py-2">
                    <v-menu location="end" open-on-hover open-on-click :open-delay="100">
                        <template #activator="{ props: submenuProps }">
                            <v-list-item
                                v-bind="submenuProps"
                                append-icon="mdi-chevron-right"
                            >
                                <template #prepend>
                                    <v-icon icon="mdi-map-marker-path" />
                                </template>
                                <v-list-item-title>{{ $t("tutorialOptionsLabel") }}</v-list-item-title>
                            </v-list-item>
                        </template>
                        <v-list density="compact" min-width="280" class="rounded-lg border border-slate-200 py-2">
                            <template v-if="isAdmin">
                                <v-list-item
                                    v-for="tutorial in tutorialStore.availableTutorials"
                                    :key="tutorial.key"
                                    @click="startTutorial(tutorial.key)"
                                >
                                    <template #prepend>
                                        <v-icon
                                            :icon="tutorialStore.isCompleted(tutorial.key) ? 'mdi-check-circle' : 'mdi-play-circle-outline'"
                                            :color="tutorialStore.isCompleted(tutorial.key) ? 'success' : undefined"
                                        />
                                    </template>
                                    <v-list-item-title>{{ $t(tutorial.label) }}</v-list-item-title>
                                    <template v-if="tutorialStore.isCompleted(tutorial.key)" #append>
                                        <v-icon icon="mdi-check" color="success" size="small" />
                                    </template>
                                </v-list-item>
                                <v-divider class="my-1" />
                            </template>
                            <v-list-item @click="resetTutorialHistory">
                                <template #prepend>
                                    <v-icon icon="mdi-delete-outline" color="error" />
                                </template>
                                <v-list-item-title>{{ $t("resetTutorialHistoryLabel") }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list>
            </v-menu>
            <UiButton
                class="sm:ml-auto"
                type="button"
                :disabled="!isFormValid"
                @click="updateUser"
            >
                {{ $t("saveLabel") }}
            </UiButton>
        </div>
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
import type { LanguageTagResponse, MultilingualContent } from "@/models/Common";
import { UserNotificationPeriod, type UserUpdateRequest } from "@/models/UserModel";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import UserService from "@/services/UserService";
import { useValidationUtils } from "@/utils/ValidationUtils";
import { getNotificationPeriodForGivenLocale, getTitleFromValueAutoLocale } from "@/i18n/notificationPeriod";
import { useRouter } from "vue-router";
import Toast from "../core/Toast.vue";
import { useLoginStore } from "@/stores/loginStore";
import { useTutorialStore, type TutorialKey } from "@/stores/tutorialStore";
import { useUserRole } from "@/composables/useUserRole";
import UiInput from "@/components/ui/input/Input.vue";
import UiCheckbox from "@/components/ui/checkbox/Checkbox.vue";
import { UiButton } from "@/components/ui/button";


export default defineComponent({
    name: "UserProfileForm",
    components: { PasswordInputWithMeter, Toast, UiInput, UiCheckbox, UiButton },
    setup() {
        const snackbar = ref(false);
        const snackbarText = ref("");
        const timeout = 5000;

        const router = useRouter();
        const loginStore = useLoginStore();
        const tutorialStore = useTutorialStore();

        const changePassword = ref(false);
        const isFormValid = ref(false);
        const showOldPassword = ref(false);

        const name = ref("");
        const surname = ref("");
        const originalEmail = ref("");
        const email = ref("");
        const languages = ref<{ title: string, value: number }[]>([]);
        const uiLanguages = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number }>({title: "SR", value: -1});
        const selectedReferenceLanguage = ref<{ title: string, value: number }>({title: "EN", value: -1});
        const organisationUnits = ref<{ title: string, value: number }[]>([]);
        const ouPlaceholder = {title: "", value: -1};
        const selectedOrganisationUnit = ref<{ title: string, value: number }>(ouPlaceholder);
        const allowAccountTakeover = ref(false);
        const researcherId = ref(-1);
        const onlyNewNotifications = ref(true);

        const oldPassword = ref("");
        const newPassword = ref("");

        const {
            isResearcher, isAdmin, isCommission, 
            isViceDeanForScience, isInstitutionalLibrarian, 
            isHeadOfLibrary, isInstitutionalEditor, 
            isPromotionRegistryAdministrator, hasInstitution
        } = useUserRole();

        const i18n = useI18n();
        const savedMessage = computed(() => i18n.t("savedMessage"));
        const savedAndEmailUpdateRequestedMessage = computed(() => i18n.t("savedAndEmailUpdateRequestedMessage"));

        const selectionPlaceholder: { title: string, value: any } = { title: "", value: UserNotificationPeriod.NEVER };
        const notificationPeriods = getNotificationPeriodForGivenLocale();
        const selectedNotificationPeriod = ref(selectionPlaceholder);

        const { requiredFieldRules, requiredSelectionRules, emailFieldRules } = useValidationUtils();

        const organisationUnitRules = computed(() =>
            (isResearcher.value || isInstitutionalEditor.value || isCommission.value || isViceDeanForScience.value || isInstitutionalLibrarian.value || isHeadOfLibrary.value || isPromotionRegistryAdministrator.value)
                ? requiredSelectionRules
                : []
        );

        const populateUserData = () => {
            UserService.getLoggedInUser().then((response) => {
                name.value = response.data.firstname;
                surname.value = response.data.lastName;

                originalEmail.value = response.data.email;
                email.value = response.data.email;
                
                allowAccountTakeover.value = response.data.canTakeRole;
                selectedNotificationPeriod.value = {
                    title: getTitleFromValueAutoLocale(response.data.notificationPeriod) as string, 
                    value: response.data.notificationPeriod
                };
                onlyNewNotifications.value = response.data.sendOnlyNewNotifications;
                
                let ouNameSr = "";
                let ouNameOther = "";
                response.data.organisationUnitName.forEach((mc: MultilingualContent) => {
                    if(mc.languageTag.startsWith("SR")) {
                        ouNameSr = mc.content;
                    } else {
                        ouNameOther = mc.content;
                    }
                });

                ouNameSr = ouNameSr === "" ? ouNameOther : ouNameSr;
                ouNameOther = ouNameOther === "" ? ouNameSr : ouNameOther;

                if(response.data.organisationUnitId !== -1) {
                    if (i18n.locale.value.startsWith("sr")) {
                        selectedOrganisationUnit.value = { title: ouNameSr, value: response.data.organisationUnitId }
                    } else {
                        selectedOrganisationUnit.value = { title: ouNameOther, value: response.data.organisationUnitId }
                    }
                }

                researcherId.value = response.data.personId;

                tutorialStore.syncFromProgress(response.data.tutorialProgress);
                
                populateLanguageData(response.data.preferredUILanguage, response.data.preferredReferenceCataloguingLanguage);
            });
        };

        const populateLanguageData = (preferredUILanguage: string, preferredReferenceCataloguingLanguage: string) => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                const listOfLanguages: { title: string, value: number }[] = [];
                uiLanguages.value.splice(0);
                response.data.forEach((language: LanguageTagResponse) => {
                    listOfLanguages.push({title: language.languageCode, value: language.id})
                    languages.value = listOfLanguages;
                    if (i18n.availableLocales.includes(language.languageCode.toLowerCase())) {
                        uiLanguages.value.push({title: language.languageCode, value: language.id})
                    }
                    
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
            const selectedInstitutionId =
                typeof selectedOrganisationUnit.value === "number"
                    ? selectedOrganisationUnit.value
                    : selectedOrganisationUnit.value.value;

            const organisationUnitId =
                selectedInstitutionId > 0 ? selectedInstitutionId : undefined;

            const userUpdateRequest: UserUpdateRequest = {
                firstname: name.value,
                lastName: surname.value,
                email: email.value,
                preferredUILanguageTagId: selectedLanguage.value.value,
                preferredReferenceCataloguingLanguageTagId: selectedReferenceLanguage.value.value,
                organisationUnitId: organisationUnitId,
                oldPassword: changePassword.value ? oldPassword.value : "",
                newPassword: changePassword.value ? newPassword.value : "",
                notificationPeriod: selectedNotificationPeriod.value.value,
                sendOnlyNewNotifications: onlyNewNotifications.value
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

        const resetTutorialHistory = () => {
            UserService.resetTutorialProgress().then(() => {
                tutorialStore.resetHistory();
                snackbarText.value = i18n.t("tutorialHistoryResetMessage");
                snackbar.value = true;
            }).catch((error: AxiosError<any, any>) => {
                snackbarText.value = i18n.t(error.response?.data?.message ?? "genericErrorMessage");
                snackbar.value = true;
            });
        };

        const startTutorial = (tutorialKey: TutorialKey) => {
            tutorialStore.stop();
            tutorialStore.start(tutorialKey, true);
        };

        return {
            changePassword, name, surname, selectedReferenceLanguage,
            organisationUnits, selectedOrganisationUnit, 
            email, showOldPassword, languages, selectedLanguage, 
            filterOUs, allowAccountTakeover, isInstitutionalEditor,
            updateUser, setNewPassword, selectedNotificationPeriod,
            emailFieldRules, requiredFieldRules, requiredSelectionRules, organisationUnitRules,
            isFormValid, notificationPeriods, oldPassword, newPassword, hasInstitution,
            updateAccountTakeoverPermission, snackbar, snackbarText, timeout,
            navigateToResearcherPage, isAdmin, isResearcher, isCommission,
            isViceDeanForScience, isInstitutionalLibrarian, isHeadOfLibrary,
            isPromotionRegistryAdministrator, uiLanguages, onlyNewNotifications,
            resetTutorialHistory, startTutorial, tutorialStore
        };
    }
});
</script>

<style scoped>

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
