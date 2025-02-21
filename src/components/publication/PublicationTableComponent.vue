<template>
    <v-btn
        v-if="userRole === 'ADMIN'"
        density="compact" class="bottom-spacer" :disabled="selectedPublications.length === 0"
        @click="deleteSelection">
        {{ $t("deleteLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN' && !inComparator" density="compact" class="compare-button"
        :disabled="selectedPublications.length !== 2 || selectedPublications[0]?.type !== selectedPublications[1]?.type"
        @click="startMetadataComparison">
        {{ $t("compareMetadataLabel") }}
    </v-btn>
    <v-btn
        v-if="userRole === 'ADMIN' && !inComparator" density="compact" class="compare-button"
        :disabled="selectedPublications.length !== 2 || selectedPublications[0]?.type !== selectedPublications[1]?.type || (selectedPublications[0]?.type !== 'PROCEEDINGS' && selectedPublications[0]?.type !== 'MONOGRAPH')"
        @click="startPublicationComparison">
        {{ $t("comparePublicationsLabel") }}
    </v-btn>
    <div ref="tableWrapper">
        <v-data-table-server
            v-model="selectedPublications"
            :sort-by="tableOptions.sortBy"
            :items="publications"
            :headers="headers"
            item-value="row"
            :items-length="totalPublications"
            :show-select="userRole === 'ADMIN'"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :page="tableOptions.page"
            @update:options="refreshTable">
            <template #body="props">
                <draggable
                    :list="props.items"
                    tag="tbody"
                    :disabled="!inComparator"
                    group="publications"
                    handle=".handle"
                    @change="onDropCallback"
                >
                    <tr v-if="props.items?.length === 0">
                        <td colspan="10" class="text-center">
                            <p>{{ $t("noDataInTableMessage") }}</p>
                        </td>
                    </tr>
                    <tr v-for="item in props.items" :key="item.id" class="handle">
                        <td v-if="userRole === 'ADMIN'">
                            <v-checkbox
                                v-model="selectedPublications"
                                :value="item"
                                class="table-checkbox"
                                hide-details
                            />
                        </td>
                        <td v-if="$i18n.locale == 'sr'">
                            <localized-link :to="getDocumentLandingPageBasePath(item.type) + item.databaseId">
                                {{ item.titleSr }}
                            </localized-link>
                        </td>
                        <td v-else>
                            <localized-link :to="getDocumentLandingPageBasePath(item.type) + item.databaseId">
                                {{ item.titleOther }}
                            </localized-link>
                        </td>
                        <td>
                            <!-- {{ displayTextOrPlaceholder(item.authorNames) }} -->
                            <span v-if="item.authorNames.trim() === ''">
                                {{ displayTextOrPlaceholder(item.authorNames) }}
                            </span>
                            <span v-for="(employment, index) in item.authorNames.split('; ')" v-else :key="index">
                                <localized-link
                                    v-if="item.authorIds[index] !== -1"
                                    :to="'persons/' + item.authorIds[index]"
                                >
                                    {{ `${employment}; ` }}
                                </localized-link>
                                <span v-else>{{ `${employment}; ` }}</span>
                            </span>
                        </td>
                        <td>
                            {{ item.year !== -1 ? item.year : "-" }}
                        </td>
                        <td>
                            {{ getPublicationTypeTitleFromValueAutoLocale(item.type) }}
                        </td>
                        <td v-if="item.doi">
                            <identifier-link :identifier="item.doi"></identifier-link>
                        </td>
                        <td v-else>
                            {{ displayTextOrPlaceholder(item.doi) }}
                        </td>
                        <td v-if="inClaimer">
                            <v-btn size="small" color="primary" @click="claimPublication(item.databaseId)">
                                {{ $t("claimLabel") }}
                            </v-btn>
                            <v-btn class="ml-1" size="small" color="primary" @click="declinePublicationClaim(item.databaseId)">
                                {{ $t("declineClaimLabel") }}
                            </v-btn>
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
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import UserService from '@/services/UserService';
import { type DocumentPublicationIndex, PublicationType } from '@/models/PublicationModel';
import DocumentPublicationService from '@/services/DocumentPublicationService';
import LocalizedLink from '../localization/LocalizedLink.vue';
import { displayTextOrPlaceholder } from '@/utils/StringUtil';
import { getPublicationTypeTitleFromValueAutoLocale } from '@/i18n/publicationType';
import IdentifierLink from '../core/IdentifierLink.vue';
import { VueDraggableNext } from 'vue-draggable-next';
import { watch } from 'vue';
import { getDocumentLandingPageBasePath, getMetadataComparisonPageName, getPublicationComparisonPageName } from '@/utils/PathResolutionUtil';
import { useRouter } from 'vue-router';


export default defineComponent({
    name: "PublicationTableComponent",
    components: { LocalizedLink, IdentifierLink, draggable: VueDraggableNext },
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
        }
    },
    emits: ["switchPage", "dragged", "claim", "declineClaim"],
    setup(props, {emit}) {
        const selectedPublications = ref<DocumentPublicationIndex[]>([]);

        const i18n = useI18n();
        const router = useRouter();

        const notifications = ref<Map<string, string>>(new Map());

        const tableWrapper = ref<any>(null);

        onMounted(() => {
            if (props.inClaimer) {
                headers.value.push({ title: actionLabel.value, align: "start", sortable: false, key: "action"});
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

        const titleLabel = computed(() => i18n.t("titleLabel"));
        const authorNamesLabel = computed(() => i18n.t("authorNamesLabel"));
        const yearOfPublicationLabel = computed(() => i18n.t("yearOfPublicationLabel"));
        const typeOfPublicationLabel = computed(() => i18n.t("typeOfPublicationLabel"));
        const actionLabel = computed(() => i18n.t("actionLabel"));

        const userRole = computed(() => UserService.provideUserRole());

        const titleColumn = computed(() => i18n.t("titleColumn"));

        const tableOptions = ref<any>({initialCustomConfiguration: true, page: 1, itemsPerPage: 10, sortBy:[{key: titleColumn, order: "asc"}]});

        const headers = ref([
          { title: titleLabel, align: "start", sortable: true, key: titleColumn},
          { title: authorNamesLabel, align: "start", sortable: true, key: "authorNames"},
          { title: yearOfPublicationLabel, align: "start", sortable: true, key: "year"},
          { title: typeOfPublicationLabel, align: "start", sortable: true, key: "type"},
          { title: "DOI", align: "start", sortable: true, key: "doi"},
        ]);

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
                if (publication.type === PublicationType.MONOGRAPH) {
                    return DocumentPublicationService.deleteMonograph(publication.databaseId as number)
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
                }
                
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

        return {
            selectedPublications, headers, notifications,
            refreshTable, userRole, deleteSelection, tableWrapper,
            tableOptions, displayTextOrPlaceholder, onDropCallback,
            getPublicationTypeTitleFromValueAutoLocale,
            startMetadataComparison, getDocumentLandingPageBasePath,
            startPublicationComparison, setSortAndPageOption, claimPublication,
            declinePublicationClaim
        };
    }
});
</script>

