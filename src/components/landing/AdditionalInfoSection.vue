<template>
    <div class="mt-16">
        <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div class="bg-white rounded-xl p-6 shadow-md border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-400/20">
                <div class="flex items-center gap-3 mb-4">
                    <v-icon icon="mdi-content-duplicate" size="32" color="#8b5cf6"></v-icon>
                    <h5 class="text-lg font-semibold text-slate-800 m-0">
                        {{ $t("routeLabel.deduplication") }}
                    </h5>
                </div>
                <p class="text-slate-500 leading-relaxed m-0 text-base">
                    {{ $t("deduplicationDescriptionMessage") }}
                </p>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-md border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-400/20">
                <div class="flex items-center gap-3 mb-4">
                    <v-icon icon="mdi-chart-line" size="32" color="#ef4444"></v-icon>
                    <h5 class="text-lg font-semibold text-slate-800 m-0">
                        {{ $t("visualizationsLabel") }}
                    </h5>
                </div>
                <p class="text-slate-500 leading-relaxed m-0 text-base">
                    {{ $t("visualizationsDescriptionMessage") }}
                </p>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-md border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-400/20">
                <div class="flex items-center gap-3 mb-4">
                    <v-icon icon="mdi-database" size="32" color="#06b6d4"></v-icon>
                    <h5 class="text-lg font-semibold text-slate-800 m-0">
                        {{ $t('metadataStandardisationLabel') }}
                    </h5>
                </div>
                <p class="text-slate-500 leading-relaxed m-0 text-base">
                    {{ $t('metadataStandardisationMessage') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
// No additional logic needed for this component
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
