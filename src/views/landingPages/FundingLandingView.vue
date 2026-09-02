<template>
    <v-container id="funding">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center edit-pen-container">
                        <v-skeleton-loader
                            :loading="!funding"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="title" />
                            <div>
                                <generic-crud-modal
                                    class="mb-6"
                                    :form-component="AlternateNameForm"
                                    :form-props="{ presetName: funding?.name, presetNameAbbreviation: funding?.nameAbbreviation }"
                                    entity-name="Name"
                                    is-update
                                    is-section-update
                                    :read-only="!canEdit || thesis?.isOnPublicReview"
                                    @update="updateName"
                                />
                            </div>
                        </v-skeleton-loader>
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        {{ $t("fundingLabel") }}
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Funding Info -->
        <v-row>
            <v-col cols="3" class="text-center">
                <v-icon size="x-large" class="large-funding-icon">
                    {{ icon }}
                </v-icon>
            </v-col>
            <v-col cols="9">
                <v-card class="pa-3" variant="flat" color="secondary">
                    <v-card-text class="edit-pen-container">
                        <generic-crud-modal
                            :form-component="FundingUpdateForm"
                            :form-props="{ presetFunding: funding }"
                            entity-name="Funding"
                            is-update
                            is-section-update
                            :read-only="!canEdit"
                            @update="updateBasicInfo"
                        />

                        <!-- Basic Info -->
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>

                        <basic-info-loader v-if="!funding" />
                        <div v-else class="info-columns">
                            <div v-if="funding.doi" class="info-item">
                                <div>DOI:</div>
                                <div class="response">
                                    <identifier-link :identifier="funding.doi" type="doi" />
                                </div>
                            </div>

                            <div v-if="funding.grantAgreementId" class="info-item">
                                <div>{{ $t("grantAgreementIdLabel") }}:</div>
                                <div class="response">{{ funding.grantAgreementId }}</div>
                            </div>

                            <div v-if="funding.fundingTypes && funding.fundingTypes.length > 0" class="info-item">
                                <div>{{ $t("fundingTypesLabel") }}:</div>
                                <div class="response">
                                    {{ funding.fundingTypes.map((t : FundingType) => getFundingTypeTitleFromValueAutoLocale(t)).join(", ") }}
                                </div>
                            </div>

                            <div v-if="funding.dateFrom" class="info-item">
                                <div>{{ $t("dateFromLabel") }}:</div>
                                <div class="response">{{ localiseDate(funding.dateFrom) }}</div>
                            </div>

                            <div v-if="funding.dateTo" class="info-item">
                                <div>{{ $t("dateToLabel") }}:</div>
                                <div class="response">{{ localiseDate(funding.dateTo) }}</div>
                            </div>

                            <div v-if="funding.dateSubmitted" class="info-item">
                                <div>{{ $t("dateSubmittedLabel") }}:</div>
                                <div class="response">{{ localiseDate(funding.dateSubmitted) }}</div>
                            </div>

                            <div v-if="funding.dateAwarded" class="info-item">
                                <div>{{ $t("dateAwardedLabel") }}:</div>
                                <div class="response">{{ localiseDate(funding.dateAwarded) }}</div>
                            </div>

                            <div v-if="projectName.length > 0" class="info-item">
                                <div>{{ $t("projectLabel") }}:</div>
                                <div class="response">
                                    <localized-link :to="'project/' + funding.projectId">
                                        {{ returnCurrentLocaleContent(projectName) }}
                                    </localized-link>
                                </div>
                            </div>

                            <div v-if="showFunder" class="info-item">
                                <div>{{ $t("funderLabel") }}:</div>
                                <div class="response">
                                    <localized-link v-if="funderName.length > 0" :to="'organisation-units/' + funding.funderId">
                                        {{ returnCurrentLocaleContent(funderName) }}
                                    </localized-link>
                                    <span v-else>
                                        {{ returnCurrentLocaleContent(funding.displayFunder) }}
                                    </span>
                                </div>
                            </div>

                            <div v-if="showFundingCall" class="info-item">
                                <div>{{ $t("fundingCallLabel") }}:</div>
                                <div class="response">
                                    <localized-link v-if="fundingCallName.length > 0" :to="'funding-call/' + funding.fundingCallId">
                                        {{ returnCurrentLocaleContent(fundingCallName) }}
                                    </localized-link>
                                    <span v-else>
                                        {{ returnCurrentLocaleContent(funding.displayCall) }}
                                    </span>
                                </div>
                            </div>

                            <div v-if="showFundingProgram" class="info-item">
                                <div>{{ $t("fundingProgramLabel") }}:</div>
                                <div class="response">
                                    <localized-link v-if="fundingProgramName.length > 0 && fundingProgramId" :to="'funding-program/' + fundingProgramId">
                                        {{ returnCurrentLocaleContent(fundingProgramName) }}
                                    </localized-link>
                                    <span v-else>
                                        {{ returnCurrentLocaleContent(funding.displayProgram) }}
                                    </span>
                                </div>
                            </div>

                            <div v-if="funding.amount" class="info-item">
                                <div>{{ $t("amountLabel") }}:</div>
                                <div class="response">{{ formatAmount(funding.amount.amount, locale) }} {{ funding.amount.currencyCode }}</div>
                            </div>

                            <div v-if="funding.uris && funding.uris.length > 0" class="info-item">
                                <div>{{ $t("urisLabel") }}:</div>
                                <div class="response">
                                    <div v-for="uri in funding.uris" :key="uri">
                                        <a :href="uri" target="_blank">{{ uri }}</a>
                                    </div>
                                </div>
                            </div>

                            <div v-if="funding.oaMandated !== undefined && funding.oaMandated !== null" class="info-item">
                                <div>{{ $t("oaMandatedLabel") }}:</div>
                                <div class="response">
                                    {{ funding.oaMandated ? $t("yesLabel") : $t("noLabel") }}
                                </div>
                            </div>

                            <div v-if="funding.oaMandateUrl" class="info-item">
                                <div>{{ $t("oaMandateUrlLabel") }}:</div>
                                <div class="response">
                                    <a :href="funding.oaMandateUrl" target="_blank">{{ funding.oaMandateUrl }}</a>
                                </div>
                            </div>

                            <div v-if="funding.competitive !== undefined && funding.competitive !== null" class="info-item">
                                <div>{{ $t("competitiveLabel") }}:</div>
                                <div class="response">
                                    {{ funding.competitive ? $t("yesLabel") : $t("noLabel") }}
                                </div>
                            </div>

                            <div v-if="funding.renewable !== undefined && funding.renewable !== null" class="info-item">
                                <div>{{ $t("renewableLabel") }}:</div>
                                <div class="response">
                                    {{ funding.renewable ? $t("yesLabel") : $t("noLabel") }}
                                </div>
                            </div>

                            <div v-if="funding.internalInvestment !== undefined && funding.internalInvestment !== null" class="info-item">
                                <div>{{ $t("internalInvestmentLabel") }}:</div>
                                <div class="response">
                                    {{ funding.internalInvestment ? $t("yesLabel") : $t("noLabel") }}
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Tabs -->
        <tab-content-loader v-if="!funding" layout="sections" />
        <v-tabs
            v-show="funding"
            v-model="currentTab"
            color="deep-purple-accent-4"
            align-tabs="start"
        >
            <v-tab value="fundingParts">
                {{ $t("fundingPartsLabel") }}
            </v-tab>
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-show="funding" v-model="currentTab">
            <v-tabs-window-item value="fundingParts">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <funding-part-list
                            :funding-parts="funding?.fundingParts ? funding.fundingParts : []"
                            :can-edit="canEdit"
                            @create="addFundingPart($event)"
                            @delete="deleteFundingPart($event)"
                            @update="updateFundingPart($event)"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="documents">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <attachment-list
                            :attachments="funding?.agreements ? funding.agreements : []"
                            :can-edit="canEdit"
                            @create="addAgreement($event)"
                            @delete="deleteAgreement($event)"
                            @update="updateAgreement($event)"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="funding?.keywords ? funding.keywords : []"
                    :can-edit="canEdit"
                    @search-keyword="searchKeyword($event)"
                    @update="updateKeywords" />

                <!-- Description -->
                <div>
                    <description-section
                        :description="funding?.description"
                        :can-edit="canEdit"
                        @update="updateDescription"
                    />
                </div>
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
import FundingService from "@/services/project/FundingService";
import type { Funding, FundingPart } from "@/models/FundingModel";
import type { FundingType } from "@/models/FundingModel";
import { getFundingTypeTitleFromValueAutoLocale } from "@/i18n/fundingType";
import Toast from "@/components/core/Toast.vue";
import type { MultilingualContent } from "@/models/Common";
import IdentifierLink from "@/components/core/IdentifierLink.vue";
import AttachmentList from "@/components/core/AttachmentList.vue";
import { useLoginStore } from "@/stores/loginStore";
import { useUploadStore } from "@/stores/uploadStore";
import type { DocumentFile } from "@/models/DocumentFileModel";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import FundingPartList from "@/components/project/FundingPartList.vue";
import { formatAmount } from "@/utils/MonetaryUtil";
import FundingPartService from "@/services/project/FundingPartService";
import { localiseDate } from '@/utils/DateUtil';
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import AlternateNameForm from "@/components/project/AlternateNameForm.vue";
import FundingUpdateForm from "@/components/project/FundingUpdateForm.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import ProjectService from "@/services/project/ProjectService";
import FundingCallService from "@/services/project/FundingCallService";
import OrganisationUnitService from "@/services/OrganisationUnitService";

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { locale } = useI18n();

