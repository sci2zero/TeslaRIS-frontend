<template>
    <v-row class="mt-5">
        <v-col>
            <generic-crud-modal
                :form-component="ThesisResearchOutputForm"
                :form-props="{ thesisId: thesisId, researcherId: researcherId }"
                entity-name="ResearchOutput"
                is-update
                wide
                :read-only="!canEdit"
                @update="fetchResearchOutput"
                @update-persist="fetchResearchOutput"
            />
        </v-col>
    </v-row>
    <h2>{{ $t("researchOutputLabel") }}</h2>
    <v-row>
        <v-col>
            <publication-table-component
                ref="tableRef"
                :publications="publications"
                :total-publications="totalPublications"
                shows-research-outputs
                allow-selection
                :can-remove-research-outputs="canEdit"
                @remove-research-outputs="removeSelectedOutputs"
                @switch-page="switchPage">
            </publication-table-component>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { type PropType, ref, watch } from "vue";
import { defineComponent } from "vue";
import PublicationTableComponent from "./PublicationTableComponent.vue";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";
import ThesisResearchOutputService from "@/services/ThesisResearchOutputService";
import GenericCrudModal from "../core/GenericCrudModal.vue";
import ThesisResearchOutputForm from "./ThesisResearchOutputForm.vue";


export default defineComponent({
    name: "ThesisResearchOutputSection",
    components: { PublicationTableComponent, GenericCrudModal },
    props: {
        thesisId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        researcherId: {
            type: Object as PropType<number | undefined>,
            required: true
        },
        canEdit: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const tableRef = ref<typeof PublicationTableComponent>();

        const publications = ref<DocumentPublicationIndex[]>([]);
        const totalPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        watch(() => props.thesisId, () => {
            fetchResearchOutput();
        });

        const fetchResearchOutput = () => {
            if (!props.thesisId) {
                return;
            }

            ThesisResearchOutputService.getThesisResearchOutput(
                props.thesisId,
                `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`
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
            fetchResearchOutput();
        };

        const removeSelectedOutputs = (researchOutputIds: number[]) => {
            Promise.all(researchOutputIds.map(researchOutputId => 
                ThesisResearchOutputService.removeThesisResearchOutput(props.thesisId as number, researchOutputId)
            )).then(() => {
                tableRef.value?.selectedPublications.splice(0);
                fetchResearchOutput();
            });
        };

        return {
            publications,
            totalPublications,
            switchPage, tableRef,
            fetchResearchOutput,
            ThesisResearchOutputForm,
            removeSelectedOutputs
        };
    },
});
</script>
