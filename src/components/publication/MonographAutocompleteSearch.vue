<template>
    <v-row>
        <v-col cols="10">
            <v-autocomplete
                v-model="selectedMonograph"
                :readonly="readOnly"
                :label="$t('monographLabel') + (required ? '*' : '')"
                :items="readOnly ? [] : monographs"
                :custom-filter="((): boolean => true)"
                :rules="required ? requiredSelectionRules : []"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchMonographs($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1">
            <generic-crud-modal
                :form-component="MonographSubmissionForm"
                :form-props="{readOnly: readOnly, inModal: true}"
                entity-name="Monograph"
                is-submission
                :read-only="false"
                @create="selectNewlyAddedMonograph"
            />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import DocumentPublicationService from '@/services/DocumentPublicationService';
import type { DocumentPublicationIndex, Monograph } from '@/models/PublicationModel';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import GenericCrudModal from '../core/GenericCrudModal.vue';
import MonographSubmissionForm from './MonographSubmissionForm.vue';


export default defineComponent({
    name: "MonographAutocompleteSearch",
    components: { GenericCrudModal },
    props: {
        required: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        modelValue: {
            type: Object as PropType<{ title: string, value: number } | undefined>,
            required: true,
        },
        returnOnlyNonSerialMonographs: {
            type: Boolean,
            default: true
        },
        onlyBooks: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update:modelValue"],
    setup(props, {emit}) {
        const i18n = useI18n();
        const searchPlaceholder = {title: "", value: -1};

        const monographs = ref<{ title: string; value: number; date?: string }[]>([]);
        const selectedMonograph = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedMonograph.value = props.modelValue;
            }
            sendContentToParent();
        });
        
        const { requiredSelectionRules } = useValidationUtils();

        const searchMonographs = lodash.debounce((input: string) => {
            if (input.includes("|")) {
                return;
            }
            if (input.length >= 3) {
                let params = "";
                const tokens = input.split(" ");
                tokens.forEach((token) => {
                    params += `tokens=${token}&`
                });
                params = params.slice(0, -1);
                DocumentPublicationService.searchMonographs(params, props.onlyBooks).then((response) => {
                    const listOfMonographs: { title: string, value: number }[] = [];
                    response.data.content.forEach((monograph: DocumentPublicationIndex) => {
                        if (i18n.locale.value.startsWith("sr")) {
                            listOfMonographs.push({title: `${monograph.titleSr} | ${monograph.year !== -1 ? monograph.year : i18n.t("unknownDateMessage")}`, value: monograph.databaseId as number});
                        } else {
                            listOfMonographs.push({title: `${monograph.titleOther} | ${monograph.year !== -1 ? monograph.year : i18n.t("unknownDateMessage")}`, value: monograph.databaseId as number});
                        }
                    })
                    monographs.value = listOfMonographs;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedMonograph.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedMonograph.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedMonograph.value = searchPlaceholder;
            sendContentToParent();
        };

        const selectNewlyAddedMonograph = (monograph: Monograph) => {
            let title: string | undefined;
            monograph.title.forEach(multilingualContent => {
                if(multilingualContent.languageTag === i18n.locale.value.toUpperCase()) {
                    title = multilingualContent.content;
                    return;
                }
            });

            if (!title && monograph.title.length > 0) {
                title = monograph.title[0].content;
            }
            
            const toSelect = {title: `${title} | ${monograph.documentDate}`, value: monograph.id as number};
            monographs.value.push(toSelect);
            selectedMonograph.value = toSelect;
            sendContentToParent();
        };

        return {
            monographs, selectedMonograph, searchMonographs,
            requiredSelectionRules, MonographSubmissionForm,
            sendContentToParent, clearInput,
            selectNewlyAddedMonograph
        };
    }
});
</script>
