<template>
    <div class="mt-4 space-y-6">
        <div v-if="hasBibliographicDetails" class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span class="mdi mdi-book-open-page-variant-outline mr-2 text-blue-600"></span>
                {{ t("basicInfoLabel") }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="thesis?.typeOfTitle && thesis.typeOfTitle.length > 0">
                    <label class="block text-sm font-medium text-gray-700">{{ t("typeOfTitleLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ returnCurrentLocaleContent(thesis.typeOfTitle) }}</p>
                </div>
                <div v-if="thesis?.numberOfPages">
                    <label class="block text-sm font-medium text-gray-700">{{ t("numberOfPagesLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.numberOfPages }}</p>
                </div>
                <div v-if="thesis?.numberOfChapters">
                    <label class="block text-sm font-medium text-gray-700">{{ t("numberOfChaptersLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.numberOfChapters }}</p>
                </div>
                <div v-if="thesis?.numberOfReferences">
                    <label class="block text-sm font-medium text-gray-700">{{ t("numberOfReferencesLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.numberOfReferences }}</p>
                </div>
                <div v-if="thesis?.numberOfIllustrations">
                    <label class="block text-sm font-medium text-gray-700">{{ t("numberOfIllustrationsLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.numberOfIllustrations }}</p>
                </div>
                <div v-if="thesis?.numberOfGraphs">
                    <label class="block text-sm font-medium text-gray-700">{{ t("numberOfGraphsLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.numberOfGraphs }}</p>
                </div>
                <div v-if="thesis?.numberOfTables">
                    <label class="block text-sm font-medium text-gray-700">{{ t("numberOfTablesLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.numberOfTables }}</p>
                </div>
                <div v-if="thesis?.numberOfAppendices">
                    <label class="block text-sm font-medium text-gray-700">{{ t("numberOfAppendicesLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.numberOfAppendices }}</p>
                </div>
                <div v-if="thesis?.udc">
                    <label class="block text-sm font-medium text-gray-700">{{ t("udcLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ thesis.udc }}</p>
                </div>
                <div v-if="thesis?.languageId">
                    <label class="block text-sm font-medium text-gray-700">{{ t("languageLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">
                        {{ returnCurrentLocaleContent(languageMap.get(thesis.languageId)?.name) || "-" }}
                    </p>
                </div>
                <div v-if="thesis?.writingLanguageTagId">
                    <label class="block text-sm font-medium text-gray-700">{{ t("writingLanguageLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">
                        {{ languageTagMap.get(thesis.writingLanguageTagId)?.display || "-" }}
                    </p>
                </div>
                <div v-if="thesis?.placeOfKeep && thesis.placeOfKeep.length > 0">
                    <label class="block text-sm font-medium text-gray-700">{{ t("placeOfKeepLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">{{ returnCurrentLocaleContent(thesis.placeOfKeep) }}</p>
                </div>
                <div v-if="thesis?.scientificArea && thesis.scientificArea.length > 0">
                    <label class="block text-sm font-medium text-gray-700">
                        {{ t(isArtProject ? "artAreaLabel" : "scientificAreaLabel") }}
                    </label>
                    <p class="mt-1 text-sm text-gray-900">{{ returnCurrentLocaleContent(thesis.scientificArea) }}</p>
                </div>
                <div v-if="thesis?.scientificSubArea && thesis.scientificSubArea.length > 0">
                    <label class="block text-sm font-medium text-gray-700">
                        {{ t(isArtProject ? "artSubAreaLabel" : "scientificSubAreaLabel") }}
                    </label>
                    <p class="mt-1 text-sm text-gray-900">{{ returnCurrentLocaleContent(thesis.scientificSubArea) }}</p>
                </div>
                <div v-if="thesis?.eventId">
                    <label class="block text-sm font-medium text-gray-700">{{ t("conferenceLabel") }}</label>
                    <p class="mt-1 text-sm text-gray-900">
                        <localized-link :to="'events/conference/' + thesis.eventId" class="underline">
                            {{ returnCurrentLocaleContent(event?.name) }}
                        </localized-link>
                    </p>
                </div>
            </div>
        </div>

        <div
            v-if="(thesis?.publicReviewDates && thesis.publicReviewDates.length > 0) || (thesis?.publicReviewEndDates && thesis.publicReviewEndDates.length > 0)"
            class="bg-gray-50 p-6 rounded-lg"
        >
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span class="mdi mdi-calendar-clock mr-2 text-amber-600"></span>
                {{ t("datesOfPublicReviewLabel") }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="thesis?.publicReviewDates && thesis.publicReviewDates.length > 0">
                    <label class="block text-sm font-medium text-gray-700">{{ t("datesOfPublicReviewLabel") }}</label>
                    <p
                        v-for="date in thesis.publicReviewDates"
                        :key="`start-${date}`"
                        class="mt-1 text-sm text-gray-900"
                    >
                        {{ localiseDate(date) }}
                    </p>
                </div>
                <div v-if="thesis?.publicReviewEndDates && thesis.publicReviewEndDates.length > 0">
                    <label class="block text-sm font-medium text-gray-700">{{ t("datesOfPublicReviewEndLabel") }}</label>
                    <p
                        v-for="date in thesis.publicReviewEndDates"
                        :key="`end-${date}`"
                        class="mt-1 text-sm text-gray-900"
                    >
                        {{ localiseDate(date) }}
                    </p>
                </div>
            </div>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span class="mdi mdi-identifier mr-2 text-indigo-600"></span>
                {{ t("identifiersLabel") }}
            </h3>
            <v-row>
                <document-common-fields-display
                    :document="thesis"
                    :cols="12"
                    :can-edit="canEdit"
                    :containing-entity-type="ApplicableEntityType.DOCUMENT"
                    :concrete-entity-type="ApplicableEntityType.THESIS"
                    :document-identifiers="documentIdentifiers"
                    @identifiers-updated="emit('identifiers-updated')"
                />
            </v-row>
        </div>

        <keyword-list
            :keywords="thesis?.keywords ? thesis.keywords : []"
            :can-edit="canEdit && !thesis?.isOnPublicReview"
            @search-keyword="emit('search-keyword', $event)"
            @update="emit('update-keywords', $event)"
        />

        <div>
            <description-section
                :description="thesis?.description"
                :can-edit="canEdit && !thesis?.isOnPublicReview"
                @update="emit('update-description', $event)"
            />
            <description-section
                :description="thesis?.extendedAbstract"
                :can-edit="canEdit && !thesis?.isOnPublicReview"
                is-extended-abstract
                @update="emit('update-extended-abstract', $event)"
            />
            <description-section
                :description="thesis?.remark"
                :can-edit="canEdit && !thesis?.isOnPublicReview && !thesis?.isArchived"
                is-remark
                @update="emit('update-remark', $event)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ApplicableEntityType, type LanguageResponse, type LanguageTagResponse, type MultilingualContent } from "@/models/Common";
import type { Conference } from "@/models/EventModel";
import type { EntityIdentifierResponse } from "@/models/IdentifierModel";
import { ThesisType, type Thesis } from "@/models/PublicationModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { localiseDate } from "@/utils/DateUtil";
import KeywordList from "@/components/core/KeywordList.vue";
import DescriptionSection from "@/components/core/DescriptionSection.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import DocumentCommonFieldsDisplay from "@/components/publication/DocumentCommonFieldsDisplay.vue";

interface Props {
    thesis: Thesis | undefined;
    canEdit: boolean;
    event?: Conference;
    languageMap: Map<number, LanguageResponse>;
    languageTagMap: Map<number, LanguageTagResponse>;
    documentIdentifiers: EntityIdentifierResponse[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: "search-keyword", keyword: string): void;
    (e: "update-keywords", keywords: MultilingualContent[]): void;
    (e: "update-description", description: MultilingualContent[]): void;
    (e: "update-extended-abstract", extendedAbstract: MultilingualContent[]): void;
    (e: "update-remark", remark: MultilingualContent[]): void;
    (e: "identifiers-updated"): void;
}>();

const { t } = useI18n();

const isArtProject = computed(() => props.thesis?.thesisType === ThesisType.PHD_ART_PROJECT);

const hasBibliographicDetails = computed(() => {
    const thesis = props.thesis;
    if (!thesis) {
        return false;
    }

    return !!(
        (thesis.typeOfTitle && thesis.typeOfTitle.length > 0) ||
        thesis.numberOfPages ||
        thesis.numberOfChapters ||
        thesis.numberOfReferences ||
        thesis.numberOfIllustrations ||
        thesis.numberOfGraphs ||
        thesis.numberOfTables ||
        thesis.numberOfAppendices ||
        thesis.udc ||
        thesis.languageId ||
        thesis.writingLanguageTagId ||
        (thesis.placeOfKeep && thesis.placeOfKeep.length > 0) ||
        (thesis.scientificArea && thesis.scientificArea.length > 0) ||
        (thesis.scientificSubArea && thesis.scientificSubArea.length > 0) ||
        thesis.eventId
    );
});
</script>
