<template>
    <div class="actions-box pa-4">
        <div class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t("additionalActionsLabel") }}
        </div>

        <v-row dense>
            <v-col cols="12" sm="6" class="action-section">
                <citation-selector
                    ref="citationRef"
                    :document-id="documentId">
                </citation-selector>
            </v-col>
            <v-col cols="12" sm="6" class="action-section">
                <publication-badge-section
                    class="move-up"
                    :preloaded-doi="doi"
                    :document-id="documentId"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import CitationSelector from '@/components/publication/CitationSelector.vue';
import PublicationBadgeSection from '@/components/publication/PublicationBadgeSection.vue';


export default defineComponent({
    name: "DocumentActionBox",
    components: { CitationSelector, PublicationBadgeSection },
    props: {
        documentId: {
            type: Number,
            required: true
        },
        doi: {
            type: Object as PropType<string | undefined>,
            required: true
        }
    },
    setup() {
        const citationRef = ref<typeof CitationSelector>();

        const fetchCitations = () => {
            citationRef.value?.fetchCitations();
        };

        return {
            fetchCitations
        };
}})

</script>
