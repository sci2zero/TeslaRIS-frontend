<template>
    <v-container v-for="(input, index) in inputs" :key="index" :class="['bottom-spacer', { 'section-box': !single }]">
        <v-row>
            <v-col :cols="single ? 12 : 10">
                <person-contribution-base
                    :ref="(el) => (baseContributionRef[index] = el)"
                    :basic="false"
                    :required="false"
                    :allow-external-associate="allowExternalAssociate"
                    is-update
                    :preset-contribution-value="input.contribution"
                    @set-input="input.contribution = $event; sendContentToParent();"
                />
            </v-col>
            <v-col v-if="!single" cols="2">
                <v-col>
                    <v-btn
                        v-show="inputs.length > ((presetContributions && presetContributions.length > 0) ? 0 : 1)"
                        icon
                        @click="removeInput(index)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                    <v-btn v-show="index === inputs.length - 1" icon @click="addInput">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-col>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <v-select
                    v-model="input.contributionType"
                    :items="contributionTypes"
                    :label="$t('contributionTypeLabel')"
                    return-object
                    :readonly="lockContributionType !== undefined && lockContributionType.length === 1"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
            <v-col cols="6">
                <v-select
                    v-model="input.investigationRole"
                    :items="investigationRoles"
                    :label="$t('investigationRoleLabel')"
                    return-object
                    @update:model-value="sendContentToParent"
                />
            </v-col>
        </v-row>
        <v-row v-if="input.investigationRole?.value === PersonProjectInvestigationRole.OTHER">
            <v-col>
                <multilingual-text-input
                    :ref="(el) => (otherRoleDescriptionRef[index] = el)"
                    v-model="input.otherRoleDescription"
                    :label="$t('otherRoleDescriptionLabel')"
                    :initial-value="toMultilingualTextInput(input.otherRoleDescription, languageTags)"
                    is-area
                    @update="sendContentToParent"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import PersonContributionBase from "../core/PersonContributionBase.vue";
import MultilingualTextInput from "../core/MultilingualTextInput.vue";
import { toMultilingualTextInput } from "@/i18n/MultilingualContentUtil";
import { useLanguageTags } from "@/composables/useLanguageTags";
import {
    getPersonProjectContributionTypeTitleFromValueAutoLocale,
    getPersonProjectContributionTypesForGivenLocale
} from "@/i18n/personProjectContributionType";
import {
    getPersonProjectInvestigationRoleTitleFromValueAutoLocale,
    getPersonProjectInvestigationRolesForGivenLocale
} from "@/i18n/personProjectInvestigationRole";
import {
    PersonProjectContributionType,
    PersonProjectInvestigationRole,
    type PersonProjectContribution,
    type PrepopulatedPerson
} from "@/models/ProjectModel";

const props = withDefaults(defineProps<{
    presetContributions?: PersonProjectContribution[];
    isUpdate?: boolean;
    lockContributionType?: PersonProjectContributionType[];
    allowExternalAssociate?: boolean;
    single?: boolean;
}>(), {
    presetContributions: () => [],
    isUpdate: false,
    lockContributionType: undefined,
    allowExternalAssociate: false,
    single: false
});

const emit = defineEmits<{
    (e: "setInput", payload: PersonProjectContribution[]): void;
}>();

const { languageTags } = useLanguageTags();

const defaultContributionType = () =>
    props.lockContributionType ? props.lockContributionType[0] : PersonProjectContributionType.TEAM_MEMBER;

const blankInput = () => ({
    contributionType: {
        title: getPersonProjectContributionTypeTitleFromValueAutoLocale(defaultContributionType()),
        value: defaultContributionType()
    },
    investigationRole: {
        title: getPersonProjectInvestigationRoleTitleFromValueAutoLocale(PersonProjectInvestigationRole.RESEARCHER),
        value: PersonProjectInvestigationRole.RESEARCHER
    },
    otherRoleDescription: []
});

const inputs = ref<any[]>(
    props.presetContributions.length > 0 ?
        Array.from({ length: props.presetContributions.length }, () => ({})) :
        [blankInput()]
);
const baseContributionRef = ref<any>([]);
const otherRoleDescriptionRef = ref<any>([]);

onMounted(() => {
    if (props.presetContributions && props.presetContributions.length > 0) {
        inputs.value = [];
        props.presetContributions.forEach(contribution => {
            inputs.value.push({
                contribution: {
                    personId: contribution.personId,
                    description: contribution.contributionDescription,
                    affiliationStatement: contribution.displayAffiliationStatement,
                    selectedOtherName: [
                        contribution.personName?.firstname,
                        contribution.personName?.otherName,
                        contribution.personName?.lastname
                    ],
                    institutionIds: contribution.institutionIds,
                    dateFrom: contribution.dateFrom,
                    dateTo: contribution.dateTo,
                    researchAreas: contribution.researchAreas
                },
                contributionType: {
                    title: getPersonProjectContributionTypeTitleFromValueAutoLocale(contribution.contributionType),
                    value: contribution.contributionType
                },
                investigationRole: {
                    title: getPersonProjectInvestigationRoleTitleFromValueAutoLocale(contribution.investigationRole),
                    value: contribution.investigationRole
                },
                otherRoleDescription: contribution.otherRoleDescription ?? [],
                id: contribution.id
            });
        });
    }
});

