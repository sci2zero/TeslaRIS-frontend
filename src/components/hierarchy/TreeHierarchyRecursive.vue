<template>
    <ul v-for="(researchArea, index) in researchAreas" :key="index">
        <li class="item">
            <h4>{{ returnCurrentLocaleContent(researchArea.name) }}</h4>
            <p>
                {{ returnCurrentLocaleContent(researchArea.description) }}
            </p>
        </li>

        <li>
            <tree-hierarchy-recursive
                :preset-research-area="researchArea.children"
            />
        </li>
    </ul>
</template>


<script lang="ts">
import { watch } from 'vue';
import { defineComponent, ref, type PropType } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "TreeHierarchyRecursive",
    props: {
        presetResearchArea: {
            type: Object as PropType<any[]>,
            required: true
        },
    },
    setup(props) {
        const researchAreas = ref<any[]>(props.presetResearchArea);

        watch(() => props.presetResearchArea, () => {
            researchAreas.value = props.presetResearchArea;
        });

        return {
            researchAreas,
            returnCurrentLocaleContent
        };
    },
})
</script>
