<template>
    <entity-details-sheet
        v-if="item"
        v-model="open"
        :title="names[0] || item.name"
        :to="'persons/' + item.databaseId"
        :open-page-label="$t('openPersonPageLabel')"
    >
        <template #icon>
            <person-avatar :person-id="item.databaseId" :name="names[0]" :size="40" />
        </template>
        <div class="entity-details-grid">
            <entity-detail-field v-if="birthdateLabel" :label="item.displayBirthdate ? $t('birthdateLabel') : $t('birthYearLabel')">
                {{ birthdateLabel }}
            </entity-detail-field>
            <entity-detail-field v-if="names.length > 1" :label="$t('otherNamesLabel')">
                {{ names.join(', ') }}
            </entity-detail-field>
            <entity-detail-field v-if="hasEmployment(item)" :label="$t('employmentsLabel')" class="entity-details-full-width">
                <person-employment-list :item="item" />
            </entity-detail-field>
            <entity-detail-field v-for="identifier in identifiers" :key="identifier.type" :label="identifier.label">
                <div class="flex items-start gap-2">
                    <identifier-menu :identifier="identifier.value" :type="identifier.type" class="shrink-0" />
                    <span class="min-w-0">{{ identifier.value }}</span>
                </div>
            </entity-detail-field>
        </div>
    </entity-details-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PersonIndex } from "@/models/PersonModel";
import EntityDetailsSheet from "../core/EntityDetailsSheet.vue";
import EntityDetailField from "../core/EntityDetailField.vue";
import IdentifierMenu from "../core/IdentifierMenu.vue";
import PersonEmploymentList from "./PersonEmploymentList.vue";
import PersonAvatar from "./PersonAvatar.vue";
import { splitPersonNames, usePersonItemDisplay } from "@/composables/usePersonItemDisplay";

const props = defineProps<{
    modelValue: boolean;
    item: PersonIndex | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
}>();

const { getBirthdateLabel, hasEmployment } = usePersonItemDisplay();

const open = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value)
});

const names = computed(() => props.item ? splitPersonNames(props.item) : []);

const birthdateLabel = computed(() => props.item ? getBirthdateLabel(props.item) : "");
const identifiers = computed(() => props.item ? [
    { label: 'ORCID', type: 'orcid', value: props.item.orcid },
    { label: 'Scopus Author ID', type: 'scopus', value: props.item.scopusAuthorId },
    { label: 'OpenAlex ID', type: 'openalex', value: props.item.openAlexId },
    { label: 'Web of Science Researcher ID', type: 'webofscience', value: props.item.webOfScienceResearcherId }
].filter(identifier => identifier.value) : []);
</script>
