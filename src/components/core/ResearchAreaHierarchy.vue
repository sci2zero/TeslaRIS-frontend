<template>
    <strong v-if="!researchAreas || researchAreas.length === 0">{{ $t("notYetSetMessage") }}</strong>
    <div class="research-area-tree">
        <draggable
            tag="ul" :list="researchAreas" group="researchAreaHierarchy" item-key="id"
            :disabled="!inComparator"
            @change="onDropCallback">
            <tree-hierarchy-recursive
                :preset-node-data="researchAreaTree"
            />
        </draggable>
    </div>
</template>


<script lang="ts">
import { ref, type PropType, watch } from 'vue';
import { defineComponent } from 'vue'
import TreeHierarchyRecursive from '../hierarchy/TreeHierarchyRecursive.vue';
import type { ResearchArea } from '@/models/OrganisationUnitModel';
import { VueDraggableNext } from 'vue-draggable-next';

export default defineComponent({
    name: 'ResearchAreaHierarchy',
    components: { TreeHierarchyRecursive, draggable: VueDraggableNext },
    props: {
        researchAreas: {
            type: Object as PropType<ResearchArea[] | undefined>,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        }
    },
    emits: ["dragged"],
    setup(props, {emit}) {
        const researchAreaTree = ref<any[]>([]);

        const buildTree = (data: any[]) => {
            const nodeMap: { [key: number]: any } = {};
            const roots: any[] = [];

            const getNode = (node: any) => {
                if (!nodeMap[node.id]) {
                nodeMap[node.id] = {
                    id: node.id,
                    name: node.name,
                    description: node.description,
                    children: [],
                };
                }
                return nodeMap[node.id];
            };

            for (const item of data) {
                let currentNode = getNode(item);

                let currentSuperResearchArea = item.superResearchArea;
                while (currentSuperResearchArea) {
                const parentNode = getNode(currentSuperResearchArea);

                if (!parentNode.children.some((child: any) => child.id === currentNode.id)) {
                    parentNode.children.push(currentNode);
                }

                currentNode = parentNode;
                currentSuperResearchArea = currentSuperResearchArea.superResearchArea;
                }

                if (!roots.some((root) => root.id === currentNode.id)) {
                roots.push(currentNode);
                }
            }

            return roots;
        };


        watch(() => props.researchAreas, (researchAreas) => {
            researchAreaTree.value = buildTree(researchAreas ?? []);
        }, { immediate: true, deep: true });

        const onDropCallback = (event: any) => {
            emit("dragged", event);
        };

        return {onDropCallback, researchAreaTree};
    },
})
</script>


<style scoped>
.research-area-tree {
    min-width: 0;
    overflow-x: auto;
}

.research-area-tree > :deep(ul) {
    margin: 0;
    padding: 0;
    list-style: none;
}
</style>
