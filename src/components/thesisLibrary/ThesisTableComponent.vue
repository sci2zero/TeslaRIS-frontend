<template>
    <div>
        <v-data-table-server
            v-model="selectedTheses"
            :items="theses"
            :headers="headers"
            :items-length="totalTheses"
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 25, 50]"
            :items-per-page="25"
            :show-select="allowSelection"
            return-object
            :no-data-text="$t('noDataInTableMessage')"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #item="row">
                <tr>
                    <td v-if="allowSelection">
                        <v-checkbox
                            v-model="selectedTheses"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>{{ row.item.nameAndSurname.replaceAll("*", "") }}</td>
                    <td v-if="institutionId === undefined && $i18n.locale.startsWith('sr')">
                        {{ row.item.organisationUnitNameSr }}
                    </td>
                    <td v-if="institutionId === undefined && !$i18n.locale.startsWith('sr')">
                        {{ row.item.organisationUnitNameOther }}
                    </td>
                    <td>{{ row.item.scientificArea }}</td>
                    <td v-if="$i18n.locale.startsWith('sr')">
                        <localized-link
                            :to="'scientific-results/thesis/' + row.item.databaseId"
                            open-in-new-tab>
                            <rich-title-renderer :title="row.item.titleSr"></rich-title-renderer>
                        </localized-link>
                    </td>
                    <td v-else>
                        <localized-link
                            :to="'scientific-results/thesis/' + row.item.databaseId"
                            open-in-new-tab>
                            <rich-title-renderer :title="row.item.titleOther"></rich-title-renderer>
                        </localized-link>
                    </td>
                    <td>{{ localiseDate(row.item.publicReviewStartDate) }} - {{ showReviewEndDate ? localiseDate(row.item.publicReviewEndDate) : "*" }}</td>
                    <td>
                        <v-menu
                            :close-on-content-click="true"
                            location="bottom"
                        >
                            <template #activator="{ props }">
                                <div class="edit-pen">
                                    <v-btn
                                        v-bind="props"
                                        compact>
                                        ...
                                    </v-btn>
                                </div>
                            </template>

                            <v-list min-width="150">
                                <publication-file-download-modal
                                    :document-id="(row.item.databaseId as number)"
                                    show-thesis-sections
                                />
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import { watch } from 'vue';
import { getDocumentLandingPageBasePath } from '@/utils/PathResolutionUtil';
import RichTitleRenderer from '../core/RichTitleRenderer.vue';
import type { ThesisPublicReviewResponse } from '@/models/ThesisLibraryModel';
import { localiseDate } from '@/i18n/dateLocalisation';
import PublicationFileDownloadModal from '../publication/PublicationFileDownloadModal.vue';


export default defineComponent({
    name: "ThesisTableComponent",
    components: { LocalizedLink, RichTitleRenderer, PublicationFileDownloadModal },
    props: {
        theses: {
            type: Array<ThesisPublicReviewResponse>,
            required: true
        }, 
        totalTheses: {
            type: Number,
            required: true
        },
        institutionId: {
            type: Number,
            default: undefined
        },
        showReviewEndDate: {
            type: Boolean,
            default: true
        },
        allowSelection: {
            type: Boolean,
            default: false
        }
    },
    emits: ["switchPage"],
    setup(props, {emit}) {
        const selectedTheses = ref<ThesisPublicReviewResponse[]>([]);

        const i18n = useI18n();

        const notifications = ref<Map<string, string>>(new Map());

        const tableWrapper = ref<any>(null);

        onMounted(() => {
            if (props.institutionId) {
                headers.value = headers.value.filter(header => header.key !== "faculty");
            }
        })

        watch(tableWrapper, () => {
            if (tableWrapper.value) {
                const table = tableWrapper.value;
                const sortableTbody = table.querySelector('.v-table__wrapper > table > tbody > tbody')
                const tbody = table.querySelector('.v-table__wrapper > table > tbody')
                tbody!.parentNode!.append(sortableTbody!)
                tbody!.remove()
            }
        });

        const fullNameLabel = computed(() => i18n.t("surnameAndNameLabel"));
        const facultyLabel = computed(() => i18n.t("facultyLabel"));
        const scientificOrArtFieldLabel = computed(() => i18n.t("scientificOrArtFieldLabel"));
        const publicationTitleLabel = computed(() => i18n.t("publicationTitleLabel"));
        const publicReviewPeriodLabel = computed(() => i18n.t("publicReviewPeriodLabel"));
        const downloadableDocumentsLabel = computed(() => i18n.t("downloadableDocumentsLabel"));

        const headers = ref<any[]>([
            { title: fullNameLabel, align: "start", sortable: false},
            { title: facultyLabel, align: "start", sortable: false, key: "faculty"},
            { title: scientificOrArtFieldLabel, align: "start", sortable: false},
            { title: publicationTitleLabel, align: "start", sortable: false},
            { title: publicReviewPeriodLabel, align: "start", sortable: false},
            { title: downloadableDocumentsLabel, align: "start", sortable: false}
        ]);

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10});


        const refreshTable = (event: any) => {
            if (tableOptions.value.initialCustomConfiguration) {
                tableOptions.value.initialCustomConfiguration = false;
                event = tableOptions.value;
            }
            tableOptions.value = event;
            emit("switchPage", event.page - 1, event.itemsPerPage);
        };

        return {
            headers, notifications, localiseDate,
            refreshTable, tableWrapper, tableOptions,
            displayTextOrPlaceholder, selectedTheses,
            getPublicationTypeTitleFromValueAutoLocale,
            getDocumentLandingPageBasePath
        };
    }
});
</script>
