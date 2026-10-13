<template>
    <landing-meta-item
        v-for="featured in featuredIdentifiers"
        :key="featured.identifier"
        :label="featured.label"
        :abbrev="featured.abbrev"
        :icon="featured.icon"
        :tone="featured.tone"
    >
        <identifier-link
            v-if="featured.value && featured.linkType"
            :identifier="featured.value"
            :type="featured.linkType"
            compact
        />
        <template v-else-if="featured.value">
            {{ featured.value }}
        </template>
        <span v-else>{{ t("notYetSetMessage") }}</span>
    </landing-meta-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LandingMetaItem from "@/components/landing/LandingMetaItem.vue";
import IdentifierLink from "@/components/core/IdentifierLink.vue";
import { identifierPresentation } from "@/i18n/identifierPresentation";
import { useCrisContextInformation, useIdentifierConfiguration }
    from "@/composables/useCrisContextInformation";
import { ApplicableEntityType } from "@/models/Common";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


const props = defineProps<{
    entityType: ApplicableEntityType;
    // The entity whose fields carry the identifiers, named exactly as the catalogue names them.
    source?: Record<string, any> | null;
}>();

const { t, locale } = useI18n();
const { isIdentifierShown } = useIdentifierConfiguration();
const { crisContextInformation } = useCrisContextInformation();

const nationalIdentifierKeys = ["nationalId", "nationalScienceId"];

const featuredIdentifiers = computed(() => {
        // Read so that labels recompute on a language switch.
    const _activeLocale = locale.value;
    const configured = crisContextInformation.value.identifierConfiguration?.[props.entityType]
        ?? {};
    const presentation = identifierPresentation(props.entityType);
    const configuredNationalName = returnCurrentLocaleContent(
        crisContextInformation.value.nationalIdentifierName);

    return Object.entries(configured)
        .filter(([identifier, policy]) => policy?.featured && presentation[identifier])
        .map(([identifier]) => {
            const shape = presentation[identifier];
            const value = props.source?.[identifier] as string | undefined;
            const label = nationalIdentifierKeys.includes(identifier) && configuredNationalName
                ? configuredNationalName
                : shape.label ?? t(shape.labelKey as string);

            return { identifier, value, label, abbrev: shape.abbrev, icon: shape.icon,
                tone: shape.tone, linkType: shape.linkType };
        })
        .filter(featured =>
            isIdentifierShown(props.entityType, featured.identifier, featured.value));
});
</script>
