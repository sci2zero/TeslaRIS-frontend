<template>
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
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import JournalService from '@/services/JournalService';
import type { JournalIndex } from '@/models/JournalModel';
import { watch } from 'vue';


export default defineComponent({
    name: "JournalAutocompleteSearch",
    props: {
        required: {
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

        const journals = ref<{ title: string; value: number; }[]>([]);
        const selectedJournal = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedJournal.value = props.modelValue;
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

        return {
            journals, selectedJournal, searchJournals,
            requiredSelectionRules, externalValidationRules,
            sendContentToParent, clearInput
        };
    }
});
</script>
