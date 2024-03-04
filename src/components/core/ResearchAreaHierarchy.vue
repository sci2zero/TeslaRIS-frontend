<template>
    <ul class="tree">
        <tree-hierarchy-recursive :research-area="researchAreaDataRoots"></tree-hierarchy-recursive>
    </ul>
</template>


<script lang="ts">
import { ref } from 'vue';
import { defineComponent, computed } from 'vue'
import TreeHierarchyRecursive from '../hierarchy/TreeHierarchyRecursive.vue';

export default defineComponent({
    name: 'ResearchAreaHierarchy',
    components: {TreeHierarchyRecursive},
    props: {
      
        researchArea: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const researchAreaData = ref(props.researchArea)
        const researchAreaDataRoots = ref([])


        const reorganiseParent = (data) => {
            const nodeMap = {}
            const root = []
            data.forEach(element => {
                let current = element

                while (current['superResearchArea']) {
                    nodeMap[current.id] = current

                    current = current['superResearchArea']

                }
                
                nodeMap[current.id] = current
                root.push(current)
                

            });

            for (const [key, value] of Object.entries(nodeMap)) {
                if (value.children == undefined)  value.children = []

                if (value['superResearchArea']) {
                    if (value['superResearchArea'].children == undefined)  value['superResearchArea'].children = []

                    value['superResearchArea'].children.push(value)
                    value['superResearchArea'] = undefined
                }
            }

            console.log(root)
            return root

        }

        researchAreaDataRoots.value = reorganiseParent(researchAreaData.value)


        return {researchAreaDataRoots}
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