<template>
    <entity-details-sheet
        :model-value="modelValue"
        :title="title"
        :to="to"
        @update:model-value="$emit('update:modelValue', $event)">
        <template #icon>
            <organisation-unit-avatar v-if="organisation" :organisation-unit-id="organisationUnitId" />
            <span v-else class="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <v-icon :icon="icon" />
            </span>
        </template>
        <div class="entity-details-grid">
            <entity-detail-field v-for="field in fields" :key="field.label" :label="field.label">
                <localized-link v-if="field.to" :to="field.to">
                    {{ field.value }}
                </localized-link>
                <p v-else class="whitespace-pre-line">
                    {{ displayTextOrPlaceholder(field.value) }}
                </p>
            </entity-detail-field>
        </div>
    </entity-details-sheet>
</template>

<script setup lang="ts">
import EntityDetailsSheet from "@/components/core/EntityDetailsSheet.vue";
import EntityDetailField from "@/components/core/EntityDetailField.vue";
import OrganisationUnitAvatar from "@/components/organisationUnit/OrganisationUnitAvatar.vue";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
withDefaults(defineProps<{
    modelValue: boolean;
    title: string;
    to?: string;
    icon?: string;
    organisation?: boolean;
    organisationUnitId?: number;
    fields: { label: string; value?: string | null; to?: string }[];
}>(), { icon: "mdi-file-document-outline", organisation: false, to: undefined, organisationUnitId: undefined });
defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>
