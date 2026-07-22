<template>
    <v-container id="funding-program">
        <!-- Header -->
        <v-row justify="center">
            <v-col cols="12">
                <v-card class="pa-3" variant="flat" color="blue-lighten-3">
                    <v-card-title class="text-h5 text-center">
                        <v-skeleton-loader
                            :loading="!fundingProgram"
                            type="heading"
                            color="blue-lighten-3"
                            class="text-center"
                        >
                            <rich-title-renderer :title="title" />
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
                    <v-card-text>
                        <div class="mb-5">
                            <b>{{ $t("basicInfoLabel") }}</b>
                        </div>

                        <basic-info-loader v-if="!fundingProgram" />
                        <v-row v-else>
                            <!-- Left column -->
                            <v-col cols="6">
                                <div v-if="fundingProgram.funderName && fundingProgram.funderName.length > 0">{{ $t("funderLabel") }}:</div>
                                <div v-if="fundingProgram.funderName && fundingProgram.funderName.length > 0" class="response">
                                    {{ returnCurrentLocaleContent(fundingProgram.funderName) }}
                                </div>

                                <div v-if="fundingProgram.fundingTypes && fundingProgram.fundingTypes.length > 0">{{ $t("fundingTypesLabel") }}:</div>
                                <div v-if="fundingProgram.fundingTypes && fundingProgram.fundingTypes.length > 0" class="response">
                                    {{ fundingProgram.fundingTypes.map((t: FundingType) => getFundingTypeTitleFromValueAutoLocale(t)).join(", ") }}
                                </div>

                                <div v-if="fundingProgram.dateFrom">{{ $t("dateFromLabel") }}:</div>
                                <div v-if="fundingProgram.dateFrom" class="response">{{ localiseDate(fundingProgram.dateFrom) }}</div>

                                <div v-if="fundingProgram.dateTo">{{ $t("dateToLabel") }}:</div>
                                <div v-if="fundingProgram.dateTo" class="response">{{ localiseDate(fundingProgram.dateTo) }}</div>
                            </v-col>

                            <!-- Right column -->
                            <v-col cols="6">
                                <div v-if="fundingProgram.totalAmount">{{ $t("totalAmountLabel") }}:</div>
                                <div v-if="fundingProgram.totalAmount" class="response">{{ formatAmount(fundingProgram.totalAmount.amount, locale) }} {{ fundingProgram.totalAmount.currencyCode }}</div>

                                <div v-if="fundingProgram.uris && fundingProgram.uris.length > 0">{{ $t("urisLabel") }}:</div>
                                <div v-if="fundingProgram.uris && fundingProgram.uris.length > 0" class="response">
                                    <div v-for="uri in fundingProgram.uris" :key="uri">
                                        <a :href="uri" target="_blank">{{ uri }}</a>
                                    </div>
                                </div>

                                <div v-if="fundingProgram.oaMandated !== undefined && fundingProgram.oaMandated !== null">{{ $t("oaMandatedLabel") }}:</div>
                                <div v-if="fundingProgram.oaMandated !== undefined && fundingProgram.oaMandated !== null" class="response">
                                    {{ fundingProgram.oaMandated ? $t("yesLabel") : $t("noLabel") }}
                                </div>

                                <div v-if="fundingProgram.oaMandateUrl">{{ $t("oaMandateUrlLabel") }}:</div>
                                <div v-if="fundingProgram.oaMandateUrl" class="response">
                                    <a :href="fundingProgram.oaMandateUrl" target="_blank">{{ fundingProgram.oaMandateUrl }}</a>
                                </div>
                            </v-col>
                        </v-row>
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
            <v-tab value="documents">
                {{ $t("documentsLabel") }}
            </v-tab>
            <v-tab value="additionalInfo">
                {{ $t("additionalInfoLabel") }}
            </v-tab>
        </v-tabs>

        <v-tabs-window v-show="fundingProgram" v-model="currentTab">
            <v-tabs-window-item value="documents">
                <v-row class="mt-10">
                    <v-col cols="12">
                        <attachment-list
                            :attachments="fundingProgram?.fileItems ? fundingProgram.fileItems : []"
                            :can-edit="false"
                        />
                    </v-col>
                </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="additionalInfo">
                <!-- Keywords -->
                <keyword-list
                    :keywords="fundingProgram?.keywords ? fundingProgram.keywords : []"
                    :can-edit="false"
                    @search-keyword="searchKeyword($event)">
                </keyword-list>

                <!-- Description -->
                <description-section
                    is-general-description
                    :description="fundingProgram?.description"
                    :can-edit="false"
                />

                <!-- Objectives -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text>
                                <div><b>{{ $t("objectivesLabel") }}</b></div>
                                <strong v-if="!fundingProgram?.objectives || fundingProgram.objectives.length === 0">{{ $t("notYetSetMessage") }}</strong>
                                <rich-text-editor v-model="objectivesDisplay" :editable="false"></rich-text-editor>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Research Areas -->
                <v-row>
                    <v-col cols="12">
                        <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                            <v-card-text>
                                <div class="mb-2"><b>{{ $t("researchAreasLabel") }}</b></div>
                                <research-area-hierarchy
                                    :research-areas="fundingProgram?.researchAreas"
                                />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
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
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import FundingProgramService from "@/services/project/FundingProgramService";
import type { FundingProgram, FundingType } from "@/models/FundingModel";
import { getFundingTypeTitleFromValueAutoLocale } from "@/i18n/fundingType";
import AttachmentList from "@/components/core/AttachmentList.vue";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import { formatAmount } from "@/utils/MonetaryUtil";
import { localiseDate } from "@/utils/DateUtil";

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();

const fundingProgram = ref<FundingProgram>();
const currentTab = ref("documents");
const icon = ref("mdi-cash");

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
    } catch (error) {
        console.error("Error fetching funding program:", error);
        await router.push({ name: "notFound" });
    }
};

const searchKeyword = (keyword: string) => {
    router.push({ name: "advancedSearch", query: { searchQuery: keyword.trim(), tab: "publications", search: "simple" } });
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
</style>
