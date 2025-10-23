<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("publicationsLabel") + ` - ${entityName} - (${props.publicationType ? getPublicationTypeTitleFromValueAutoLocale(props.publicationType) : $t('allLabel')}, ${yearFrom}${(yearTo !== yearFrom) ? ('-' + yearTo) : ''})` }}</span>
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
                            :endpoint-type="ExportableEndpointType.VISUALIZATION_PUBLICATIONS"
                            :endpoint-token-parameters="[
                                (props.publicationType ? String(props.publicationType) : ''),
                                (props.publicationSubType ? String(props.publicationSubType) : ''),
                                String(props.yearFrom),
                                String(props.yearTo),
                                String(props.personId),
                                String(props.institutionId)
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
import { ExportableEndpointType } from '@/models/Common';
import { PublicationType, ThesisType, type DocumentPublicationIndex } from '@/models/PublicationModel';
import { type PropType, ref, watch } from 'vue';
import PublicationTableComponent from '../publication/PublicationTableComponent.vue';
import DocumentVisualizationService from '@/services/visualization/DocumentVisualizationService';
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import PersonService from '@/services/PersonService';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


const props = defineProps({
    publicationType: {
        type: Object as PropType<PublicationType>,
        required: true
    },
    publicationSubType: {
        type: Object as PropType<ThesisType | null>,
        required: true
    },
    personId: {
        type: Number,
        default: -1
    },
    institutionId: {
        type: Number,
        default: -1
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
const entityName = ref("");

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
        (props.personId > 0 || props.institutionId > 0) &&
        props.publicationType
    ) {
        setEntityname();
    }
});

const fetchPublications = () => {
    DocumentVisualizationService.getPublicationsForTypeAndPeriod(
        props.publicationType,
        props.publicationSubType,
        props.personId,
        props.institutionId,
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

const setEntityname = () => {
    if (props.personId > 0) {
        PersonService.getPersonWithUser(props.personId).then(response => {
            entityName.value = `${response.data.personName.firstname} ${response.data.personName.lastname}`;
        });
    } else if (props.institutionId) {
        OrganisationUnitService.readOU(props.institutionId).then(response => {
            entityName.value = returnCurrentLocaleContent(response.data.name) as string;
        });
    }
};

</script>
