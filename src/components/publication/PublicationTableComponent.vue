<template>
    <responsive-data-table
        v-model="selectedPublications"
        :items="publications"
        :headers="headers"
        :extra-sort-headers="[yearHeader]"
        :items-length="totalPublications"
        :show-select="showSelect"
        :page="tableOptions.page"
        :items-per-page="tableOptions.itemsPerPage"
        :sort-by="tableOptions.sortBy"
        :in-comparator="inComparator"
        :container-class="embedded ? 'bg-transparent' : undefined"
        draggable-group="publications"
        :has-active-filters="hasActiveTypeFilters"
        filter-header-key="type"
        @update:options="refreshTable"
        @dragged="onDropCallback"
    >
        <template v-if="$slots['top-left']" #top-left>
            <slot name="top-left" />
        </template>
        <template #actions>
            <slot name="actions" />
        </template>
        <template #selection-menu>
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
        </template>
        <template v-if="$slots['type-filter-menu']" #filter="{ column }">
            <slot name="type-filter-menu" :column="column" />
        </template>
        <template #[`header.`+titleColumn]="{ isSorted, column, toggleSort, getSortIcon }">
            <div class="flex items-center gap-2 sm:gap-8 md:gap-12 lg:gap-16">
                <div class="group flex items-center gap-2" @click.stop="toggleSort(column)">
                    <span>{{ column.title }}</span>
                    <v-icon :class="[isSorted(column) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']" :icon="getSortIcon(column)" />
                </div>
                <div class="group flex items-center gap-2 px-2 py-4" @click.stop="toggleSort(yearHeader)">
                    <span>{{ yearHeader.title }}</span>
                    <v-icon :class="[isSorted(yearHeader) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50']" :icon="getSortIcon(yearHeader)" />
                </div>
            </div>
        </template>
        <template #compact-item="{ item }">
            <publication-card
                :item="item"
                :selected-publications="selectedPublications"
                :show-select="showSelect"
                :show-publication-concrete-type="showPublicationConcreteType"
                @update:selected-publications="selectedPublications = $event"
                @open="openGlance(item)"
            />
        </template>
        <template #row="{ item }">
            <publication-table-row
                :item="item"
                :selected-publications="selectedPublications"
                :show-select="showSelect"
                :show-publication-concrete-type="showPublicationConcreteType"
                :rich-results-view="richResultsView"
                :validation-view="validationView"
                :in-claimer="inClaimer"
                :show-classification="showClassification"
                :is-commission="isCommission"
                :logged-in-commission-id="loggedInUser?.commissionId"
                :show-document-download="isDigitalRepositoryEnabled"
                @update:selected-publications="selectedPublications = $event"
                @claim="claimPublication"
                @decline-claim="declinePublicationClaim"
                @classified="documentClassified"
                @refresh="refreshTable(tableOptions)"
                @validate="validateSection"
            />
        </template>
    </responsive-data-table>
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
        :hide-activation-button="true" />

    <publication-quick-glance
        v-model="glanceOpen"
        :item="glancedPublication"
        :show-publication-concrete-type="showPublicationConcreteType"
        :rich-results-view="richResultsView"
        :validation-view="validationView"
        :in-claimer="inClaimer"
        :show-classification="showClassification"
        :is-commission="isCommission"
        :logged-in-commission-id="loggedInUser?.commissionId"
        @claim="claimPublication"
        @decline-claim="declinePublicationClaim"
        @classified="documentClassified"
        @refresh="refreshTable(tableOptions)"
        @validate="validateSection"
    />

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
        @continue="deleteSelection" />
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType } from 'vue';
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getMetadataComparisonPageName, getPublicationComparisonPageName } from '@/utils/PathResolutionUtil';
import { useRouter } from 'vue-router';
import { useUserRole } from '@/composables/useUserRole';
import { ExportableEndpointType, ExportEntity } from '@/models/Common';
import TableExportModal from '../core/TableExportModal.vue';
import { isEqual } from 'lodash';
import OrganisationUnitTrustConfigurationService from '@/services/OrganisationUnitTrustConfigurationService';
import PersistentQuestionDialog from '../core/comparators/PersistentQuestionDialog.vue';
import ResponsiveDataTable from '../core/ResponsiveDataTable.vue';
import PublicationTableRow from './PublicationTableRow.vue';
import PublicationCard from './PublicationCard.vue';
import PublicationQuickGlance from './PublicationQuickGlance.vue';
import { useCrisContextInformation } from '@/composables/useCrisContextInformation';


