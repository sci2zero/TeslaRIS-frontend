<template>
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <span
            v-if="index !== undefined"
            class="w-5 shrink-0 text-center text-sm font-medium text-slate-400">
            {{ index }}
        </span>

        <person-avatar
            class="shrink-0"
            :person-id="contribution.personId"
            :first-name="contribution.personName?.firstname"
            :last-name="contribution.personName?.lastname"
            :size="40"
        />

        <div class="min-w-0 flex-1">
            <localized-link
                v-if="contribution.personId && contribution.personId > 0"
                :to="'persons/' + contribution.personId"
                class="font-semibold text-slate-800 no-underline hover:underline">
                {{ contributorName }}
            </localized-link>
            <span v-else class="font-semibold text-slate-800">
                {{ contributorName }}
            </span>
            <p
                v-if="titles"
                class="mt-0.5 text-xs text-slate-500">
                {{ titles }}
            </p>
            <p
                v-if="affiliation"
                class="mt-0.5 text-sm text-slate-500">
                {{ affiliation }}
            </p>
            <p
                v-if="showEmail && contribution.contact?.contactEmail"
                class="mt-0.5 text-xs text-slate-500">
                {{ $t("emailLabel") }}: {{ contribution.contact.contactEmail }}
            </p>
        </div>

        <div
            v-if="$slots.badges"
            class="ml-auto flex flex-wrap items-center justify-end gap-1.5">
            <slot name="badges"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import PersonAvatar from "@/components/person/PersonAvatar.vue";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getEmploymentTitleFromValueAutoLocale } from "@/i18n/employmentTitle";
import { getPersonalTitleFromValueAutoLocale } from "@/i18n/personalTitle";
import type { PersonContribution } from "@/models/PersonModel";
import type { PersonDocumentContribution } from "@/models/PublicationModel";
import { useLoginStore } from "@/stores/loginStore";

type RowContribution = PersonContribution & Partial<Pick<PersonDocumentContribution, "employmentTitle" | "personalTitle">>;

const props = defineProps<{
    contribution: RowContribution;
    index?: number;
}>();

defineOptions({
    name: "PersonContributionRow",
});

const loginStore = useLoginStore();

const showEmail = computed(() => loginStore.userLoggedIn);

const contributorName = computed(() => {
    const name = props.contribution.personName;
    if (!name) {
        return "";
    }

    return [
        name.firstname,
        name.otherName ? `(${name.otherName})` : "",
        name.lastname,
    ].filter(Boolean).join(" ");
});

const affiliation = computed(() => {
    if (!props.contribution.institutionIds?.length) {
        return returnCurrentLocaleContent(props.contribution.displayAffiliationStatement) || "";
    }

    return (props.contribution.displayInstitutionNames || [])
        .map((name) => returnCurrentLocaleContent(name))
        .filter(Boolean)
        .join(", ");
});

const titles = computed(() => {
    const values: string[] = [];
    if (props.contribution.employmentTitle) {
        const employmentTitle = getEmploymentTitleFromValueAutoLocale(props.contribution.employmentTitle);
        if (employmentTitle) {
            values.push(employmentTitle);
        }
    }
    if (props.contribution.personalTitle) {
        const personalTitle = getPersonalTitleFromValueAutoLocale(props.contribution.personalTitle);
        if (personalTitle) {
            values.push(personalTitle);
        }
    }
    return values.join(" · ");
});
</script>