const funding = ref<Funding>();
const currentTab = ref("fundingParts");
const icon = ref("mdi-cash-multiple");

const snackbar = ref(false);
const snackbarMessage = ref("");

const projectName = ref<MultilingualContent[]>([]);
const funderName = ref<MultilingualContent[]>([]);
const fundingCallName = ref<MultilingualContent[]>([]);
const fundingProgramName = ref<MultilingualContent[]>([]);
const fundingProgramId = ref<number | undefined>(undefined);

const canEdit = ref(false);
const loginStore = useLoginStore();

const uploadStore = useUploadStore();

const title = computed(() => {
    const name = returnCurrentLocaleContent(funding.value?.name) ?? "";
    const abbr = returnCurrentLocaleContent(funding.value?.nameAbbreviation);
    return abbr ? `${name} (${abbr})` : name;
});

const showFunder = computed(() =>
    funderName.value.length > 0 || (funding.value?.displayFunder?.length ?? 0) > 0
);

const showFundingCall = computed(() =>
    fundingCallName.value.length > 0 || (funding.value?.displayCall?.length ?? 0) > 0
);

const showFundingProgram = computed(() =>
    fundingProgramName.value.length > 0 || (funding.value?.displayProgram?.length ?? 0) > 0
);

onMounted(() => {
    fetchFunding();
});

