<template>
    <v-container>
        <h1>{{ $t("eventListLabel") }}</h1>
        <br />
        <br />
        <search-bar-component :preset-search-input="presetSearchParams" @search="search"></search-bar-component>
        <br />
        <span class="d-flex align-center">
            <v-btn color="primary" @click="addConference">
                {{ $t("addConferenceLabel") }}
            </v-btn>
            <v-checkbox
                v-model="returnSerialEvents"
                :label="$t('showSerialEventsLabel')"
                class="ml-4 mt-5"
            ></v-checkbox>
        </span>
        <event-table-component :events="events" :total-events="totalEvents" @switch-page="switchPage"></event-table-component>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import SearchBarComponent from '@/components/core/SearchBarComponent.vue';
import EventService from '@/services/EventService';
import EventTableComponent from '@/components/event/EventTableComponent.vue';
import { ref } from 'vue';
import type { EventIndex } from '@/models/EventModel';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';


export default defineComponent({
    name: "OrganisationUnitListView",
    components: {SearchBarComponent, EventTableComponent},
    setup() {
        const i18n = useI18n();
        const router = useRouter();
        const route = useRoute();

        const presetSearchParams = ref(route.query.searchQuery as string);
        const searchParams = ref("tokens=");
        const events = ref<EventIndex[]>([]);
        const totalEvents = ref(0);
        const page = ref(0);
        const size = ref(1);
        const sort = ref("");
        const direction = ref("");

        const returnSerialEvents = ref(true);

        onMounted(() => {
            document.title = i18n.t("eventListLabel");
        });

        watch(returnSerialEvents, () => {
            search(searchParams.value);
        });

        const search = (tokenParams: string) => {
            searchParams.value = tokenParams;
            EventService.searchConferences(`${tokenParams}&page=${page.value}&size=${size.value}&sort=${sort.value},${direction.value}`, !returnSerialEvents.value).then((response) => {
                events.value = response.data.content;
                totalEvents.value = response.data.totalElements;
            });
        };

        const switchPage = (nextPage: number, pageSize: number, sortField: string, sortDir: string) => {
            page.value = nextPage;
            size.value = pageSize;
            sort.value = sortField;
            direction.value = sortDir;
            search(searchParams.value);
        }

        const addConference = () => {
            router.push({name: "submitConference"});
        }

        return { search, events, totalEvents, switchPage,
            addConference, presetSearchParams, returnSerialEvents };
    }
});
</script>
