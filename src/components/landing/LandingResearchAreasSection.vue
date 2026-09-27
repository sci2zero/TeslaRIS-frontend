<template>
    <landing-section-card
        :title="$t('researchAreasLabel')"
        icon="mdi-flask-outline"
        icon-class="bg-teal-50 text-teal-700"
        padded
    >
        <template v-if="canEdit" #action>
            <research-areas-update-modal
                :research-areas-hierarchy="researchAreas"
                :limit-one="limitOne"
                @update="$emit('update', $event)"
            >
                <template #activator="{ props: activatorProps }">
                    <v-btn
                        v-bind="activatorProps"
                        variant="outlined"
                        size="small"
                        class="text-none"
                        prepend-icon="mdi-pencil-outline">
                        {{ $t("editActionLabel") }}
                    </v-btn>
                </template>
            </research-areas-update-modal>
        </template>

        <p
            v-if="!researchAreas?.length"
            class="text-sm text-slate-500">
            {{ $t("notYetSetMessage") }}
        </p>
        <research-area-hierarchy
            v-else
            :research-areas="researchAreas"
        />
    </landing-section-card>
</template>

<script setup lang="ts">
import LandingSectionCard from "@/components/landing/LandingSectionCard.vue";
import ResearchAreaHierarchy from "@/components/core/ResearchAreaHierarchy.vue";
import ResearchAreasUpdateModal from "@/components/core/ResearchAreasUpdateModal.vue";
import type { ResearchArea } from "@/models/OrganisationUnitModel";

withDefaults(defineProps<{
    researchAreas?: ResearchArea[];
    canEdit?: boolean;
    limitOne?: boolean;
}>(), {
    researchAreas: () => [],
    canEdit: false,
    limitOne: false,
});

defineEmits<{
    (e: "update", researchAreaIds: number[]): void;
}>();
</script>
