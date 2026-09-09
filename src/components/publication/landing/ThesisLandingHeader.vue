<template>
    <div class="mb-8">
        <generic-crud-modal
            v-if="canEdit && !thesis?.isOnPublicReview"
            ref="thesisUpdateModalRef"
            hide-activator
            :form-component="ThesisUpdateForm"
            :form-props="{ presetThesis: thesis }"
            entity-name="Thesis"
            is-update
            is-section-update
            :read-only="!canEdit || thesis?.isOnPublicReview"
            @update="emit('update', $event)"
        />
        <generic-crud-modal
            v-if="canEdit && !thesis?.isOnPublicReview"
            ref="titleUpdateModalRef"
            hide-activator
            :form-component="AlternateTitleForm"
            :form-props="{ presetTitle: thesis?.title, presetAlternateTitle: thesis?.alternateTitle }"
            entity-name="Title"
            is-update
            is-section-update
            :read-only="!canEdit || thesis?.isOnPublicReview"
            @update="emit('update-title', $event)"
        />

        <div class="flex flex-col lg:flex-row items-center lg:items-start w-full">
            <div class="flex-shrink-0 mb-8 lg:mb-0 lg:mr-12">
                <div class="relative">
                    <div class="w-32 h-32 sm:size-48 lg:size-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-slate-100 bg-slate-50 flex items-center justify-center">
                        <v-icon v-if="!thesis" size="x-large" class="text-slate-400">
                            mdi-certificate-outline
                        </v-icon>
                        <wordcloud
                            v-else
                            :for-document-id="thesis?.id"
                            :document-type="PublicationType.THESIS"
                            compact-icon
                        />
                    </div>
                    <div
                        v-if="thesisTypeLabel"
                        class="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border-2 border-white"
                    >
                        {{ thesisTypeLabel }}
                    </div>
                </div>
            </div>

            <div class="flex-1 min-w-0 w-full text-center lg:text-left">
                <div class="flex items-start justify-center lg:justify-between w-full gap-3 mb-3">
                    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-800 leading-tight tracking-tight min-w-0 flex-1">
                        <v-skeleton-loader
                            :loading="!thesis"
                            type="heading"
                            class="bg-transparent"
                        >
                            <rich-title-renderer :title="returnCurrentLocaleContent(thesis?.title)" />
                        </v-skeleton-loader>
                    </h1>
                    <v-menu v-if="canEdit && !thesis?.isOnPublicReview" location="bottom end">
                        <template #activator="{ props: menuProps }">
                            <UiButton variant="outline" size="icon" class="shrink-0 mt-1" v-bind="menuProps">
                                <span class="mdi mdi-dots-vertical text-xl"></span>
                            </UiButton>
                        </template>
                        <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                            <v-list-item
                                prepend-icon="mdi-pencil-outline"
                                :title="$t('updateThesisLabel')"
                                @click="openModal(thesisUpdateModalRef)"
                            />
                            <v-list-item
                                prepend-icon="mdi-format-title"
                                :title="$t('updateTitleLabel')"
                                @click="openModal(titleUpdateModalRef)"
                            />
                        </v-list>
                    </v-menu>
                </div>

                <p
                    v-if="thesis?.alternateTitle && thesis.alternateTitle.length > 0"
                    class="text-lg sm:text-xl text-slate-500 italic mb-2"
                >
                    <rich-title-renderer :title="`(${returnCurrentLocaleContent(thesis.alternateTitle)})`" />
                </p>
                <p
                    v-if="returnCurrentLocaleContent(thesis?.subTitle)"
                    class="text-lg sm:text-xl text-slate-600 mb-4"
                >
                    {{ returnCurrentLocaleContent(thesis?.subTitle) }}
                </p>

                <div class="mb-6 lg:mb-8">
                    <p v-if="thesis?.organisationUnitId || hasExternalOrganisationUnit" class="text-lg sm:text-xl font-semibold text-slate-600 font-sans">
                        <localized-link
                            v-if="thesis?.organisationUnitId"
                            :to="'organisation-units/' + thesis.organisationUnitId"
                            class="font-medium text-gray-900 underline"
                        >
                            {{ returnCurrentLocaleContent(organisationUnit?.name) }}
                        </localized-link>
                        <span v-else>
                            {{ returnCurrentLocaleContent(thesis?.externalOrganisationUnitName) }}
                        </span>
                    </p>
                    <p v-if="thesis?.publisherId || thesis?.authorReprint" class="text-sm text-slate-500 font-sans">
                        <localized-link
                            v-if="thesis?.publisherId"
                            :to="'publishers/' + thesis.publisherId"
                            class="underline"
                        >
                            {{ returnCurrentLocaleContent(publisher?.name) }}
                        </localized-link>
                        <localized-link
                            v-else-if="thesis?.authorReprint"
                            to="scientific-results/author-reprints"
                            class="underline"
                        >
                            {{ $t("authorReprintLabel") }}
                        </localized-link>
                    </p>
                </div>

                <div class="mb-6 flex justify-center lg:justify-start">
                    <div class="space-y-3">
                        <div v-if="thesis?.documentDate" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="mdi mdi-calendar text-white text-sm"></span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">{{ $t("dateOfPublicationLabel") }}</span>
                                <span class="text-sm text-slate-800 font-medium">{{ localiseFlexibleDate(thesis.documentDate) }}</span>
                            </div>
                        </div>

                        <div v-if="thesis?.thesisDefenceDate" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="mdi mdi-school text-white text-sm"></span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">{{ $t("defenceDateLabel") }}</span>
                                <span class="text-sm text-slate-800 font-medium">{{ localiseDate(thesis.thesisDefenceDate) }}</span>
                            </div>
                        </div>

                        <div v-if="thesis?.topicAcceptanceDate" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="mdi mdi-file-check-outline text-white text-sm"></span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">{{ $t("topicAcceptanceDateLabel") }}</span>
                                <span class="text-sm text-slate-800 font-medium">{{ localiseDate(thesis.topicAcceptanceDate) }}</span>
                            </div>
                        </div>

                        <div v-if="thesis?.doi" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="text-white text-xs font-bold">DOI</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">DOI</span>
                                <identifier-link :identifier="thesis.doi" compact />
                            </div>
                        </div>

                        <div v-if="thesis?.eisbn" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="text-white text-xs font-bold">eI</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">eISBN</span>
                                <span class="text-sm text-slate-800 font-medium font-mono">{{ thesis.eisbn }}</span>
                            </div>
                        </div>

                        <div v-if="thesis?.printISBN" class="flex items-center justify-start space-x-3">
                            <div class="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-md">
                                <span class="text-white text-xs font-bold">ISBN</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs text-slate-500 font-medium uppercase tracking-wide">Print ISBN</span>
                                <span class="text-sm text-slate-800 font-medium font-mono">{{ thesis.printISBN }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="thesis?.substituteFor || thesis?.substitutedBy" class="mb-4 space-y-1 text-sm">
                    <p v-if="thesis.substituteFor">
                        <span class="text-slate-500">{{ $t("substituteForLabel") }}:</span>
                        <localized-link
                            :to="'scientific-results/thesis/' + thesis.substituteFor"
                            class="ml-1 font-medium text-gray-900 underline"
                        >
                            {{ returnCurrentLocaleContent(thesis.substitutedTitle) }}
                        </localized-link>
                    </p>
                    <p v-if="thesis.substitutedBy">
                        <span class="text-slate-500">{{ $t("substitutedByLabel") }}:</span>
                        <localized-link
                            :to="'scientific-results/thesis/' + thesis.substitutedBy"
                            class="ml-1 font-medium text-gray-900 underline"
                        >
                            {{ returnCurrentLocaleContent(thesis.substituteTitle) }}
                        </localized-link>
                    </p>
                </div>

                <div
                    v-if="thesis?.isOnPublicReview"
                    class="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-full border border-amber-200 mb-6"
                >
                    <span class="mdi mdi-eye-outline"></span>
                    {{ $t("onPublicReviewLabel", [localiseDate(thesis.publicReviewEnd)]) }}
                </div>

                <div
                    v-if="$slots.actions"
                    class="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start w-full"
                >
                    <slot name="actions"></slot>
                </div>
            </div>
        </div>

        <div v-if="thesis?.id" class="mt-8">
            <data-quality-remarks-dialog
                :entity-type="PublicationType.THESIS"
                :entity-id="thesis.id"
                prominent
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getThesisTitleFromValueAutoLocale } from "@/i18n/thesisType";
import { localiseDate, localiseFlexibleDate } from "@/utils/DateUtil";
import { PublicationType, type Thesis } from "@/models/PublicationModel";
import type { OrganisationUnitResponse } from "@/models/OrganisationUnitModel";
import type { Publisher } from "@/models/PublisherModel";
import type { MultilingualContent } from "@/models/Common";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import ThesisUpdateForm from "@/components/publication/update/ThesisUpdateForm.vue";
import AlternateTitleForm from "@/components/thesisLibrary/AlternateTitleForm.vue";
import Wordcloud from "@/components/core/Wordcloud.vue";
import RichTitleRenderer from "@/components/core/RichTitleRenderer.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import IdentifierLink from "@/components/core/IdentifierLink.vue";
import DataQualityRemarksDialog from "@/components/core/revisions/DataQualityRemarksDialog.vue";
import { UiButton } from "@/components/ui/button";

interface Props {
    thesis: Thesis | undefined;
    organisationUnit?: OrganisationUnitResponse;
    publisher?: Publisher;
    canEdit: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    update: [basicInfo: Thesis];
    "update-title": [titleInformation: { title: MultilingualContent[]; alternateTitle: MultilingualContent[] }];
}>();

const thesisUpdateModalRef = ref<{ dialog: boolean } | null>(null);
const titleUpdateModalRef = ref<{ dialog: boolean } | null>(null);

const openModal = (modal: { dialog: boolean } | null) => {
    if (modal) {
        modal.dialog = true;
    }
};

const thesisTypeLabel = computed(() =>
    props.thesis?.thesisType ? getThesisTitleFromValueAutoLocale(props.thesis.thesisType) : ""
);

const hasExternalOrganisationUnit = computed(() =>
    !!(props.thesis?.externalOrganisationUnitName && props.thesis.externalOrganisationUnitName.length > 0)
);
</script>

<style scoped>
.font-serif {
    font-family: "Georgia", "Times New Roman", serif;
}
</style>
