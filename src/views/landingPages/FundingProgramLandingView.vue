<template>
    <v-container id="funding-program">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center edit-pen-container">
                        <v-skeleton-loader
                            :loading="!fundingProgram"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="title" />
                            <div>
                                <generic-crud-modal
                                    class="mb-6"
                                    :form-component="AlternateNameForm"
                                    :form-props="{ presetName: fundingProgram?.name, presetNameAbbreviation: fundingProgram?.nameAbbreviation }"
                                    entity-name="Name"
                                    is-update
                                    is-section-update
                                    :read-only="!canEdit"
                                    @update="updateName"
                                />
                            </div>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("fundingProgramLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Basic Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-funding-program-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="FundingProgramUpdateForm"
                            :form-props="{ presetFundingProgram: fundingProgram }"
                            entity-name="FundingProgram"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>

                        <basic-info-loader v-if="!fundingProgram" />
                        <div v-else class="info-columns">
                            <div v-if="fundingProgram.funderName && fundingProgram.funderName.length > 0" class="info-item">
                                <div>{{ $t("funderLabel") }}:</div>
                                <div class="response">
                                    <localized-link v-if="fundingProgram.funderId" :to="'organisation-units/' + fundingProgram.funderId">
                                        {{ returnCurrentLocaleContent(fundingProgram.funderName) }}
                                    </localized-link>
                                    <span v-else>
                                        {{ returnCurrentLocaleContent(fundingProgram.funderName) }}
                                    </span>
                                </div>
                            </div>

                            <div v-if="fundingProgram.fundingTypes && fundingProgram.fundingTypes.length > 0" class="info-item">
                                <div>{{ $t("fundingTypesLabel") }}:</div>
                                <div class="response">
                                    {{ fundingProgram.fundingTypes.map((t: FundingType) => getFundingTypeTitleFromValueAutoLocale(t)).join(", ") }}
                                </div>
                            </div>

                            <div v-if="fundingProgram.dateFrom" class="info-item">
                                <div>{{ $t("dateFromLabel") }}:</div>
                                <div class="response">
                                    {{ localiseDate(fundingProgram.dateFrom) }}
                                </div>
                            </div>

                            <div v-if="fundingProgram.dateTo" class="info-item">
                                <div>{{ $t("dateToLabel") }}:</div>
                                <div class="response">
                                    {{ localiseDate(fundingProgram.dateTo) }}
                                </div>
                            </div>

                            <div v-if="fundingProgram.totalAmount" class="info-item">
                                <div>{{ $t("totalAmountLabel") }}:</div>
                                <div class="response">
                                    {{ formatAmount(fundingProgram.totalAmount.amount, locale) }} {{ fundingProgram.totalAmount.currencyCode }}
                                </div>
                            </div>

                            <div v-if="fundingProgram.uris && fundingProgram.uris.length > 0" class="info-item">
                                <div>{{ $t("urisLabel") }}:</div>
                                <div class="response">
                                    <div v-for="uri in fundingProgram.uris" :key="uri">
                                        <a :href="uri" target="_blank">{{ uri }}</a>
                                    </div>
                                </div>
                            </div>

                            <div v-if="fundingProgram.oaMandated !== undefined && fundingProgram.oaMandated !== null" class="info-item">
                                <div>{{ $t("oaMandatedLabel") }}:</div>
                                <div class="response">
                                    {{ fundingProgram.oaMandated ? $t("yesLabel") : $t("noLabel") }}
                                </div>
                            </div>

                            <div v-if="fundingProgram.oaMandateUrl" class="info-item">
                                <div>{{ $t("oaMandateUrlLabel") }}:</div>
                                <div class="response">
                                    <a :href="fundingProgram.oaMandateUrl" target="_blank">{{ fundingProgram.oaMandateUrl }}</a>
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Tabs -->
        <tab-content-loader v-if="!fundingProgram" layout="sections" />
        <v-tabs
            v-show="fundingProgram"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="fundingCalls">
                {{ $t("fundingCallsLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-show="fundingProgram" v-model="currentTab">
            <v-tabs-window-item value="fundingCalls">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <funding-program-calls-table-component
                            v-if="fundingProgram?.id"
                            :funding-program-id="fundingProgram.id"
                            :preset-keywords="fundingProgram.keywords"
                            :preset-date-from="fundingProgram.dateFrom"
                            :preset-date-to="fundingProgram.dateTo"
                            :can-edit="canEdit"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="documents">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <attachment-list
                            :attachments="fundingProgram?.fileItems ? fundingProgram.fileItems : []"
                            :can-edit="canEdit"
                            @create="addDocument($event)"
                            @delete="deleteDocument($event)"
                            @update="updateDocument($event)"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="fundingProgram?.keywords ? fundingProgram.keywords : []"
                    :can-edit="canEdit"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords"
                />

                <!-- Description -->
                <description-section
                    is-general-description
                    :description="fundingProgram?.description"
                    :can-edit="canEdit"
                    @update="updateDescription"
                />

                <!-- Objectives -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <generic-crud-modal
                                    :form-component="DescriptionOrBiographyUpdateForm"
                                    :form-props="{ presetDescriptionOrBiography: fundingProgram?.objectives ? fundingProgram.objectives : [], placeholderLabel: $t('objectivesLabel') }"
                                    entity-name="Objectives"
                                    is-update
                                    is-section-update
                                    :read-only="!canEdit"
                                    @update="updateObjectives"
                                />

                                <div><b>{{ $t("objectivesLabel") }}</b></div>
                                <strong v-if="!fundingProgram?.objectives || fundingProgram.objectives.length === 0">{{ $t("notYetSetMessage") }}</strong>
                                <rich-text-editor v-model="objectivesDisplay" :editable="false" />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Research Areas -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3 research-areas-card" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container">
                                <research-areas-update-modal
                                    :research-areas-hierarchy="fundingProgram?.researchAreas"
                                    :read-only="!canEdit"
                                    @update="updateResearchAreas"
                                />

                                <div class="mb-2">
                                    <b>{{ $t("researchAreasLabel") }}</b>
                                </div>
                                <research-area-hierarchy
                                    :research-areas="fundingProgram?.researchAreas"
                                    in-comparator
                                />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RichTitleRenderer from "@/components/core/RichTitleRenderer.vue";
import BasicInfoLoader from "@/components/core/BasicInfoLoader.vue";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import RichTextEditor from "@/components/core/RichTextEditor.vue";
import ResearchAreaHierarchy from "@/components/core/ResearchAreaHierarchy.vue";
import ResearchAreasUpdateModal from "@/components/core/ResearchAreasUpdateModal.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import FundingProgramService from "@/services/project/FundingProgramService";
import type { FundingProgram, FundingType } from "@/models/FundingModel";
import { getFundingTypeTitleFromValueAutoLocale } from "@/i18n/fundingType";
import Toast from "@/components/core/Toast.vue";
import type { MultilingualContent } from "@/models/Common";
import AttachmentList from "@/components/core/AttachmentList.vue";
import { useLoginStore } from "@/stores/loginStore";
import { useUploadStore } from "@/stores/uploadStore";
import type { DocumentFile } from "@/models/DocumentFileModel";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import DescriptionOrBiographyUpdateForm from "@/components/core/update/DescriptionOrBiographyUpdateForm.vue";
import { formatAmount } from "@/utils/MonetaryUtil";
import { localiseDate } from "@/utils/DateUtil";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import AlternateNameForm from "@/components/project/AlternateNameForm.vue";
import FundingProgramUpdateForm from "@/components/project/FundingProgramUpdateForm.vue";
import FundingProgramCallsTableComponent from "@/components/project/FundingProgramCallsTableComponent.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { locale } = useI18n();

const fundingProgram = ref<FundingProgram>();
const currentTab = ref("fundingCalls");
const icon = ref("mdi-cash");

const snackbar = ref(false);
const snackbarMessage = ref("");

const canEdit = ref(false);
const loginStore = useLoginStore();

const uploadStore = useUploadStore();

const objectivesDisplay = ref("");

const title = computed(() => {
    const name = returnCurrentLocaleContent(fundingProgram.value?.name) ?? "";
    const abbr = returnCurrentLocaleContent(fundingProgram.value?.nameAbbreviation);
    return abbr ? `${name} (${abbr})` : name;
});

onMounted(() => {
    fetchFundingProgram();
});

watch([() => fundingProgram.value?.objectives, locale], () => {
    objectivesDisplay.value = returnCurrentLocaleContent(fundingProgram.value?.objectives) ?? "";
});

const fetchFundingProgram = async () => {
    try {
        const response = await FundingProgramService.readFundingProgram(
            parseInt(route.params.id as string)
        );
        fundingProgram.value = response.data;

        if (loginStore.userLoggedIn) {
            checkIfUserCanEdit();
        }
    } catch (error) {
        console.error("Error fetching funding program:", error);
        await router.push({ name: "notFound" });
    }
};

const checkIfUserCanEdit = () => {
    FundingProgramService.canEdit(parseInt(route.params.id as string)).then((response) => {
        canEdit.value = response.data;
    }).catch(() => canEdit.value = false);
};

const searchKeyword = (keyword: string) => {
    router.push({ name: "advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" } });
};

const updateName = (nameInformation: {name: MultilingualContent[], nameAbbreviation: MultilingualContent[]}) => {
    fundingProgram.value!.name = nameInformation.name;
    fundingProgram.value!.nameAbbreviation = nameInformation.nameAbbreviation;
    performUpdate(true);
};

const updateKeywords = (keywords: MultilingualContent[]) => {
    fundingProgram.value!.keywords = keywords;
    performUpdate(true);
};

const updateDescription = (description: MultilingualContent[]) => {
    fundingProgram.value!.description = description;
    performUpdate(true);
};

const updateObjectives = (objectives: MultilingualContent[]) => {
    fundingProgram.value!.objectives = objectives;
    performUpdate(true);
};

const updateResearchAreas = (researchAreaIds: number[]) => {
    fundingProgram.value!.researchAreasId = researchAreaIds;
    performUpdate(true);
};

const updateBasicInfo = (basicInfo: FundingProgram) => {
    fundingProgram.value = { ...fundingProgram.value, ...basicInfo };
    performUpdate(true);
};

const performUpdate = (reload: boolean) => {
    if (fundingProgram.value?.totalAmount && fundingProgram.value.totalAmount.amount <= 0) {
        fundingProgram.value.totalAmount = undefined;
    }

    FundingProgramService.updateFundingProgram(fundingProgram.value?.id as number, fundingProgram.value as FundingProgram).then(() => {
        snackbarMessage.value = i18n.t("updatedSuccessMessage");
        snackbar.value = true;
        if (reload) {
            fetchFundingProgram();
        }
    }).catch(() => {
        snackbarMessage.value = i18n.t("genericErrorMessage");
        snackbar.value = true;
        fetchFundingProgram();
    });
};

const addDocument = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }
    uploadStore.uploadProgressRef?.startUpload(attachment.file.name);

    FundingProgramService.addDocument(fundingProgram.value?.id as number, attachment).then((response) => {
        fundingProgram.value?.fileItems?.push(response.data);
        uploadStore.uploadProgressRef?.updateProgress(100);
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};

const deleteDocument = (attachmentId: number) => {
    FundingProgramService.deleteDocument(fundingProgram.value?.id as number, attachmentId).then(() => {
        fundingProgram.value!.fileItems = fundingProgram.value?.fileItems?.filter(a => a.id !== attachmentId) ?? [];
    });
};

const updateDocument = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }

    if ((attachment.file?.size ?? 0) > 0) {
        uploadStore.uploadProgressRef?.startUpload(attachment.file.name);
    }

    FundingProgramService.updateDocument(attachment).then((response) => {
        fundingProgram.value!.fileItems = fundingProgram.value?.fileItems?.filter(a => a.id !== attachment.id) ?? [];
        fundingProgram.value?.fileItems?.push(response.data);

        if ((attachment.file?.size ?? 0) > 0) {
            uploadStore.uploadProgressRef?.updateProgress(100);
        }
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};
</script>

<style scoped>
#funding-program .large-funding-program-icon {
    font-size: 10em;
}

#funding-program .response {
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-weight: bold;
}

#funding-program .info-columns {
    columns: 2;
    column-gap: 40px;
}

#funding-program .info-item {
    break-inside: avoid;
}

@media (max-width: 959px) {
    #funding-program .info-columns {
        columns: 1;
    }
}

.edit-pen-container {
    position: relative;
}

.research-areas-card {
    padding: 24px 0 10px 0;
}

</style>
