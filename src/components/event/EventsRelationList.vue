<template>
    <v-row>
        <v-col>
            <div class="d-flex flex-row justify-start">
                <div>
                    <h2>{{ presetEvent?.serialEvent ? $t("serialEventsRelationsLabel") : $t("eventsRelationsLabel") }}</h2>  
                </div>
                <div v-if="!readonly && !presetEvent?.serialEvent" class="events-relation-submission">
                    <events-relation-submission-modal
                        :source-event="presetEvent"
                        @create="refreshRelationsList"
                    />
                </div>
            </div>
        </v-col>
    </v-row>
    <v-row>
        <v-list lines="two">
            <v-list-item
                v-for="item in relations"
                :key="item.id"
                :title="(returnCurrentLocaleContent(item.targetEventName) as string)"
                :subtitle="presetEvent?.serialEvent ? '' : getEventsRelationTitleFromValueAutoLocale(item.eventsRelationType)"
                @click="navigateToTargetEvent(item.targetId as number)"
            >
                <template v-if="!readonly" #append>
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
        <h3 v-if="relations?.length === 0" class="ml-10 mb-7">
            {{ $t("noAvailableRelationsMessage") }}
        </h3>
    </v-row>

    <toast v-model="snackbar" :message="message" />
</template>
  
<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from 'vue';
import type { Conference, EventsRelation } from "@/models/EventModel";
import { EventsRelationType } from "@/models/EventModel";
import { watch } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import router from '@/router';
import { useI18n } from 'vue-i18n';
import EventService from '@/services/EventService';
import { getEventsRelationTitleFromValueAutoLocale } from '@/i18n/eventsRelationType';
import EventsRelationSubmissionModal from './update/EventsRelationSubmissionModal.vue';
import Toast from '../core/Toast.vue';


export default defineComponent({
name: "EventsRelationList",
components: { EventsRelationSubmissionModal, Toast },
props: {
    presetEvent: {
        type: Object as PropType<Conference | undefined>,
        required: true
    },
    readonly: {
        type: Boolean,
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
                response.data.forEach(relation => {
                    if (relation.sourceId !== props.presetEvent?.id) {
                        [relation.sourceEventName, relation.targetEventName] = [relation.targetEventName, relation.sourceEventName];
                        [relation.sourceId, relation.targetId] = [relation.targetId, relation.sourceId];
                        if (relation.eventsRelationType === EventsRelationType.PART_OF) {
                            relation.eventsRelationType = EventsRelationType.HAS_PART;
                        }
                    }
                });
                relations.value = response.data;
            });
        }
    };

    const navigateToTargetEvent = (eventId: number) => {
        router.push({ name: "conferenceLandingPage", params: {id: eventId} });
    };

    const refreshRelationsList = () => {
        relations.value = [];
        fetchRelations();
    };

    const deleteRelation = (relation: EventsRelation) => {
        EventService.deleteEventsRelation(relation.id as number).then(() => {
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
    margin-left: 25px;
}

</style>
