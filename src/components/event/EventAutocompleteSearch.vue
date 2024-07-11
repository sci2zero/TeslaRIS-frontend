<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedEvent.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedEvent"
                :readonly="readOnly"
                :label="$t('conferenceLabel') + (required ? '*' : '')"
                :items="events"
                :custom-filter="((): boolean => true)"
                :rules="required ? requiredSelectionRules : []"
                :auto-select-first="true"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchEvents($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1" class="modal-spacer-top">
            <conference-submission-modal :read-only="readOnly" @create="selectNewlyAddedEvent"></conference-submission-modal>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedEvent.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import EventService from '@/services/EventService';
import type { Conference, EventIndex } from '@/models/EventModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import ConferenceSubmissionModal from './ConferenceSubmissionModal.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';


export default defineComponent({
    name: "EventAutocompleteSearch",
    components: { ConferenceSubmissionModal },
    props: {
        required: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        allowManualClearing: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Object as PropType<{ title: string, value: number } | undefined>,
            required: true,
        },
        returnOnlyNonSerialEvents: {
            type: Boolean,
            default: true
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const events = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedEvent.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules } = useValidationUtils();

        const searchEvents = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params += "page=0&size=5";
                EventService.searchConferences(params, props.returnOnlyNonSerialEvents).then((response) => {
                    const listOfEvents: { title: string, value: number, date?: string }[] = [];
                    response.data.content.forEach((conference: EventIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfEvents.push({title: `${conference.nameSr} | ${extractDate(conference.dateFromTo)}`, value: conference.databaseId, date: conference.dateFromTo});
                        } else {
                            listOfEvents.push({title: `${conference.nameOther} | ${extractDate(conference.dateFromTo)}`, value: conference.databaseId, date: conference.dateFromTo});
                        }
                    })
                    events.value = listOfEvents;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedEvent.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedEvent.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedEvent.value = searchPlaceholder;
            sendContentToParent();
        };

        const selectNewlyAddedEvent = (event: Conference) => {
            let title: string | undefined;
            event.name.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });

            event.nameAbbreviation.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title += " " + multilingualContent.content;
                    return;
                }
            });

            if (!title && event.name.length > 0) {
                title = event.name[0].content;
                if (event.nameAbbreviation.length > 0) {
                    title += " " + event.nameAbbreviation[0].content
                }
            }
            
            const toSelect = {title: `${title} | ${extractDate(event.dateFrom)}`, value: event.id as number};
            events.value.push(toSelect);
            selectedEvent.value = toSelect;
            sendContentToParent();
        };

        const extractDate = (text: string): string => {
            if (!text) {
                return i18n.t("serialEventLabel");
            }

            const yyyy_mm_dd_regex = /\b\d{4}-\d{2}-\d{2}\b/g;
            
            let match;
            
            while ((match = yyyy_mm_dd_regex.exec(text)) !== null) {
                return match[0].split("-")[0];
            }

            return text.split(".")[2];
        };

        return {
            events, selectedEvent, searchEvents,
            requiredSelectionRules,
            sendContentToParent, clearInput,
            selectNewlyAddedEvent
        };
    }
});
</script>
