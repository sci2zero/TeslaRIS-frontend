<template>
    <v-container v-for="(input, index) in inputs" :key="index" :class="['bottom-spacer', { 'section-box': !single }]">
        <v-row>
            <v-col :cols="single ? 12 : 10">
                <organisation-unit-autocomplete-search
                    v-if="!input.enterExternalOU"
                    v-model="input.organisationUnit"
                    only-independent-institutions
                    @update:model-value="selectOrganisationUnit(input, $event)"
                />
                <multilingual-text-input
                    v-else
                    :ref="(el) => (externalNameRefs[index] = el)"
                    v-model="input.displayOrganisationUnit"
                    :label="$t('externalOUNameLabel')"
                    :initial-value="toMultilingualTextInput(input.displayOrganisationUnit, languageTags)"
                    @update="sendContentToParent"
                />
            </v-col>
            <v-col v-if="!single" cols="2">
                <v-btn
                    v-show="inputs.length > 1"
                    icon
                    @click="removeInput(index)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn v-show="index === inputs.length - 1" icon @click="addInput">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-btn
                    color="blue darken-1"
                    compact
                    @click="toggleExternalOU(input)">
                    {{ input.enterExternalOU ? $t("searchInSystemLabel") : $t("enterExternalOULabel") }}
                </v-btn>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-select
                    v-model="input.contributionType"
                    :items="contributionTypes"
                    :label="$t('contributionTypeLabel')"
                    item-title="title"
                    item-value="value"
                    @update:model-value="sendContentToParent" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="input.dateFrom"
                    :label="$t('fromLabel')"
                    color="primary"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="input.dateTo"
                    :label="$t('toLabel')"
                    color="primary"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <multilingual-text-input
                    :ref="(el) => (descriptionRefs[index] = el)"
                    v-model="input.contributionDescription"
                    :label="$t('descriptionLabel')"
                    :initial-value="toMultilingualTextInput(input.contributionDescription, languageTags)"
                    is-area
                    @update="sendContentToParent"
                />
            </v-col>
        </v-row>

        <!--      Hidden temporarily - requested by Dragan -->
        <!--        <v-row>-->
        <!--            <v-col cols="12">-->
        <!--                <uri-input-->
        <!--                    :ref="(el) => (urisRefs[index] = el)"-->
        <!--                    v-model="input.uris"-->
        <!--                    @update:model-value="sendContentToParent"-->
        <!--                />-->
        <!--            </v-col>-->
        <!--        </v-row>-->
    </v-container>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import DatePicker from "@/components/core/DatePicker.vue";
import MultilingualTextInput from "@/components/core/MultilingualTextInput.vue";
import OrganisationUnitAutocompleteSearch from "@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import { returnCurrentLocaleContent, toMultilingualTextInput } from "@/i18n/MultilingualContentUtil";
import { getOrganisationUnitProjectContributionTypesForGivenLocale } from "@/i18n/organisationUnitProjectContributionType";
import { useLanguageTags } from "@/composables/useLanguageTags";
import {
    OrganisationUnitProjectContributionType,
    type OrganisationUnitProjectContribution,
    type PrepopulatedOrganisation
} from "@/models/ProjectModel";
import type { MultilingualContent } from "@/models/Common";

withDefaults(defineProps<{
    single?: boolean;
}>(), {
    single: false
});

const emit = defineEmits<{
    (e: "setInput", payload: OrganisationUnitProjectContribution[]): void;
}>();

type ConsortiumInput = {
    organisationUnit: { title: string; value: number };
    organisationUnitId?: number;
    enterExternalOU: boolean;
    displayOrganisationUnit: MultilingualContent[];
    contributionDescription: MultilingualContent[];
    contributionType: OrganisationUnitProjectContributionType;
    dateFrom: string;
    dateTo: string;
    uris: string[];
};

const { languageTags } = useLanguageTags();

const contributionTypes = computed(() => getOrganisationUnitProjectContributionTypesForGivenLocale());

const externalNameRefs = ref<any>([]);
const descriptionRefs = ref<any>([]);
const urisRefs = ref<any>([]);

