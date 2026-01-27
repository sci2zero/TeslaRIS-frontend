<template>
    <strong v-if="!researchAreas || researchAreas.length === 0">{{ $t("notYetSetMessage") }}</strong>
    <ul class="tree">
        <draggable
            :list="researchAreas" group="researchAreaHierarchy" item-key="id" :disabled="!inComparator"
            @change="onDropCallback">
            <tree-hierarchy-recursive
                :preset-research-area="researchAreaTree"
            />
        </draggable>
    </ul>
</template>


<script lang="ts">
import { ref, type PropType, watch, onMounted } from 'vue';
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

        onMounted(() => {
            if(props.researchAreas) {
                researchAreaTree.value = buildTree(props.researchAreas);
            }
        });

        watch(() => props.researchAreas, () => {
            if(props.researchAreas) {
                researchAreaTree.value = buildTree(props.researchAreas);
            }
        });

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


        const onDropCallback = (event: any) => {
            if (event.added && props.researchAreas) {
                researchAreaTree.value = buildTree([...props.researchAreas, event.added.element])
            } else if (event.removed && props.researchAreas) {
                const tree = [...props.researchAreas]
                researchAreaTree.value = buildTree(tree.filter(node => node.id != event.removed.id))
            }

            emit("dragged", event);
        };

        return {onDropCallback, researchAreaTree};
    },
})
</script>


<style>
.tree{
    --spacing : 1.8rem;
    --radius  : 10px;
    margin-top: 16px;
    margin-left: 32px;
}


.tree li{
    display      : block;
    position     : relative;
    padding-left : calc(2 * var(--spacing) - var(--radius) - 2px);
    line-height  : normal;
    border-left  : 2px solid #ddd;
}

.tree li h4 {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 10px;
}

.tree li p::before {
    content: '';
    display      : block;
    position     : absolute;
    top          : -5px;
    left         : -20.7px;
    width        : calc(var(--spacing) + 2px);
    height       : 100%;
    border       : solid #ddd;
    border-width : 0 0 0 2px;
}

.tree ul{
    margin-left  : calc(var(--radius) - var(--spacing));
    padding-left : 0;
}


.tree ul li:last-child {
    border-color: #ddd; /* Ensure the line continues even for the last child */
}

.tree ul li.item::before{
    content      : '';
    display      : block;
    position     : absolute;
    top          : calc(var(--spacing) / -1.7);
    left         : -2px;
    width        : calc(var(--spacing) + 2px);
    height       : calc(var(--spacing) + 5px);
    border       : solid #ddd;
    border-width : 0 0 2px 2px;
}

.tree ul li.container::before{
    content      : '';
    display      : block;
    position     : absolute;
    top          : calc(var(--spacing) / -2);
    left         : -2px;
    width        : calc(var(--spacing) + 2px);
    height       : calc(var(--spacing) + 1px);
    border-left: 0;
}


.tree summary{
    display : block;
}

.tree summary:focus-visible{
    outline : 1px dotted #000;
}

.tree li.item::after,
.tree summary::before{
    content       : '';
    display       : block;
    position      : absolute;
    top           : calc(var(--spacing) / 2 - var(--radius));
    left          : calc(var(--spacing) - var(--radius) - 1px);
    width         : calc(2 * var(--radius));
    height        : calc(2 * var(--radius));
    border-radius : 50%;
    background    : #ddd;
}

.tree summary::before{
    z-index    : 1;
    background : #696 url('expand-collapse.svg') 0 0;
}

.tree details[open] > summary::before{
    background-position : calc(-2 * var(--radius)) 0;
}

</style>