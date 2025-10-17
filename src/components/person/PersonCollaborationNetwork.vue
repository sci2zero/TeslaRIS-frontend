<template>
    <div class="d-flex flex-row justify-start select-component mt-5 ml-5">
        <v-select
            v-model="selectedCollaborationType"
            class="collaboration-type-select"
            :items="collaborationTypes"
            :label="$t('collaborationTypeLabel')"
            :rules="requiredSelectionRules"
            return-object>
        </v-select>
        <v-text-field
            v-model.number="depth"
            class="ml-2" 
            :label="$t('depthLabel')" 
            type="number" 
            :min="1"
            :max="selectedCollaborationType.value === CollaborationType.COAUTHORSHIP ? 2 : 3"
        />
    </div>
    <v-row>
        <v-col>
            <force-layout-graph
                :data="{
                    nodes: nodes,
                    links: links,
                    categories: categories
                }"
                :category-resolver="getCategoryNamesFromDepth"
                :height="`${Math.min(600 * depth, 1200)}px`"
                @list-publications="showPublicationListModal"
            />
        </v-col>
    </v-row>

    <person-collaboration-publications
        ref="publicationsViewRef"
        :source-person-id="sourcePersonId"
        :target-person-id="targetPersonId"
        :collaboration-type="collaborationType"
        :collaboration-name="collaborationName"
        :year-from="yearFrom"
        :year-to="yearTo"
    />
</template>

<script lang="ts" setup>
import { type CollaborationLink, CollaborationType, type PersonNode } from '@/models/Common';
import CollaborationNetworkService from '@/services/visualization/CollaborationNetworkService';
import { onMounted, ref, watch } from 'vue';
import ForceLayoutGraph from '../charts/ForceLayoutGraph.vue';
import { getCollaborationTypesForGivenLocale, getCollaborationTypeTitleFromValueAutoLocale } from '@/i18n/collaborationType';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { useI18n } from 'vue-i18n';
import PersonCollaborationPublications from './PersonCollaborationPublications.vue';


const props = defineProps({
    personId: {
        type: Number,
        required: true
    },
    yearFrom: {
        type: Number,
        required: true
    },
    yearTo: {
        type: Number,
        required: true
    }
});

const sourcePersonId = ref(-1);
const targetPersonId = ref(-1);
const collaborationName = ref("");
const collaborationType = ref();

const nodes = ref<PersonNode[]>([]);
const links = ref<CollaborationLink[]>([]);
const categories = ref<{name: string, value: number}[]>([]);

const collaborationTypes = ref<{title: string, value: CollaborationType}[]>(getCollaborationTypesForGivenLocale());
const selectedCollaborationType = ref<{title: string, value: CollaborationType}>(
    {
        title: getCollaborationTypeTitleFromValueAutoLocale(CollaborationType.COAUTHORSHIP) as string,
        value: CollaborationType.COAUTHORSHIP
    }
);
const depth = ref(2);

const i18n = useI18n();
const { requiredSelectionRules } = useValidationUtils();

const publicationsViewRef = ref<typeof PersonCollaborationPublications>();

const getCategoryNamesFromDepth = (depth: number) => {
    switch (depth) {
        case 0:
            return i18n.t("rootAuthorLabel");
        case 1:
            return i18n.t("level1Label");
        case 2:
            return i18n.t("level2Label");
        case 3:
            return i18n.t("level3Label");
    }

    return ""; // should never return this
};

onMounted(() => {
    fetchCollaborationNetwork();
});

watch(
    [
        selectedCollaborationType,
        depth,
        () => props.yearFrom,
        () => props.yearTo
    ], () => {
    fetchCollaborationNetwork();
});

const fetchCollaborationNetwork = () => {
    if (!props.yearFrom || !props.yearTo) {
        return;
    }

    CollaborationNetworkService.getPersonCollaborationNetwork(
        props.personId,
        selectedCollaborationType.value.value,
        depth.value,
        props.yearFrom,
        props.yearTo
    ).then(response => {
        nodes.value = response.data.nodes;
        links.value = response.data.links;
        categories.value =
            response.data.nodes.map(node => {
                return {
                    name: getCategoryNamesFromDepth(node.category),
                    value: node.category
                };
            }
        );
    });
};

const showPublicationListModal = (edge: CollaborationLink, collabName: string) => {
    if (publicationsViewRef.value) {
        sourcePersonId.value = parseInt(edge.source);
        targetPersonId.value = parseInt(edge.target);
        collaborationType.value = selectedCollaborationType.value.value;
        collaborationName.value = collabName;

        publicationsViewRef.value.toggle();
    }
};

</script>

<style>

.select-component {
    max-width: 400px;
}

.collaboration-type-select {
    min-width: 200px;
}

</style>