const searchPlaceholder = { title: "", value: -1 };

const blankInput = (): ConsortiumInput => ({
    organisationUnit: { ...searchPlaceholder },
    organisationUnitId: undefined,
    enterExternalOU: false,
    displayOrganisationUnit: [],
    contributionDescription: [],
    contributionType: OrganisationUnitProjectContributionType.PARTNER,
    dateFrom: "",
    dateTo: "",
    uris: []
});

const inputs = ref<ConsortiumInput[]>([blankInput()]);

const selectOrganisationUnit = (input: ConsortiumInput, selection: { title: string; value: number } | undefined) => {
    input.organisationUnitId = selection?.value && selection.value > 0 ? selection.value : undefined;
    sendContentToParent();
};

const toggleExternalOU = (input: ConsortiumInput) => {
    input.enterExternalOU = !input.enterExternalOU;

    if (input.enterExternalOU) {
        input.organisationUnit = { ...searchPlaceholder };
        input.organisationUnitId = undefined;
    } else {
        input.displayOrganisationUnit = [];
    }

    sendContentToParent();
};

const addInput = () => {
    inputs.value.push(blankInput());
};

const removeInput = (index: number) => {
    inputs.value.splice(index, 1);
    externalNameRefs.value.splice(index, 1);
    descriptionRefs.value.splice(index, 1);
    urisRefs.value.splice(index, 1);

    if (inputs.value.length === 0) {
        addInput();
    }

    sendContentToParent();
};

const clearInput = () => {
    inputs.value = [blankInput()];

    [...externalNameRefs.value, ...descriptionRefs.value, ...urisRefs.value]
        .filter((componentRef: any) => componentRef)
        .forEach((componentRef: any) => componentRef.clearInput());

    sendContentToParent();
};

const isEmptyRow = (input: ConsortiumInput) =>
    !input.organisationUnitId && input.displayOrganisationUnit.length === 0;

const seedFromMetadata = async (items: PrepopulatedOrganisation[]) => {
    if (!items?.length || inputs.value.some(input => !isEmptyRow(input))) {
        return;
    }

    const seeded: ConsortiumInput[] = [];

    for (const item of items) {
        if (!item.organisationName?.length) {
            continue;
        }

        const matched = !!item.organisationId;

        seeded.push({
            ...blankInput(),
            organisationUnit: matched ?
                {
                    title: returnCurrentLocaleContent(item.organisationName) as string,
                    value: item.organisationId as number
                } :
                { ...searchPlaceholder },
            organisationUnitId: matched ? item.organisationId : undefined,
            enterExternalOU: !matched,
            displayOrganisationUnit: matched ? [] : item.organisationName,
            contributionType: item.contributionType ?? OrganisationUnitProjectContributionType.PARTNER
        });
    }

    if (seeded.length === 0) {
        return;
    }

    inputs.value = [];
    externalNameRefs.value = [];
    descriptionRefs.value = [];
    urisRefs.value = [];
    await nextTick();

    inputs.value = seeded;
    await nextTick();

    inputs.value.forEach((input, index) => {
        if (input.enterExternalOU) {
            externalNameRefs.value[index]?.forceRefreshModelValue(
                toMultilingualTextInput(input.displayOrganisationUnit, languageTags.value)
            );
        }
    });

    sendContentToParent();
};

const sendContentToParent = () => {
    const consortium: OrganisationUnitProjectContribution[] = [];

    inputs.value.forEach(input => {
        if (isEmptyRow(input)) {
            return;
        }

        consortium.push({
            organisationUnitId: input.organisationUnitId,
            displayOrganisationUnit: input.enterExternalOU ? input.displayOrganisationUnit : [],
            contributionDescription: input.contributionDescription,
            contributionType: input.contributionType,
            orderNumber: consortium.length + 1,
            dateFrom: input.dateFrom || undefined,
            dateTo: input.dateTo || undefined,
            uris: input.uris,
            fundingParts: []
        });
    });

    emit("setInput", consortium);
};

defineExpose({
    clearInput,
    seedFromMetadata
});
</script>