const contributionTypes = computed(() => {
    const types = getPersonProjectContributionTypesForGivenLocale();

    if (types && props.lockContributionType) {
        return types.filter(type => props.lockContributionType?.includes(type.value));
    }

    return types;
});

const investigationRoles = computed(() => getPersonProjectInvestigationRolesForGivenLocale());

const addInput = () => {
    inputs.value.push(blankInput());
};

const removeInput = (index: number) => {
    inputs.value.splice(index, 1);

    baseContributionRef.value.filter(
        (ref: any) => ref
    ).forEach((ref: typeof PersonContributionBase) => {
        ref.valueSet = false;
    });

    inputs.value = [...inputs.value];
    sendContentToParent();
};

const clearInput = () => {
    inputs.value = [{ contribution: {}, ...blankInput() }];

    baseContributionRef.value
        .filter((ref: any) => ref)
        .forEach((ref: typeof PersonContributionBase) => {
            ref.clearInput();
        });

    otherRoleDescriptionRef.value
        .filter((ref: any) => ref)
        .forEach((ref: any) => {
            ref.clearInput();
        });

    sendContentToParent();
};

const isEmptyRow = (input: any) => {
    const hasPerson = input.contribution?.personId > 0;
    const hasTypedName = (input.contribution?.selectedOtherName ?? [])
        .slice(0, 3)
        .some((namePart: string | undefined) => namePart);

    return !hasPerson && !hasTypedName;
};

// Seeds rows from DOI-harvested metadata. Persons the backend matched against an existing
// person come back with an id and are linked, the rest become external associates.
const seedFromMetadata = async (items: PrepopulatedPerson[]) => {
    if (!items?.length || inputs.value.some(input => input.contribution && !isEmptyRow(input))) {
        return;
    }

    const seeded: any[] = [];

    for (const item of items) {
        if (!item.givenName?.trim() && !item.familyName?.trim()) {
            continue;
        }

        const row = blankInput();

        // Harvested lead investigators come back as PRINCIPLE_INVESTIGATOR, the rest as TEAM_MEMBER.
        // A locked form keeps its own type, and the investigation role stays on the default since
        // neither source says anything about it.
        if (item.contributionType && !props.lockContributionType) {
            row.contributionType = {
                title: getPersonProjectContributionTypeTitleFromValueAutoLocale(item.contributionType),
                value: item.contributionType
            };
        }

        seeded.push({
            ...row,
            contribution: {
                // Left undefined when unmatched: PersonContributionBase branches on truthiness, so a
                // falsy id is what drops the row into external-associate mode.
                personId: item.personId,
                description: [],
                // Only for an unmatched person: on a linked one, a non-empty statement would push
                // the base into free-text mode and wipe the institution it resolves from employments.
                affiliationStatement: item.personId ? [] : item.affiliationName,
                selectedOtherName: [item.givenName, "", item.familyName],
                institutionIds: [],
                dateFrom: "",
                dateTo: "",
                researchAreas: []
            }
        });
    }

    if (seeded.length === 0) {
        return;
    }

    inputs.value = [];
    baseContributionRef.value = [];
    otherRoleDescriptionRef.value = [];
    await nextTick();

    inputs.value = seeded.map(row => ({ ...row, contribution: undefined }));
    await nextTick();

    seeded.forEach((row, index) => {
        inputs.value[index].contribution = row.contribution;
    });

    sendContentToParent();
};

const sendContentToParent = () => {
    const returnObject: PersonProjectContribution[] = [];

    inputs.value.forEach((input, index) => {
        if (!input.contribution || isEmptyRow(input)) {
            return;
        }

        let personName = undefined;
        if (input.contribution.selectedOtherName) {
            personName = {
                firstname: input.contribution.selectedOtherName[0],
                otherName: input.contribution.selectedOtherName[1],
                lastname: input.contribution.selectedOtherName[2],
                dateFrom: input.contribution.selectedOtherName[3],
                dateTo: input.contribution.selectedOtherName[4]
            };
        }

        returnObject.push({
            contributionDescription: input.contribution.description,
            personId: input.contribution.personId > 0 ? input.contribution.personId : undefined,
            displayAffiliationStatement: input.contribution.affiliationStatement,
            orderNumber: index + 1,
            personName: personName,
            contributionType: input.contributionType.value,
            investigationRole: input.investigationRole.value,
            otherRoleDescription:
                input.investigationRole.value === PersonProjectInvestigationRole.OTHER ?
                    input.otherRoleDescription : [],
            fundingParts: [],
            dateFrom: input.contribution.dateFrom || undefined,
            dateTo: input.contribution.dateTo || undefined,
            institutionIds: input.contribution.institutionIds,
            researchAreasId: input.contribution.researchAreasId
        });
    });

    emit("setInput", returnObject);
};

defineExpose({ clearInput, seedFromMetadata });
</script>
