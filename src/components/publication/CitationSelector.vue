<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent class="narrow">
            <template #activator="scope">
                <v-btn
                    color="primary"
                    density="compact" class="bottom-spacer" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ $t("citePublicationLabel") }}
                </v-btn>
            </template>
            
            <v-card class="d-flex flex-column align-right pa-4">
                <v-card-title>{{ $t("citePublicationLabel") }}</v-card-title>
                <v-card-text class="text-right">
                    <citation-formats :citation="citation"></citation-formats>
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

<script lang="ts">
import { type CitationResponse } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { onMounted, ref } from "vue";
import { defineComponent } from "vue";
import CitationFormats from "./CitationFormats.vue";


export default defineComponent({
    name: "CitationSelector",
    components: { CitationFormats },
    props: {
        documentId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const dialog = ref(false);
        const citation = ref<CitationResponse>();

        onMounted(() => {
            fetchCitations();
        });

        const fetchCitations = () => {
            DocumentPublicationService.fetchCitations(props.documentId).then(response => {
                citation.value = response.data;
            });
        };

        return {
            dialog,
            citation,
            fetchCitations
        };
    }
});
</script>

<style scoped>

.narrow {
    width: 100%;
    max-width: 650px;
}

</style>
