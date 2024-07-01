<template>
    <v-btn
        v-if="userRole === 'ADMIN'" density="compact" class="bottom-spacer" :disabled="selectedPublications.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        density="compact" class="compare-button" :disabled="selectedPublications.length !== 2">
        {{ $t("compareLabel") }}
    </v-btn>
    <v-data-table-server
        v-model="selectedPublications"
        :sort-by="tableOptions.sortBy"
        :items="publications"
        :headers="headers"
        item-value="row"
        :items-length="totalPublications"
        show-select
        return-object
        :items-per-page-text="$t('itemsPerPageLabel')"
        :items-per-page-options="[5, 10, 25, 50]"
        @update:options="refreshTable">
        <template #item="row">
            <tr>
                <td>
                    <v-checkbox
                        v-model="selectedPublications"
                        :value="row.item"
                        class="table-checkbox"
                        hide-details
                    />
                </td>
                <td v-if="$i18n.locale == 'sr'">
                    <localized-link :to="(getResultType(row.item) !== 'proceedings/' ? 'scientific-results/' : '') + getResultType(row.item) + row.item.databaseId">
                        {{ row.item.titleSr }}
                    </localized-link>
                </td>
                <td v-else>
                    <localized-link :to="(getResultType(row.item) !== 'proceedings/' ? 'scientific-results/' : '') + getResultType(row.item) + row.item.databaseId">
                        {{ row.item.titleOther }}
                    </localized-link>
                </td>
                <td>
                    {{ displayTextOrPlaceholder(row.item.authorNames) }}
                </td>
                <td>
                    {{ row.item.year !== -1 ? row.item.year : "-" }}
                </td>
                <td>
                    {{ getPublicationTypeTitleFromValueAutoLocale(row.item.type) }}
                </td>
                <td v-if="row.item.doi">
                    <doi-link :doi="row.item.doi"></doi-link>
                </td>
                <td v-else>
                    {{ displayTextOrPlaceholder(row.item.doi) }}
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UserService from '@/services/UserService';
import type {DocumentPublicationIndex} from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import DoiLink from '../core/DoiLink.vue';


export default defineComponent({
    name: "PublicationTableComponent",
    components: { LocalizedLink, DoiLink },
    props: {
        publications: {
            type: Array<DocumentPublicationIndex>,
            required: true
        }, 
        totalPublications: {
            type: Number,
            required: true
        }},
    emits: ["switchPage"],
    setup(_, {emit}) {
        const selectedPublications = ref([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const authorNamesLabel = computed(() => i18n.t("authorNamesLabel"));
        const yearOfPublicationLabel = computed(() => i18n.t("yearOfPublicationLabel"));
        const typeOfPublicationLabel = computed(() => i18n.t("typeOfPublicationLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const titleColumn = computed(() => i18n.t("titleColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: titleColumn, order: "asc"}]});

        const headers = [
          { title: titleLabel, align: "start", sortable: true, key: titleColumn},
          { title: authorNamesLabel, align: "start", sortable: true, key: "authorNames"},
          { title: yearOfPublicationLabel, align: "start", sortable: true, key: "year"},
          { title: typeOfPublicationLabel, align: "start", sortable: true, key: "type"},
          { title: "DOI", align: "start", sortable: true, key: "doi"},
        ];

        const headersSortableMappings: Map<string, string> = new Map([
            ["titleSr", "title_sr_sortable"],
            ["titleOther", "title_other_sortable"],
            ["authorNames", "author_names_sortable"],
            ["year", "year"],
            ["type", "type"],
            ["doi", "doi"],
        ]);

        const refreshTable = (event: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                event = tableOptions.value;
            }
            tableOptions.value = event;
            let sortField: string | undefined = "";
            let sortDir: string | undefined = "";
            if (event.sortBy.length > 0) {
                sortField = headersSortableMappings.get(event.sortBy[0].key);
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        const deleteSelection = () => {
            Promise.all(selectedPublications.value.map((publication: DocumentPublicationIndex) => {
                return DocumentPublicationService.deleteDocumentPublication(publication.databaseId as number)
                    .then(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteSuccessNotification", { name: publication.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteSuccessNotification", { name: publication.titleOther }));
                        }
                    })
                    .catch(() => {
                        if (i18n.locale.value === "sr") {
                            addNotification(i18n.t("deleteFailedNotification", { name: publication.titleSr }));
                        } else {
                            addNotification(i18n.t("deleteFailedNotification", { name: publication.titleOther }));
                        }
                        return publication;
                    });
            })).then((failedDeletions) => {
                selectedPublications.value = selectedPublications.value.filter((publication) => failedDeletions.includes(publication));
                refreshTable(tableOptions.value);
            });
        }

        const addNotification = (message: string) => {
            const notificationId = self.crypto.randomUUID();

            notifications.value.set(notificationId, message);
            setTimeout(() => removeNotification(notificationId), 2000);
        }

        const removeNotification = (notificationId: string) => {
            notifications.value.delete(notificationId);
        }

        const getResultType = (result: DocumentPublicationIndex): string => {
            switch (result.type) {
                case "JOURNAL_PUBLICATION":
                    return "journal-publication/";
                case "PROCEEDINGS_PUBLICATION":
                    return "proceedings-publication/";
                case "PATENT":
                    return "patent/";
                case "PROCEEDINGS":
                    return "proceedings/";
                case "DATASET":
                    return "dataset/";
                case "SOFTWARE":
                    return "software/";
                case "MONOGRAPH":
                    return "monograph/";
            }
            return "";
        }

        return {selectedPublications, headers, notifications,
            refreshTable, userRole, deleteSelection,
            tableOptions, getResultType, displayTextOrPlaceholder,
            getPublicationTypeTitleFromValueAutoLocale};
    }
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

