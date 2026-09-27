<template>
    <div v-if="entries.length" class="flex flex-col">
        <div
            v-for="(employment, index) in entries"
            :key="`${employment.name}-${index}`"
            class="flex items-center gap-2 py-0.5 text-sm text-gray-600"
        >
            <v-icon size="16" class="text-gray-400 flex-shrink-0">
                mdi-domain
            </v-icon>
            <localized-link
                v-if="employment.institutionId !== -1"
                :to="'organisation-units/' + employment.institutionId"
                class="text-gray-600 hover:text-primary hover:underline"
                @click.stop
            >
                {{ employment.name }}
            </localized-link>
            <span v-else>{{ employment.name }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PersonIndex } from "@/models/PersonModel";
import LocalizedLink from "../localization/LocalizedLink.vue";
import { usePersonItemDisplay } from "@/composables/usePersonItemDisplay";

const props = defineProps<{
    item: PersonIndex;
}>();

const { getEmploymentEntries } = usePersonItemDisplay();
const entries = computed(() => getEmploymentEntries(props.item));
</script>
