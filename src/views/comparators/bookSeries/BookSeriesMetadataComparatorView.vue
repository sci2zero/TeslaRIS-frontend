<template>
    <v-container id="bookSeries-publications-comparator">
        <v-row class="d-flex flex-row justify-center align-start">
            <v-col cols="5">
                <h2 class="d-flex flex-row justify-center">
                    {{ returnCurrentLocaleContent(leftBookSeries?.title) }}
                </h2>
                <br />

                <publication-series-update-form
                    ref="updateLeftRef" input-type="JOURNAL" :preset-publication-series="leftBookSeries" :in-modal="false"
                    @update="updateLeft"></publication-series-update-form>

                <br />

                <!-- Left Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list
                            :publication-series-id="leftBookSeries?.id"
                            :contribution-list="leftBookSeries?.contributions ? leftBookSeries.contributions : []"
                            in-comparator
                            :can-reorder="true">
                        </person-publication-series-contribution-list>
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

                <publication-series-update-form
                    ref="updateRightRef" input-type="JOURNAL" :preset-publication-series="rightBookSeries" :in-modal="false"
                    @update="updateRight"></publication-series-update-form>

                <br />

                <!-- Right Contributions Table -->
                <v-card class="pa-3" variant="flat" color="grey-lighten-5">
                    <v-card-text class="edit-pen-container">
                        <!-- <publication-series-contribution-update-modal :read-only="false" :preset-publication-series-contributions="leftContributions"></publication-series-contribution-update-modal> -->

                        <div>
                            <b>{{ $t("contributionsLabel") }}</b>
                        </div>

                        <person-publication-series-contribution-list
                            :publication-series-id="rightBookSeries?.id"
                            :contribution-list="rightBookSeries?.contributions ? rightBookSeries.contributions : []"
                            in-comparator
                            :can-reorder="true">
                        </person-publication-series-contribution-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <comparison-actions
            :is-form-valid="updateLeftRef?.isFormValid && updateRightRef?.isFormValid"
            supports-force-delete
            aggregated-entities-comparison-page="bookSeriesPublicationsComparator"
            :left-id="(leftBookSeries?.id as number)"
            :right-id="(rightBookSeries?.id as number)"
            :entity-type="EntityType.BOOK_SERIES"
            @update="updateAll"
            @delete="deleteSide">
        </comparison-actions>

        <toast v-model="snackbar" :message="snackbarMessage" />
    </v-container>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { mergeMultilingualContentField, returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import BookSeriesService from '@/services/BookSeriesService';
import type { BookSeries } from '@/models/BookSeriesModel';
import PersonPublicationSeriesContributionList from '@/components/core/PersonPublicationSeriesContributionList.vue';
import type { PersonPublicationSeriesContribution } from '@/models/PublicationSeriesModel';
import PublicationSeriesUpdateForm from '@/components/publicationSeries/update/PublicationSeriesUpdateForm.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { ComparisonSide, EntityType } from '@/models/MergeModel';
import MergeService from '@/services/MergeService';
import ComparisonActions from '@/components/core/comparators/ComparisonActions.vue';
import Toast from '@/components/core/Toast.vue';
import { bulkTransferFields } from '@/utils/FieldTransferUtil';


export default defineComponent({
    name: "BookSeriesMetadataComparator",
    components: { PersonPublicationSeriesContributionList, PublicationSeriesUpdateForm, ComparisonActions, Toast },
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
            mergeMultilingualContentField(bookSeries1.title, bookSeries2.title);
            mergeMultilingualContentField(bookSeries1.subtitle, bookSeries2.subtitle);

            mergeMultilingualContentField(bookSeries1.nameAbbreviation, bookSeries2.nameAbbreviation);
            bookSeries2.nameAbbreviation = [];

            bulkTransferFields(bookSeries1, bookSeries2, [
                { fieldName: "eissn", emptyValue: "" },
                { fieldName: "printISSN", emptyValue: "" },
                { fieldName: "openAlexId", emptyValue: "" }
            ]);

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
            leftBookSeries.value!.subtitle = updatedBookSeries.subtitle;
            leftBookSeries.value!.openAlexId = updatedBookSeries.openAlexId;
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
            rightBookSeries.value!.subtitle = updatedBookSeries.subtitle;
            rightBookSeries.value!.openAlexId = updatedBookSeries.openAlexId;
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

        const deleteSide = async (side: ComparisonSide, isForceDelete = false) => {
            const id = side === ComparisonSide.LEFT ? leftBookSeries.value?.id as number : rightBookSeries.value?.id as number;
            const name = side === ComparisonSide.LEFT ? leftBookSeries.value?.title : rightBookSeries.value?.title;
            const transferTargetId = side === ComparisonSide.LEFT ? rightBookSeries.value?.id : leftBookSeries.value?.id;

            try {
                const deleteAction = isForceDelete 
                    ? BookSeriesService.forceDeleteBookSeries(id)
                    : BookSeriesService.deleteBookSeries(id);

                await deleteAction;

                await MergeService.switchAllIndicatorsToOtherBookSeries(id as number, transferTargetId as number);

                router.push({ name: "bookSeriesLandingPage", params: { id: transferTargetId } });
            } catch {
                snackbarMessage.value = i18n.t("deleteFailedNotification", { name: returnCurrentLocaleContent(name) });
                snackbar.value = true;
            }
        };

        return {
            returnCurrentLocaleContent,
            snackbar, snackbarMessage,
            leftBookSeries, rightBookSeries,
            moveAll, updateAll, updateLeft,
            updateLeftRef, updateRightRef,
            updateRight, deleteSide, EntityType
        };
}})

</script>
