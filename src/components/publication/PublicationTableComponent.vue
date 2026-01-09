<template>
    <div class="flex justify-between mb-2">
        <div class="flex items-center gap-2">
            <div v-if="selectedPublications.length > 0" class="action-menu-container">
                <v-menu offset-y>
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            color="white"
                            variant="elevated"
                            height="48"
                            prepend-icon="mdi-dots-vertical"
                            class="action-menu-trigger"
                        >
                            {{ $t("actions") }} <template v-if="selectedPublications.length > 0">
                                ({{ selectedPublications.length }})
                            </template>
                        </v-btn>
                    </template>

                    <v-list class="action-menu-list" density="compact">
                        <v-list-item
                            v-if="(isAdmin || allowComparison || allowResearcherUnbinding)"
                            :disabled="allowResearcherUnbinding ? (!canPerformUnbinding() || selectedPublications.length === 0) : selectedPublications.length === 0"
                            class="action-menu-item"
                            @click="startDeletionProcess"
                        >
                            <template #prepend>
                                <v-icon color="error" size="18">
                                    mdi-delete
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ allowResearcherUnbinding ? $t("unbindLabel") : $t("deleteLabel") }}
                            </v-list-item-title>
                        </v-list-item>

                        <v-list-item
                            v-if="showsResearchOutputs && canRemoveResearchOutputs"
                            :disabled="selectedPublications.length === 0"
                            class="action-menu-item"
                            @click="removeResearchOutputs"
                        >
                            <template #prepend>
                                <v-icon color="warning" size="18">
                                    mdi-playlist-remove
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("removeLabel") }}
                            </v-list-item-title>
                        </v-list-item>

                        <v-list-item
                            v-if="(isAdmin || allowComparison) && !inComparator"
                            :disabled="selectedPublications.length !== 2 || selectedPublications[0]?.type !== selectedPublications[1]?.type"
                            class="action-menu-item"
                            @click="startMetadataComparison"
                        >
                            <template #prepend>
                                <v-icon color="info" size="18">
                                    mdi-database-search
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("compareMetadataLabel") }}
                            </v-list-item-title>
                        </v-list-item>

                        <v-list-item
                            v-if="isAdmin && !inComparator"
                            :disabled="selectedPublications.length !== 2 || selectedPublications[0]?.type !== selectedPublications[1]?.type || (selectedPublications[0]?.type !== 'PROCEEDINGS' && selectedPublications[0]?.type !== 'MONOGRAPH')"
                            class="action-menu-item"
                            @click="startPublicationComparison"
                        >
                            <template #prepend>
                                <v-icon color="info" size="18">
                                    mdi-file-compare
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("comparePublicationsLabel") }}
                            </v-list-item-title>
                        </v-list-item>

                        <v-list-item
                            v-if="validationView"
                            :disabled="selectedPublications.length === 0 || selectedPublications.some(p => p.isApproved === true)"
                            class="action-menu-item"
                            @click="validateSectionForAll(true)"
                        >
                            <template #prepend>
                                <v-icon color="success" size="18">
                                    mdi-check-decagram
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("validateMetadataLabel") }}
                            </v-list-item-title>
                        </v-list-item>

                        <v-list-item
                            v-if="validationView"
                            :disabled="selectedPublications.length === 0 || selectedPublications.some(p => p.areFilesValid === true)"
                            class="action-menu-item"
                            @click="validateSectionForAll(false)"
                        >
                            <template #prepend>
                                <v-icon color="success" size="18">
                                    mdi-file-check
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("validateUploadedFilesLabel") }}
                            </v-list-item-title>
                        </v-list-item>

                        <v-list-item
                            v-if="enableExport"
                            class="action-menu-item"
                            @click="openExportModal"
                        >
                            <template #prepend>
                                <v-icon color="success" size="18">
                                    mdi-download
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">
                                {{ $t("exportLabel") }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
            <div :class="[selectedPublications.length > 0 ? 'w-[19.25rem]' : 'w-[28rem]']">
                <slot name="top-left"></slot>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <slot name="actions"></slot>
        </div>
    </div>
    <table-export-modal
        v-if="enableExport"
        ref="exportModal"
        :export-entity="exportEntity"
        :export-ids="(selectedPublications.map(publication => publication.databaseId) as number[])"
        :disabled="selectedPublications.length === 0"
        :potential-max-amount-requested="selectedPublications.length >= tableOptions.itemsPerPage"
        :total-results="totalPublications"
        :endpoint-type="endpointType"
        :endpoint-token-parameters="endpointTokenParameters"
        :endpoint-body-parameters="endpointBodyParameters"
        :hide-activation-button="true">
    </table-export-modal>

    <div ref="tableWrapper" class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table-server
            v-model="selectedPublications"
            :sort-by="tableOptions.sortBy"
            :items="publications"
            :headers="headers"
            item-value="row"
            :items-length="totalPublications"
            :show-select="isAdmin || allowSelection || enableExport"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #[`header.`+titleColumn]="{ isSorted, column, toggleSort, getSortIcon }">
                <div class="flex items-center gap-2 sm:gap-8 md:gap-12 lg:gap-16">
                    <div class="group flex items-center gap-2" @click.stop="toggleSort(column)">
                        <span>{{ column.title }}</span>
                        <v-icon class="" :class="[isSorted(column) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']" :icon="getSortIcon(column)"></v-icon>
                    </div>

                    <div class="group flex items-center gap-2 px-2 py-4" @click.stop="toggleSort(yearHeader)">
                        <span>{{ yearHeader.title }}</span>
                        <v-icon class="" :class="[isSorted(yearHeader) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']" :icon="getSortIcon(yearHeader)"></v-icon>
                    </div>
                </div>
            </template>
            <template #[`header.type`]="{ isSorted, column, toggleSort, getSortIcon }">
                <div class="group flex items-center gap-2" @click="toggleSort(column)">
                    <span>{{ column.title }}</span>
                    <v-menu v-if="$slots['type-filter-menu']" :close-on-content-click="false">
                        <template #activator="{ props }">
                            <v-icon 
                                v-bind="props" 
                                :title="hasActiveTypeFilters ? $t('filterActiveLabel') : $t('filterLabel')"
                                :class="hasActiveTypeFilters ? 'ml-1 text-primary cursor-pointer hover:text-primary-darken-1' : 'ml-1 text-gray-400 cursor-pointer hover:text-gray-600'"
                                icon="mdi-filter"
                            ></v-icon>
                        </template>
                        <div class="p-3 bg-white rounded-lg shadow-lg">
                            <slot name="type-filter-menu" :column="column"></slot>
                        </div>
                    </v-menu>
                    <v-icon class="" :class="[isSorted(column) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']" :icon="getSortIcon(column)"></v-icon>
                </div>
            </template>
            <template #body="properties">
                <draggable
                    :list="(properties.items as unknown as any[])"
                    tag="tbody"
                    :disabled="!inComparator"
                    group="publications"
                    handle=".handle"
                    @change="onDropCallback"
                >
                    <tr v-if="properties.items?.length === 0">
                        <td colspan="10" class="text-center">
                            <p>{{ $t("noDataInTableMessage") }}</p>
                        </td>
                    </tr>
                    <tr v-for="item in properties.items" :key="item.id" class="handle">
                        <td v-if="isAdmin || allowSelection || enableExport" class="px-2!">
                            <v-checkbox
                                v-model="selectedPublications"
                                :value="item"
                                class="table-checkbox"
                                hide-details
                            />
                        </td>
                        <td class="py-2!">
                            <div class="flex gap-2">
                                <localized-link :to="getDocumentLandingPageBasePath(item.type) + item.databaseId" class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors flex-shrink-0">
                                    <v-icon color="primary" size="20">
                                        {{ getPublicationTypeIcon(item.type) }}
                                    </v-icon>
                                </localized-link>
                                <div>
                                    <div class="flex items-baseline gap-2">
                                        <div class="text-gray-800! hover:text-blue-900! font-semibold text-base flex">
                                            <localized-link :to="getDocumentLandingPageBasePath(item.type) + item.databaseId">
                                                <rich-title-renderer v-if="$i18n.locale.startsWith('sr')" :title="item.titleSr" />
                                                <rich-title-renderer v-else :title="item.titleOther" />
                                            </localized-link>
                                            <span v-if="item.year && item.year > 0">, </span>
                                        </div>
                                        <span v-if="item.year && item.year > 0" class="text-xs text-gray-600">{{ item.year }}</span>
                                    </div>
                                    <div v-if="item.authorNames.trim() !== ''" class="mt-1 ml-1 text-sm text-gray-600">
                                        <div v-for="(author, index) in getDisplayedAuthors(item)" :key="index">
                                            <localized-link
                                                v-if="item.authorIds[index] !== -1"
                                                :to="'persons/' + item.authorIds[index]"
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
                                        <v-btn
                                            v-if="shouldShowMoreButton(item)"
                                            variant="text"
                                            size="x-small"
                                            color="primary"
                                            class="mt-1"
                                            @click="toggleShowAllAuthors(item.databaseId as number)"
                                        >
                                            {{ getShowMoreText(item) }}
                                        </v-btn>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <v-chip size="small" color="primary" variant="flat" :prepend-icon="getPublicationTypeIcon(item.type)">
                                {{ showPublicationConcreteType ? getConcretePublicationType(item.publicationType) : getPublicationTypeTitleFromValueAutoLocale(item.type) }}
                            </v-chip>
                        </td>
                        <td>
                            <identifier-menu v-if="item.doi" :identifier="item.doi" type="doi"></identifier-menu>
                        </td>
                        <td>
                            <v-menu
                                v-if="richResultsView"
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
                                    <publication-reference-formats
                                        :document-id="(item.databaseId as number)"
                                    />
                                    <publication-file-download-modal
                                        :document-id="(item.databaseId as number)"
                                    />
                                </v-list>
                            </v-menu>
                            <div
                                v-else
                                class="d-flex flex-row justify-center">
                                <publication-file-download-modal
                                    :document-id="(item.databaseId as number)"
                                    :show-thesis-sections="item.type === 'THESIS'"
                                    hide-empty-sections
                                    :persistent="false"
                                    :is-list-item="false"
                                    :contains-files="item.containsFiles"
                                />
                            </div>
                        </td>
                        <td>
                            <v-btn v-if="inClaimer" size="small" color="primary" @click="claimPublication(item.databaseId as number)">
                                {{ $t("claimLabel") }}
                            </v-btn>
                            <v-btn
                                v-if="inClaimer" class="ml-1" size="small" color="primary"
                                @click="declinePublicationClaim(item.databaseId as number)">
                                {{ $t("declineClaimLabel") }}
                            </v-btn>
                            <entity-classification-modal-content
                                v-if="(isAdmin || isCommission) && !richResultsView && !validationView"
                                :entity-id="(item.databaseId as number)"
                                :entity-type="ApplicableEntityType.DOCUMENT"
                                :disabled="!item.year || item.year < 0"
                                @classified="documentClassified(item)"
                                @update="refreshTable(tableOptions)">
                            </entity-classification-modal-content>
                            <v-btn
                                v-if="validationView"
                                size="small"
                                color="primary"
                                :disabled="item.isApproved"
                                @click="validateSection(item.databaseId as number, true)">
                                {{ $t("validateMetadataLabel") }}
                            </v-btn>
                            <v-btn
                                v-if="validationView"
                                class="ml-1"
                                size="small"
                                color="primary"
                                :disabled="item.areFilesValid"
                                @click="validateSection(item.databaseId as number, false)">
                                {{ $t("validateUploadedFilesLabel") }}
                            </v-btn>
                        </td>
                        <td v-if="isCommission">
                            <v-icon v-if="item.assessedBy?.includes(loggedInUser?.commissionId as number)" icon="mdi-check"></v-icon>
                            <v-icon v-else icon="mdi-close"></v-icon>
                        </td>
                    </tr>
                </draggable>
            </template>
        </v-data-table-server>
    </div>

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

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="!allowResearcherUnbinding ? $t('confirmDeletionMessage') : $t('confirmUnbindingMessage')"
        :entity-names="selectedPublications.map(entity => $i18n.locale.startsWith('sr') ? entity.titleSr : entity.titleOther)"
        @continue="deleteSelection">
    </persistent-question-dialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import { VueDraggableNext } from 'vue-draggable-next';
import { watch } from 'vue';
import { getDocumentLandingPageBasePath, getMetadataComparisonPageName, getPublicationComparisonPageName } from '@/utils/PathResolutionUtil';
import { useRouter } from 'vue-router';
import RichTitleRenderer from '../core/RichTitleRenderer.vue';
import { useUserRole } from '@/composables/useUserRole';
import EntityClassificationModalContent from '../assessment/classifications/EntityClassificationModalContent.vue';
import { ApplicableEntityType, ExportableEndpointType, ExportEntity } from '@/models/Common';
import PublicationReferenceFormats from './PublicationReferenceFormats.vue';
import PublicationFileDownloadModal from './PublicationFileDownloadModal.vue';
import TableExportModal from '../core/TableExportModal.vue';
import { isEqual } from 'lodash';
import { getTitleFromValueAutoLocale as getJournalPublicationTypeTitle } from '@/i18n/journalPublicationType';
import { getTitleFromValueAutoLocale as getProceedingsPublicationTypeTitle } from '@/i18n/proceedingsPublicationType';
import { getTitleFromValueAutoLocale as getMonographPublicationTypeTitle } from '@/i18n/monographPublicationType';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';
import IdentifierMenu from '../core/IdentifierMenu.vue';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';


export default defineComponent({
    name: "PublicationTableComponent",
    components: { LocalizedLink, draggable: VueDraggableNext, RichTitleRenderer, EntityClassificationModalContent, PublicationReferenceFormats, PublicationFileDownloadModal, TableExportModal, IdentifierMenu, PersistentQuestionDialog },
    props: {
        publications: {
            type: Array<DocumentPublicationIndex>,
            required: true
        }, 
        totalPublications: {
            type: Number,
            required: true
        },
        inComparator: {
            type: Boolean,
            default: false
        },
        inClaimer: {
            type: Boolean,
            default: false
        },
        showsResearchOutputs: {
            type: Boolean,
            default: false
        },
        canRemoveResearchOutputs: {
            type: Boolean,
            default: false
        },
        allowSelection: {
            type: Boolean,
            default: false
        },
        richResultsView: {
            type: Boolean,
            default: false
        },
        enableExport: {
            type: Boolean,
            default: false
        },
        endpointType: {
            type: Object as PropType<ExportableEndpointType | undefined>,
            default: undefined
        },
        endpointTokenParameters: {
            type: Array<string>,
            default: []
        },
        endpointBodyParameters: {
            type: Object as PropType<any>,
            default: undefined
        },
        exportEntity: {
            type: Object as PropType<ExportEntity>,
            default: ExportEntity.DOCUMENT
        },
        showPublicationConcreteType: {
            type: Boolean,
            default: false
        },
        allowComparison: {
            type: Boolean,
            default: false
        },
        validationView: {
            type: Boolean,
            default: false
        },
        allowResearcherUnbinding: {
            type: Boolean,
            default: false
        },
        hasActiveTypeFilters: {
            type: Boolean,
            default: false
        },
        sortByDateDefault: {
            type: Boolean,
            default: false
        }
    },
    emits: ["switchPage", "dragged", "claim", "declineClaim", "selectionUpdated", "removeResearchOutputs"],
    setup(props, {emit}) {
        const selectedPublications = ref<DocumentPublicationIndex[]>([]);
        const expandedAuthors = ref<Set<number>>(new Set());
        const MAX_AUTHORS_DISPLAYED = 4;

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());
        const exportModal = ref<any>(null);

        const tableWrapper = ref<any>(null);

        onMounted(() => {
            if ((props.inClaimer ||
                isAdmin.value ||
                isCommission.value ||
                props.validationView) &&
                !props.richResultsView
            ) {
                headers.value.push({ title: actionLabel.value, align: "start", sortable: false, key: "action"});
            }

            if (isCommission.value) {
                headers.value.push({ title: assessedByMeLabel, align: "start", sortable: false, key: "classifiedBy"});
            }

            if (isInstitutionalLibrarian.value || isHeadOfLibrary.value || props.sortByDateDefault) {
                tableOptions.value.sortBy = [{key: "year", order: "desc"}];
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

        watch(selectedPublications, () => {
            emit("selectionUpdated", selectedPublications.value);
        });

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const yearOfPublicationLabel = computed(() => i18n.t("yearOfPublicationLabel"));
        const typeOfPublicationLabel = computed(() => i18n.t("typeOfPublicationLabel"));
        const concretePublicationTypeLabel = computed(() => i18n.t("concretePublicationTypeLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));
        const assessedByMeLabel = computed(() => i18n.t("assessedByMeLabel"));
        const downloadableDocumentsLabel = computed(() => i18n.t("downloadableDocumentsLabel"));

        const {
            isAdmin, isCommission,
            isInstitutionalEditor,
            isInstitutionalLibrarian,
            isHeadOfLibrary, loggedInUser,
            isUserLoggedIn, isResearcher
        } = useUserRole();

        const titleColumn = computed(() => i18n.t("titleColumn"));

        const tableOptions = ref<any>(
            {
                initialCustomConfiguration: true,
                page: 1,
                itemsPerPage: 10,
                sortBy:[
                    {
                        key: ((isInstitutionalLibrarian.value || isHeadOfLibrary.value) ? "year" : titleColumn),
                        order: ((isInstitutionalLibrarian.value || isHeadOfLibrary.value) ? "desc" : "asc")
                    }
                ]
            }
        );

        const headers = ref<any>([
            { title: titleLabel, align: "start", sortable: true, key: titleColumn},
            // { title: authorNamesLabel, align: "start", sortable: true, key: "authorNames"},
            // { title: yearOfPublicationLabel, align: "start", sortable: true, key: "year"},
            { title:
                    props.showPublicationConcreteType ? concretePublicationTypeLabel : typeOfPublicationLabel,
                align: "start",
                sortable: true, 
                key: "type"
            },
            { title: "DOI", align: "start", sortable: true, key: "doi"},
            { title: downloadableDocumentsLabel, align: "start", sortable: false, key: "documentDownload"}
        ]);

        // const yearHeader = computed(() => headers.value.find((header: any) => header.key === "year") as any);
        const yearHeader = ref({ title: yearOfPublicationLabel, align: "start", sortable: true, key: "year"})

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
            if (event.sortBy?.length > 0) {
                sortField = headersSortableMappings.get(event.sortBy[0].key);
                sortDir = event.sortBy[0].order.toUpperCase();
            }
            emit("switchPage", event.page - 1, event.itemsPerPage, sortField, sortDir);
        };

        const deleteSelection = () => {
            Promise.all(selectedPublications.value.map((publication: DocumentPublicationIndex) => {
                if (props.allowResearcherUnbinding) {
                    const serviceMethod = isInstitutionalEditor.value ?
                        (documentId: number) => DocumentPublicationService.unbindInstitutionResearchersFromPublication(documentId) :
                        (documentId: number) => DocumentPublicationService.unbindPersonFromPublication(documentId);

                    const sucessMessage =
                        isInstitutionalEditor.value ?
                            "massInstitutionUnbindSuccessfullMessage" : "massUnbindSuccessfullMessage";

                    return serviceMethod(
                        publication.databaseId as number
                    ).then(() => {
                        if (i18n.locale.value.startsWith("sr")) {
                            addNotification(i18n.t(sucessMessage, { name: publication.titleSr }));
                        } else {
                            addNotification(i18n.t(sucessMessage, { name: publication.titleOther }));
                        }
                    })
                    .catch(() => {
                        if (i18n.locale.value.startsWith("sr")) {
                            addNotification(i18n.t("unbindFailedMessage", { name: publication.titleSr }));
                        } else {
                            addNotification(i18n.t("unbindFailedMessage", { name: publication.titleOther }));
                        }
                        return publication;
                    });
                } else if (publication.type === PublicationType.MONOGRAPH) {
                    return DocumentPublicationService.deleteMonograph(publication.databaseId as number)
                        .then(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("deleteSuccessNotification", { name: publication.titleSr }));
                            } else {
                                addNotification(i18n.t("deleteSuccessNotification", { name: publication.titleOther }));
                            }
                        })
                        .catch(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("deleteFailedNotification", { name: publication.titleSr }));
                            } else {
                                addNotification(i18n.t("deleteFailedNotification", { name: publication.titleOther }));
                            }
                            return publication;
                    });
                } else {
                    return DocumentPublicationService.deleteDocumentPublication(publication.databaseId as number)
                        .then(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("deleteSuccessNotification", { name: publication.titleSr }));
                            } else {
                                addNotification(i18n.t("deleteSuccessNotification", { name: publication.titleOther }));
                            }
                        })
                        .catch(() => {
                            if (i18n.locale.value.startsWith("sr")) {
                                addNotification(i18n.t("deleteFailedNotification", { name: publication.titleSr }));
                            } else {
                                addNotification(i18n.t("deleteFailedNotification", { name: publication.titleOther }));
                            }
                            return publication;
                    });
                }
            })).then((failedDeletions) => {
                selectedPublications.value = selectedPublications.value.filter((publication) => failedDeletions.includes(publication));
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

        const onDropCallback = (event: any) => {
            emit("dragged", event);
        };

        const startMetadataComparison = () => {
            router.push({name: getMetadataComparisonPageName(selectedPublications.value[0].type), params: {
                leftId: selectedPublications.value[0].databaseId, rightId: selectedPublications.value[1].databaseId
            }});
        };

        const startPublicationComparison = () => {
            router.push({name: getPublicationComparisonPageName(selectedPublications.value[0].type), params: {
                leftId: selectedPublications.value[0].databaseId, rightId: selectedPublications.value[1].databaseId
            }});
        };

        const setSortAndPageOption = (sortBy: {key: string,  order: string}[], page: number) => {
            if (
                (
                    isEqual(
                        [
                            {
                                key: ((isInstitutionalLibrarian.value || isHeadOfLibrary.value) ? "year" : titleColumn.value),
                                order: ((isInstitutionalLibrarian.value || isHeadOfLibrary.value) ? "desc" : "asc")
                            }
                        ], tableOptions.value.sortBy) ||
                    tableOptions.value.sortBy.length === 0
                ) &&
                page == tableOptions.value.page
            ) {
                tableOptions.value.sortBy.splice(0);
                return;
            }

            tableOptions.value.initialCustomConfiguration = true;
            if (sortBy.length === 0) {
                tableOptions.value.sortBy.splice(0);
            } else {
                tableOptions.value.sortBy = sortBy;
            }
            tableOptions.value.page = page;
        };

        const claimPublication = (documentId: number) => {
            emit("claim", documentId);
        };

        const declinePublicationClaim = (documentId: number) => {
            emit("declineClaim", documentId);
        };

        const documentClassified = (document: DocumentPublicationIndex) => {
            const commissionId = loggedInUser.value?.commissionId as number;
            
            if (document.assessedBy) {
                if (!document.assessedBy.includes(commissionId)) {
                    document.assessedBy.push(commissionId);
                }
            } else {
                document.assessedBy = [commissionId];
            }
        };

        const removeResearchOutputs = () => {
            emit("removeResearchOutputs", selectedPublications.value.map(selectedPublication => selectedPublication.databaseId));
        };

        const getConcretePublicationType = (publicationType: string) => {
            const possibleValues = [
                getJournalPublicationTypeTitle(publicationType),
                getProceedingsPublicationTypeTitle(publicationType),
                getMonographPublicationTypeTitle(publicationType)
            ];
            
            return possibleValues.find(publicationType => publicationType);
        };

        const getPublicationTypeIcon = (type: string) => {
            switch(type) {
                case 'JOURNAL_PUBLICATION':
                    return 'mdi-book-open-page-variant';
                case 'PROCEEDINGS':
                    return 'mdi-presentation';
                case 'PATENT':
                    return 'mdi-shield-check';
                case 'DATASET':
                    return 'mdi-database';
                case 'SOFTWARE':
                    return 'mdi-code-tags';
                case 'MONOGRAPH':
                    return 'mdi-book';
                case 'MONOGRAPH_PUBLICATION':
                    return 'mdi-book-open';
                case 'THESIS':
                    return 'mdi-school';
                case 'MATERIAL_PRODUCT':
                    return 'mdi-hammer-wrench';
                case 'GENETIC_MATERIAL':
                    return 'mdi-sprout';
                default:
                    return 'mdi-file-document';
            }
        };

        const validateSection = async (documentId: number, metadata: boolean) => {
            const validationMethod = metadata ? 
                () => OrganisationUnitTrustConfigurationService.validateDocumentMetadata(documentId) :
                () => OrganisationUnitTrustConfigurationService.validateDocumentFiles(documentId);

            await validationMethod();
            refreshTable(tableOptions);
        };

        const validateSectionForAll = async (metadata: boolean) => {
            const validationMethod = metadata
                ? (documentId: number) => OrganisationUnitTrustConfigurationService.validateDocumentMetadata(documentId)
                : (documentId: number) => OrganisationUnitTrustConfigurationService.validateDocumentFiles(documentId);

            const promises = selectedPublications.value.map(publication => {
                return validationMethod(publication.databaseId as number)
                    .then(() => {
                        const name = i18n.locale.value.startsWith("sr")
                            ? publication.titleSr
                            : publication.titleOther;
                        addNotification(i18n.t("validationSuccessNotification", { name }));
                    })
                    .catch(() => {
                        const name = i18n.locale.value.startsWith("sr")
                            ? publication.titleSr
                            : publication.titleOther;
                        addNotification(i18n.t("validationFailedNotification", { name }));
                    });
            });

            await Promise.all(promises);
            refreshTable(tableOptions);
        };

        const canPerformUnbinding = (): boolean => {
            if (isAdmin.value || isResearcher.value) {
                return true;
            }
            
            if (isInstitutionalEditor.value) {
                return selectedPublications.value.find(pub => pub.type === PublicationType.THESIS) === undefined;
            }

            return false;
        };

        const openExportModal = () => {
            if (exportModal.value) {
                exportModal.value.openModal();
            }
        };

        const toggleShowAllAuthors = (publicationId: number) => {
            if (expandedAuthors.value.has(publicationId)) {
                expandedAuthors.value.delete(publicationId);
            } else {
                expandedAuthors.value.add(publicationId);
            }
        };

        const getDisplayedAuthors = (item: DocumentPublicationIndex) => {
            const authors = item.authorNames.split(';');
            const isExpanded = expandedAuthors.value.has(item.databaseId as number);
            
            if (authors.length <= MAX_AUTHORS_DISPLAYED || isExpanded) {
                return authors;
            }
            
            return authors.slice(0, MAX_AUTHORS_DISPLAYED);
        };

        const shouldShowMoreButton = (item: DocumentPublicationIndex) => {
            const authors = item.authorNames.split(';');
            return authors.length > MAX_AUTHORS_DISPLAYED;
        };

        const getShowMoreText = (item: DocumentPublicationIndex) => {
            const authors = item.authorNames.split(';');
            const isExpanded = expandedAuthors.value.has(item.databaseId as number);
            
            if (isExpanded) {
                return i18n.t("showLessLabel");
            }
            
            const remainingCount = authors.length - MAX_AUTHORS_DISPLAYED;
            return i18n.t("showMoreAuthorsLabel", { count: remainingCount });
        };

        const displayPersistentDialog = ref(false);
        const startDeletionProcess = () => {
            displayPersistentDialog.value = true;
        };

        return {
            selectedPublications, headers, notifications,
            refreshTable, isAdmin, deleteSelection, tableWrapper,
            tableOptions, displayTextOrPlaceholder, onDropCallback,
            getPublicationTypeTitleFromValueAutoLocale, isCommission,
            startMetadataComparison, getDocumentLandingPageBasePath,
            startPublicationComparison, setSortAndPageOption, claimPublication,
            declinePublicationClaim, loggedInUser, documentClassified,
            ApplicableEntityType, removeResearchOutputs, ExportEntity,
            getConcretePublicationType, isUserLoggedIn, validateSection,
            validateSectionForAll, canPerformUnbinding, openExportModal, exportModal,
            toggleShowAllAuthors, getDisplayedAuthors, shouldShowMoreButton, getShowMoreText,
            getPublicationTypeIcon, titleColumn, yearHeader, displayPersistentDialog,
            startDeletionProcess
        };
    }
});
</script>

<style scoped>

.action-menu-trigger {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.action-menu-list {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>