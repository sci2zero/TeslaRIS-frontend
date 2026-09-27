<template>
    <div class="mt-4 space-y-4">
        <landing-section-card
            v-if="hasBibliographicDetails"
            :title="t('basicInfoLabel')"
            icon="mdi-book-open-page-variant-outline"
            icon-class="bg-blue-50 text-blue-600"
            padded
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field
                    v-if="thesis?.typeOfTitle && thesis.typeOfTitle.length > 0"
                    :label="t('typeOfTitleLabel')"
                    :value="returnCurrentLocaleContent(thesis.typeOfTitle)"
                />
                <landing-detail-field
                    v-if="thesis?.numberOfPages"
                    :label="t('numberOfPagesLabel')"
                    :value="thesis.numberOfPages"
                />
                <landing-detail-field
                    v-if="thesis?.numberOfChapters"
                    :label="t('numberOfChaptersLabel')"
                    :value="thesis.numberOfChapters"
                />
                <landing-detail-field
                    v-if="thesis?.numberOfReferences"
                    :label="t('numberOfReferencesLabel')"
                    :value="thesis.numberOfReferences"
                />
                <landing-detail-field
                    v-if="thesis?.numberOfIllustrations"
                    :label="t('numberOfIllustrationsLabel')"
                    :value="thesis.numberOfIllustrations"
                />
                <landing-detail-field
                    v-if="thesis?.numberOfGraphs"
                    :label="t('numberOfGraphsLabel')"
                    :value="thesis.numberOfGraphs"
                />
                <landing-detail-field
                    v-if="thesis?.numberOfTables"
                    :label="t('numberOfTablesLabel')"
                    :value="thesis.numberOfTables"
                />
                <landing-detail-field
                    v-if="thesis?.numberOfAppendices"
                    :label="t('numberOfAppendicesLabel')"
                    :value="thesis.numberOfAppendices"
                />
                <landing-detail-field
                    v-if="thesis?.udc"
                    :label="t('udcLabel')"
                    :value="thesis.udc"
                />
                <landing-detail-field
                    v-if="thesis?.languageId"
                    :label="t('languageLabel')"
                    :value="returnCurrentLocaleContent(languageMap.get(thesis.languageId)?.name) || '-'"
                />
                <landing-detail-field
                    v-if="thesis?.writingLanguageTagId"
                    :label="t('writingLanguageLabel')"
                    :value="languageTagMap.get(thesis.writingLanguageTagId)?.display || '-'"
                />
                <landing-detail-field
                    v-if="thesis?.placeOfKeep && thesis.placeOfKeep.length > 0"
                    :label="t('placeOfKeepLabel')"
                    :value="returnCurrentLocaleContent(thesis.placeOfKeep)"
                />
                <landing-detail-field
                    v-if="thesis?.scientificArea && thesis.scientificArea.length > 0"
                    :label="t(isArtProject ? 'artAreaLabel' : 'scientificAreaLabel')"
                    :value="returnCurrentLocaleContent(thesis.scientificArea)"
                />
                <landing-detail-field
                    v-if="thesis?.scientificSubArea && thesis.scientificSubArea.length > 0"
                    :label="t(isArtProject ? 'artSubAreaLabel' : 'scientificSubAreaLabel')"
                    :value="returnCurrentLocaleContent(thesis.scientificSubArea)"
                />
                <landing-detail-field
                    v-if="thesis?.eventId"
                    :label="t('conferenceLabel')"
                >
                    <localized-link :to="'events/conference/' + thesis.eventId" class="underline">
                        {{ returnCurrentLocaleContent(event?.name) }}
                    </localized-link>
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            v-if="hasPublicReviewDates"
            :title="t('datesOfPublicReviewLabel')"
            icon="mdi-calendar-clock"
            icon-class="bg-amber-50 text-amber-700"
            padded
        >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <landing-detail-field
                    v-if="thesis?.publicReviewDates && thesis.publicReviewDates.length > 0"
                    :label="t('datesOfPublicReviewLabel')"
                >
                    <span
                        v-for="date in thesis.publicReviewDates"
                        :key="`start-${date}`"
                        class="block">
                        {{ localiseDate(date) }}
                    </span>
                </landing-detail-field>
                <landing-detail-field
                    v-if="thesis?.publicReviewEndDates && thesis.publicReviewEndDates.length > 0"
                    :label="t('datesOfPublicReviewEndLabel')"
                >
                    <span
                        v-for="date in thesis.publicReviewEndDates"
                        :key="`end-${date}`"
                        class="block">
                        {{ localiseDate(date) }}
                    </span>
                </landing-detail-field>
            </div>
        </landing-section-card>

        <landing-section-card
            :title="t('identifiersLabel')"
            icon="mdi-identifier"
            icon-class="bg-indigo-50 text-indigo-600"
            padded
        >
            <document-common-fields-display
                :document="thesis"
                :cols="12"
                :can-edit="canEdit"
                :containing-entity-type="ApplicableEntityType.DOCUMENT"
                :concrete-entity-type="ApplicableEntityType.THESIS"
                :document-identifiers="documentIdentifiers"
                @identifiers-updated="emit('identifiers-updated')"
            />
        </landing-section-card>

        <keyword-list
            :keywords="thesis?.keywords ? thesis.keywords : []"
            :can-edit="canEdit && !thesis?.isOnPublicReview"
            @search-keyword="emit('search-keyword', $event)"
            @update="emit('update-keywords', $event)"
        />

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
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import LandingDetailField from "@/components/landing/LandingDetailField.vue";

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

const hasPublicReviewDates = computed(() =>
    !!(props.thesis?.publicReviewDates?.length || props.thesis?.publicReviewEndDates?.length)
);

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
