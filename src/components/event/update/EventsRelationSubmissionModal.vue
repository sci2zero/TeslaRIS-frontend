<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="900px">
            <template #activator="scope">
                <div v-if="!readOnly" class="edit-pen">
                    <v-btn
                        icon color="primary" v-bind="scope.props" class="bottom-spacer"
                        :disabled="readOnly" v-on="scope.isActive">
                        <v-icon icon="mdi-pencil-plus-outline"></v-icon>
                    </v-btn>
                </div>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addEventsRelationLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col cols="3">
                                    <v-select
                                        v-model="relationType"
                                        :items="relationTypes"
                                        :label="$t('relationTypeLabel') + '*'"
                                        :rules="requiredSelectionRules"
                                        return-object>
                                    </v-select>
                                </v-col>
                                <v-col cols="7">
                                    <event-autocomplete-search v-model="selectedEvent" required :return-only-non-serial-events="false" :return-only-serial-events="relationType.value === EventsRelationType.BELONGS_TO_SERIES"></event-autocomplete-search>
                                </v-col>
                            </v-row>
                        </v-form>

                        <v-row>
                            <p class="required-fields-message">
                                {{ $t("requiredFieldsMessage") }}
                            </p>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="createRelation">
                        {{ $t("updateLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ message }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-row>
</template>

<script lang="ts">
import { ref } from "vue";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { getEventsRelationTypeForGivenLocale } from "@/i18n/eventsRelationType";
import EventAutocompleteSearch from "../EventAutocompleteSearch.vue";
import { type Conference, type EventsRelation, EventsRelationType } from "@/models/EventModel";
import { useValidationUtils } from "@/utils/ValidationUtils";
import EventService from "@/services/EventService";
import { getErrorMessageForErrorKey } from "@/i18n";


export default defineComponent({
    name: "EventsRelationSubmissionModal",
    components: { EventAutocompleteSearch },
    props: {
        readOnly: {
            type: Boolean,
            default: false
        },
        sourceEvent: {
            type: Object as PropType<Conference | undefined>,
            required: true
        },
    },
    emits: ["create"],
    setup(props, { emit }) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const searchPlaceholder = {title: "", value: -1};
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);
        const relationType = ref<{ title: string, value: EventsRelationType | number }>(searchPlaceholder);
        const relationTypes = getEventsRelationTypeForGivenLocale();

        const { requiredSelectionRules } = useValidationUtils();

        const emitToParent = () => {
            emit("create");
            dialog.value = false;
        };

        const createRelation = () => {
            const newRelation: EventsRelation = {
                sourceId: props.sourceEvent?.id as number,
                targetId: selectedEvent.value.value,
                eventsRelationType: relationType.value.value as EventsRelationType
            };

            EventService.createEventsRelation(newRelation).then(() => {
                emitToParent();
                dialog.value = false;
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        return {dialog, emitToParent, isFormValid, 
            selectedEvent, relationTypes, relationType,
            requiredSelectionRules, createRelation,
            message, snackbar, EventsRelationType};
    }
});
</script>
