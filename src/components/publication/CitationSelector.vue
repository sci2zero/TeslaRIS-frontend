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
                    <v-list lines="two" class="w-100">
                        <v-list-item v-for="(value, key) in citation" :key="key">
                            <template #title>
                                <div class="citation">
                                    {{ value }}
                                </div>
                            </template>
                            <template #subtitle>
                                <strong>{{ key.toUpperCase() }}</strong>
                            </template>
                        </v-list-item>
                    </v-list>
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

export default defineComponent({
    name: "CitationSelector",
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

.citation {
    white-space: normal;
    word-wrap: break-word;
    text-align: justify;
}

</style>
