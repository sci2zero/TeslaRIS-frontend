<template>
    <v-container id="registry-book-entry">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        {{ registryBookEntry?.personalInformation.authorName.firstname }} {{ registryBookEntry?.personalInformation.authorName.lastname }}
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("routeLabel.registryBookLandingPage") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Assessment Rulebook Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-registry-book-entry-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="RegistryBookEntryForm"
                            :form-props="{ presetRegistryBookEntry: registryBookEntry, canSave: canEdit }"
                            is-section-update
                            entity-name="RegistryBookEntry"
                            :read-only="!canEdit"
                            wide disable-submission
                            @create="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>
                        <div
                            v-if="registryBookEntry?.promotionId"
                            class="mb-5">
                            {{ $t("promotionLabel") }}:
                            <div class="response">
                                <localized-link :to="'registry-book?promotionId=' + registryBookEntry?.promotionId + (!registryBookEntry.promoted ? '&forPromotion=true' : '')">
                                    {{ `${localiseDate(registryBookEntry.promotionDate)} ${$t("inLabel")} ${localiseTime(registryBookEntry.promotionTime)}` }}
                                </localized-link>
                            </div>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <template v-if="registryBookEntry?.personalInformation">
                                    <div v-if="registryBookEntry.personalInformation.authorName.otherName">
                                        {{ $t("middleNameLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.personalInformation.authorName.otherName }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.personalInformation.localBirthDate">
                                        {{ $t("birthdateLabel") }}:
                                        <div class="response">
                                            {{ localiseDate(registryBookEntry.personalInformation.localBirthDate) }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.personalInformation.placeOfBrith">
                                        {{ $t("placeOfBirthLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.personalInformation.placeOfBrith }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.personalInformation.municipalityOfBrith">
                                        {{ $t("municipalityOfBirthLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.personalInformation.municipalityOfBrith }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.personalInformation.fatherName">
                                        {{ $t("fatherNameLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.personalInformation.fatherName }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.personalInformation.motherName">
                                        {{ $t("motherNameLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.personalInformation.motherName }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.personalInformation.guardianNameAndSurname">
                                        {{ $t("guardianNameLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.personalInformation.guardianNameAndSurname }}
                                        </div>
                                    </div>
                                </template>
                            </v-col>

                            <v-col cols="6">
                                <template v-if="registryBookEntry?.contactInformation">
                                    <div v-if="registryBookEntry.contactInformation.streetAndNumber">
                                        {{ $t("addressLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.contactInformation.streetAndNumber }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.contactInformation.place">
                                        {{ $t("placeLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.contactInformation.place }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.contactInformation.municipality">
                                        {{ $t("municipalityLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.contactInformation.municipality }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.contactInformation.postalCode">
                                        {{ $t("postalCodeLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.contactInformation.postalCode }}
                                        </div>
                                    </div>
                                </template>
                            </v-col>
                        </v-row>

                        <!-- Dissertation Info -->
                        <div class="mb-5 mt-8">
                            <b>{{ $t("dissertationInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <template v-if="registryBookEntry?.dissertationInformation">
                                    <div v-if="registryBookEntry.dissertationInformation.dissertationTitle">
                                        {{ $t("dissertationTitleLabel") }}:
                                        <div class="response">
                                            <localized-link :to="'scientific-results/thesis/' + registryBookEntry?.thesisId">
                                                {{ registryBookEntry.dissertationInformation.dissertationTitle }}
                                            </localized-link>
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.dissertationInformation.mentor">
                                        {{ $t("mentorLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.dissertationInformation.mentor }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.dissertationInformation.grade">
                                        {{ $t("gradeLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.dissertationInformation.grade }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.dissertationInformation.defenceDate">
                                        {{ $t("defenceDateLabel") }}:
                                        <div class="response">
                                            {{ localiseDate(registryBookEntry.dissertationInformation.defenceDate) }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.dissertationInformation.acquiredTitle">
                                        {{ $t("acquiredTitleLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.dissertationInformation.acquiredTitle }}
                                        </div>
                                    </div>
                                </template>
                            </v-col>

                            <v-col cols="6">
                                <div v-if="registryBookEntry?.dissertationInformation?.organisationUnitId">
                                    {{ $t("institutionNameLabel") }}:
                                    <div class="response">
                                        <localized-link :to="'organisation-units/' + registryBookEntry.dissertationInformation.organisationUnitId">
                                            {{ returnCurrentLocaleContent(registryBookEntry.dissertationInformation.institutionName) }}
                                        </localized-link>
                                    </div>
                                </div>

                                <div v-if="registryBookEntry?.dissertationInformation.diplomaNumber">
                                    {{ $t("diplomaNumberLabel") }}:
                                    <div class="response">
                                        {{ registryBookEntry?.dissertationInformation.diplomaNumber }}
                                    </div>
                                </div>

                                <div v-if="registryBookEntry?.dissertationInformation.diplomaIssueDate">
                                    {{ $t("diplomaIssueDateLabel") }}:
                                    <div class="response">
                                        {{ localiseDate(registryBookEntry?.dissertationInformation.diplomaIssueDate) }}
                                    </div>
                                </div>

                                <div v-if="registryBookEntry?.dissertationInformation.diplomaSupplementsNumber">
                                    {{ $t("diplomaSupplementsNumberLabel") }}:
                                    <div class="response">
                                        {{ registryBookEntry?.dissertationInformation.diplomaSupplementsNumber }}
                                    </div>
                                </div>

                                <div v-if="registryBookEntry?.dissertationInformation.diplomaSupplementsIssueDate">
                                    {{ $t("diplomaSupplementsIssueDateLabel") }}:
                                    <div class="response">
                                        {{ localiseDate(registryBookEntry?.dissertationInformation.diplomaSupplementsIssueDate) }}
                                    </div>
                                </div>
                                <div v-if="registryBookEntry?.promotionSchoolYear">
                                    {{ $t("schoolYearLabel") }}:
                                    <div class="response">
                                        {{ registryBookEntry?.promotionSchoolYear }}
                                    </div>
                                </div>
                                <div v-if="registryBookEntry?.registryBookNumber">
                                    {{ $t("registryBookNumberLabel") }}:
                                    <div class="response">
                                        {{ registryBookEntry?.registryBookNumber }}
                                    </div>
                                </div>
                            </v-col>
                        </v-row>

                        <!-- Previous Title Info -->
                        <div class="mb-5 mt-8">
                            <b>{{ $t("previousTitleInfoLabel") }}</b>
                        </div>
                        <v-row>
                            <v-col cols="6">
                                <template v-if="registryBookEntry?.previousTitleInformation">
                                    <div v-if="registryBookEntry.previousTitleInformation.institutionName">
                                        {{ $t("institutionNameLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.previousTitleInformation.institutionName }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.previousTitleInformation.institutionPlace">
                                        {{ $t("placeLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.previousTitleInformation.institutionPlace }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.previousTitleInformation.graduationDate">
                                        {{ $t("graduationDateLabel") }}:
                                        <div class="response">
                                            {{ localiseDate(registryBookEntry.previousTitleInformation.graduationDate) }}
                                        </div>
                                    </div>

                                    <div v-if="registryBookEntry.previousTitleInformation.schoolYear">
                                        {{ $t("schoolYearLabel") }}:
                                        <div class="response">
                                            {{ registryBookEntry.previousTitleInformation.schoolYear }}
                                        </div>
                                    </div>
                                </template>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <div class="flex justify-end">
            <generic-crud-modal
                v-if="!registryBookEntry?.inPromotion"
                class="mt-5"
                :form-component="PromotionSelectorForm"
                :form-props="{}"
                entity-name="Entry"
                primary-color
                @create="addToPromotion($event, (registryBookEntry?.id as number))"
            />
        </div>
        <div
            v-if="((isAdmin || canAllowEdit) && !canEdit) || (isAdmin && registryBookEntry?.promoted)"
            class="actions-box pa-4">
            <div class="text-subtitle-1 font-weight-medium mb-3">
                {{ $t("adminActionsLabel") }}
            </div>
            <div class="d-flex flex-wrap gap-2">
                <v-btn
                    v-if="(isAdmin || canAllowEdit) && !canEdit"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="allowSingleEdit()">
                    {{ $t("allowSingleEditLabel") }}
                </v-btn>
                <v-btn
                    v-if="isAdmin && registryBookEntry?.promoted"
                    class="mb-5 ml-2" color="primary" density="compact"
                    variant="outlined"
                    @click="initialteRemovalFromPromotion">
                    {{ $t("removeFromPromotionLabel") }}
                </v-btn>
            </div>
        </div>

        <toast v-model="snackbar" :message="snackbarMessage" />

        <persistent-question-dialog
            v-model="displayPersistentDialog"
            :title="$t('areYouSureLabel')"
            :message="$t('removeOneFromPromotionMessage')"
            @continue="removeFromPromotion">
        </persistent-question-dialog>
    </v-container>
</template>

<script lang="ts">
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import LocalizedLink from '@/components/localization/LocalizedLink.vue';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import { localiseDate, localiseTime } from '@/utils/DateUtil';
import RegistryBookEntryForm from '@/components/thesisLibrary/RegistryBookEntryForm.vue';
import GenericCrudModal from '@/components/core/GenericCrudModal.vue';
import Toast from '@/components/core/Toast.vue';
import { type RegistryBookEntry } from '@/models/ThesisLibraryModel';
import { useUserRole } from '@/composables/useUserRole';
import PromotionSelectorForm from '@/components/thesisLibrary/PromotionSelectorForm.vue';
import PersistentQuestionDialog from '@/components/core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "RegistryBookEntryLandingPage",
    components: { LocalizedLink, GenericCrudModal, Toast, PersistentQuestionDialog },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");
        const displayPersistentDialog = ref(false);

        const router = useRouter();
        const currentRoute = useRoute();
        const canEdit = ref(false);
        const canAllowEdit = ref(false);

        const registryBookEntry = ref<RegistryBookEntry>();
        const languageTagMap = ref<Map<number, LanguageTagResponse>>(new Map());

        const { isAdmin } = useUserRole();

        const i18n = useI18n();

        const icon = ref("mdi-book-outline");

        onMounted(() => {
            fetchRegistryBookEntry();
            
            checkCanEdit();
            checkCanAllowEdit();
        });

        const checkCanEdit = () => {
            RegistryBookService.canEdit(
                parseInt(currentRoute.params.id as string)
            ).then(response => {
                canEdit.value = response.data;
            });
        };

        const checkCanAllowEdit = () => {
            RegistryBookService.canAllowSingleEdit(
                parseInt(currentRoute.params.id as string)
            ).then(response => {
                canAllowEdit.value = response.data;
            });
        };

        const fetchRegistryBookEntry = () => {
            RegistryBookService.readRegistryBookEntry(
                parseInt(currentRoute.params.id as string)
            ).then((response) => {
                registryBookEntry.value = response.data;

                document.title = 
                    `${registryBookEntry.value?.personalInformation.authorName.firstname} ${registryBookEntry.value?.personalInformation.authorName.lastname}`;
            });
        };

        const updateBasicInfo = (entry: RegistryBookEntry) => {
            RegistryBookService.updateRegistryBookEntry(
                entry, parseInt(currentRoute.params.id as string)
            ).then(() => {
                snackbarMessage.value = i18n.t("updatedSuccessMessage");
                snackbar.value = true;
                fetchRegistryBookEntry();
                checkCanEdit();
            }).catch(() => {
                snackbarMessage.value = i18n.t("genericErrorMessage");
                snackbar.value = true;
            });
        };

        const allowSingleEdit = () => {
            RegistryBookService.allowSingleUpdate(
                parseInt(currentRoute.params.id as string)
            ).then(() => {
                checkCanEdit();
            });
        };

        const addToPromotion = (promotionId: number, entryId: number) => {
            RegistryBookService.addToPromotion(entryId, promotionId)
            .then(() => {
                router.push(
                    {
                        name: "registryBookList",
                        query: {promotionId: promotionId, forPromotion: "true"}
                    }
                );
            });
        };

        const initialteRemovalFromPromotion = () => {
            displayPersistentDialog.value = true;
        };

        const removeFromPromotion = () => {
            RegistryBookService.removeFromFinishedPromotion(registryBookEntry.value?.id as number)
            .then(() => {
                router.push({name: "registryBookList"});
            });
        };

        return {
            registryBookEntry, icon, returnCurrentLocaleContent,
            languageTagMap, localiseDate, snackbar, snackbarMessage,
            RegistryBookEntryForm, updateBasicInfo, canEdit,
            allowSingleEdit, isAdmin, canAllowEdit, localiseTime,
            PromotionSelectorForm, addToPromotion, removeFromPromotion,
            displayPersistentDialog, initialteRemovalFromPromotion
        };
}})

</script>

<style scoped>
    #registry-book-entry .large-registry-book-entry-icon {
        font-size: 10em;
    }

    #registry-book-entry .response {
        font-size: 1.2rem;
        margin-bottom: 10px;
        font-weight: bold;
    }

    .edit-pen-container {
        position:relative;
    }
</style>
