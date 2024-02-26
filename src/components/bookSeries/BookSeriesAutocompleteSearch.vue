<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedBookSeries.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedBookSeries"
                :label="$t('bookSeriesLabel') + (required ? '*' : '')"
                :items="bookSeries"
                :custom-filter="((): boolean => true)"
                :auto-select-first="true"
                :rules="required ? [...requiredSelectionRules, ...externalValidationRules] : externalValidationRules"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchBookSeries($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1" style="margin-top: 20px;">
            <publication-series-submission-modal :input-type="inputType" @create="selectNewlyAddedBookSeries"></publication-series-submission-modal>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedBookSeries.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import BookSeriesService from '@/services/BookSeriesService';
import type { BookSeries, BookSeriesIndex } from '@/models/BookSeriesModel';
import type { PropType } from 'vue';
import { watch } from 'vue';
import PublicationSeriesSubmissionModal from '../publicationSeries/PublicationSeriesSubmissionModal.vue';
import { PublicationSeriesType } from '@/models/PublicationSeriesModel';
import { useValidationUtils } from '@/utils/ValidationUtils';


export default defineComponent({
    name: "BookSeriesAutocompleteSearch",
    components: { PublicationSeriesSubmissionModal },
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
        },
        externalValidation: {
            type: Object as PropType<{ passed: boolean, message: string } | undefined>,
            default: () => ({ passed: true, message: "" })
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const searchPlaceholder = {title: "", value: -1};
        
        const inputType = PublicationSeriesType.BOOK_SERIES.toString();

        const bookSeries = ref<{ title: string; value: number; }[]>([]);
        const selectedBookSeries = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedBookSeries.value = props.modelValue;
            }
            sendContentToParent();
        });

        const i18n = useI18n();
        const { requiredSelectionRules } = useValidationUtils();

        const externalValidationRules = ref([
            () => {
                if (props.externalValidation?.passed == false) return props.externalValidation?.message;
                return true;
            }
        ]);

        watch(() => props.externalValidation, () => {
            externalValidationRules.value = [
                () => {
                    if (props.externalValidation?.passed === false) return props.externalValidation?.message;
                    return true;
                }
            ];
        });

        const searchBookSeries = lodash.debounce((input: string) => {
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
                BookSeriesService.searchBookSeries(params).then((response) => {
                    const listOfBookSeries: { title: string, value: number }[] = [];
                    response.data.content.forEach((bookSeries: BookSeriesIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfBookSeries.push({title: bookSeries.titleSr, value: bookSeries.databaseId});
                        } else {
                            listOfBookSeries.push({title: bookSeries.titleOther, value: bookSeries.databaseId});
                        }
                    })
                    bookSeries.value = listOfBookSeries;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedBookSeries.value);
        };

        const clearInput = () => {
            selectedBookSeries.value = searchPlaceholder;
            sendContentToParent();
        };

        const selectNewlyAddedBookSeries = (newBookSeries: BookSeries) => {
            let title: string | undefined;
            newBookSeries.title.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            if (!title && newBookSeries.title.length > 0) {
                title = newBookSeries.title[0].content;
            }
            const toSelect = {title: title as string, value: newBookSeries.id as number};
            bookSeries.value.push(toSelect);
            selectedBookSeries.value = toSelect;
            sendContentToParent();
        };

        return {
            bookSeries, selectedBookSeries, searchBookSeries,
            requiredSelectionRules, externalValidationRules,
            sendContentToParent, clearInput, inputType,
            selectNewlyAddedBookSeries
        };
    }
});
</script>
