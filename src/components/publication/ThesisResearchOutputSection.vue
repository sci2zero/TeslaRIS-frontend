<template>
    <div class="mt-4">
        <landing-section-card
            :title="$t('researchOutputLabel')"
            :count="totalPublications"
            icon="mdi-book-open-page-variant"
            icon-class="bg-indigo-50 text-indigo-600">
            <template v-if="canEdit" #action>
                <generic-crud-modal
                    :form-component="ThesisResearchOutputForm"
                    :form-props="{ thesisId: thesisId, researcherId: researcherId }"
                    entity-name="ResearchOutput"
                    is-update
                    wide
                    @update="fetchResearchOutput"
                    @update-persist="fetchResearchOutput">
                    <template #activator="{ props: activatorProps }">
                        <v-btn
                            v-bind="activatorProps"
                            variant="outlined"
                            size="small"
                            class="text-none"
                            prepend-icon="mdi-plus">
                            {{ $t("updateResearchOutputLabel") }}
                        </v-btn>
                    </template>
                </generic-crud-modal>
            </template>

            <div class="px-4 py-4">
                <publication-table-component
                    ref="tableRef"
                    embedded
                    :publications="publications"
                    :total-publications="totalPublications"
                    shows-research-outputs
                    allow-selection
                    :can-remove-research-outputs="canEdit"
                    @remove-research-outputs="removeSelectedOutputs"
                    @switch-page="switchPage"
                />
            </div>
        </landing-section-card>
    </div>
</template>

<script lang="ts">
import { type PropType, ref, watch } from "vue";
import { defineComponent } from "vue";
import PublicationTableComponent from "./PublicationTableComponent.vue";
import { type DocumentPublicationIndex } from "@/models/PublicationModel";
import ThesisResearchOutputService from "@/services/ThesisResearchOutputService";
import GenericCrudModal from "../core/GenericCrudModal.vue";
import ThesisResearchOutputForm from "./ThesisResearchOutputForm.vue";
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";


export default defineComponent({
    name: "ThesisResearchOutputSection",
    components: { PublicationTableComponent, GenericCrudModal, LandingSectionCard },
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
