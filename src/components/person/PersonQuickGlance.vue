<template>
    <v-bottom-sheet
        v-model="open"
        inset
    >
        <v-card v-if="item" class="rounded-t-2xl max-h-[90vh] flex flex-col">
            <div class="flex justify-center pt-2 pb-1">
                <div class="w-10 h-1 rounded-full bg-slate-300" />
            </div>
            <v-card-title class="px-4 pt-1 pb-2 flex items-start gap-2">
                <person-avatar
                    class="flex-shrink-0"
                    :person-id="item.databaseId"
                    :name="names[0]"
                    :size="48"
                />
                <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                        <div class="text-base font-semibold leading-snug text-slate-800">
                            {{ names[0] }}
                        </div>
                        <span v-if="birthdateLabel" class="text-sm text-slate-500 font-medium flex-shrink-0">
                            {{ birthdateLabel }}
                        </span>
                    </div>
                    <p v-if="names.length > 1" class="mt-1 text-xs text-slate-500">
                        {{ names.slice(1).join(", ") }}
                    </p>
                </div>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    class="flex-shrink-0"
                    @click="open = false"
                />
            </v-card-title>

            <v-card-text class="px-4 pb-4 overflow-y-auto">
                <div v-if="hasEmployment(item)" class="mb-4">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                        {{ $t("organisationUnitLabel") }}
                    </p>
                    <person-employment-list :item="item" />
                </div>

                <div v-if="hasIdentifiers(item)" class="mb-4">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
                        {{ $t("identifiersLabel") }}
                    </p>
                    <div class="flex flex-wrap gap-2">
                        <identifier-menu v-if="item.orcid" :identifier="item.orcid" type="orcid" />
                        <identifier-menu v-if="item.scopusAuthorId" :identifier="item.scopusAuthorId" type="scopus" />
                        <identifier-menu v-if="item.openAlexId" :identifier="item.openAlexId" type="openalex" />
                        <identifier-menu v-if="item.webOfScienceResearcherId" :identifier="item.webOfScienceResearcherId" type="webofscience" />
                    </div>
                </div>

                <localized-link :to="'persons/' + item.databaseId" class="block">
                    <span class="inline-flex w-full items-center justify-center gap-2 font-medium rounded-lg px-4 py-2.5 text-sm bg-slate-800 text-white shadow-md hover:bg-slate-700">
                        {{ $t("openPersonPageLabel") }}
                    </span>
                </localized-link>
            </v-card-text>
        </v-card>
    </v-bottom-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PersonIndex } from "@/models/PersonModel";
import LocalizedLink from "../localization/LocalizedLink.vue";
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

const { getBirthdateLabel, hasEmployment, hasIdentifiers } = usePersonItemDisplay();

const open = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit("update:modelValue", value)
});

const names = computed(() => props.item ? splitPersonNames(props.item) : []);

const birthdateLabel = computed(() => props.item ? getBirthdateLabel(props.item) : "");
</script>
