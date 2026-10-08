<template>
    <entity-list-card
        :to="'persons/' + item.databaseId"
        :class="isSelected ? 'bg-purple-50' : 'bg-white'"
        @preview="$emit('open')"
    >
        <div class="flex gap-2 items-start">
            <div v-if="showSelect" class="flex-shrink-0" @click.stop>
                <v-checkbox
                    :model-value="selectedPersons"
                    :value="item"
                    class="table-checkbox"
                    hide-details
                    density="compact"
                    color="primary"
                    @update:model-value="$emit('update:selectedPersons', $event ?? [])"
                />
            </div>
            <person-avatar
                class="flex-shrink-0"
                :person-id="item.databaseId"
                :name="primaryName"
                :size="40"
            />
            <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                    <localized-link :to="'persons/' + item.databaseId" class="text-gray-800 font-semibold text-sm leading-snug min-w-0 break-words">
                        {{ primaryName }}
                    </localized-link>
                    <span v-if="birthdateLabel" class="text-xs text-gray-600 flex-shrink-0 pt-0.5">
                        {{ birthdateLabel }}
                    </span>
                </div>
                <div v-if="firstEmployment" class="mt-1">
                    <v-chip
                        size="small"
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-domain"
                    >
                        {{ firstEmployment.name }}
                    </v-chip>
                    <span v-if="extraEmploymentCount > 0" class="ml-1 text-xs text-gray-500">
                        +{{ extraEmploymentCount }}
                    </span>
                </div>
                <div v-if="hasIdentifiers(item)" class="mt-1.5 flex flex-wrap gap-2" @click.stop>
                    <identifier-menu v-if="item.orcid" :identifier="item.orcid" type="orcid" />
                    <identifier-menu v-if="item.scopusAuthorId" :identifier="item.scopusAuthorId" type="scopus" />
                    <identifier-menu v-if="item.openAlexId" :identifier="item.openAlexId" type="openalex" />
                    <identifier-menu v-if="item.webOfScienceResearcherId" :identifier="item.webOfScienceResearcherId" type="webofscience" />
                </div>
            </div>
        </div>
    </entity-list-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EntityListCard from "../core/EntityListCard.vue";
import LocalizedLink from "../localization/LocalizedLink.vue";
import type { PersonIndex } from "@/models/PersonModel";
import IdentifierMenu from "../core/IdentifierMenu.vue";
import PersonAvatar from "./PersonAvatar.vue";
import { splitPersonNames, usePersonItemDisplay } from "@/composables/usePersonItemDisplay";

const props = withDefaults(defineProps<{
    item: PersonIndex;
    selectedPersons: PersonIndex[];
    showSelect?: boolean;
}>(), {
    showSelect: false
});

defineEmits<{
    open: [];
    "update:selectedPersons": [value: PersonIndex[]];
}>();

const { getEmploymentEntries, getBirthdateLabel, hasIdentifiers } = usePersonItemDisplay();

const isSelected = computed(() => props.selectedPersons.some((person) => person.id === props.item.id));

const primaryName = computed(() => splitPersonNames(props.item)[0] || props.item.name);

const birthdateLabel = computed(() => getBirthdateLabel(props.item));

const employments = computed(() => getEmploymentEntries(props.item));

const firstEmployment = computed(() => employments.value[0] || null);

const extraEmploymentCount = computed(() => Math.max(employments.value.length - 1, 0));
</script>
