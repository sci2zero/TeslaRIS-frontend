<template>
    <v-container id="fundingCall">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center edit-pen-container">
                        <v-skeleton-loader
                            :loading="!fundingCall"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="title" />
                            <div>
                                <generic-crud-modal
                                    class="mb-6"
                                    :form-component="FundingCallUpdateForm"
                                    :form-props="{ presetFundingCall: fundingCall }"
                                    entity-name="FundingCall"
                                    is-update
                                    is-section-update
                                    :read-only="!canEdit"
                                    wide
                                    @update="updateFundingCall"
                                />
                            </div>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("fundingCallLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Basic Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-funding-call-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text>
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>

                        <basic-info-loader v-if="!fundingCall" />
                        <v-row v-else>
                            <!-- Left column -->
                            <v-col cols="6">
                                <div v-if="fundingCall.dateFrom">
                                    {{ $t("dateFromLabel") }}:
                                </div>
                                <div v-if="fundingCall.dateFrom" class="response">
                                    {{ localiseDate(fundingCall.dateFrom) }}
                                </div>

                                <div v-if="fundingCall.dateTo">
                                    {{ $t("dateToLabel") }}:
                                </div>
                                <div v-if="fundingCall.dateTo" class="response">
                                    {{ localiseDate(fundingCall.dateTo) }}
                                </div>

                                <div v-if="funderName">
                                    {{ $t("funderLabel") }}:
                                </div>
                                <div v-if="funderName" class="response">
                                    {{ funderName }}
                                </div>

                                <div v-if="fundingCall.fundingTypes && fundingCall.fundingTypes.length > 0">
                                    {{ $t("fundingTypesLabel") }}:
                                </div>
                                <div v-if="fundingCall.fundingTypes && fundingCall.fundingTypes.length > 0" class="response">
                                    {{ fundingCall.fundingTypes.map((t : FundingType) => getFundingTypeTitleFromValueAutoLocale(t)).join(", ") }}
                                </div>

                                <div v-if="fundingCall.fundingProgramName && fundingCall.fundingProgramName.length > 0">
                                    {{ $t("fundingProgramLabel") }}:
                                </div>
                                <div v-if="fundingCall.fundingProgramName && fundingCall.fundingProgramName.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(fundingCall.fundingProgramName) }}
                                </div>
                            </v-col>

                            <!-- Right column -->
                            <v-col cols="6">
                                <div v-if="fundingCall.monetaryAmount">
                                    {{ $t("totalAmountLabel") }}:
                                </div>
                                <div v-if="fundingCall.monetaryAmount" class="response">
                                    {{ formatAmount(fundingCall.monetaryAmount.amount, locale) }} {{ fundingCall.monetaryAmount.currencyCode }}
                                </div>

                                <div v-if="fundingCall.uris && fundingCall.uris.length > 0">
                                    {{ $t("urisLabel") }}:
                                </div>
                                <div v-if="fundingCall.uris && fundingCall.uris.length > 0" class="response">
                                    <div v-for="uri in fundingCall.uris" :key="uri">
                                        <a :href="uri" target="_blank">{{ uri }}</a>
                                    </div>
                                </div>

                                <div v-if="fundingCall.oaMandated !== undefined && fundingCall.oaMandated !== null">
                                    {{ $t("oaMandatedLabel") }}:
                                </div>
                                <div v-if="fundingCall.oaMandated !== undefined && fundingCall.oaMandated !== null" class="response">
                                    {{ fundingCall.oaMandated ? $t("yesLabel") : $t("noLabel") }}
                                </div>

                                <div v-if="fundingCall.oaMandateUrl">
                                    {{ $t("oaMandateUrlLabel") }}:
                                </div>
                                <div v-if="fundingCall.oaMandateUrl" class="response">
                                    <a :href="fundingCall.oaMandateUrl" target="_blank">{{ fundingCall.oaMandateUrl }}</a>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Tabs -->
        <tab-content-loader v-if="!fundingCall" layout="sections" />
        <v-tabs
            v-show="fundingCall"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="contributors">
                {{ $t("contributorsLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-show="fundingCall" v-model="currentTab">
            <v-tabs-window-item value="contributors">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <person-funding-call-contribution-tabs
                            :contribution-list="fundingCall?.contributors ? fundingCall.contributors : []"
                            :read-only="!canEdit"
                            @update="updateContributors"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="documents">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <attachment-list
                            :attachments="fundingCall?.fileItems ? fundingCall.fileItems : []"
                            :can-edit="canEdit"
                            @create="addCallDocument($event)"
                            @delete="deleteCallDocument($event)"
                            @update="updateCallDocument($event)"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="fundingCall?.keywords ? fundingCall.keywords : []"
                    :can-edit="canEdit"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords" />

                <!-- Description -->
                <div>
                    <description-section
                        :description="fundingCall?.description"
                        :can-edit="canEdit"
                        is-general-description
                        @update="updateDescription"
                    />
                </div>

                <!-- Objectives -->
                <div>
                    <objectives-section
                        :objectives="fundingCall?.objectives"
                        :can-edit="canEdit"
                        @update="updateObjectives"
                    />
                </div>

                <!-- Research areas -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text class="edit-pen-container research-areas-container">
                                <research-areas-update-modal
                                    :research-areas-hierarchy="fundingCall?.researchAreas ? fundingCall.researchAreas : []"
                                    :read-only="!canEdit"
                                    @update="updateResearchAreas"
                                />
                                <div><b>{{ $t("researchAreasLabel") }}</b></div>
                                <research-area-hierarchy
                                    :research-areas="fundingCall?.researchAreas ? fundingCall.researchAreas : []"
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
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import RichTitleRenderer from "@/components/core/RichTitleRenderer.vue";
import BasicInfoLoader from "@/components/core/BasicInfoLoader.vue";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import FundingCallService from "@/services/project/FundingCallService";
import type { FundingCall, PersonFundingCallContribution } from "@/models/FundingCallModel";
import type { FundingType } from "@/models/FundingModel";
import { getFundingTypeTitleFromValueAutoLocale } from "@/i18n/fundingType";
import Toast from "@/components/core/Toast.vue";
import type { MultilingualContent } from "@/models/Common";
import AttachmentList from "@/components/core/AttachmentList.vue";
import { useUploadStore } from "@/stores/uploadStore";
import { useUserRole } from "@/composables/useUserRole";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import type { DocumentFile } from "@/models/DocumentFileModel";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import ObjectivesSection from "@/components/project/ObjectivesSection.vue";
import ResearchAreasUpdateModal from "@/components/core/ResearchAreasUpdateModal.vue";
import ResearchAreaHierarchy from "@/components/core/ResearchAreaHierarchy.vue";
import PersonFundingCallContributionTabs from "@/components/project/PersonFundingCallContributionTabs.vue";
import { formatAmount } from "@/utils/MonetaryUtil";
import { localiseDate } from '@/utils/DateUtil';
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import FundingCallUpdateForm from "@/components/project/FundingCallUpdateForm.vue";

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { locale } = useI18n();

const fundingCall = ref<FundingCall>();
const currentTab = ref("contributors");
const icon = ref("mdi-cash-multiple");

const snackbar = ref(false);
const snackbarMessage = ref("");

const funderName = ref("");

const { isAdmin, isResearcher } = useUserRole();
const canEdit = computed(() => isAdmin.value || isResearcher.value);

const uploadStore = useUploadStore();

const title = computed(() => {
    const name = returnCurrentLocaleContent(fundingCall.value?.name) ?? "";
    const abbr = returnCurrentLocaleContent(fundingCall.value?.nameAbbreviation);
    return abbr ? `${name} (${abbr})` : name;
});

onMounted(() => {
    fetchFundingCall();
});

const fetchFundingCall = async () => {
    try {
        const response = await FundingCallService.readFundingCall(
            parseInt(route.params.id as string)
        );
        fundingCall.value = response.data;

        if (fundingCall.value.funderId) {
            fetchFunderName(fundingCall.value.funderId);
        }
    } catch (error) {
        console.error("Error fetching funding call:", error);
        await router.push({ name: "notFound" });
    }
};

const fetchFunderName = (funderId: number) => {
    OrganisationUnitService.readOU(funderId).then((response) => {
        funderName.value = returnCurrentLocaleContent(response.data.name) as string;
    });
};

const searchKeyword = (keyword: string) => {
    router.push({ name: "advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" } });
};

const updateKeywords = (keywords: MultilingualContent[]) => {
    fundingCall.value!.keywords = keywords;
    performUpdate(true);
};

const updateDescription = (description: MultilingualContent[]) => {
    fundingCall.value!.description = description;
    performUpdate(true);
};

const updateObjectives = (objectives: MultilingualContent[]) => {
    fundingCall.value!.objectives = objectives;
    performUpdate(true);
};

const updateContributors = (contributors: PersonFundingCallContribution[]) => {
    fundingCall.value!.contributors = contributors;
    performUpdate(true);
};

const updateResearchAreas = (researchAreaIds: number[]) => {
    fundingCall.value!.researchAreasId = researchAreaIds;
    performUpdate(true);
};

const updateFundingCall = (basicInfo: FundingCall) => {
    fundingCall.value = { ...fundingCall.value, ...basicInfo };
    performUpdate(true);
};

const performUpdate = (reload: boolean) => {
    if (fundingCall.value?.monetaryAmount && fundingCall.value.monetaryAmount.amount <= 0) {
        fundingCall.value.monetaryAmount = undefined;
    }

    FundingCallService.updateFundingCall(fundingCall.value?.id as number, fundingCall.value as FundingCall).then(() => {
        snackbarMessage.value = i18n.t("updatedSuccessMessage");
        snackbar.value = true;
        if (reload) {
            fetchFundingCall();
        }
    }).catch(() => {
        snackbarMessage.value = i18n.t("genericErrorMessage");
        snackbar.value = true;
        fetchFundingCall();
    });
};

const addCallDocument = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }
    uploadStore.uploadProgressRef?.startUpload(attachment.file.name);

    FundingCallService.addCallDocument(fundingCall.value?.id as number, attachment).then((response) => {
        fundingCall.value?.fileItems?.push(response.data);
        uploadStore.uploadProgressRef?.updateProgress(100);
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};

const deleteCallDocument = (attachmentId: number) => {
    FundingCallService.deleteCallDocument(fundingCall.value?.id as number, attachmentId).then(() => {
        fundingCall.value!.fileItems = fundingCall.value?.fileItems?.filter(a => a.id !== attachmentId) ?? [];
    });
};

const updateCallDocument = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }

    if ((attachment.file?.size ?? 0) > 0) {
        uploadStore.uploadProgressRef?.startUpload(attachment.file.name);
    }

    FundingCallService.updateCallDocument(attachment).then((response) => {
        fundingCall.value!.fileItems = fundingCall.value?.fileItems?.filter(a => a.id !== attachment.id) ?? [];
        fundingCall.value?.fileItems?.push(response.data);

        if ((attachment.file?.size ?? 0) > 0) {
            uploadStore.uploadProgressRef?.updateProgress(100);
        }
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};

</script>

<style scoped>
#fundingCall .large-funding-call-icon {
    font-size: 10em;
}

#fundingCall .response {
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-weight: bold;
}

.edit-pen-container {
    position: relative;
}

.research-areas-container > :deep(.v-row) {
    margin: 0;
}
</style>
