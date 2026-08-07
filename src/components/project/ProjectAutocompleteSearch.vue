<template>
    <v-row>
        <v-col :cols="disableSubmission ? 12 : 11">
            <v-autocomplete
                v-model="selectedProject"
                :label="(label ? $t(label) : $t('projectLabel')) + (required ? '*' : '')"
                :items="readOnly ? [] : projects"
                :custom-filter="(() => true)"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                :readonly="readOnly"
                return-object
                @update:search="searchProjects($event)"
                @update:model-value="sendContentToParent"
            >
                <template #item="{ item, props: itemProps }">
                    <v-list-item v-bind="{ ...itemProps, title: undefined }">
                        {{ item.raw.listTitle }}
                        <v-chip
                            v-if="item.raw.status"
                            size="small"
                            class="ml-2"
                            :color="getProjectStatusColor(item.raw.status)"
                            variant="flat"
                        >
                            {{ getProjectStatusTitleFromValueAutoLocale(item.raw.status) }}
                        </v-chip>
                    </v-list-item>
                </template>
            </v-autocomplete>
        </v-col>
        <v-col v-if="!disableSubmission" cols="1">
            <generic-crud-modal
                ref="modalRef"
                :form-component="ProjectSubmissionForm"
                entity-name="Project"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedProject"
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import lodash from "lodash";
import { useI18n } from "vue-i18n";
import ProjectService from "@/services/project/ProjectService";
import type { Project, ProjectIndex, ProjectStatus } from "@/models/ProjectModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { getProjectStatusColor, getProjectStatusTitleFromValueAutoLocale } from "@/i18n/projectStatus";
import { useValidationUtils } from "@/utils/ValidationUtils";
import GenericCrudModal from "@/components/core/GenericCrudModal.vue";
import ProjectSubmissionForm from "@/components/project/ProjectSubmissionForm.vue";

const props = withDefaults(defineProps<{
    modelValue?: { title: string; value: number };
    label?: string;
    required?: boolean;
    readOnly?: boolean;
    disableSubmission?: boolean;
}>(), {
    modelValue: undefined,
    label: "",
    required: false,
    readOnly: false,
    disableSubmission: false
});

const emit = defineEmits<{
    (e: "update:modelValue", payload: { title: string; value: number }): void;
}>();

const i18n = useI18n();
const searchPlaceholder = { title: "", value: -1 };

const { requiredSelectionRules } = useValidationUtils();

const modalRef = ref<InstanceType<typeof GenericCrudModal> | null>(null);

type ProjectSearchItem = {
    title: string;
    listTitle: string;
    value: number;
    status?: ProjectStatus;
};

const projects = ref<ProjectSearchItem[]>([]);
const selectedProject = ref<{ title: string; value: number; }>(props.modelValue ?? { ...searchPlaceholder });

onMounted(() => {
    if (props.modelValue) {
        selectedProject.value = props.modelValue;
    }
});

const joinParts = (parts: (string | undefined)[]): string => parts.filter(part => part).join(" | ");

const searchProjects = lodash.debounce((input: string) => {
    if (input.includes("|")) {
        return;
    }

    if (input.length >= 3) {
        let params = "";
        const tokens = input.split(" ");
        tokens.forEach((token) => {
            params += `tokens=${token}&`;
        });
        params += "page=0&size=5";

        ProjectService.searchProjects(params).then((response) => {
            const listOfProjects: ProjectSearchItem[] = [];
            response.data.content.forEach((project: ProjectIndex) => {
                const isSerbian = i18n.locale.value.startsWith("sr");
                const listTitle = joinParts([
                    isSerbian ? project.nameSr : project.nameOther,
                    isSerbian ? project.coordinatorNameSr : project.coordinatorNameOther
                ]);

                listOfProjects.push({
                    title: joinParts([listTitle, project.status ? getProjectStatusTitleFromValueAutoLocale(project.status) : ""]),
                    listTitle: listTitle,
                    value: project.databaseId,
                    status: project.status
                });
            });

            if (!props.disableSubmission && !modalRef.value!.dialog) {
                listOfProjects.push({
                    title: i18n.t("notInListLabel", [input]),
                    listTitle: i18n.t("notInListLabel", [input]),
                    value: 0
                });
            }

            projects.value = listOfProjects;
        });
    }
}, 300);

watch(selectedProject, () => {
    if (selectedProject.value && selectedProject.value.value === 0) {
        modalRef.value!.dialog = true;
        selectedProject.value = { ...searchPlaceholder };
    }
});

watch(() => props.modelValue, () => {
    selectedProject.value = props.modelValue ?? { ...searchPlaceholder };
});

const sendContentToParent = () => {
    emit("update:modelValue", selectedProject.value);
};

const selectNewlyAddedProject = (project: Project) => {
    const listTitle = returnCurrentLocaleContent(project.name) as string;
    const toSelect = {
        title: joinParts([listTitle, project.status ? getProjectStatusTitleFromValueAutoLocale(project.status) : ""]),
        listTitle: listTitle,
        value: project.id as number,
        status: project.status
    };
    projects.value.push(toSelect);
    selectedProject.value = toSelect;
    sendContentToParent();
};
</script>
