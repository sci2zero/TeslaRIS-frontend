<template>
    <div justify="start">
        <v-dialog v-model="dialog" persistent class="narrow">
            <template #activator="scope">
                <v-list-item
                    v-bind="scope.props"
                    class="inline-action"
                    v-on="scope.isActive">
                    <v-list-item-title>{{ $t("referenceFormatsLabel") }}</v-list-item-title>
                </v-list-item>
            </template>
            
            <v-card v-if="dialog" class="d-flex flex-column align-right pa-4">
                <v-card-title>{{ $t("referenceFormatsLabel") }}</v-card-title>
                <v-card-text class="text-right">
                    <v-tabs
                        v-model="currentTab"
                        bg-color="blue-grey-lighten-5"
                        color="deep-purple-accent-4"
                        align-tabs="center"
                    >
                        <v-tab value="citationFormats">
                            {{ $t("citationFormatsLabel") }}
                        </v-tab>
                        <v-tab value="libraryFormats">
                            {{ $t("libraryFormatsLabel") }}
                        </v-tab>
                    </v-tabs>

                    <v-tabs-window v-model="currentTab">
                        <v-tabs-window-item value="citationFormats">
                            <citation-formats :citation="citation"></citation-formats>
                        </v-tabs-window-item>
                        <v-tabs-window-item class="text-left" value="libraryFormats">
                            <h3>ETD-MS</h3>
                            <code-viewer :code-content="(libraryFormats?.etdMs as string)"></code-viewer>
                            <h3 class="mt-10">
                                Dublin Core
                            </h3>
                            <code-viewer :code-content="(libraryFormats?.dublinCore as string)"></code-viewer>
                            <h3 class="mt-10">
                                MARC21
                            </h3>
                            <code-viewer :code-content="(libraryFormats?.marc21 as string)"></code-viewer>
                        </v-tabs-window-item>
                    </v-tabs-window>
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
import { type ThesisLibraryFormatsResponse, type CitationResponse } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import { ref, watch } from "vue";
import { defineComponent } from "vue";
import CitationFormats from "./CitationFormats.vue";
import CodeViewer from "../core/CodeViewer.vue";


export default defineComponent({
    name: "PublicationReferenceFormats",
    components: { CitationFormats, CodeViewer },
    props: {
        documentId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const currentTab = ref("simpleSearch");
        const dialog = ref(false);
        const citation = ref<CitationResponse>();
        const libraryFormats = ref<ThesisLibraryFormatsResponse>();

        watch(dialog, () => {
            if (dialog.value) {
                fetchCitations();
                fetchLibraryFormats();
            }
        });

        const fetchCitations = () => {
            DocumentPublicationService.fetchCitations(props.documentId).then(response => {
                citation.value = response.data;
            });
        };

        const fetchLibraryFormats = () => {
            DocumentPublicationService.getThesisLibraryFormats(props.documentId).then(response => {
                libraryFormats.value = response.data;
            });
        };

        return {
            dialog,
            citation,
            currentTab,
            fetchCitations,
            libraryFormats
        };
    }
});
</script>

<style scoped>

.narrow {
    width: 100%;
    max-width: 750px;
}

</style>
