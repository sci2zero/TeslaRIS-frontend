<template>
    <v-row>
        <v-col cols="10">
            <v-autocomplete
                v-model="selectedMonograph"
                :readonly="readOnly"
                :label="$t('monographLabel') + (required ? '*' : '')"
                :items="monographs"
                :custom-filter="((): boolean => true)"
                :rules="required ? requiredSelectionRules : []"
                :auto-select-first="true"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchMonographs($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1" class="modal-spacer-top">
            <!-- monograph submission modal -->
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


export default defineComponent({
    name: "MonographAutocompleteSearch",
    components: { },
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
                DocumentPublicationService.searchMonographs(params).then((response) => {
                    const listOfMonographs: { title: string, value: number }[] = [];
                    response.data.content.forEach((monograph: DocumentPublicationIndex) => {
                        if (i18n.locale.value === "sr") {
                            listOfMonographs.push({title: `${monograph.titleSr} | ${monograph.year}`, value: monograph.databaseId as number});
                        } else {
                            listOfMonographs.push({title: `${monograph.titleOther} | ${monograph.year}`, value: monograph.databaseId as number});
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
            
            const toSelect = {title: `${title} | ${extractDate(monograph.documentDate as string)}`, value: monograph.id as number};
            monographs.value.push(toSelect);
            selectedMonograph.value = toSelect;
            sendContentToParent();
        };

        const extractDate = (text: string): string => {
            if (!text) {
                return i18n.t("monographLabel");
            }

            const yyyy_mm_dd_regex = /\b\d{4}-\d{2}-\d{2}\b/g;
            
            let match;
            
            while ((match = yyyy_mm_dd_regex.exec(text)) !== null) {
                return match[0].split("-")[0];
            }

            return text.split(".")[2];
        };

        return {
            monographs, selectedMonograph, searchMonographs,
            requiredSelectionRules,
            sendContentToParent, clearInput,
            selectNewlyAddedMonograph
        };
    }
});
</script>
