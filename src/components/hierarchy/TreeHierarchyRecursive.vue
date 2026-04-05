<template>
    <ul v-for="(node, index) in nodeData" :key="index">
        <li class="item">
            <h4>{{ returnCurrentLocaleContent(node.name) }}</h4>
            <p>
                {{ returnCurrentLocaleContent(node.description) }}
            </p>
        </li>

        <li>
            <tree-hierarchy-recursive
                :preset-node-data="node.children"
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
        presetNodeData: {
            type: Object as PropType<any[]>,
            required: true
        },
    },
    setup(props) {
        const nodeData = ref<any[]>(props.presetNodeData);

        watch(() => props.presetNodeData, () => {
            nodeData.value = props.presetNodeData;
        });

        return {
            nodeData,
            returnCurrentLocaleContent
        };
    },
})
</script>
