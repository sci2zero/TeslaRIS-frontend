<template>
    <div class="mt-4 space-y-4">
        <landing-section-card
            v-if="previewContributors.length"
            :title="contributorsHeading"
            :count="matchingContributors.length"
            icon="mdi-account-group"
            icon-class="bg-indigo-50 text-indigo-600"
        >
            <template #action>
                <UiButton
                    variant="outline"
                    size="sm"
                    @click="$emit('see-all', contributorsTab)"
                >
                    {{ $t("showAllLabel") }}
                </UiButton>
            </template>
            <ul class="divide-y divide-slate-100">
                <li
                    v-for="(contribution, index) in previewContributors"
                    :key="contribution.id ?? `${contribution.personId}-${contribution.orderNumber}`"
                >
                    <person-contribution-row
                        :contribution="contribution"
                        :index="index + 1"
                    />
                </li>
            </ul>
        </landing-section-card>

        <landing-section-card
            v-if="hasDescription"
            :title="descriptionHeading"
            icon="mdi-text-box-outline"
            icon-class="bg-blue-50 text-blue-600"
            padded
        >
            <template #action>
                <UiButton
                    variant="outline"
                    size="sm"
                    @click="$emit('see-all', descriptionTab)"
                >
                    {{ $t("showAllLabel") }}
                </UiButton>
            </template>
            <rich-text-editor
                :model-value="descriptionDisplay"
                :editable="false"
                :limit-display="500"
            />
        </landing-section-card>

        <landing-section-card
            v-if="forDocumentId && documentType"
            v-show="isWordcloudVisible"
            :title="$t('wordcloudLabel')"
            icon="mdi-cloud-outline"
            icon-class="bg-purple-50 text-purple-600"
            padded
        >
            <wordcloud
                :for-document-id="forDocumentId"
                :document-type="documentType"
                @visible="onWordcloudVisible"
            />
        </landing-section-card>

        <p
            v-if="!previewContributors.length && !hasDescription && !isWordcloudVisible && !isWordcloudPending"
            class="mt-6 text-slate-500"
        >
            {{ $t("notYetSetMessage") }}
        </p>

        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, watch } from "vue";
import { useI18n } from "vue-i18n";
import RichTextEditor from "@/components/core/RichTextEditor.vue";
import Wordcloud from "@/components/core/Wordcloud.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import PersonContributionRow from "@/components/person/PersonContributionRow.vue";
import { UiButton } from "@/components/ui/button";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import type { MultilingualContent } from "@/models/Common";
import type { PersonContribution } from "@/models/PersonModel";
import type { PublicationType } from "@/models/PublicationModel";

type OverviewContribution = PersonContribution & {
    contributionType?: string | number;
};

const props = withDefaults(defineProps<{
    description?: MultilingualContent[];
    isGeneralDescription?: boolean;
    contributions?: OverviewContribution[];
    contributionTypes?: string[];
    previewCount?: number;
    contributorsLabel?: string;
    contributorsTab?: string;
    descriptionTab?: string;
    forDocumentId?: number;
    documentType?: PublicationType;
}>(), {
    description: () => [],
    isGeneralDescription: false,
    contributions: () => [],
    contributionTypes: () => [],
    previewCount: 3,
    contributorsLabel: "",
    contributorsTab: "contributions",
    descriptionTab: "additionalInfo",
});

const emit = defineEmits<{
    "see-all": [tab: string];
    "has-content": [state: { visible: boolean; settled: boolean }];
}>();

const slots = useSlots();

const { t, locale } = useI18n();
const descriptionDisplay = ref("");
const isWordcloudVisible = ref(false);
const isWordcloudReady = ref(false);
const isWordcloudPending = computed(() =>
    Boolean(props.documentType) && !isWordcloudReady.value
);

const onWordcloudVisible = (visible: boolean) => {
    isWordcloudReady.value = true;
    isWordcloudVisible.value = visible;
};

const refreshDescription = () => {
    descriptionDisplay.value = (returnCurrentLocaleContent(props.description) as string) || "";
};

watch([() => props.description, locale], refreshDescription, { immediate: true });
watch(() => [props.forDocumentId, props.documentType], () => {
    isWordcloudVisible.value = false;
    isWordcloudReady.value = false;
});

const hasDescription = computed(() =>
    descriptionDisplay.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 0
);

const descriptionHeading = computed(() =>
    props.isGeneralDescription ? t("descriptionLabel") : t("abstractLabel")
);

const contributorsHeading = computed(() =>
    props.contributorsLabel || t("authorsLabel")
);

const matchingContributors = computed(() => {
    const list = [...(props.contributions ?? [])].sort(
        (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
    );
    if (!props.contributionTypes.length) {
        return list;
    }

    return list.filter((contribution) =>
        props.contributionTypes.includes(String(contribution.contributionType))
    );
});

const previewContributors = computed(() =>
    matchingContributors.value.slice(0, props.previewCount)
);

const hasExtraContent = computed(() =>
    hasDescription.value || isWordcloudVisible.value || Boolean(slots.default)
);

const contentSettled = computed(() =>
    !isWordcloudPending.value || hasExtraContent.value
);

watch([hasExtraContent, contentSettled], () => {
    emit("has-content", {
        visible: hasExtraContent.value,
        settled: contentSettled.value,
    });
}, { immediate: true });
</script>
