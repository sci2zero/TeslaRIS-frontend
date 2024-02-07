<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedEvent.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedEvent"
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
        <v-col cols="1" style="margin-top: 20px;">
            <conference-submission-modal></conference-submission-modal>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedEvent.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import EventService from '@/services/EventService';
import type { EventIndex } from '@/models/EventModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { computed } from 'vue';
import ConferenceSubmissionModal from './ConferenceSubmissionModal.vue';


export default defineComponent({
    name: "EventAutocompleteSearch",
    components: { ConferenceSubmissionModal },
    props: {
        required: {
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
        
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const requiredSelectionRules = [
            (value: { title: string, value: number } | number) => {
                if (!value || (value as { title: string, value: number }).value === -1) return requiredFieldMessage.value;
                return true;
            }
        ];

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
                EventService.searchConferences(params).then((response) => {
                    const listOfEvents: { title: string, value: number, date?: string }[] = [];
                    response.data.content.forEach((conference: EventIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfEvents.push({title: conference.nameSr, value: conference.databaseId, date: conference.dateFromTo});
                        } else {
                            listOfEvents.push({title: conference.nameOther, value: conference.databaseId, date: conference.dateFromTo});
                        }
                    })
                    events.value = listOfEvents;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedEvent.value);
        };

        const clearInput = () => {
            selectedEvent.value = searchPlaceholder;
            sendContentToParent();
        };

        return {
            events, selectedEvent, searchEvents,
            requiredSelectionRules,
            sendContentToParent, clearInput
        };
    }
});
</script>
