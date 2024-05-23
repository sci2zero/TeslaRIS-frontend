<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="600px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon variant="outlined"
                        color="grey-lighten" v-bind="scope.props" style="margin-bottom: 20px;"
                        :disabled="readOnly" size="small" v-on="scope.isActive">
                        <v-icon size="x-large" icon="mdi-file-edit-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("updateKeywordsLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-treeview
                        v-model:selected="selectedResearchAreas"
                        :items="researchAreasSelectable"
                        selection-type="leaf"
                        item-title="title"
                        item-value="id"
                        selected-color="indigo"
                        open-on-click
                        open-all
                        selectable
                    ></v-treeview>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" @click="submitSelection">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { ResearchArea } from "@/models/OrganisationUnitModel";
import ResearchAreaService from "@/services/ResearchAreaService";
import { returnCurrentLocaleContent } from "@/i18n/TranslationUtil";
import { watch } from "vue";


export default defineComponent({
    name: "ResearchAreaUpdateModal",
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        researchAreasHierarchy: {
            type: Object as PropType<ResearchArea[] | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const dialog = ref(false);

        const selectedResearchAreas = ref<number[]>([]);
        const researchAreasSelectable = ref<any>([]);

        onMounted(() => {
            ResearchAreaService.readAllResearchAreas().then((response) => {
                response.data.forEach((researchAreaResponse) => {
                    researchAreasSelectable.value.push(...reorganiseParent(researchAreaResponse));
                });
            });
        });

        watch(() => props.researchAreasHierarchy, () => {
            props.researchAreasHierarchy?.forEach((researchArea) => {
                selectedResearchAreas.value.push(researchArea.id as number);
                while(researchArea.superResearchArea) {
                    selectedResearchAreas.value.push(researchArea.superResearchArea.id as number);
                    researchArea = researchArea.superResearchArea;
                }
            });
        });

        const reorganiseParent = (data: any) => {
            if (!data) {
                return [];
            }

            const nodeMap: { [key: string]: any } = {};
            const root: any[] = [];

            let current = data;
            while (current['superResearchArea']) {
                current["children"] = [];
                current["title"] = returnCurrentLocaleContent(current.name);

                if(current.name[0].content) {
                    nodeMap[current.name[0].content] = current;
                }
                current = current['superResearchArea'];
            }

            current["children"] = [];
            current["title"] = returnCurrentLocaleContent(current.name);
            nodeMap[current.name[0].content] = current;
            root.push(current);

            for (const [, value] of Object.entries(nodeMap)) {
                if (!value.children) {
                    value.children = [];
                }

                if (value['superResearchArea']) {
                    const parent = nodeMap[value['superResearchArea'].name[0].content];
                    parent.children.push(value);
                }
            }
            return root;
        };

        const findDeepestNodes = (ids: number[]): number[] => {
            const idSet = new Set(ids);
            const result = new Set();

            function traverse(node: any, currentPath: any) {
                if (!node.children || node.children.length === 0) {
                    if (idSet.has(node.id)) {
                        result.add(node.id);
                    }
                    return;
                }

                const isCurrentNodeInIds = idSet.has(node.id);
                let foundChildInIds = false;

                for (const child of node.children) {
                    traverse(child, currentPath.concat(node.id));
                    if (idSet.has(child.id)) {
                        foundChildInIds = true;
                    }
                }

                if (isCurrentNodeInIds && !foundChildInIds) {
                    result.add(node.id);
                }
            }

            for (const item of researchAreasSelectable.value) {
                traverse(item, []);
            }

            return Array.from(result) as number[];
        }

        const emitToParent = (researchAreaIds: number[]) => {
            emit("update", researchAreaIds)
            dialog.value = false;
        }

        const submitSelection = () => {
            emitToParent(findDeepestNodes(selectedResearchAreas.value));
        };

        return {dialog, researchAreasSelectable,
            selectedResearchAreas, emitToParent,
            submitSelection};
    }
});
</script>

<style scoped>
.edit-pen-container .edit-pen {
    top: 0px;
    right: 0px;
    position: absolute;
    z-index: 10;
    opacity: 0;
}

.edit-pen-container:hover .edit-pen {
    opacity: 0.3;
}

.edit-pen-container .edit-pen:hover {
    opacity: 1;
}

.vue3-treeselect__menu-container {
width : 500px !important;
}
</style>
