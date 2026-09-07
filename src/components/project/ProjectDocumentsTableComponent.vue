<template>
    <table-toolbar
        :title="$t('documentsLabel')"
        :selected-count="selectedDocuments.length"
        :can-act="canEdit"
    >
        <template #action-items>
            <v-list-item
                class="action-menu-item"
                @click="displayPersistentDialog = true"
            >
                <template #prepend>
                    <v-icon color="error" size="18">
                        mdi-delete
                    </v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                    {{ $t("removeLabel") }}
                </v-list-item-title>
            </v-list-item>
        </template>
        <template #actions>
            <v-btn
                v-if="canEdit"
                color="primary"
                prepend-icon="mdi-file-plus"
                @click="addDialog = true">
                {{ $t("addDocumentLabel") }}
            </v-btn>
        </template>
    </table-toolbar>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table
            v-model="selectedDocuments"
            :items="documents"
            :headers="headers"
            item-value="id"
            :show-select="canEdit"
            return-object
            :items-per-page-text="$t('itemsPerPageLabel')"
            :items-per-page-options="[5, 10, 25, 50]"
            :no-data-text="$t('noDataInTableMessage')">
            <template #item="row">
                <tr>
                    <td v-if="canEdit">
                        <v-checkbox
                            v-model="selectedDocuments"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <localized-link
                            v-if="row.item.documentId && documentLandingPagePath(row.item)"
                            :to="documentLandingPagePath(row.item) + row.item.documentId">
                            {{ documentTitle(row.item) }}
                        </localized-link>
                        <span v-else>
                            {{ documentTitle(row.item) }}
                        </span>
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(getProjectDocumentTypeTitleFromValueAutoLocale(row.item.relationType)) }}
                    </td>
                </tr>
            </template>
        </v-data-table>
    </div>

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addDocumentLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="isFormValid" @submit.prevent>
                    <v-row v-if="!enterExternalDocument">
                        <v-col cols="12">
                            <publication-autocomplete-search
                                v-model="selectedDocument"
                                required
                            />
                        </v-col>
                    </v-row>
                    <v-row v-if="enterExternalDocument">
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="textualDescriptionRef"
                                v-model="textualDescription"
                                :rules="requiredFieldRules"
                                :label="$t('externalDocumentDescriptionLabel') + '*'"
                                is-area
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn
                                color="blue darken-1"
                                compact
                                @click="toggleExternalDocument">
                                {{ enterExternalDocument ? $t("searchInSystemLabel") : $t("enterExternalDocumentLabel") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-select
                                v-model="selectedRelationType"
                                :items="relationTypes"
                                :label="$t('relationTypeLabel') + '*'"
                                :rules="requiredSelectionRules"
                                return-object
                            />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" @click="closeAddDialog">
                    {{ $t("closeLabel") }}
                </v-btn>
                <v-btn color="blue darken-1" :disabled="!isFormValid" @click="addDocument">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedDocuments.map(projectDocument => documentTitle(projectDocument))"
        @continue="removeSelected" />

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import type { ErrorResponse, MultilingualContent } from "@/models/Common";
import type { ProjectDocument } from "@/models/ProjectModel";
import { ProjectDocumentType } from "@/models/ProjectModel";
import ProjectService from "@/services/project/ProjectService";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import MultilingualTextInput from "@/components/core/MultilingualTextInput.vue";
import PublicationAutocompleteSearch from "@/components/publication/PublicationAutocompleteSearch.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import TableToolbar from "@/components/core/TableToolbar.vue";
import {
    getProjectDocumentTypeTitleFromValueAutoLocale,
    getProjectDocumentTypesForGivenLocale
} from "@/i18n/projectDocumentType";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { getDocumentLandingPageBasePath } from "@/utils/PathResolutionUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";

const props = withDefaults(defineProps<{
    projectId: number;
    canEdit?: boolean;
}>(), {
    canEdit: false
});

const i18n = useI18n();
const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

const documents = ref<ProjectDocument[]>([]);
const selectedDocuments = ref<ProjectDocument[]>([]);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const isFormValid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const textualDescriptionRef = ref<typeof MultilingualTextInput>();

const searchPlaceholder = { title: "", value: -1 };
const enterExternalDocument = ref(false);
const selectedDocument = ref<{ title: string, value: number }>(searchPlaceholder);
const textualDescription = ref<MultilingualContent[]>([]);
const selectedRelationType = ref<{ title: string | undefined, value: ProjectDocumentType }>();

const headers = computed(() => [
    {
        title: i18n.t("documentLabel"), align: "start", sortable: true, key: "document",
        value: (projectDocument: ProjectDocument) => documentTitle(projectDocument)
    },
    { title: i18n.t("relationTypeLabel"), align: "start", sortable: false, key: "relationType" }
]);

const relationTypes = computed(() => getProjectDocumentTypesForGivenLocale());

onMounted(() => {
    fetchDocuments();
});

const fetchDocuments = () => {
    ProjectService.readProjectDocuments(props.projectId).then((response) => {
        documents.value = response.data;
    });
};

const documentTitle = (projectDocument: ProjectDocument) => {
    const title = projectDocument.documentId ?
        (i18n.locale.value.startsWith("sr") ? projectDocument.documentTitleSr : projectDocument.documentTitleOther) :
        returnCurrentLocaleContent(projectDocument.textualDescription);

    return displayTextOrPlaceholder(title);
};

const documentLandingPagePath = (projectDocument: ProjectDocument) => {
    return projectDocument.documentType ?
        getDocumentLandingPageBasePath(projectDocument.documentType) : "";
};

const toggleExternalDocument = () => {
    enterExternalDocument.value = !enterExternalDocument.value;
    selectedDocument.value = searchPlaceholder;
    textualDescription.value = [];
    textualDescriptionRef.value?.clearInput();
};

const closeAddDialog = () => {
    addDialog.value = false;
    enterExternalDocument.value = false;
    selectedDocument.value = searchPlaceholder;
    textualDescription.value = [];
    selectedRelationType.value = undefined;
    textualDescriptionRef.value?.clearInput();
};

const addDocument = () => {
    const newDocument: ProjectDocument = {
        projectId: props.projectId,
        documentId: enterExternalDocument.value ? undefined : selectedDocument.value.value,
        textualDescription: enterExternalDocument.value ? textualDescription.value : [],
        relationType: selectedRelationType.value?.value as ProjectDocumentType,
        fundingParts: []
    };

    ProjectService.addProjectDocument(newDocument).then(() => {
        notify(i18n.t("savedMessage"));
        closeAddDialog();
        fetchDocuments();
    }).catch((error: AxiosError<ErrorResponse>) => {
        notifyError(error);
    });
};

const removeSelected = () => {
    const removedIds = selectedDocuments.value.map(projectDocument => projectDocument.id as number);

    Promise.all(removedIds.map(projectDocumentId => ProjectService.removeProjectDocument(projectDocumentId)))
        .then(() => {
            selectedDocuments.value = [];
            notify(i18n.t("updatedSuccessMessage"));
            fetchDocuments();
        })
        .catch((error: AxiosError<ErrorResponse>) => {
            notifyError(error);
            fetchDocuments();
        });
};

const notify = (message: string) => {
    snackbarMessage.value = message;
    snackbar.value = true;
};

const notifyError = (error: AxiosError<ErrorResponse>) => {
    const backendMessage = error.response?.data.message as string;
    const translated = backendMessage ? i18n.t(backendMessage) : "";
    notify(translated && translated !== backendMessage ? translated : i18n.t("genericErrorMessage"));
};
</script>