const fetchFunding = async () => {
    try {
        const response = await FundingService.readFunding(
            parseInt(route.params.id as string)
        );
        funding.value = response.data;

        fetchLinkedEntityNames();

        if (loginStore.userLoggedIn) {
            checkIfUserCanEdit();
        }
    } catch (error) {
        console.error("Error fetching funding:", error);
        await router.push({ name: "notFound" });
    }
};

const fetchLinkedEntityNames = () => {
    projectName.value = [];
    funderName.value = [];
    fundingCallName.value = [];
    fundingProgramName.value = [];
    fundingProgramId.value = undefined;

    if (funding.value?.projectId) {
        ProjectService.readProject(funding.value.projectId).then((response) => {
            projectName.value = response.data.name;
        });
    }

    if (funding.value?.funderId) {
        OrganisationUnitService.readOU(funding.value.funderId).then((response) => {
            funderName.value = response.data.name;
        });
    }

    if (funding.value?.fundingCallId) {
        FundingCallService.readFundingCall(funding.value.fundingCallId).then((response) => {
            fundingCallName.value = response.data.name;
            fundingProgramId.value = response.data.fundingProgramId;
            fundingProgramName.value = response.data.fundingProgramName ?? [];
        });
    }
};

const checkIfUserCanEdit = () => {
    FundingService.canEdit(parseInt(route.params.id as string)).then((response) => {
        canEdit.value = response.data;
    }).catch(() => canEdit.value = false);
};

