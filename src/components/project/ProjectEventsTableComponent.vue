<template>
    <table-toolbar
        :title="$t('eventListLabel')"
        :selected-count="selectedEvents.length"
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
                prepend-icon="mdi-calendar-plus"
                @click="addDialog = true">
                {{ $t("addEventLabel") }}
            </v-btn>
        </template>
    </table-toolbar>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <v-data-table
            v-model="selectedEvents"
            :items="events"
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
                            v-model="selectedEvents"
                            :value="row.item"
                            class="table-checkbox"
                            hide-details
                        />
                    </td>
                    <td>
                        <localized-link
                            v-if="row.item.eventId && eventLandingPagePath(row.item)"
                            :to="eventLandingPagePath(row.item) + row.item.eventId">
                            {{ eventName(row.item) }}
                        </localized-link>
                        <span v-else>
                            {{ eventName(row.item) }}
                        </span>
                    </td>
                    <td>
                        {{ displayTextOrPlaceholder(getProjectEventTypeTitleFromValueAutoLocale(row.item.relationType)) }}
                    </td>
                </tr>
            </template>
        </v-data-table>
    </div>

    <v-dialog v-model="addDialog" persistent max-width="900">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t("addEventLabel") }}</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="isFormValid" @submit.prevent>
                    <v-row v-if="!enterExternalEvent">
                        <v-col cols="12">
                            <all-events-autocomplete-search
                                v-model="selectedEvent"
                                required
                            />
                        </v-col>
                    </v-row>
                    <v-row v-if="enterExternalEvent">
                        <v-col cols="12">
                            <multilingual-text-input
                                ref="textualDescriptionRef"
                                v-model="textualDescription"
                                :rules="requiredFieldRules"
                                :label="$t('externalEventDescriptionLabel') + '*'"
                                is-area
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn
                                color="blue darken-1"
                                compact
                                @click="toggleExternalEvent">
                                {{ enterExternalEvent ? $t("searchInSystemLabel") : $t("enterExternalEventLabel") }}
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
                <v-btn color="blue darken-1" :disabled="!isFormValid" @click="addEvent">
                    {{ $t("saveLabel") }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <persistent-question-dialog
        v-model="displayPersistentDialog"
        :title="$t('areYouSureLabel')"
        :message="$t('confirmDeletionMessage')"
        :entity-names="selectedEvents.map(projectEvent => eventName(projectEvent))"
        @continue="removeSelected" />

    <toast v-model="snackbar" :message="snackbarMessage" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import type { ErrorResponse, MultilingualContent } from "@/models/Common";
import type { ProjectEvent } from "@/models/ProjectModel";
import { ProjectEventType } from "@/models/ProjectModel";
import ProjectService from "@/services/project/ProjectService";
import LocalizedLink from "@/components/localization/LocalizedLink.vue";
import MultilingualTextInput from "@/components/core/MultilingualTextInput.vue";
import AllEventsAutocompleteSearch from "@/components/event/AllEventsAutocompleteSearch.vue";
import PersistentQuestionDialog from "@/components/core/comparators/PersistentQuestionDialog.vue";
import Toast from "@/components/core/Toast.vue";
import TableToolbar from "@/components/core/TableToolbar.vue";
import {
    getProjectEventTypeTitleFromValueAutoLocale,
    getProjectEventTypesForGivenLocale
} from "@/i18n/projectEventType";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import { displayTextOrPlaceholder } from "@/utils/StringUtil";
import { getEventLandingPageBasePath } from "@/utils/PathResolutionUtil";
import { useValidationUtils } from "@/utils/ValidationUtils";

const props = withDefaults(defineProps<{
    projectId: number;
    canEdit?: boolean;
}>(), {
    canEdit: false
});

const i18n = useI18n();
const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

const events = ref<ProjectEvent[]>([]);
const selectedEvents = ref<ProjectEvent[]>([]);

const addDialog = ref(false);
const displayPersistentDialog = ref(false);
const isFormValid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const textualDescriptionRef = ref<typeof MultilingualTextInput>();

const searchPlaceholder = { title: "", value: -1 };
const enterExternalEvent = ref(false);
const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);
const textualDescription = ref<MultilingualContent[]>([]);
const selectedRelationType = ref<{ title: string | undefined, value: ProjectEventType }>();

const headers = computed(() => [
    {
        title: i18n.t("eventLabel"), align: "start", sortable: true, key: "event",
        value: (projectEvent: ProjectEvent) => eventName(projectEvent)
    },
    { title: i18n.t("relationTypeLabel"), align: "start", sortable: false, key: "relationType" }
]);

const relationTypes = computed(() => getProjectEventTypesForGivenLocale());

onMounted(() => {
    fetchEvents();
});

const fetchEvents = () => {
    ProjectService.readProjectEvents(props.projectId).then((response) => {
        events.value = response.data;
    });
};

const eventName = (projectEvent: ProjectEvent) => {
    const name = projectEvent.eventId ?
        (i18n.locale.value.startsWith("sr") ? projectEvent.eventNameSr : projectEvent.eventNameOther) :
        returnCurrentLocaleContent(projectEvent.textualDescription);

    return displayTextOrPlaceholder(name);
};

const eventLandingPagePath = (projectEvent: ProjectEvent) => {
    return projectEvent.eventType ?
        getEventLandingPageBasePath(projectEvent.eventType) : "";
};

const toggleExternalEvent = () => {
    enterExternalEvent.value = !enterExternalEvent.value;
    selectedEvent.value = searchPlaceholder;
    textualDescription.value = [];
    textualDescriptionRef.value?.clearInput();
};

const closeAddDialog = () => {
    addDialog.value = false;
    enterExternalEvent.value = false;
    selectedEvent.value = searchPlaceholder;
    textualDescription.value = [];
    selectedRelationType.value = undefined;
    textualDescriptionRef.value?.clearInput();
};

const addEvent = () => {
    const newEvent: ProjectEvent = {
        projectId: props.projectId,
        eventId: enterExternalEvent.value ? undefined : selectedEvent.value.value,
        textualDescription: enterExternalEvent.value ? textualDescription.value : [],
        relationType: selectedRelationType.value?.value as ProjectEventType,
        fundingParts: []
    };

    ProjectService.addProjectEvent(newEvent).then(() => {
        notify(i18n.t("savedMessage"));
        closeAddDialog();
        fetchEvents();
    }).catch((error: AxiosError<ErrorResponse>) => {
        notifyError(error);
    });
};

const removeSelected = () => {
    const removedIds = selectedEvents.value.map(projectEvent => projectEvent.id as number);

    Promise.all(removedIds.map(projectEventId => ProjectService.removeProjectEvent(projectEventId)))
        .then(() => {
            selectedEvents.value = [];
            notify(i18n.t("updatedSuccessMessage"));
            fetchEvents();
        })
        .catch((error: AxiosError<ErrorResponse>) => {
            notifyError(error);
            fetchEvents();
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
