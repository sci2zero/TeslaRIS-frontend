<template>
    <ul v-for="(researchArea, index) in researchAreas" :key="index">
        <li class="item">
            <h4>{{ researchArea.name[0].content }}</h4>
            <p v-if="researchArea.description[0]">
                {{ researchArea.description[0].content }}
            </p>
        </li>

        <li v-if="researchArea.children.length > 0" class="container">
            <component :is="treeHierarchyRecursive" :research-area="researchArea.children"></component>
        </li>
    </ul>
</template>


<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';


export default defineComponent({
    name: "TreeHierarchyRecursive",
    components: {TreeHierarchyRecursive : () => import('@/componens/hierarchy/TreeHierarchyRecursive.vue')},
    props: {
        presetResearchArea: {
            type: Object as PropType<any[]>,
            required: true
        },
    },
    setup(props) {
        const researchAreas = ref<any[]>(props.presetResearchArea)
        // const treeHierarchyRecursive = shallowRef(TreeHierarchyRecursive)

        return {researchAreas}
    },
})
</script>
