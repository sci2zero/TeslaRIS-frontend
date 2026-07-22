<template>
    <v-container id="funding-application">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!fundingApplication"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="title" />
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("fundingApplicationLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Basic Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-funding-application-icon">
                    mdi-cash-check
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="FundingApplicationUpdateForm"
                            :form-props="{ presetFundingApplication: fundingApplication }"
                            entity-name="FundingApplication"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <div class="mb-5 d-flex justify-center">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>

                        <basic-info-loader v-if="!fundingApplication" />
                        <v-row v-else>
                            <!-- Left column -->
                            <v-col cols="6">
                                <div v-if="fundingApplication.requestedAmount">{{ $t("amountRequestedLabel") }}:</div>
                                <div v-if="fundingApplication.requestedAmount" class="response">
                                    {{ formatAmount(fundingApplication.requestedAmount.amount, locale) }} {{ fundingApplication.requestedAmount.currencyCode }}
                                </div>

                                <div v-if="fundingApplication.description && fundingApplication.description.length > 0">{{ $t("descriptionLabel") }}:</div>
                                <div v-if="fundingApplication.description && fundingApplication.description.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(fundingApplication.description) }}
                                </div>

                                <div v-if="submitterName">{{ $t("submitterLabel") }}:</div>
                                <div v-if="submitterName" class="response">{{ submitterName }}</div>

                                <div v-if="fundingApplication.submissionDate">{{ $t("submissionDateLabel") }}:</div>
                                <div v-if="fundingApplication.submissionDate" class="response">{{ localiseDate(fundingApplication.submissionDate) }}</div>

                                <div v-if="fundingApplication.responseSummary && fundingApplication.responseSummary.length > 0">{{ $t("responseSummaryLabel") }}:</div>
                                <div v-if="fundingApplication.responseSummary && fundingApplication.responseSummary.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(fundingApplication.responseSummary) }}
                                </div>
                            </v-col>

                            <!-- Right column -->
                            <v-col cols="6">
                                <div v-if="fundingApplication.reviewDateFrom">{{ $t("reviewStartedLabel") }}:</div>
                                <div v-if="fundingApplication.reviewDateFrom" class="response">{{ localiseDate(fundingApplication.reviewDateFrom) }}</div>

                                <div v-if="fundingApplication.reviewDateTo">{{ $t("reviewEndedLabel") }}:</div>
                                <div v-if="fundingApplication.reviewDateTo" class="response">{{ localiseDate(fundingApplication.reviewDateTo) }}</div>

                                <div v-if="fundingApplication.decisionDate">{{ $t("dateOfDecisionLabel") }}:</div>
                                <div v-if="fundingApplication.decisionDate" class="response">{{ localiseDate(fundingApplication.decisionDate) }}</div>

                                <div v-if="fundingApplication.result">{{ $t("resultLabel") }}:</div>
                                <div v-if="fundingApplication.result" class="response">{{ getFundingApplicationResultTitleFromValueAutoLocale(fundingApplication.result) }}</div>

                                <div v-if="fundingApplication.revisedProposalOrNextRoundDeadlineDate">{{ $t("deadlineForRequestedChangesLabel") }}:</div>
                                <div v-if="fundingApplication.revisedProposalOrNextRoundDeadlineDate" class="response">{{ localiseDate(fundingApplication.revisedProposalOrNextRoundDeadlineDate) }}</div>

                                <div v-if="fundingApplication.revisedFundingApplicationId">{{ $t("revisedFundingApplicationLabel") }}:</div>
                                <div v-if="fundingApplication.revisedFundingApplicationId" class="response">
                                    <localized-link :to="'funding-application/' + fundingApplication.revisedFundingApplicationId">
                                        {{ revisedFundingApplicationTitle }}
                                    </localized-link>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Tabs -->
        <tab-content-loader v-if="!fundingApplication" layout="sections" />
        <v-tabs
            v-show="fundingApplication"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="otherFundingSources">
                {{ $t("otherFundingSourcesLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-show="fundingApplication" v-model="currentTab">
            <v-tabs-window-item value="otherFundingSources">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <funding-part-list
                            :funding-parts="fundingApplication?.otherFundingSources ? fundingApplication.otherFundingSources : []"
                            :can-edit="canEdit"
                            @create="addOtherFundingSource($event)"
                            @delete="deleteOtherFundingSource($event)"
                            @update="updateOtherFundingSource($event)"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="documents">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <attachment-list
                            :attachments="fundingApplication?.documents ? fundingApplication.documents : []"
                            :can-edit="canEdit"
                            @create="addDocument($event)"
                            @delete="deleteDocument($event)"
                            @update="updateDocument($event)"
                        />
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
import BasicInfoLoader from "@/components/core/BasicInfoLoader.vue";
import RichTitleRenderer from "@/components/core/RichTitleRenderer.vue";
import TabContentLoader from "@/components/core/TabContentLoader.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import FundingApplicationService from "@/services/project/FundingApplicationService";
import ProjectService from "@/services/project/ProjectService";
import FundingCallService from "@/services/project/FundingCallService";
import FundingPartService from "@/services/project/FundingPartService";
import PersonService from "@/services/PersonService";
import type { FundingApplication } from "@/models/FundingApplicationModel";
import type { FundingPart } from "@/models/FundingModel";
import type { Project } from "@/models/ProjectModel";
import type { FundingCall } from "@/models/FundingCallModel";
import { getFundingApplicationResultTitleFromValueAutoLocale } from "@/i18n/fundingApplicationResult";
import Toast from "@/components/core/Toast.vue";
import AttachmentList from "@/components/core/AttachmentList.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import { useLoginStore } from "@/stores/loginStore";
import { useUploadStore } from "@/stores/uploadStore";
import type { DocumentFile } from "@/models/DocumentFileModel";
import FundingPartList from "@/components/project/FundingPartList.vue";
import { formatAmount } from "@/utils/MonetaryUtil";
import { localiseDate } from '@/utils/DateUtil';
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import FundingApplicationUpdateForm from "@/components/project/FundingApplicationUpdateForm.vue";

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { locale } = useI18n();

const fundingApplication = ref<FundingApplication>();
const project = ref<Project>();
const fundingCall = ref<FundingCall>();
const submitterName = ref("");

const revisedProject = ref<Project>();
const revisedFundingCall = ref<FundingCall>();

const currentTab = ref("otherFundingSources");

const snackbar = ref(false);
const snackbarMessage = ref("");

const canEdit = ref(false);
const loginStore = useLoginStore();

const uploadStore = useUploadStore();

const title = computed(() => {
    const projectName = returnCurrentLocaleContent(project.value?.name) ?? "";
    const callName = returnCurrentLocaleContent(fundingCall.value?.name) ?? "";
    return [projectName, callName].filter(part => part).join(" — ");
});

const revisedFundingApplicationTitle = computed(() => {
    const projectName = returnCurrentLocaleContent(revisedProject.value?.name) ?? "";
    const callName = returnCurrentLocaleContent(revisedFundingCall.value?.name) ?? "";
    const combined = [projectName, callName].filter(part => part).join(" — ");
    return combined || `#${fundingApplication.value?.revisedFundingApplicationId}`;
});

onMounted(() => {
    fetchFundingApplication();
});

const fetchFundingApplication = async () => {
    try {
        const response = await FundingApplicationService.readFundingApplication(
            parseInt(route.params.id as string)
        );
        fundingApplication.value = response.data;

        fetchLinkedEntities();

        if (loginStore.userLoggedIn) {
            checkIfUserCanEdit();
        }
    } catch (error) {
        console.error("Error fetching funding application:", error);
        await router.push({ name: "notFound" });
    }
};

const fetchLinkedEntities = () => {
    if (fundingApplication.value?.projectId) {
        ProjectService.readProject(fundingApplication.value.projectId).then((response) => {
            project.value = response.data;
        });
    }

    if (fundingApplication.value?.fundingCallId) {
        FundingCallService.readFundingCall(fundingApplication.value.fundingCallId).then((response) => {
            fundingCall.value = response.data;
        });
    }

    if (fundingApplication.value?.submitterId) {
        PersonService.readPerson(fundingApplication.value.submitterId).then((response) => {
            submitterName.value = `${response.data.personName.firstname} ${response.data.personName.lastname}`;
        });
    }

    if (fundingApplication.value?.revisedFundingApplicationId) {
        const revisedId = fundingApplication.value.revisedFundingApplicationId;
        FundingApplicationService.readFundingApplication(revisedId).then((response) => {
            if (response.data.projectId) {
                ProjectService.readProject(response.data.projectId).then((projectResponse) => {
                    revisedProject.value = projectResponse.data;
                });
            }
            if (response.data.fundingCallId) {
                FundingCallService.readFundingCall(response.data.fundingCallId).then((callResponse) => {
                    revisedFundingCall.value = callResponse.data;
                });
            }
        });
    }
};

const checkIfUserCanEdit = () => {
    FundingApplicationService.canEdit(parseInt(route.params.id as string)).then((response) => {
        canEdit.value = response.data;
    }).catch(() => canEdit.value = false);
};

const updateBasicInfo = (basicInfo: FundingApplication) => {
    fundingApplication.value = { ...fundingApplication.value, ...basicInfo };
    performUpdate(true);
};

const performUpdate = (reload: boolean) => {
    FundingApplicationService.updateFundingApplication(fundingApplication.value?.id as number, fundingApplication.value as FundingApplication).then(() => {
        snackbarMessage.value = i18n.t("updatedSuccessMessage");
        snackbar.value = true;
        if (reload) {
            fetchFundingApplication();
        }
    }).catch(() => {
        snackbarMessage.value = i18n.t("genericErrorMessage");
        snackbar.value = true;
        fetchFundingApplication();
    });
};

const addDocument = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }
    uploadStore.uploadProgressRef?.startUpload(attachment.file.name);

    FundingApplicationService.addFundingApplicationDocument(fundingApplication.value?.id as number, attachment).then((response) => {
        fundingApplication.value?.documents?.push(response.data);
        uploadStore.uploadProgressRef?.updateProgress(100);
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};

const deleteDocument = (documentId: number) => {
    FundingApplicationService.deleteFundingApplicationDocument(fundingApplication.value?.id as number, documentId).then(() => {
        fundingApplication.value!.documents = fundingApplication.value?.documents?.filter(d => d.id !== documentId) ?? [];
    });
};

const updateDocument = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }

    if ((attachment.file?.size ?? 0) > 0) {
        uploadStore.uploadProgressRef?.startUpload(attachment.file.name);
    }

    FundingApplicationService.updateFundingApplicationDocument(attachment).then((response) => {
        fundingApplication.value!.documents = fundingApplication.value?.documents?.filter(d => d.id !== attachment.id) ?? [];
        fundingApplication.value?.documents?.push(response.data);

        if ((attachment.file?.size ?? 0) > 0) {
            uploadStore.uploadProgressRef?.updateProgress(100);
        }
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};

const addOtherFundingSource = (fundingPart: FundingPart) => {
    if (fundingApplication.value === undefined || fundingApplication.value.id === undefined) {
        return;
    }

    fundingPart.fundingApplicationId = fundingApplication.value.id;

    FundingPartService.createFundingPart(fundingPart).then((response) => {
        fundingApplication.value?.otherFundingSources?.push(response.data);
    });
};

const updateOtherFundingSource = (fundingPart: FundingPart) => {
    fundingPart.fundingApplicationId = fundingApplication.value?.id;

    FundingPartService.updateFundingPart(fundingPart.id as number, fundingPart).then(() => {
        fundingApplication.value!.otherFundingSources = fundingApplication.value?.otherFundingSources?.filter(fp => fp.id !== fundingPart.id) ?? [];
        fundingApplication.value?.otherFundingSources?.push(fundingPart);
    });
};

const deleteOtherFundingSource = (fundingPartId: number) => {
    FundingPartService.deleteFundingPart(fundingPartId).then(() => {
        fundingApplication.value!.otherFundingSources = fundingApplication.value?.otherFundingSources?.filter(fp => fp.id !== fundingPartId) ?? [];
    });
};

</script>

<style scoped>
#funding-application .large-funding-application-icon {
    font-size: 10em;
}

#funding-application .response {
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-weight: bold;
}

.edit-pen-container {
    position: relative;
}
</style>
