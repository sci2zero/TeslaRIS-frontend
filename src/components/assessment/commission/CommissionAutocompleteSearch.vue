<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedCommission.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedCommission"
                :readonly="readOnly"
                :label="$t('commissionLabel') + (required ? '*' : '')"
                :items="commissions"
                :custom-filter="((): boolean => true)"
                :rules="required ? requiredSelectionRules : []"
                :auto-select-first="true"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchCommissions"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedCommission.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import CommissionService from '@/services/assessment/CommissionService';
import type { CommissionResponse } from '@/models/AssessmentModel';
import type { MultilingualContent } from '@/models/Common';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "CommissionAutocompleteSearch",
    props: {
        required: {
            type: Boolean,
            default: false
        },
        readOnly: {
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
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const commissions = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedCommission = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedCommission.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules } = useValidationUtils();

        const searchCommissions = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                const params = `searchExpression=${input}&page=0&size=5`;
                CommissionService.fetchAllCommissions(params).then((response) => {
                    const listOfCommissions: { title: string, value: number, date?: string }[] = [];
                    response.data.content.forEach((commission: CommissionResponse) => {
                        listOfCommissions.push({title: `${returnCurrentLocaleContent(commission.description)} | ${commission.formalDescriptionOfRule}`, value: commission.id});
                    })
                    commissions.value = listOfCommissions;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedCommission.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedCommission.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedCommission.value = searchPlaceholder;
            sendContentToParent();
        };

        const selectNewlyAddedCommission = (commission: CommissionResponse) => {
            let title: string | undefined;
            commission.description.forEach((multilingualContent: MultilingualContent) => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });

            if (!title && commission.description.length > 0) {
                title = commission.description[0].content;
            }
            
            const toSelect = {title: `${title} | ${commission.formalDescriptionOfRule}`, value: commission.id as number};
            commissions.value.push(toSelect);
            selectedCommission.value = toSelect;
            sendContentToParent();
        };

        return {
            commissions, selectedCommission, searchCommissions,
            requiredSelectionRules,
            sendContentToParent, clearInput,
            selectNewlyAddedCommission
        };
    }
});
</script>
