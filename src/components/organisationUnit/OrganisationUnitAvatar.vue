<template>
    <span class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-indigo-600">
        <img
            v-if="organisationUnitId && organisationUnitId > 0 && !imageFailed"
            :src="`${baseUrl}file/logo/${organisationUnitId}?fullSize=false`"
            alt=""
            loading="lazy"
            class="size-full object-contain p-1"
            @error="imageFailed = true">
        <v-icon v-else icon="mdi-office-building-outline" />
    </span>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
const props = defineProps<{ organisationUnitId?: number }>();
const baseUrl = import.meta.env.VITE_BASE_URL;
const imageFailed = ref(false);
watch(() => props.organisationUnitId, () => { imageFailed.value = false; });
</script>
