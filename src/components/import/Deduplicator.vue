<template>
    <v-container v-if="foundDuplicates">
        <h2 class="alert">
            {{ $t("potentialDuplicateMessage") }}
        </h2>
        <v-list lines="two">
            <v-radio-group
                v-model="selectedMatchIndex"
                class="ma-0 pa-0">
                <v-list-item
                    v-for="(potentialMatch, index) in potentialMatches"
                    :key="(potentialMatch.databaseId as number)"
                    class="d-flex flex-row justify-left"
                    :subtitle="potentialMatch.authorNames + 
                        ((potentialMatch.year && potentialMatch.year > 0) ? ` · ${potentialMatch.year}` : '')">
                    <template #title>
                        <localized-link
                            :to="getDocumentLandingPageBasePath(potentialMatch.type) + potentialMatch.databaseId"
                            open-in-new-tab>
                            {{ $i18n.locale.startsWith('sr') ? potentialMatch.titleSr : potentialMatch.titleOther }}
                        </localized-link>
                    </template>
                    <template #append>
                        <v-btn
                            class="inline-action"
                            color="primary"
                            density="compact"
                            @click="handleSelect(potentialMatch.databaseId as number, false)">
                            {{ $t("saveOldPublicationLabel") }}
                        </v-btn>
                        <v-btn
                            :disabled="!canPerformOverwrite"
                            class="inline-action"
                            color="primary"
                            density="compact"
                            @click="handleSelect(potentialMatch.databaseId as number, true)">
                            {{ $t("overwriteOldPublicationLabel") }}
                        </v-btn>
                        <v-radio
                            :disabled="!canPerformOverwrite"
                            :value="index"
                            class="mr-2"
                            :label="$t('showMetadataLabel')"
                        />
                    </template>
                </v-list-item>
            </v-radio-group>
        </v-list>
    </v-container>
</template>

<script lang="ts">
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import type { PropType } from "vue";
import { computed, defineComponent } from "vue";
import type { JournalPublicationLoad, ProceedingsPublicationLoad } from "@/models/LoadModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { watch } from "vue";
import { ref } from "vue";
import ImportService from "@/services/importer/ImportService";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";
import { getDocumentLandingPageBasePath } from "@/utils/PathResolutionUtil";
import LocalizedLink from "../localization/LocalizedLink.vue";


export default defineComponent({
    name: "ImportDeduplicator",
    components: { LocalizedLink },
    props: {
        publicationForLoading: {
            type: Object as PropType<JournalPublicationLoad | ProceedingsPublicationLoad | undefined>,
            required: true
        },
        canPerformOverwrite: {
            type: Boolean,
            required: true
        }
    },
    emits: ["deduplicate", "foundMatches", "matchSelected"],
    setup(props, { emit }) {
        const parameters = ref("");
        const potentialMatches = ref<DocumentPublicationIndex[]>([]);

        const selectedMatchIndex = ref(0);

        const foundDuplicates = computed(() => potentialMatches.value && potentialMatches.value.length > 0);

        watch(() => props.publicationForLoading, () => {
            if (props.publicationForLoading) {
                parameters.value = "";
                props.publicationForLoading.title.forEach(title => {
                    parameters.value += `titles=${encodeURIComponent(title.content.replaceAll(",", "%2c").trim())}&`;
                });

                parameters.value += 
                    `doi=${props.publicationForLoading.doi}&scopusId=${props.publicationForLoading.scopusId}&openAlexId=${props.publicationForLoading.openAlexId}&webOfScienceId=${props.publicationForLoading.webOfScienceId}`;
                
                props.publicationForLoading.internalIdentifiers.forEach(identifier => {
                    parameters.value += `&internalIdentifiers=${identifier}`;
                });
                
                fetchPotentialMatches();
            }
        });

        const fetchPotentialMatches = () => {
            ImportService.searchForDuplicates(parameters.value).then(response => {
                potentialMatches.value = response.data.content;
                emit("foundMatches", potentialMatches.value.map(document => document.databaseId));
            });
        };

        const handleSelect = (oldPublicationId: number, deleteOldDocument: boolean) => {
            emit("deduplicate", oldPublicationId, deleteOldDocument);
        };

        watch(selectedMatchIndex, () => {
            emit("matchSelected", selectedMatchIndex.value)
        });

        return { 
            returnCurrentLocaleContent, handleSelect,
            potentialMatches, displayTextOrPlaceholder,
            foundDuplicates, getDocumentLandingPageBasePath,
            selectedMatchIndex
        };
    },
});
</script>

<style scope>

    .alert {
        color: red;
    }

</style>
