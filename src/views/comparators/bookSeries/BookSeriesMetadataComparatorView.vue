<template>
    <v-container id="bookSeries-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftBookSeries?.title) }}
                </h2>
                <br />

                <publication-series-update-form ref="updateLeftRef" input-type="JOURNAL" :preset-publication-series="leftBookSeries" @update="updateLeft"></publication-series-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list :contribution-list="leftBookSeries?.contributions ? leftBookSeries.contributions : []" in-comparator></person-publication-series-contribution-list>
                    </v-card-text>
                </v-card>
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
                    {{ returnCurrentLocaleContent(rightBookSeries?.title) }}
                </h2>

                <br />

                <publication-series-update-form ref="updateRightRef" input-type="JOURNAL" :preset-publication-series="rightBookSeries" @update="updateRight"></publication-series-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list :contribution-list="rightBookSeries?.contributions ? rightBookSeries.contributions : []" in-comparator></person-publication-series-contribution-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions supports-force-delete @update="updateAll" @delete="deleteSide"></comparison-actions>

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
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import BookSeriesService from '@/services/BookSeriesService';
import type { BookSeries } from '@/models/BookSeriesModel';
import PersonPublicationSeriesContributionList from '@/components/core/PersonPublicationSeriesContributionList.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import PublicationSeriesUpdateForm from '@/components/publicationSeries/update/PublicationSeriesUpdateForm.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { ComparisonSide } from '@/models/MergeModel';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';


export default defineComponent({
    name: "BookSeriesMetadataComparator",
    components: { PersonPublicationSeriesContributionList, PublicationSeriesUpdateForm, ComparisonActions },
    setup() {
        const snackbar = ref(false);
        const snackbarMessage = ref("");

        const currentRoute = useRoute();
        const router = useRouter();

        const leftBookSeries = ref<BookSeries>();
        const rightBookSeries = ref<BookSeries>();

        const updateLeftRef = ref<typeof PublicationSeriesUpdateForm>();
        const updateRightRef = ref<typeof PublicationSeriesUpdateForm>();
        
        const i18n = useI18n();

        onMounted(() => {
            document.title = i18n.t("bookSeriesMetadataComparatorLabel");
            fetchBookSeriess();
        });

        const fetchBookSeriess = () => {
            BookSeriesService.readBookSeries(parseInt(currentRoute.params.leftId as string)).then((response) => {
                leftBookSeries.value = response.data;
            });

            BookSeriesService.readBookSeries(parseInt(currentRoute.params.rightId as string)).then((response) => {
                rightBookSeries.value = response.data;
            });
        };

        const mergeBookSeriesMetadata = (bookSeries1: BookSeries, bookSeries2: BookSeries) => {
            bookSeries2.title.forEach(title => {
                let merged = false;
                bookSeries1.title.forEach(currentTitle => {
                    if (currentTitle.languageTag === title.languageTag) {
                        currentTitle.content += " | " + title.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    bookSeries1.title.push(title);
                }
            });

            bookSeries2.nameAbbreviation.forEach(nameAbbreviation => {
                let merged = false;
                bookSeries1.nameAbbreviation.forEach(currentNameAbbreviation => {
                    if (currentNameAbbreviation.languageTag === nameAbbreviation.languageTag) {
                        currentNameAbbreviation.content += " | " + nameAbbreviation.content;
                        merged = true;
                    }
                });
                if (!merged) {
                    bookSeries1.nameAbbreviation.push(nameAbbreviation);
                }
            });
            bookSeries2.nameAbbreviation = [];

            bookSeries1.eissn = bookSeries2.eissn;
            bookSeries2.eissn = "";
            bookSeries1.printISSN = bookSeries2.printISSN;
            bookSeries2.printISSN = "";

            bookSeries2.languageTagIds.forEach(languageTagId => {
                if (!bookSeries1.languageTagIds.includes(languageTagId)) {
                    bookSeries1.languageTagIds.push(languageTagId);
                }
            });
            bookSeries2.languageTagIds = [];

            bookSeries2.uris.forEach(uri => {
                if (!bookSeries1.uris.includes(uri)) {
                    bookSeries1.uris.push(uri);
                }
            });
            bookSeries2.uris = [];

            bookSeries1.contributions = bookSeries1.contributions?.concat(bookSeries2.contributions as PersonPublicationSeriesContribution[]);
            bookSeries2.contributions = [];

            return [bookSeries1, bookSeries2];
        };

        const moveAll = (fromLeftToRight: boolean) => {
            updateLeftRef.value?.submit();
            updateRightRef.value?.submit();

            if (fromLeftToRight) {
                [rightBookSeries.value, leftBookSeries.value] = mergeBookSeriesMetadata(rightBookSeries.value as BookSeries, leftBookSeries.value as BookSeries);
            } else {
                [leftBookSeries.value, rightBookSeries.value] = mergeBookSeriesMetadata(leftBookSeries.value as BookSeries, rightBookSeries.value as BookSeries);
            }

            updateLeftRef.value?.refreshForm();
            updateRightRef.value?.refreshForm();
        };

        const leftUpdateComplete = ref(false);
        const rightUpdateComplete = ref(false);
        const update = ref(false);

        const updateLeft = (updatedBookSeries: BookSeries) => {
            leftBookSeries.value!.title = updatedBookSeries.title;
            leftBookSeries.value!.nameAbbreviation = updatedBookSeries.nameAbbreviation;
            leftBookSeries.value!.eissn = updatedBookSeries.eissn;
            leftBookSeries.value!.printISSN = updatedBookSeries.printISSN;
            leftBookSeries.value!.languageTagIds = updatedBookSeries.languageTagIds;
            leftBookSeries.value!.uris = updatedBookSeries.uris;
            leftUpdateComplete.value = true;
            
            if (update.value) {
                finishUpdates();
            }
        };

        const updateRight = (updatedBookSeries: BookSeries) => {
            rightBookSeries.value!.title = updatedBookSeries.title;
            rightBookSeries.value!.nameAbbreviation = updatedBookSeries.nameAbbreviation;
            rightBookSeries.value!.eissn = updatedBookSeries.eissn;
            rightBookSeries.value!.printISSN = updatedBookSeries.printISSN;
            rightBookSeries.value!.languageTagIds = updatedBookSeries.languageTagIds;
            rightBookSeries.value!.uris = updatedBookSeries.uris;
            rightUpdateComplete.value = true;
            
            if (update.value) {
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

                MergeService.saveMergedBookSeriesMetadata(
                    leftBookSeries.value?.id as number, rightBookSeries.value?.id as number,
                    {
                        leftBookSeries: leftBookSeries.value as BookSeries, 
                        rightBookSeries: rightBookSeries.value as BookSeries
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
            const id = side === ComparisonSide.LEFT ? leftBookSeries.value?.id as number : rightBookSeries.value?.id as number;
            const name = side === ComparisonSide.LEFT ? leftBookSeries.value?.title : rightBookSeries.value?.title;

            const deleteAction = isForceDelete 
                ? BookSeriesService.forceDeleteBookSeries(id)
                : BookSeriesService.deleteBookSeries(id);

            deleteAction.then(() => {
                router.push({ name: "deduplication", query: { tab: "bookSeries" } });
            }).catch(() => {
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            });
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftBookSeries, rightBookSeries,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef,
            updateRight, deleteSide
        };
}})

</script>