const searchKeyword = (keyword: string) => {
    router.push({ name: "advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" } });
};

const updateName = (nameInformation: {name: MultilingualContent[], nameAbbreviation: MultilingualContent[]}) => {
    funding.value!.name = nameInformation.name;
    funding.value!.nameAbbreviation = nameInformation.nameAbbreviation;
    performUpdate(true);
};

const updateKeywords = (keywords: MultilingualContent[]) => {
    funding.value!.keywords = keywords;
    performUpdate(true);
};

const updateDescription = (description: MultilingualContent[]) => {
    funding.value!.description = description;
    performUpdate(true);
};

const updateBasicInfo = (basicInfo: Funding) => {
    funding.value = { ...funding.value, ...basicInfo };
    performUpdate(true);
}

const performUpdate = (reload: boolean) => {
    if (funding.value?.amount && funding.value.amount.amount <= 0) {
        funding.value.amount = undefined;
    }

    FundingService.updateFunding(funding.value?.id as number, funding.value as Funding).then(() => {
        snackbarMessage.value = i18n.t("updatedSuccessMessage");
        snackbar.value = true;
        if (reload) {
            fetchFunding();
        }
    }).catch(() => {
        snackbarMessage.value = i18n.t("genericErrorMessage");
        snackbar.value = true;
        fetchFunding();
    });
};

const addAgreement = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }
    uploadStore.uploadProgressRef?.startUpload(attachment.file.name);

    FundingService.addAgreementDocument(funding.value?.id as number, attachment).then((response) => {
        funding.value?.agreements?.push(response.data);
        uploadStore.uploadProgressRef?.updateProgress(100);
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};

const deleteAgreement = (attachmentId: number) => {
    FundingService.deleteAgreementDocument(funding.value?.id as number, attachmentId).then(() => {
        funding.value!.agreements = funding.value?.agreements?.filter(a => a.id !== attachmentId) ?? [];
    });
};

const updateAgreement = (attachment: DocumentFile) => {
    if (uploadStore.isUploading) {
        return;
    }

    if ((attachment.file?.size ?? 0) > 0) {
        uploadStore.uploadProgressRef?.startUpload(attachment.file.name);
    }

    FundingService.updateAgreementDocument(attachment).then((response) => {
        funding.value!.agreements = funding.value?.agreements?.filter(a => a.id !== attachment.id) ?? [];
        funding.value?.agreements?.push(response.data);

        if ((attachment.file?.size ?? 0) > 0) {
            uploadStore.uploadProgressRef?.updateProgress(100);
        }
    }).catch(() => {
        uploadStore.uploadProgressRef?.cancelUpload(true);
    });
};

const addFundingPart = (fundingPart: FundingPart) => {
    if (funding.value === undefined || funding.value.id === undefined) {
        return;
    }

    fundingPart.fundingId = funding.value.id;

    FundingPartService.createFundingPart(fundingPart).then((response) => {
        funding.value?.fundingParts?.push(response.data);
    });
};

const updateFundingPart = (fundingPart: FundingPart) => {
    FundingPartService.updateFundingPart(fundingPart.id as number, fundingPart).then(() => {
        funding.value!.fundingParts = funding.value?.fundingParts?.filter(fp => fp.id !== fundingPart.id) ?? [];
        funding.value?.fundingParts?.push(fundingPart);
    });
};

const deleteFundingPart = (fundingPartId: number) => {
    FundingPartService.deleteFundingPart(fundingPartId).then(() => {
        funding.value!.fundingParts = funding.value?.fundingParts?.filter(fp => fp.id !== fundingPartId) ?? [];
    });
};

</script>

<style scoped>
#funding .large-funding-icon {
    font-size: 10em;
}

#funding .response {
    font-size: 1.2rem;
    margin-bottom: 10px;
    font-weight: bold;
}

#funding .info-columns {
    columns: 2;
    column-gap: 40px;
}

#funding .info-item {
    break-inside: avoid;
}

@media (max-width: 959px) {
    #funding .info-columns {
        columns: 1;
    }
}

.edit-pen-container {
    position: relative;
}
</style>