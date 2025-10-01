<template>
    <force-layout-graph
        :data="{
            nodes: nodes,
            links: links
        }"
    />
</template>

<script lang="ts" setup>
import type { CollaborationLink, PersonNode } from '@/models/Common';
import CollaborationNetworkService from '@/services/visualization/CollaborationNetworkService';
import { onMounted, ref } from 'vue';
import ForceLayoutGraph from '../charts/ForceLayoutGraph.vue';


const props = defineProps({
    personId: {
        type: Number,
        required: true
    }
});


const nodes = ref<PersonNode[]>([]);
const links = ref<CollaborationLink[]>([]);

onMounted(() => {
    CollaborationNetworkService.getPersonCollaborationNetwork(
        props.personId
    ).then(response => {
        nodes.value = response.data.nodes;
        links.value = response.data.links;
    });
});

</script>