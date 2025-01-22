<template>
    <v-container id="publisher-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftPublisher?.name) }}
                </h2>
                <br />

                <publisher-update-form ref="updateLeftRef" input-type="JOURNAL" :preset-publisher="leftPublisher" @update="updateLeft"></publisher-update-form>
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
                    {{ returnCurrentLocaleContent(rightPublisher?.name) }}
                </h2>

                <br />

                <publisher-update-form ref="updateRightRef" input-type="JOURNAL" :preset-publisher="rightPublisher" @update="updateRight"></publisher-update-form>
            </v-col>
        </v-row>

        <comparison-actions supports-force-delete @update="updateAll" @delete="deleteSide"></comparison-actions>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PublisherService from '@/services/PublisherService';
import type { Publisher } from '@/models/PublisherModel';
import PublisherUpdateForm from '@/components/publisher/update/PublisherUpdateForm.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { ComparisonSide } from '@/models/MergeModel';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import Toast from '@/components/core/Toast.vue';


export default defineComponent({
    name: "PublisherMetadataComparator",
    components: { PublisherUpdateForm, ComparisonActions, Toast },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftPublisher = ref<Publisher>();
        const rightPublisher = ref<Publisher>();

        const updateLeftRef = ref<typeof PublisherUpdateForm>();
        const updateRightRef = ref<typeof PublisherUpdateForm>();
        
        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("publisherMetadataComparatorLabel");
            fetchPublishers();
        });

        const fetchPublishers = () => {
            PublisherService.readPublisher(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftPublisher.value = response.data;
            });

            PublisherService.readPublisher(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightPublisher.value = response.data;
            });
        };

        const mergePublisherMetadata = (publisher1: Publisher, publisher2: Publisher) => {
            publisher2.name.forEach(name => {
                let merged = false;
                publisher1.name.forEach(currentName => {
                    if (currentName.languageTag === name.languageTag) {
                        currentName.content += " | " + name.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    publisher1.name.push(name);
                }
            });

            publisher2.place.forEach(place => {
                let merged = false;
                publisher1.place.forEach(currentPlace => {
                    if (currentPlace.languageTag === place.languageTag) {
                        currentPlace.content += " | " + place.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    publisher1.place.push(place);
                }
            });
            publisher2.place = [];

            publisher1.countryId = publisher2.countryId;

            return [publisher1, publisher2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightPublisher.value, leftPublisher.value] = mergePublisherMetadata(rightPublisher.value as Publisher, leftPublisher.value as Publisher);
            } else {
                [leftPublisher.value, rightPublisher.value] = mergePublisherMetadata(leftPublisher.value as Publisher, rightPublisher.value as Publisher);
            }

            updateLeftRef.value?.refreshForm();
            updateRightRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (updatedPublisher: Publisher) => {
            leftPublisher.value!.name = updatedPublisher.name;
            leftPublisher.value!.countryId = updatedPublisher.countryId;
            leftPublisher.value!.place = updatedPublisher.place;
            
            if (update.value) {
                leftUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateRight = (updatedPublisher: Publisher) => {
            rightPublisher.value!.name = updatedPublisher.name;
            rightPublisher.value!.countryId = updatedPublisher.countryId;
            rightPublisher.value!.place = updatedPublisher.place;
            
            if (update.value) {
                rightUpdateComplete.value = true;
                finishUpdates();
            }
        };

        const updateAll = () => {
            update.value = true;
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();
        };

        const finishUpdates = () => {
            if (leftUpdateComplete.value && rightUpdateComplete.value) {
                leftUpdateComplete.value = false;
                rightUpdateComplete.value = false;
                update.value = false;

                MergeService.saveMergedPublishersMetadata(
                    leftPublisher.value?.id as number, rightPublisher.value?.id as number,
                    {
                        leftPublisher: leftPublisher.value as Publisher, 
                        rightPublisher: rightPublisher.value as Publisher
                    }
                )
                .then(() => {
                    snackbarMessage.value = i18n.t("updatedSuccessMessage");
                    snackbar.value = true;
                })
                .catch((error) => {
                    snackbarMessage.value = getErrorMessageForErrorKey(error.response.data.message);
                    snackbar.value = true;
                });
            }
        };

        const deleteSide = (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftPublisher.value?.id as number : rightPublisher.value?.id as number;
            const name = side === ComparisonSide.LEFT ? leftPublisher.value?.name : rightPublisher.value?.name;

            const deleteAction = isForceDelete 
                ? PublisherService.forceDeletePublisher(id)
                : PublisherService.deletePublisher(id);

            deleteAction.then(() => {
                router.push({ name: "deduplication", query: { tab: "publishers" } });
            }).catch(() => {
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftPublisher, rightPublisher,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef,
            updateRight, deleteSide
        };
}})

</script>
