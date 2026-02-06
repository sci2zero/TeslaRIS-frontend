<template>
    <div class="mb-3">
        <strong>{{ $t("noteLabel") }}: </strong>
        <p>
            {{ $t("publicationInfoTextBeforeLink") }} 
            <localized-link :to="`scientific-results/thesis/submit-thesis?researcherId=${researcherId}`">
                <a href="#" class="clickable-link">{{ $t("addPublicationLabel") }}</a>
            </localized-link>
            {{ $t("publicationInfoTextAfterLink") }}
        </p>
    </div>
    <v-row>
        <v-col cols="12">
            <publication-table-component
                ref="tableRef"
                :publications="personPublications"
                :total-publications="totalPersonPublications"
                shows-research-outputs
                allow-selection
                limit-one-selection
                @switch-page="switchPage">
            </publication-table-component>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { ref } from 'vue';
import PublicationTableComponent from './PublicationTableComponent.vue';
import { PublicationType, type DocumentPublicationIndex } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { computed } from 'vue';


export default defineComponent({
    name: "ThesisResearchOutputForm",
    components: { PublicationTableComponent, LocalizedLink },
    props: {
        thesisId: {
            type: Number,
            required: true
        },
        existingSubstitutionId: {
            type: Number,
            default: undefined
        },
        researcherId: {
            type: Number,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = computed(() => tableRef.value!.selectedPublications.length === 1);

        const tableRef = ref<typeof PublicationTableComponent>();
        const personPublications = ref<DocumentPublicationIndex[]>([]);
        const totalPersonPublications = ref<number>(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        watch(() => props.researcherId, () => {
            fetchPersonPublications();
        })

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            fetchPersonPublications();
        };

        const fetchPersonPublications = () => {
            if (!props.researcherId) {
                return;
            }

            DocumentPublicationService.findResearcherPublications(
                props.researcherId as number,
                [PublicationType.THESIS],
                `page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}&ignore=${props.thesisId}${props.existingSubstitutionId ? ("&ignore=" + props.existingSubstitutionId) : ""}`
            ).then((publicationResponse) => {
                personPublications.value = publicationResponse.data.content;
                totalPersonPublications.value = publicationResponse.data.totalElements
            });
        };

        const submit = () => {
            const selectedResearchOutput = tableRef.value!.selectedPublications;
            
            if (!selectedResearchOutput || selectedResearchOutput.length === 0) {
                return;
            }

            DocumentPublicationService.substituteThesis(props.thesisId, selectedResearchOutput[0].databaseId).then(() => {
                emit("update");
            });  
        };

        return {
            submit, personPublications,
            totalPersonPublications,
            tableRef, switchPage,
            isFormValid
        };
    }
});
</script>
