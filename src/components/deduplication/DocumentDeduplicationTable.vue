<template>
    <v-container>
        <v-btn
            density="compact" class="bottom-spacer" :disabled="selectedSuggestions.length === 0" @click="flagAsNotDuplicates">
            {{ $t("flagAsNotDuplicatesLabel") }}
        </v-btn>

        <v-data-table-server
            v-model="selectedSuggestions"
            :items="suggestions"
            :headers="headers"
            item-value="row"
            :items-length="totalSuggestions"
            show-select
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td>
                        <v-checkbox
                            v-model="selectedSuggestions"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <localized-link :to="`${getLandingPageBasePath(row.item.documentPublicationType)}` + row.item.leftDocumentId">
                            {{ returnCurrentLocaleContent(row.item.leftDocumentTitle) }}
                        </localized-link>
                    </td>
                    <td>
                        <localized-link :to="`${getLandingPageBasePath(row.item.documentPublicationType)}` + row.item.rightDocumentId">
                            {{ returnCurrentLocaleContent(row.item.rightDocumentTitle) }}
                        </localized-link>
                    </td>
                    <td>
                        <v-btn density="compact" @click="compareMetadata(row.item.leftDocumentId, row.item.rightDocumentId, row.item.documentPublicationType)">
                            {{ $t("compareMetadataLabel") }}
                        </v-btn>
                        <v-btn v-if="row.item.documentPublicationType === 'PROCEEDINGS' || row.item.documentPublicationType === 'MONOGRAPH'" density="compact" class="ml-2" @click="comparePublications(row.item.leftDocumentId, row.item.rightDocumentId, row.item.documentPublicationType)">
                            {{ $t("comparePublicationsLabel") }}
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table-server>

        <div class="notificationContainer">
            <v-slide-y-transition group>
                <v-alert
                    v-for="notification in notifications"
                    :key="notification[0]"
                    theme="dark"
                >
                    {{ notification[1] }}
                </v-alert>
            </v-slide-y-transition>
        </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { computed } from "vue";
import type { DocumentDeduplicationSuggestion, PublicationType } from "@/models/PublicationModel";
import DeduplicationService from "@/services/DeduplicationService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import LocalizedLink from "../localization/LocalizedLink.vue";
import { useRouter } from "vue-router";


export default defineComponent({
    name: "DocumentDeduplicationTableComponent",
    components: { LocalizedLink },
    props: {
        suggestions: {
            type: Array<DocumentDeduplicationSuggestion>,
            required: true
        }, 
        totalSuggestions: {
            type: Number,
            required: true
        }
    },
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedSuggestions = ref([]);

        const router = useRouter();

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const titleLeftLabel = computed(() => i18n.t("titleLeftLabel"));
        const titleRightLabel = computed(() => i18n.t("titleRightLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const headers = [
            { title: titleLeftLabel, align: "start", sortable: false, key: "leftDocumentTitle"},
            { title: titleRightLabel, align: "start", sortable: false, key: "rightDocumentTitle"},
            { title: actionLabel, align: "start", sortable: false, key: "action"}
        ];

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10});

        const refreshTable = (event: any) => {
            emit("switchPage", event.page - 1, event.itemsPerPage);
        };

        const flagAsNotDuplicates = () => {
            Promise.all(selectedSuggestions.value.map((suggestion: DocumentDeduplicationSuggestion) => {
                return DeduplicationService.flagDocumentAsNotDuplicate(suggestion.id)
                    .then(() => {
                        addNotification(i18n.t("flagSuccessNotification", { name: returnCurrentLocaleContent(suggestion.leftDocumentTitle) }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("flagFailedNotification", { name: returnCurrentLocaleContent(suggestion.leftDocumentTitle) }));
                        return suggestion;
                    });
            })).then((failedFlags) => {
                selectedSuggestions.value = selectedSuggestions.value.filter((suggestion) => failedFlags.includes(suggestion));
                refreshTable(tableOptions.value);
            });
        };

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        };

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        };

        const getLandingPageBasePath = (type: PublicationType): string => {
            switch (type) {
                case "JOURNAL_PUBLICATION":
                    return "scientific-results/journal-publication/";
                case "PROCEEDINGS_PUBLICATION":
                    return "scientific-results/proceedings-publication/";
                case "PATENT":
                    return "scientific-results/patent/";
                case "PROCEEDINGS":
                    return "proceedings/";
                case "DATASET":
                    return "scientific-results/dataset/";
                case "SOFTWARE":
                    return "scientific-results/software/";
                case "MONOGRAPH":
                    return "scientific-results/monograph/";
                // TODO: add monograph pubs and theses
            }
            return "";
        };

        const getMetadataComparisonPageName = (type: PublicationType): string => {
            switch (type) {
                case "JOURNAL_PUBLICATION":
                    return "journalPublicationMetadataComparator";
                case "PROCEEDINGS_PUBLICATION":
                    return "proceedingsPublicationMetadataComparator";
                case "PATENT":
                    return "patentPublicationMetadataComparator";
                case "PROCEEDINGS":
                    return "proceedingsMetadataComparator";
                case "DATASET":
                    return "datasetMetadataComparator";
                case "SOFTWARE":
                    return "softwareMetadataComparator";
                case "MONOGRAPH":
                    return "monographMetadataComparator";
                // TODO: add monograph pubs and theses
            }
            return "";
        };

        const getPublicationComparisonPageName = (type: PublicationType): string => {
            switch (type) {
                case "PROCEEDINGS":
                    return "proceedingsPublicationsComparator";
                case "MONOGRAPH":
                    return "monographPublicationsComparator";
            }
            return "";
        };

        const compareMetadata = (leftId: number, rightId: number, publicationType: PublicationType) => {
            router.push({name: getMetadataComparisonPageName(publicationType), params: {
                leftId: leftId, rightId: rightId
            }});
        };

        const comparePublications = (leftId: number, rightId: number, publicationType: PublicationType) => {
            router.push({name: getPublicationComparisonPageName(publicationType), params: {
                leftId: leftId, rightId: rightId
            }});
        };
        
        return {
            selectedSuggestions, notifications, headers,
            refreshTable, flagAsNotDuplicates,
            returnCurrentLocaleContent, getLandingPageBasePath,
            compareMetadata, comparePublications
        };   
    },
});
</script>

<style scoped>
  .notificationContainer {
    position: fixed;
    top: 10px;
    right: 10px;
    display: grid;
    grid-gap: 0.5em;
    z-index: 99;
  }
</style>
