<template>
    <v-row>
        <v-col :cols="allowManualClearing && selectedResearchArea.value !== -1 ? 10 : 11">
            <v-autocomplete
                v-model="selectedResearchArea"
                :label="$t('researchAreaLabel')"
                :items="researchAreas"
                :custom-filter="((): boolean => true)"
                :auto-select-first="true"
                :no-data-text="$t('noDataMessage')"
                return-object
                @update:search="searchResearchAreas($event)"
                @update:model-value="sendContentToParent"
            ></v-autocomplete>
        </v-col>
        <v-col cols="1">
            <v-btn v-show="allowManualClearing && selectedResearchArea.value !== -1" icon @click="clearInput()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import lodash from "lodash";
import ResearchAreaService from '@/services/ResearchAreaService';
import type { ResearchAreaResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';


export default defineComponent({
    name: "ResearchAreaAutocompleteSearch",
    props: {
        allowManualClearing: {
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

        const researchAreas = ref<{ title: string; value: number; }[]>([]);
        const selectedResearchArea = ref<{ title: string, value: number }>(searchPlaceholder);

        onMounted(() => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedResearchArea.value = props.modelValue;
            }
            sendContentToParent();
        });

        const searchResearchAreas = lodash.debounce((input: string) => {
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
                ResearchAreaService.searchResearchAreas(params).then((response) => {
                    const listOfResearchAreas: { title: string, value: number }[] = [];
                    response.data.content.forEach((researchArea: ResearchAreaResponse) => {
                        listOfResearchAreas.push({title: returnCurrentLocaleContent(researchArea.name) as string, value: researchArea.id as number});
                    })
                    researchAreas.value = listOfResearchAreas;
                });
            }
        }, 300);

        const sendContentToParent = () => {
            emit("update:modelValue", selectedResearchArea.value);
        };

        watch(() => props.modelValue, () => {
            if(props.modelValue && props.modelValue.value !== -1) {
                selectedResearchArea.value = props.modelValue;
            }
        });

        const clearInput = () => {
            selectedResearchArea.value = searchPlaceholder;
            sendContentToParent();
        };

        return {
            researchAreas, selectedResearchArea, searchResearchAreas,
            sendContentToParent, clearInput
        };
    }
});
</script>
