<template>
    <tr class="handle">
        <td v-if="showSelect" class="checkbox-column px-2!">
            <v-checkbox
                :model-value="selectedPersons"
                :value="item"
                class="table-checkbox"
                hide-details
                color="primary"
                @update:model-value="$emit('update:selectedPersons', $event)"
            />
        </td>
        <td class="py-2!">
            <div class="person-info">
                <div class="person-name-section">
                    <localized-link :to="'persons/' + item.databaseId" class="person-name">
                        <person-avatar
                            :person-id="item.databaseId"
                            :name="names[0] || item.name"
                            :size="40"
                        />
                    </localized-link>
                    <div class="flex items-center gap-2">
                        <div class="flex flex-col items-start text-center">
                            <div class="flex flex-wrap justify-left gap-x-1">
                                <span v-for="(nameVariant, index) in displayedNames" :key="nameVariant" class="whitespace-nowrap">
                                    <localized-link :to="'persons/' + item.databaseId" class="person-name">
                                        {{ nameVariant }}
                                    </localized-link>
                                    <span v-if="(index + 1 < displayedNames.length) || item.birthdate">, </span>
                                </span>
                                <span v-if="item.birthdate" class="person-year">{{ getBirthdateLabel(item) }}</span>
                            </div>
                            <v-btn
                                v-if="names.length > 1"
                                variant="text"
                                size="x-small"
                                color="primary"
                                :class="item.birthdate ? 'ml-[-0.5rem]' : 'ml-[-0.35rem]'"
                                @click="expanded = !expanded"
                            >
                                {{ moreText }}
                            </v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </td>
        <td class="py-4">
            <person-employment-list :item="item" />
        </td>
        <td class="py-4">
            <div v-if="hasIdentifiers(item)" class="identifiers-cell">
                <div class="flex flex-wrap gap-2">
                    <identifier-menu v-if="item.orcid" :identifier="item.orcid" type="orcid"></identifier-menu>
                    <identifier-menu v-if="item.scopusAuthorId" :identifier="item.scopusAuthorId" type="scopus"></identifier-menu>
                    <identifier-menu v-if="item.openAlexId" :identifier="item.openAlexId" type="openalex"></identifier-menu>
                    <identifier-menu v-if="item.webOfScienceResearcherId" :identifier="item.webOfScienceResearcherId" type="webofscience"></identifier-menu>
                </div>
            </div>
            <div v-else class="no-identifiers">
                <v-icon size="16" color="grey-lighten-1" class="mr-2">
                    mdi-identifier
                </v-icon>
                <span class="text-body-2 text-grey">{{ displayTextOrPlaceholder(item.orcid) }}</span>
            </div>
        </td>
    </tr>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { PersonIndex } from "@/models/PersonModel";
import LocalizedLink from "../localization/LocalizedLink.vue";
import IdentifierMenu from "../core/IdentifierMenu.vue";
import PersonEmploymentList from "./PersonEmploymentList.vue";
import PersonAvatar from "./PersonAvatar.vue";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { splitPersonNames, usePersonItemDisplay } from "@/composables/usePersonItemDisplay";

const props = defineProps<{
    item: PersonIndex;
    selectedPersons: PersonIndex[];
    showSelect?: boolean;
}>();

defineEmits<{
    "update:selectedPersons": [value: PersonIndex[]];
}>();

const i18n = useI18n();
const expanded = ref(false);
const { getBirthdateLabel, hasIdentifiers } = usePersonItemDisplay();

const names = computed(() => splitPersonNames(props.item));

const displayedNames = computed(() => {
    if (expanded.value || names.value.length <= 1) {
        return names.value;
    }

    return names.value.slice(0, 1);
});

const moreText = computed(() => {
    if (expanded.value) {
        return i18n.t("showLessLabel");
    }

    return i18n.t("showMoreNameVariantsLabel", { count: names.value.length - 1 });
});
</script>

<style scoped>
.checkbox-column {
    padding-left: 12px;
    padding-right: 12px;
    width: 48px;
}

.person-info {
    display: flex;
    flex-direction: column;
}

.person-name-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.person-name {
    font-weight: 600;
    color: #424242;
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.person-name:hover {
    color: #1976d2;
    text-decoration: underline;
}

.person-year {
    font-size: 0.85rem;
    color: #666;
    font-weight: 400;
    margin-top: 0.15rem;
}

.identifiers-cell {
    display: flex;
    align-items: center;
}

.no-identifiers {
    display: flex;
    align-items: center;
    color: #999;
}
</style>
