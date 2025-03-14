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
                                <div class="citation-container">
                                    <div ref="citations" class="citation" @click="selectText">
                                        {{ value }}
                                    </div>
                                </div>
                            </template>
                            <template #subtitle>
                                <v-btn
                                    class="ml-5 copy-btn" icon size="x-small" variant="plain"
                                    @click="copyToClipboard(value)">
                                    <v-icon>mdi-content-copy</v-icon>
                                </v-btn>
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

        const selectText = (event: Event) => {
            const target = event.currentTarget as HTMLElement;
            if (!target) return;

            const range = document.createRange();
            range.selectNodeContents(target);

            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text);
        };

        return {
            dialog,
            citation,
            fetchCitations,
            copyToClipboard,
            selectText
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
    cursor: pointer;
    user-select: text;
}

.citation-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  opacity: 0.5; /* Makes the button translucent */
  transition: opacity 0.2s ease-in-out;
}

.copy-btn:hover {
  opacity: 1; /* Fully visible on hover */
}

</style>