export default defineComponent({
    name: "PublicationTableComponent",
    components: { ResponsiveDataTable, TableExportModal, PersistentQuestionDialog, PublicationTableRow, PublicationCard, PublicationQuickGlance },
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
        },
        limitOneSelection: {
            type: Boolean,
            default: false
        },
        embedded: {
            type: Boolean,
            default: false
        }
    },
    emits: ["switchPage", "dragged", "claim", "declineClaim", "selectionUpdated", "removeResearchOutputs"],
    setup(props, {emit}) {
        const selectedPublications = ref<DocumentPublicationIndex[]>([]);
        const glanceOpen = ref(false);
        const glancedPublication = ref<DocumentPublicationIndex | null>(null);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());
        const exportModal = ref<any>(null);

        const {
            isDigitalRepositoryEnabled
        } = useCrisContextInformation();
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

            tableOptions.value.sortBy = [{key: "year", order: "desc"}];
        });

        let isUpdatingSeelction = false;
        watch(selectedPublications, (newVal) => {
            if (isUpdatingSeelction) {
                return;
            }
            
            if (props.limitOneSelection && newVal.length > 1) {
                isUpdatingSeelction = true;
                selectedPublications.value = [newVal[newVal.length - 1]];
                isUpdatingSeelction = false;
            }

            emit("selectionUpdated", selectedPublications.value);
        }, { deep: false });

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
            loggedInUser,
            isUserLoggedIn,
            isResearcher
        } = useUserRole();

        const showSelect = computed(() => isAdmin.value || props.allowSelection || props.enableExport);
        const showClassification = computed(() => (isAdmin.value || isCommission.value) && !props.richResultsView && !props.validationView);

        const titleColumn = computed(() => i18n.t("titleColumn"));

        const tableOptions = ref<any>(
            {
                initialCustomConfiguration: true,
                page: 1,
                itemsPerPage: 10,
                sortBy:[
                    {
                        key: "year",
                        order: "desc"
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
            { title: "DOI", align: "start", sortable: true, key: "doi"}
        ]);

        const documentDownloadHeader = { title: downloadableDocumentsLabel, align: "start", sortable: false, key: "documentDownload"};

        watch(isDigitalRepositoryEnabled, (enabled) => {
            const index = headers.value.findIndex((header: any) => header.key === "documentDownload");

            if (enabled && index === -1) {
                const doiIndex = headers.value.findIndex((header: any) => header.key === "doi");
                headers.value.splice(doiIndex + 1, 0, documentDownloadHeader);
            } else if (!enabled && index !== -1) {
                headers.value.splice(index, 1);
            }
        }, { immediate: true });

        // const yearHeader = computed(() => headers.value.find((header: any) => header.key === "year") as any);
        const yearHeader = ref({ title: yearOfPublicationLabel, align: "start", sortable: true, key: "year", defaultOrder: "desc" })

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
                                key: "year",
                                order: "desc"
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

        const openGlance = (item: DocumentPublicationIndex) => {
            glancedPublication.value = item;
            glanceOpen.value = true;
        };

        const displayPersistentDialog = ref(false);
        const startDeletionProcess = () => {
            displayPersistentDialog.value = true;
        };

        return {
            selectedPublications, headers, notifications,
            refreshTable, isAdmin, deleteSelection,
            tableOptions, displayTextOrPlaceholder, onDropCallback,
            isCommission, startMetadataComparison,
            startPublicationComparison, setSortAndPageOption, claimPublication,
            declinePublicationClaim, loggedInUser, documentClassified,
            removeResearchOutputs, ExportEntity,
            isUserLoggedIn, validateSection,
            validateSectionForAll, canPerformUnbinding, openExportModal, exportModal,
            titleColumn, yearHeader, displayPersistentDialog, startDeletionProcess, showSelect, showClassification, glanceOpen, glancedPublication, openGlance, isDigitalRepositoryEnabled,
        };
    }
});
</script>

<style scoped>
.action-menu-item {
    border-radius: 6px;
    margin: 2px 4px;
    transition: all 0.2s ease;
}

.action-menu-item:hover {
    background-color: rgba(25, 118, 210, 0.08);
}
</style>