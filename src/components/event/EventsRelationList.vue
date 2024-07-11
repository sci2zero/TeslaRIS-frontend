<template>
    <v-row>
        <v-col cols="4">
            <h2>{{ presetEvent?.serialEvent ? $t("serialEventsRelationsLabel") : $t("eventsRelationsLabel") }}</h2>  
        </v-col>
        <v-col class="events-relation-submission" cols="3">
            <!-- CREATE COMPONENT GOES HERE -->
        </v-col>
    </v-row>
    <v-list lines="two">
        <v-list-item
            v-for="item in relations"
            :key="item.id"
            :title="(returnCurrentLocaleContent(item.targetEventName) as string)"
            :subtitle="presetEvent?.serialEvent ? '' : getEventsRelationTitleFromValueAutoLocale(item.eventsRelationType)"
            @click="navigateToTargetEvent(item.targetId as number)"
        >
            <template #append>
                <v-row>
                    <v-col cols="auto">
                        <v-icon @click.stop="deleteRelation(item)">
                            mdi-delete
                        </v-icon>
                    </v-col>
                </v-row>
            </template>
        </v-list-item>
    </v-list>

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
</template>
  
<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from 'vue';
import type { Conference, EventsRelation } from "@/models/EventModel";
import { watch } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/TranslationUtil';
import router from '@/router';
import { useI18n } from 'vue-i18n';
import EventService from '@/services/EventService';
import { getEventsRelationTitleFromValueAutoLocale } from '@/i18n/eventsRelationType';

  export default defineComponent({
    name: "EventsRelationList",
    components: {},
    props: {
        presetEvent: {
            type: Object as PropType<Conference | undefined>,
            required: true
        }
    },
    setup(props) {
        const relations = ref<EventsRelation[]>([]);

        const snackbar = ref(false);
        const message = ref("");

        const i18n = useI18n();

        onMounted(() => {
            fetchRelations();
        });

        watch(() => props.presetEvent, () => {
            fetchRelations();
        });

        const fetchRelations = () => {
            if (!props.presetEvent?.id) {
                return;
            }

            if (props.presetEvent.serialEvent) {
                EventService.getRelationsForSerialEvent(props.presetEvent?.id as number).then((response) => {
                    response.data.forEach(relation => {
                        [relation.sourceEventName, relation.targetEventName] = [relation.targetEventName, relation.sourceEventName];
                        [relation.sourceId, relation.targetId] = [relation.targetId, relation.sourceId];
                    });
                    relations.value = response.data;
                });
            } else {
                EventService.getRelationsForOneTimeEvent(props.presetEvent?.id as number).then((response) => {
                    relations.value = response.data;
                });
            }
        };

        const navigateToTargetEvent = (eventId: number) => {
            router.push({ name: "conferenceLandingPage", params: {id: eventId} }).then(() => {
                router.go(0);
            });
        };

        const refreshRelationsList = () => {
            relations.value = [];
            fetchRelations();
        };

        const deleteRelation = (relation: EventsRelation) => {
            EventService.deleteEventsRelation(relation.id).then(() => {
                refreshRelationsList();
                message.value = i18n.t("relationDeleteSuccessNotification");
                snackbar.value = true;
            }).catch(() => {
                message.value = i18n.t("relationDeleteFailedNotification");
                snackbar.value = true;
            });
        };

        return {
            relations, returnCurrentLocaleContent,
            refreshRelationsList, snackbar, message,
            deleteRelation, navigateToTargetEvent,
            getEventsRelationTitleFromValueAutoLocale
        };
    },
  });
</script>

<style scoped>

.events-relation-submission {
    margin-top: 10px;
}

</style>
