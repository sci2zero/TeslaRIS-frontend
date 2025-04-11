<template>
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
</template>

<script lang="ts">
import { type CitationResponse } from "@/models/PublicationModel";
import { type PropType } from "vue";
import { defineComponent } from "vue";


export default defineComponent({
    name: "CitationFormats",
    props: {
        citation: {
            type: Object as PropType<CitationResponse | undefined>,
            required: true
        }
    },
    setup() {
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
        };

        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text);
        };

        return {
            copyToClipboard,
            selectText
        };
    }
});
</script>

<style scoped>

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
