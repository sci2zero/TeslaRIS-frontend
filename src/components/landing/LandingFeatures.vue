<template>
    <div class="bg-gray-100 p-4 md:p-6 lg:p-8 relative overflow-hidden flex flex-col">
        <plugin-override name="home.topCited" :fallback="TopCitedFeatures" />
        <div class="container mx-auto px-4 pb-16">
            <AdditionalInfoSection />
        </div>
    </div>
</template>

<script lang="ts" setup>
import AdditionalInfoSection from "./AdditionalInfoSection.vue";
import PluginOverride from "@/plugin-system/PluginOverride.vue";
import TopCitedFeatures from "./TopCitedFeatures.vue";
</script>
