<template>
    <v-autocomplete
        v-model="selectedBookSeries"
        :label="$t('bookSeriesLabel') + (required ? '*' : '')"
        :items="bookSeries"
        :custom-filter="((): boolean => true)"
        :auto-select-first="true"
        :rules="required ? requiredSelectionRules : []"
        :no-data-text="$t('noDataMessage')"
        return-object
        @update:search="searchBookSeries($event)"
        @update:model-value="sendContentToParent"
    ></v-autocomplete>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import BookSeriesService from '@/services/BookSeriesService';
import type { BookSeriesIndex } from '@/models/BookSeriesModel';
import type { PropType } from 'vue';


export default defineComponent({
    name: "BookSeriesAutocompleteSearch",
    props: {
        required: {
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
        const searchPlaceholder = {title: "", value: -1};

        const bookSeries = ref<{ title: string; value: number; }[]>([]);
        const selectedBookSeries = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue) {
                selectedBookSeries.value = props.modelValue;
            }
            sendContentToParent();
        });

        const i18n = useI18n();
        const requiredFieldMessage = computed(() => i18n.t("mandatoryFieldError"));
        const requiredSelectionRules = [
            (value: { title: string, value: number } | number) => {
                if (!value || (value as { title: string, value: number }).value === -1) return requiredFieldMessage.value;
                return true;
            }
        ];

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

        return {
            bookSeries, selectedBookSeries, searchBookSeries,
            requiredSelectionRules,
            sendContentToParent, clearInput
        };
    }
});
</script>
