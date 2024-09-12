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
                        <localized-link :to="`${getLandingPageBasePath(row.item)}` + row.item.leftEntityId">
                            {{ $i18n.locale == 'sr' ? row.item.leftTitleSr : row.item.leftTitleOther }}
                        </localized-link>
                    </td>
                    <td>
                        <localized-link :to="`${getLandingPageBasePath(row.item)}` + row.item.rightEntityId">
                            {{ $i18n.locale == 'sr' ? row.item.rightTitleSr : row.item.rightTitleOther }}
                        </localized-link>
                    </td>
                    <td>
                        <v-btn density="compact" @click="compareMetadata(row.item)">
                            {{ $t("compareMetadataLabel") }}
                        </v-btn>
                        <v-btn v-if="canAggregateEntities(row.item)" density="compact" class="ml-2" @click="comparePublications(row.item)">
                            {{ getAggregationComparisonLabel(row.item.entityType) }}
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
import type { DeduplicationSuggestion } from "@/models/PublicationModel";
import DeduplicationService from "@/services/DeduplicationService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import LocalizedLink from "../localization/LocalizedLink.vue";
import { useRouter } from "vue-router";
import { getMetadataComparisonPageName, getPublicationComparisonPageName, getDocumentLandingPageBasePath } from "@/utils/PathResolutionUtil";
import { EntityType } from "@/models/MergeModel";


export default defineComponent({
    name: "DocumentDeduplicationTableComponent",
    components: { LocalizedLink },
    props: {
        suggestions: {
            type: Array<DeduplicationSuggestion>,
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

        const leftTitleColumn = computed(() => i18n.t("leftTitleColumn"));
        const rightTitleColumn = computed(() => i18n.t("rightTitleColumn"));

        const headers = [
            { title: titleLeftLabel, align: "start", sortable: false, key: leftTitleColumn},
            { title: titleRightLabel, align: "start", sortable: false, key: rightTitleColumn},
            { title: actionLabel, align: "start", sortable: false, key: "action"}
        ];

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10});

        const refreshTable = (event: any) => {
            emit("switchPage", event.page - 1, event.itemsPerPage);
        };

        const flagAsNotDuplicates = () => {
            Promise.all(selectedSuggestions.value.map((suggestion: DeduplicationSuggestion) => {
                return DeduplicationService.flagAsNotDuplicate(suggestion.id)
                    .then(() => {
                        addNotification(i18n.t("flagSuccessNotification", { name: i18n.locale.value == 'sr' ? suggestion.leftTitleSr : suggestion.leftTitleOther }));
                    })
                    .catch(() => {
                        addNotification(i18n.t("flagFailedNotification", { name: i18n.locale.value == 'sr' ? suggestion.leftTitleSr : suggestion.leftTitleOther }));
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

        const compareMetadata = (suggestion: DeduplicationSuggestion) => {
            switch(suggestion.entityType) {
                case EntityType.PUBLICATION:
                    router.push({name: getMetadataComparisonPageName(suggestion.documentPublicationType), params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
                case EntityType.JOURNAL:
                    router.push({name: "journalMetadataComparator", params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
                    case EntityType.EVENT:
                    router.push({name: "eventMetadataComparator", params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
                case EntityType.PERSON:
                    router.push({name: "personMetadataComparator", params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
            }
        };

        const comparePublications = (suggestion: DeduplicationSuggestion) => {
            switch(suggestion.entityType) {
                case EntityType.PUBLICATION:
                    router.push({name: getPublicationComparisonPageName(suggestion.documentPublicationType), params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
                case EntityType.JOURNAL:
                    router.push({name: "journalPublicationsComparator", params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
                case EntityType.EVENT:
                    router.push({name: "eventProceedingsComparator", params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
                case EntityType.PERSON:
                    router.push({name: "personPublicationsComparator", params: {
                        leftId: suggestion.leftEntityId, rightId: suggestion.rightEntityId
                    }});
                    break;
            }
        };

        const canAggregateEntities = (suggestion: DeduplicationSuggestion) => {
            switch(suggestion.entityType) {
                case EntityType.PUBLICATION:
                    return suggestion.documentPublicationType === 'PROCEEDINGS' || suggestion.documentPublicationType === 'MONOGRAPH';
                case EntityType.JOURNAL:
                    return true;
                case EntityType.EVENT:
                    return true;
                case EntityType.PERSON:
                    return true;
            }
        };

        const getLandingPageBasePath = (suggestion: DeduplicationSuggestion) => {
            switch(suggestion.entityType) {
                case EntityType.PUBLICATION:
                    return getDocumentLandingPageBasePath(suggestion.documentPublicationType);
                case EntityType.JOURNAL:
                    return "journals/";
                case EntityType.EVENT:
                    return "events/conference/";
                case EntityType.PERSON:
                    return "persons/";
            }
        };

        const getAggregationComparisonLabel = (entityType: EntityType) => {
            switch (entityType) {
                case EntityType.PUBLICATION:
                case EntityType.PERSON:
                case EntityType.JOURNAL:
                    return i18n.t("comparePublicationsLabel");
                case EntityType.EVENT:
                    return i18n.t("compareProceedingsLabel");
                
            }
        };
        
        return {
            selectedSuggestions, notifications, headers,
            refreshTable, flagAsNotDuplicates,
            returnCurrentLocaleContent, getDocumentLandingPageBasePath,
            compareMetadata, comparePublications,
            canAggregateEntities, getLandingPageBasePath,
            getAggregationComparisonLabel
        };   
    },
});
</script>
