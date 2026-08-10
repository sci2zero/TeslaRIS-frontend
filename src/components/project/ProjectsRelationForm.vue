<template>
    <v-container v-for="(input, index) in inputs" :key="index" class="bottom-spacer section-box">
        <v-row>
            <v-col cols="10">
                <project-autocomplete-search
                    v-model="input.targetProject"
                    label="targetProjectLabel"
                    disable-submission
                    @update:model-value="selectTargetProject(input, $event)"
                />
            </v-col>
            <v-col cols="2">
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
            <v-col cols="12">
                <v-select
                    v-model="input.relationType"
                    :items="relationTypes"
                    :label="$t('relationTypeLabel')"
                    item-title="title"
                    item-value="value"
                    @update:model-value="sendContentToParent" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6">
                <date-picker
                    v-model="input.dateFrom"
                    :label="$t('dateFromLabel')"
                    color="primary"
                    :required="!isEmptyRow(input)"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
            <v-col cols="6">
                <date-picker
                    v-model="input.dateTo"
                    :label="$t('dateToLabel')"
                    color="primary"
                    :required="!isEmptyRow(input)"
                    @update:model-value="sendContentToParent"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <multilingual-text-input
                    :ref="(el) => (sourceDescriptionRefs[index] = el)"
                    v-model="input.sourceProjectDescription"
                    :label="$t('sourceProjectDescriptionLabel')"
                    :initial-value="toMultilingualTextInput(input.sourceProjectDescription, languageTags)"
                    is-area
                    @update="sendContentToParent"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <multilingual-text-input
                    :ref="(el) => (targetDescriptionRefs[index] = el)"
                    v-model="input.targetProjectDescription"
                    :label="$t('targetProjectDescriptionLabel')"
                    :initial-value="toMultilingualTextInput(input.targetProjectDescription, languageTags)"
                    is-area
                    @update="sendContentToParent"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import DatePicker from "@/components/core/DatePicker.vue";
import MultilingualTextInput from "@/components/core/MultilingualTextInput.vue";
import ProjectAutocompleteSearch from "@/components/project/ProjectAutocompleteSearch.vue";
import { returnCurrentLocaleContent, toMultilingualTextInput } from "@/i18n/MultilingualContentUtil";
import { getProjectsRelationTypesForGivenLocale } from "@/i18n/projectsRelationType";
import { useLanguageTags } from "@/composables/useLanguageTags";
import ProjectService from "@/services/project/ProjectService";
import { ProjectsRelationType, type ProjectsRelation } from "@/models/ProjectModel";
import type { MultilingualContent } from "@/models/Common";

const props = withDefaults(defineProps<{
    presetRelations?: ProjectsRelation[];
}>(), {
    presetRelations: () => []
});

const emit = defineEmits<{
    (e: "setInput", payload: ProjectsRelation[]): void;
}>();

type RelationInput = {
    id?: number;
    // The selection object only drives the autocomplete's label - the id is kept
    // separately so a preset relation never loses its target while the label is
    // still being read back asynchronously.
    targetProject?: { title: string; value: number };
    targetProjectId?: number;
    relationType: ProjectsRelationType;
    dateFrom: string;
    dateTo: string;
    sourceProjectDescription: MultilingualContent[];
    targetProjectDescription: MultilingualContent[];
};

const { languageTags } = useLanguageTags();

const relationTypes = computed(() => getProjectsRelationTypesForGivenLocale());

const sourceDescriptionRefs = ref<any>([]);
const targetDescriptionRefs = ref<any>([]);

const blankInput = (): RelationInput => ({
    targetProject: undefined,
    targetProjectId: undefined,
    relationType: ProjectsRelationType.PART_OF,
    dateFrom: "",
    dateTo: "",
    sourceProjectDescription: [],
    targetProjectDescription: []
});

const inputs = ref<RelationInput[]>([blankInput()]);

onMounted(() => {
    populateInputs();
});

watch(() => props.presetRelations, () => {
    populateInputs();
});

const populateInputs = () => {
    if (!props.presetRelations || props.presetRelations.length === 0) {
        inputs.value = [blankInput()];
        return;
    }

    inputs.value = props.presetRelations.map(relation => ({
        id: relation.id,
        targetProject: undefined,
        targetProjectId: relation.targetProjectId,
        relationType: relation.relationType,
        dateFrom: relation.dateFrom,
        dateTo: relation.dateTo,
        sourceProjectDescription: relation.sourceProjectDescription ?? [],
        targetProjectDescription: relation.targetProjectDescription ?? []
    }));

    sendContentToParent();

    // Preset relations only carry the target project id, so the display label
    // has to be read back the same way FundingCallUpdateForm does for its funder.
    props.presetRelations.forEach((relation, index) => {
        if (!relation.targetProjectId) {
            return;
        }

        ProjectService.readProject(relation.targetProjectId).then(response => {
            inputs.value[index].targetProject = {
                title: returnCurrentLocaleContent(response.data.name) as string,
                value: relation.targetProjectId as number
            };
        });
    });
};

const selectTargetProject = (input: RelationInput, selection: { title: string; value: number } | undefined) => {
    input.targetProjectId = selection?.value ? selection.value : undefined;
    sendContentToParent();
};

const addInput = () => {
    inputs.value.push(blankInput());
};

const removeInput = (index: number) => {
    inputs.value.splice(index, 1);
    sourceDescriptionRefs.value.splice(index, 1);
    targetDescriptionRefs.value.splice(index, 1);

    if (inputs.value.length === 0) {
        addInput();
    }

    sendContentToParent();
};

const clearInput = () => {
    inputs.value = [blankInput()];

    [...sourceDescriptionRefs.value, ...targetDescriptionRefs.value]
        .filter((componentRef: any) => componentRef)
        .forEach((componentRef: any) => componentRef.clearInput());

    sendContentToParent();
};

const isEmptyRow = (input: RelationInput) =>
    !input.targetProjectId &&
    input.sourceProjectDescription.length === 0 &&
    input.targetProjectDescription.length === 0;

const sendContentToParent = () => {
    const relations: ProjectsRelation[] = [];

    inputs.value.forEach(input => {
        if (isEmptyRow(input)) {
            return;
        }

        relations.push({
            id: input.id,
            sourceProjectDescription: input.sourceProjectDescription,
            targetProjectDescription: input.targetProjectDescription,
            relationType: input.relationType,
            dateFrom: input.dateFrom,
            dateTo: input.dateTo,
            targetProjectId: input.targetProjectId
        });
    });

    emit("setInput", relations);
};

defineExpose({
    clearInput
});
</script>
