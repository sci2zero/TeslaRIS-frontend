<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("collaborationPublicationsLabel") + ` - ${collaborationName} - (${getCollaborationTypeTitleFromValueAutoLocale(props.collaborationType)}, ${yearFrom}-${yearTo})` }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <publication-table-component
                            ref="tableRef"
                            :publications="publications"
                            :total-publications="totalPublications"
                            shows-research-outputs
                            allow-selection
                            enable-export
                            :endpoint-type="ExportableEndpointType.COLLABORATION_PUBLICATIONS"
                            :endpoint-token-parameters="[
                                String(props.sourcePersonId),
                                String(props.targetPersonId),
                                String(props.yearFrom),
                                String(props.yearTo),
                                props.collaborationType
                            ]"
                            :endpoint-body-parameters="
                                {
                                    allowedTypes: [],
                                    institutionId: null,
                                    commissionId: null,
                                    onlyUnmanaged: null
                                }"
                            @switch-page="switchPage">
                        </publication-table-component>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ExportableEndpointType, type CollaborationType } from '@/models/Common';
import { type DocumentPublicationIndex } from '@/models/PublicationModel';
import CollaborationNetworkService from '@/services/visualization/CollaborationNetworkService';
import { type PropType, ref, watch } from 'vue';
import PublicationTableComponent from '../publication/PublicationTableComponent.vue';
import { getCollaborationTypeTitleFromValueAutoLocale } from '@/i18n/collaborationType';


const props = defineProps({
    sourcePersonId: {
        type: Number,
        required: true
    },
    targetPersonId: {
        type: Number,
        required: true
    },
    collaborationType: {
        type: Object as PropType<CollaborationType>,
        required: true
    },
    collaborationName: {
        type: String,
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


const dialog = ref(false);

defineExpose({
  dialog,
  open: () => dialog.value = true,
  close: () => dialog.value = false,
  toggle: () => dialog.value = !dialog.value
});

const publications = ref<DocumentPublicationIndex[]>([]);
const totalPublications = ref(0);
const page = ref(0);
const size = ref(5);
const sort = ref("");
const direction = ref("");

watch(dialog, () => {
    if (dialog.value &&
        props.sourcePersonId > 0 &&
        props.targetPersonId > 0 &&
        props.collaborationType) {
        fetchPublications();
    }
});

const fetchPublications = () => {
    CollaborationNetworkService.getPublicationsForCollaboration(
        props.sourcePersonId,
        props.targetPersonId,
        props.collaborationType,
        props.yearFrom,
        props.yearTo,
        `&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
    ).then(response => {
        publications.value = response.data.content;
        totalPublications.value = response.data.totalElements;
    });
};

const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
    page.value = nextPage;
    size.value = pageSize;
    sort.value = sortField;
    direction.value = sortDir;
    fetchPublications();
};

</script>
