<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedJournal.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedJournal"
                :label="$t('journalLabel') + (required ? '*' : '')"
                :items="journals"
                :custom-filter="((): boolean => true)"
                :auto-select-first="true"
                :rules="required ? [...requiredSelectionRules, ...externalValidationRules] : externalValidationRules"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchJournals($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1" style="margin-top: 20px;">
            <publication-series-submission-modal :input-type="inputType" @create="selectNewlyAddedJournal"></publication-series-submission-modal>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedJournal.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import JournalService from '@/services/JournalService';
import type { Journal, JournalIndex } from '@/models/JournalModel';
import { watch } from 'vue';
import { PublicationSeriesType } from '@/models/PublicationSeriesModel';
import PublicationSeriesSubmissionModal from '../publicationSeries/PublicationSeriesSubmissionModal.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';


export default defineComponent({
    name: "JournalAutocompleteSearch",
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

        const inputType = PublicationSeriesType.JOURNAL.toString();

        const journals = ref<{ title: string; value: number; }[]>([]);
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedJournal.value = props.modelValue;
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

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedJournal.value = props.modelValue;
            }
        });

        const searchJournals = lodash.debounce((input: string) => {
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
                JournalService.searchJournals(params).then((response) => {
                    const listOfJournals: { title: string, value: number }[] = [];
                    response.data.content.forEach((journal: JournalIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfJournals.push({title: journal.titleSr, value: journal.databaseId});
                        } else {
                            listOfJournals.push({title: journal.titleOther, value: journal.databaseId});
                        }
                    })
                    journals.value = listOfJournals;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedJournal.value);
        };

        const clearInput = () => {
            selectedJournal.value = searchPlaceholder;
            sendContentToParent();
        };

        const selectNewlyAddedJournal = (journal: Journal) => {
            let title: string | undefined;
            journal.title.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });
            if (!title && journal.title.length > 0) {
                title = journal.title[0].content;
            }
            const toSelect = {title: title as string, value: journal.id as number};
            journals.value.push(toSelect);
            selectedJournal.value = toSelect;
            sendContentToParent();
        };

        return {
            journals, selectedJournal, searchJournals,
            requiredSelectionRules, externalValidationRules,
            sendContentToParent, clearInput, inputType,
            selectNewlyAddedJournal
        };
    }
});
</script>
