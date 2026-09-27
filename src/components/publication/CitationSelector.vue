<template>
    <div :class="{ 'contents': hideActivator }">
        <v-dialog
            v-model="dialog"
            max-width="640"
            @keydown.esc="dialog = false"
        >
            <template v-if="!hideActivator" #activator="{ props: activatorProps }">
                <UiButton
                    variant="outline"
                    size="md"
                    class="w-full sm:w-auto"
                    v-bind="activatorProps"
                >
                    <span class="mdi mdi-format-quote-close" aria-hidden="true"></span>
                    {{ $t("citePublicationLabel") }}
                </UiButton>
            </template>

            <div class="bg-slate-100 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <span class="mdi mdi-format-quote-close text-xl" aria-hidden="true"></span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h2 class="citation-title text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                            {{ $t("citePublicationLabel") }}
                        </h2>
                        <p class="mt-1 text-sm text-slate-500">
                            {{ $t("citePublicationHintLabel") }}
                        </p>
                    </div>
                    <UiButton
                        variant="ghost"
                        size="icon-sm"
                        class="shrink-0 -mt-0.5"
                        :aria-label="$t('closeLabel')"
                        @click="dialog = false"
                    >
                        <span class="mdi mdi-close text-lg" aria-hidden="true"></span>
                    </UiButton>
                </div>

                <div class="px-5 py-4 max-h-[min(70vh,36rem)] overflow-y-auto">
                    <citation-formats :citation="citation" />
                </div>

                <div class="px-5 py-4 border-t border-slate-100 flex justify-end">
                    <UiButton
                        variant="outline"
                        size="sm"
                        @click="dialog = false"
                    >
                        {{ $t("closeLabel") }}
                    </UiButton>
                </div>
            </div>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { CitationResponse } from "@/models/PublicationModel";
import DocumentPublicationService from "@/services/DocumentPublicationService";
import CitationFormats from "./CitationFormats.vue";
import { UiButton } from "@/components/ui/button";

defineOptions({
    name: "CitationSelector",
});

const props = withDefaults(defineProps<{
    documentId: number;
    hideActivator?: boolean;
}>(), {
    hideActivator: false,
});

const dialog = ref(false);
const citation = ref<CitationResponse>();

const fetchCitations = () => {
    DocumentPublicationService.fetchCitations(props.documentId)
        .then((response) => {
            citation.value = response.data;
        })
        .catch(() => {
            citation.value = {
                apa: "",
                mla: "",
                chicago: "",
                harvard: "",
                vancouver: "",
            };
        });
};

watch(() => props.documentId, fetchCitations, { immediate: true });

watch(dialog, (isOpen) => {
    if (isOpen && !citation.value) {
        fetchCitations();
    }
});

defineExpose({
    dialog,
    fetchCitations,
});
</script>

<style scoped>
.citation-title {
    font-family: "Georgia", "Times New Roman", serif;
}
</style>
