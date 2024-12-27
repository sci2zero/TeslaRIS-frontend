<template>
    <v-container id="journal-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftEvent?.name) }}
                </h2>
                <br />
                <!-- Left Proceedings List -->
                <proceedings-list :preset-event="leftEvent" in-comparator :readonly="false" @dragged="handleDrag"></proceedings-list>
            </v-col>

            <v-col cols="1">
                <v-btn class="mb-1 middle-arrow" icon @click="moveAll(true)">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn class="mt-1 middle-arrow" icon @click="moveAll(false)">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
            </v-col>
            
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(rightEvent?.name) }}
                </h2>

                <br />
                <!-- Right Proceedings List -->
                <proceedings-list :preset-event="rightEvent" in-comparator :readonly="false"></proceedings-list>
            </v-col>
        </v-row>

        <v-row v-if="loading" class="d-flex flex-row justify-center submission-action">
            <v-progress-circular
                :size="70"
                :width="7"
                color="blue"
                indeterminate
            ></v-progress-circular>
        </v-row>

        <v-row class="d-flex flex-row justify-center mt-10">
            <v-btn @click="navigateToMetadataComparison">
                {{ $t("compareMetadataLabel") }}
            </v-btn>
        </v-row>

        <v-snackbar
            v-model="snackbar"
            :timeout="5000">
            {{ snackbarMessage }}
            <template #actions>
                <v-btn
                    color="blue"
                    variant="text"
                    @click="snackbar = false">
                    {{ $t("closeLabel") }}
                </v-btn>
            </template>
        </v-snackbar>

        <persistent-stop-dialog v-if="showStopDialog" :text="$t('cantCompareSerialEventsProceedingsMessage')"></persistent-stop-dialog>
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import MergeService from '@/services/MergeService';
import { getErrorMessageForErrorKey } from '@/i18n';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import type { Conference } from '@/models/EventModel';
import EventService from '@/services/EventService';
import ProceedingsList from '@/components/proceedings/ProceedingsList.vue';
import PersistentStopDialog from '@/components/core/PersistentStopDialog.vue';


export default defineComponent({
    name: "EventProceedingsComparator",
    components: { ProceedingsList, PersistentStopDialog },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");
        const loading = ref(false);

        const showStopDialog = ref(false);

        const currentRoute = useRoute();

        const leftEvent = ref<Conference>();
        const rightEvent = ref<Conference>();

        const i18n = useI18n();
        const router = useRouter();

        onMounted(() => {
            document.title = i18n.t("compareProceedingsLabel");
            fetchEvents();
        });

        const fetchEvents = () => {
            EventService.readConference(parseInt(currentRoute.params.leftId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }

                leftEvent.value = response.data;
            });

            EventService.readConference(parseInt(currentRoute.params.rightId as string)).then((response) => {
                if (response.data.serialEvent) {
                    showStopDialog.value = true;
                    return;
                }
                
                rightEvent.value = response.data;
            });
        };

        const handleDrag = (event: any) => {
            if(event.added) {
                MergeService.switchProceedingsToOtherConference(leftEvent.value?.id as number, event.added.element.id)
                .then(() => {
                    fetchEvents();
                })
                .catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                    loading.value = false;
                });
            } else if (event.removed) {
                MergeService.switchProceedingsToOtherConference(rightEvent.value?.id as number, event.removed.element.id)
                .then(() => {
                    fetchEvents();
                }).catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                    loading.value = false;
                });
            }
        };

        const moveAll = (fromLeftToRight: boolean) => {
            loading.value = true;
            MergeService.switchAllProceedingsToOtherConference(
                (fromLeftToRight ? leftEvent.value?.id : rightEvent.value?.id) as number, 
                (fromLeftToRight ? rightEvent.value?.id : leftEvent.value?.id) as number)
                .then(() => {
                    fetchEvents();
                    loading.value = false;
            });
        };

        const navigateToMetadataComparison = () => {
            router.push({name: "eventMetadataComparator", params: {
                leftId: parseInt(currentRoute.params.leftId as string), rightId: parseInt(currentRoute.params.rightId as string)
            }});
        };

        return {
            snackbar, snackbarMessage,
            leftEvent, rightEvent, handleDrag,
            moveAll, loading, showStopDialog,
            returnCurrentLocaleContent,
            navigateToMetadataComparison
        };
}})

</script>
