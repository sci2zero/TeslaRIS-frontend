<template>
    <div class="mb-8">
        <slot name="modals"></slot>

        <div class="flex flex-col lg:flex-row items-center lg:items-start w-full">
            <div class="flex-shrink-0 mb-8 lg:mb-0 lg:mr-12">
                <div class="relative">
                    <div
                        class="w-32 h-32 sm:size-48 lg:size-64 overflow-hidden shadow-2xl border-4 border-white ring-4 ring-slate-100 bg-slate-50 flex items-center justify-center"
                        :class="visualShape === 'circle' ? 'rounded-full' : 'rounded-2xl'"
                    >
                        <slot name="visual">
                            <v-icon size="x-large" class="text-slate-400">{{ icon }}</v-icon>
                        </slot>
                    </div>
                    <div
                        v-if="badge"
                        class="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border-2 border-white max-w-[80%] truncate"
                    >
                        {{ badge }}
                    </div>
                </div>
            </div>

            <div class="flex-1 min-w-0 w-full text-center lg:text-left">
                <div class="flex items-start justify-center lg:justify-start w-full gap-3 mb-3">
                    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-800 leading-tight tracking-tight min-w-0 flex-1">
                        <v-skeleton-loader
                            :loading="loading"
                            type="heading"
                            class="bg-transparent"
                        >
                            <slot name="title">{{ title }}</slot>
                        </v-skeleton-loader>
                    </h1>
                    <v-menu v-if="canEdit" location="bottom end">
                        <template #activator="{ props: menuProps }">
                            <UiButton variant="outline" size="icon" class="shrink-0 mt-1" v-bind="menuProps">
                                <span class="mdi mdi-dots-vertical text-xl"></span>
                            </UiButton>
                        </template>
                        <v-list class="min-w-64 py-2 rounded-lg border border-slate-200">
                            <slot name="edit-menu">
                                <v-list-item
                                    prepend-icon="mdi-pencil-outline"
                                    :title="editLabel"
                                    @click="$emit('edit')"
                                />
                            </slot>
                        </v-list>
                    </v-menu>
                </div>

                <p
                    v-if="subtitle"
                    class="text-lg sm:text-xl text-slate-600 mb-2"
                >
                    {{ subtitle }}
                </p>
                <p
                    v-if="entityLabel"
                    class="text-sm text-slate-500 font-medium mb-6"
                >
                    {{ entityLabel }}
                </p>

                <div v-if="$slots.affiliation" class="mb-6 lg:mb-8">
                    <slot name="affiliation"></slot>
                </div>

                <div v-if="$slots.meta" class="mb-6 flex justify-center lg:justify-start">
                    <div class="space-y-3">
                        <slot name="meta"></slot>
                    </div>
                </div>

                <slot name="status"></slot>

                <div
                    v-if="$slots.actions"
                    class="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start w-full"
                >
                    <slot name="actions"></slot>
                </div>
            </div>
        </div>

        <div v-if="entityId && entityType" class="mt-8">
            <data-quality-remarks-dialog
                :entity-type="entityType"
                :entity-id="entityId"
                prominent
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import DataQualityRemarksDialog from "@/components/core/revisions/DataQualityRemarksDialog.vue";
import { UiButton } from "@/components/ui/button";

withDefaults(defineProps<{
    title?: string;
    subtitle?: string | null;
    entityLabel?: string;
    badge?: string;
    icon?: string;
    canEdit?: boolean;
    loading?: boolean;
    editLabel?: string;
    entityType?: string;
    entityId?: number;
    visualShape?: "rounded" | "circle";
}>(), {
    title: "",
    subtitle: "",
    entityLabel: "",
    badge: "",
    icon: "mdi-file-document-outline",
    canEdit: false,
    loading: false,
    editLabel: "",
    visualShape: "rounded",
});

defineEmits<{
    edit: [];
}>();
</script>

<style scoped>
.font-serif {
    font-family: "Georgia", "Times New Roman", serif;
}
</style>
