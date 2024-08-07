<template>
    <v-container v-if="potentialMatches && potentialMatches.length > 0">
        <h2 class="alert">
            {{ $t("potentialDuplicateMessage") }}
        </h2>
        <v-list lines="two">
            <v-list-item
                v-for="potentialMatch in potentialMatches"
                :key="(potentialMatch.databaseId as number)"
                class="d-flex flex-row justify-left"
                :title="$i18n.locale == 'sr' ? potentialMatch.titleSr : potentialMatch.titleOther"
                :subtitle="potentialMatch.authorNames + (potentialMatch.year ? ` · ${potentialMatch.year}` : '')"
            >
                <template #append>
                    <v-btn class="inline-action" color="primary" density="compact" @click="handleSelect">
                        {{ $t("selectLabel") }}
                    </v-btn>
                </template>
            </v-list-item>
        </v-list>
    </v-container>
</template>

<script lang="ts">
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import type { JournalPublicationLoad, ProceedingsPublicationLoad } from "@/models/LoadModel";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { watch } from "vue";
import { ref } from "vue";
import ImportService from "@/services/ImportService";
import type { DocumentPublicationIndex } from "@/models/PublicationModel";


export default defineComponent({
    name: "ImportDeduplicator",
    props: {
        publicationForLoading: {
            type: Object as PropType<JournalPublicationLoad | ProceedingsPublicationLoad | undefined>,
            required: true
        }
    },
    emits: ["deduplicate"],
    setup(props, { emit }) {
        const parameters = ref("");
        const potentialMatches = ref<DocumentPublicationIndex[]>([]);

        watch(() => props.publicationForLoading, () => {
            if (props.publicationForLoading) {
                parameters.value = "";
                props.publicationForLoading.title.forEach(title => {
                    parameters.value += `titles=${title.content}&`;
                });
                parameters.value += `doi=${props.publicationForLoading.doi}&scopusId=${props.publicationForLoading.scopusId}`;
                fetchPotentialMatches();
            }
        });

        const fetchPotentialMatches = () => {
            ImportService.searchForDuplicates(parameters.value).then(response => {
                potentialMatches.value = response.data.content;
            });
        };

        const handleSelect = () => {
            emit("deduplicate");
        };

        return { 
            returnCurrentLocaleContent, handleSelect,
            potentialMatches, displayTextOrPlaceholder
        };
    },
});
</script>

<style scope>

    .alert {
        color: red;
    }

</style>
