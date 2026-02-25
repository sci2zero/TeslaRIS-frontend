<template>
    <v-list lines="two" class="w-full">
        <v-list-item v-for="(value, key) in citation" :key="key">
            <template #title>
                <div class="citation-container">
                    <div
                        :ref="el => citations[key] = el"
                        class="citation"
                        @click="selectText($event)"
                    >
                        {{ value }}
                    </div>
                </div>
            </template>
            <template #subtitle>
                <v-btn
                    class="ml-5 copy-btn"
                    icon
                    size="x-small"
                    variant="plain"
                    @click="copyAndSelect(key, value)"
                >
                    <v-icon>mdi-content-copy</v-icon>
                </v-btn>
                <strong>{{ key.toUpperCase() }}</strong>
            </template>
        </v-list-item>
    </v-list>

    <toast v-model="snackbar" :message="$t('copiedLabel')" />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import type { PropType } from "vue";
import type { CitationResponse } from "@/models/PublicationModel";
import Toast from "../core/Toast.vue";


export default defineComponent({
    name: "CitationFormats",
    components: { Toast },
    props: {
        citation: {
        type: Object as PropType<CitationResponse | undefined>,
        required: true
        }
    },
    setup() {
        const snackbar = ref(false);
        const citations = ref<any | null>({});

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

        const copyAndSelect = (key: string, text: string) => {
            const el = citations.value[key];
            if (!el) return;

            const range = document.createRange();
            range.selectNodeContents(el);

            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }

            navigator.clipboard.writeText(text);
            snackbar.value = true;
        };

        return {
            citations,
            selectText,
            copyAndSelect,
            snackbar
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
        opacity: 0.5;
        transition: opacity 0.2s ease-in-out;
    }

    .copy-btn:hover {
        opacity: 1;
    }
</style>
