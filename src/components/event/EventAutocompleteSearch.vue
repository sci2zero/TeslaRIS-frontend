<template>
    <v-autocomplete
        v-model="selectedEvent"
        :label="$t('eventLabel')"
        :items="events"
        :custom-filter="((): boolean => true)"
        :auto-select-first="true"
        :no-data-text="$t('noDataMessage')"
        return-object
        @update:search="searchEvents($event)"
        @update:model-value="sendContentToParent"
    ></v-autocomplete>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import EventService from '@/services/EventService';
import type { EventIndex } from '@/models/EventModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';


export default defineComponent({
    name: "EventAutocompleteSearch",
    emits: ["setInput"],
    setup(_, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const events = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedEvent = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            sendContentToParent();
        });

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
            emit("setInput", selectedEvent.value);
        };

        const clearInput = () => {
            selectedEvent.value = searchPlaceholder;
            sendContentToParent();
        };

        return {
            events, selectedEvent, searchEvents,
            sendContentToParent, clearInput
        };
    }
});
</script>
