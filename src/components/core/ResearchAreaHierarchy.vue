<template>
    <ul v-for="researchArea in researchAreas" :key="researchArea.name[0].content" class="tree">
        <tree-hierarchy-recursive :preset-research-area="reorganiseParent(researchArea)"></tree-hierarchy-recursive>
    </ul>
</template>


<script lang="ts">
import { ref, type PropType, watch } from 'vue';
import { defineComponent } from 'vue'
import TreeHierarchyRecursive from '../hierarchy/TreeHierarchyRecursive.vue';
import type { ResearchArea } from '@/models/OrganisationUnitModel';


export default defineComponent({
    name: 'ResearchAreaHierarchy',
    components: {TreeHierarchyRecursive},
    props: {
        researchAreas: {
            type: Object as PropType<ResearchArea[] | undefined>,
            required: true
        }
    },
    setup(props) {
        const researchAreaData = ref<any>(props.researchAreas);

        watch(() => props.researchAreas, () => {
            researchAreaData.value = props.researchAreas;
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

                if(current.name[0].content) {
                    nodeMap[current.name[0].content] = current;
                }
                current = current['superResearchArea'];
            }
            current["children"] = [];
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

            console.log(root)
            return root;
        };

        return {reorganiseParent};
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
  line-height: normal;
}

.tree li h4 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 12px;
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


.tree ul li:last-child{
  border-color : transparent;
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