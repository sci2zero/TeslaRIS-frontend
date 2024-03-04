<template>
    <!-- <pre>{{ researchAreas }}</pre> -->
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
import { defineComponent, shallowRef, ref } from 'vue'
import TreeHierarchyRecursive from './TreeHierarchyRecursive.vue';


export default defineComponent({
    components: {TreeHierarchyRecursive : () => import('@/componens/hierarchy/TreeHierarchyRecursive.vue')},
    props: {
        researchArea: {
            type: Object,
            required: true
        },
    },

    setup(props) {
        const researchAreas = ref(props.researchArea)
        const treeHierarchyRecursive = shallowRef(TreeHierarchyRecursive)

        return {treeHierarchyRecursive, researchAreas}
    },
})
</script>
