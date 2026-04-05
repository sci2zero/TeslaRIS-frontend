<template>
    <v-treeview
        v-model:selected="selectedEmploymentPositions"
        v-model:opened="openNodes"
        :items="employmentPositions"
        select-strategy="independent"
        item-title="title"
        item-value="id"
        selected-color="indigo"
        selectable
        :load-children="onNodeOpen"
        @click:select="handleSelection"
    />
</template>

<script lang="ts">
import { onMounted, reactive, ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import EmploymentPositionService from "@/services/EmploymentPositionService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export default defineComponent({
    name: "EmploymentPositionsUpdateModal",
    props: {
        limitOne: {
            type: Boolean,
            default: false
        },
        employmentPositionsHierarchy: {
            type: Object as PropType<number[] | undefined>,
            required: true
        },
        submitOnClick: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        onMounted(async () => {
            buildInitialSelection();
        });

        const buildInitialSelection = () => {
            selectedEmploymentPositions.value = [];
            employmentPositions.splice(0);

            EmploymentPositionService.fetchChildEmploymentPositions(0).then(response => {
                response.data.forEach(employmentPositionNode => {
                    employmentPositions.push(
                        {
                            id: employmentPositionNode.id,
                            title: returnCurrentLocaleContent(employmentPositionNode.name) as string, 
                            children: []
                        }
                    );
                });

                props.employmentPositionsHierarchy?.forEach(employmentPositionId => {
                    preSelectEverything(employmentPositionId);
                });
            });
        };

        const preSelectEverything = async (nodeId: number) => {
            if (selectedEmploymentPositions.value.find(employmentPositionId => employmentPositionId === nodeId)) {
                return;
            }

            selectedEmploymentPositions.value.push(nodeId);

            const employmentPosition = await EmploymentPositionService.readEmploymentPosition(nodeId);
            if (employmentPosition.data.superEmploymentPositionId) {
                await preSelectEverything(employmentPosition.data.superEmploymentPositionId);
            }

            const childrenResponse = await EmploymentPositionService.fetchChildEmploymentPositions(nodeId);
            childrenResponse.data.forEach(employmentPositionNode => {
                const node = findNodeById(employmentPositions, nodeId);
                if (node) {
                    node.children.push({ id: employmentPositionNode.id, title: returnCurrentLocaleContent(employmentPositionNode.name) as string, children: [], superEmploymentPositionId: nodeId});
                }
            });
            
            openNodes.value.push(nodeId as number);
        };

        const findNodeById = (tree: Array<{ id: number; title: string; children: any[] }>, id: number): any => {
            for (const node of tree) {
                if (node.id === id) {
                    return node;
                }
                if (node.children && node.children.length > 0) {
                    const found = findNodeById(node.children, id);
                    if (found) return found;
                }
            }
            return null;
        };

        const unselectSubNodes = (tree: Array<{ id: number; title: string; children: any[] }>, id: number): void => {
            for (const node of tree) {
                if (node.id === id) {
                    const index = selectedEmploymentPositions.value.indexOf(node.id);
                    if (index !== -1) {
                        selectedEmploymentPositions.value.splice(index, 1);
                    }

                    if (node.children && node.children.length > 0) {
                        for (const child of node.children) {
                            unselectSubNodes(tree, child.id);
                        }
                    }
                    return;
                }

                if (node.children && node.children.length > 0) {
                    unselectSubNodes(node.children, id);
                }
            }
        };

        const openNodes = ref<number[]>([]);
        const selectedEmploymentPositions = ref<number[]>([]);
        const employmentPositions = reactive<any[]>([]);

        const onNodeOpen = async (node: any) => {
            return EmploymentPositionService.fetchChildEmploymentPositions(node.id).then(response => {
                if (response.data.length === 0) {
                    node.children = null;
                } else {
                    node.children = response.data.map(employmentPositionNode => ({
                        id: employmentPositionNode.id,
                        title: returnCurrentLocaleContent(employmentPositionNode.name) as string,
                        children: [],
                        superEmploymentPositionId: node.id
                    }));
                }
            });
        };

        const selectParentHierarchy = (node: any) => {
            const index = selectedEmploymentPositions.value.indexOf(node.id);
            if (index == -1) {
                selectedEmploymentPositions.value.push(node.id);
            }

            if (node.superEmploymentPositionId) {
                const parentNode = findNodeById(employmentPositions, node.superEmploymentPositionId);
                if (parentNode) {
                    selectParentHierarchy(parentNode);
                }
            }
        };

        const handleSelection = (event: any) => {
            if (!event.value) {
                unselectSubNodes(employmentPositions, event.id);
            } else {
                if (props.limitOne) {
                    selectedEmploymentPositions.value.splice(0);
                }

                const node = findNodeById(employmentPositions, event.id);
                if (node) {
                    selectParentHierarchy(node);
                }
            }

            if (props.submitOnClick) {
                submitSelection();
            }
        };

        const findDeepestNodes = (ids: number[]): number[] => {
            const idSet = new Set(ids);
            const result = new Set<number>();

            function traverse(node: any): boolean {
                const isInIdSet = idSet.has(node.id);

                if (!node.children || node.children.length === 0) {
                    if (isInIdSet) {
                        result.add(node.id);
                    }
                    return isInIdSet;
                }

                let foundChildInIds = false;
                for (const child of node.children) {
                    foundChildInIds = traverse(child) || foundChildInIds;
                }

                if (isInIdSet && !foundChildInIds) {
                    result.add(node.id);
                }

                return isInIdSet || foundChildInIds;
            }

            for (const item of employmentPositions) {
                traverse(item);
            }

            return Array.from(result);
        };

        const emitToParent = (employmentPositionIds: number[]) => {
            emit("update", employmentPositionIds)
        };

        const submitSelection = () => {
            emitToParent(findDeepestNodes([...new Set(selectedEmploymentPositions.value)]));
        };

        const resetForm = () => {
            buildInitialSelection();
        };

        return {
            employmentPositions, openNodes, resetForm,
            selectedEmploymentPositions, handleSelection,
            submitSelection, onNodeOpen, emitToParent
        };
    }
});
</script>

<style scoped>

.vue3-treeselect__menu-container {
    width : 500px !important;
}

</style>
