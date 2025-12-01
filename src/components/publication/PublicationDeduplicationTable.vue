<template>
    <div
        v-if="totalResults > 0"
        class="ml-5 mt-10 mb-10 actions-box p-4">
        <h3>
            {{ $t("potentialDuplicateMessage") }}
        </h3>
        <v-data-table-server
            :sort-by="tableOptions.sortBy"
            :items="potentialMatches"
            :headers="headers"
            item-value="row"
            :items-length="totalResults"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td>
                        <div class="flex items-baseline gap-2">
                            <div class="text-gray-800! hover:text-blue-900! font-semibold text-base flex">
                                <localized-link :to="getDocumentLandingPageBasePath(row.item.type) + row.item.databaseId">
                                    <rich-title-renderer v-if="$i18n.locale.startsWith('sr')" :title="row.item.titleSr" />
                                    <rich-title-renderer v-else :title="row.item.titleOther" />
                                </localized-link>
                                <span v-if="row.item.year && row.item.year > 0">, </span>
                            </div>
                            <span v-if="row.item.year && row.item.year > 0" class="text-xs text-gray-600">{{ row.item.year }}</span>
                        </div>
                        <div v-if="row.item.authorNames.trim() !== ''" class="mt-1 ml-1 text-sm text-gray-600">
                            <div v-for="(author, index) in row.item.authorNames.split(';')" :key="index">
                                <localized-link
                                    v-if="row.item.authorIds[index] !== -1"
                                    :to="'persons/' + row.item.authorIds[index]"
                                    class="flex items-center gap-1"
                                >
                                    <v-icon size="14" class="text-gray-500">
                                        mdi-account
                                    </v-icon>
                                    {{ `${author.trim()}` }}
                                </localized-link>
                                <span v-else class="flex items-center gap-1">
                                    <v-icon size="14" class="text-gray-500">mdi-account-outline</v-icon>
                                    {{ `${author.trim()}` }}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <v-btn
                            size="small"
                            color="primary"
                            @click="returnSelected ? returnToParent(row.item) : navigateToLandingPage(row.item.databaseId as number, row.item.type)">
                            {{ $t("selectLabel") }}
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </div>
</template>

<script lang="ts">
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { computed, defineComponent, type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import lodash from "lodash";
import { localiseDate } from '@/utils/DateUtil';
import { type MultilingualContent } from '@/models/Common';
import { type DocumentPublicationIndex } from '@/models/PublicationModel';
import ImportService from '@/services/importer/ImportService';
import { getDocumentLandingPageBasePath, getDocumentLandingPageName } from '@/utils/PathResolutionUtil';
import LocalizedLink from '../localization/LocalizedLink.vue';
import RichTitleRenderer from '../core/RichTitleRenderer.vue';


export default defineComponent({
    name: "PublicationDeduplicationTable",
    components: { LocalizedLink, RichTitleRenderer },
    props: {
        title: {
            type: Object as PropType<MultilingualContent[]>,
            required: true
        },
        doi: {
            type: String,
            required: true
        },
        scopusId: {
            type: String,
            required: true
        },
        openAlexId: {
            type: String,
            required: true
        },
        webOfScienceId: {
            type: String,
            required: true
        },
        returnSelected: {
            type: Boolean,
            default: false
        }
    },
    emits: ["selected"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const router = useRouter();

        const potentialMatches = ref<DocumentPublicationIndex[]>([]);

        const totalResults = ref(0);
        const page = ref(0);
        const size = ref(1);
        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[]});

        watch(() => [props.title, props.doi], () => {
            if (props.title) {
                searchPotentialMatches();
            }
        });

        const searchPotentialMatches = lodash.debounce(() => {
            let parameters = "";
            props.title.forEach(title => {
                parameters += `titles=${title.content.trim()}&`;
            });

            parameters += 
                `doi=${props.doi}&scopusId=${props.scopusId}&openAlexId=${props.openAlexId}&webOfScienceId=${props.webOfScienceId}`;
            
            ImportService.searchForDuplicates(parameters).then(response => {
                potentialMatches.value = response.data.content;
                totalResults.value = response.data.totalElements;
            });
        }, 1000);

        const switchPage = (nextPage: number, pageSize: number) => {
            page.value = nextPage;
            size.value = pageSize;
            searchPotentialMatches();
        };

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const headers = [
          { title: titleLabel, align: "start", sortable: false, key: "name"},
          { title: actionLabel, align: "start", sortable: false, key: "actions"}
        ];

        const refreshTable = (event: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                event = tableOptions.value;
            }

            tableOptions.value = event;
            
            switchPage(event.page - 1, event.itemsPerPage);
        };

        const navigateToLandingPage = (documentId: number, type: string) => {
            router.push({ name: getDocumentLandingPageName(type), params: {id: documentId} });
        };

        const resetTable = () => {
            page.value = 0;
            potentialMatches.value = [];
            totalResults.value = 0;
        };

        const returnToParent = (item: DocumentPublicationIndex) => {
            emit("selected", item)
        };

        return {
            displayTextOrPlaceholder,
            refreshTable, headers, localiseDate,
            totalResults, potentialMatches,
            tableOptions, navigateToLandingPage,
            resetTable, returnToParent,
            getDocumentLandingPageBasePath
        };
    },
});
</script>
