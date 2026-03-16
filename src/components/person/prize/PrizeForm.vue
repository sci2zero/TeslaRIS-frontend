<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="title"
                            :initial-value="toMultilingualTextInput(presetPrize?.title, languageTags)"
                            :label="$t('titleLabel') + '*'"
                            :rules="requiredFieldRules"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="description"
                            :initial-value="toMultilingualTextInput(presetPrize?.description, languageTags)"
                            :label="$t('descriptionLabel')"
                            is-area
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="keywords"
                            :initial-value="toMultilingualTextInput(presetPrize?.keywords, languageTags)"
                            :label="$t('keywordsLabel')"
                            is-area
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <date-picker
                            v-model="dateOfAcquisition"
                            :label="$t('dateOfAcquisitionLabel')"
                            color="primary"
                            persistent
                        ></date-picker>
                    </v-col>
                    <v-col cols="6">
                        <date-picker
                            v-model="endDate"
                            :label="$t('endDateLabel')"
                            color="primary"
                            persistent
                        ></date-picker>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedPrizeType"
                            :items="prizeTypes"
                            :label="$t('prizeTypeLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-checkbox
                            v-model="favorite"
                            :label="$t('favoriteLabel')"
                        ></v-checkbox>
                    </v-col>
                </v-row>
                <h2
                    class="mt-5!">
                    {{ $t("researchAreasLabel") }}
                </h2>
                <v-row>
                    <v-col cols="12">
                        <research-areas-selection
                            ref="researchAreasSelectionRef"
                            :research-areas-hierarchy="presetResearchAreas"
                            submit-on-click
                            @update="saveResearchAreas"
                        />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { type PrizeResponse, PrizeType } from '@/models/PersonModel';
import type { Prize } from '@/models/PersonModel';
import DatePicker from '@/components/core/DatePicker.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { getPrizeTypesForGivenLocale, getPrizeTypeTitleFromValueAutoLocale } from '@/i18n/prizeType';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';
import { type ResearchArea } from '@/models/OrganisationUnitModel';


export default defineComponent({
    name: "PrizeForm",
    components: { MultilingualTextInput, DatePicker, ResearchAreasSelection },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetPrize: {
            type: Object as PropType<PrizeResponse | undefined>,
            required: true
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const { languageTags } = useLanguageTags();

        const { requiredFieldRules } = useValidationUtils();

        const dateOfAcquisition = ref(props.presetPrize?.date);
        const endDate = ref(props.presetPrize?.endDate);
        const favorite = ref(props.presetPrize?.favorite);
        const title = ref([]);
        const description = ref([]);
        const keywords = ref([]);

        const researchAreasSelectionRef = ref<typeof ResearchAreasSelection>();
        const presetResearchAreas = ref<ResearchArea[]>(props.presetPrize?.researchAreas as ResearchArea[]);
        const researchAreaIds = ref<number[]>(props.presetPrize?.researchAreas?.map(researchArea => researchArea.id) as number[]);

        const prizeTypes = computed(() => getPrizeTypesForGivenLocale());
        const selectedPrizeType = ref<{ title: string, value: PrizeType }>(
            props.presetPrize?.prizeType ? 
                {title: getPrizeTypeTitleFromValueAutoLocale(props.presetPrize?.prizeType) as string, value: props.presetPrize?.prizeType} :
                {title: getPrizeTypeTitleFromValueAutoLocale(PrizeType.AWARD) as string, value: PrizeType.AWARD}
        );

        const savePrize = () => {
            const prize: Prize = {
                title: title.value,
                description: description.value,
                keywords: keywords.value,
                date: dateOfAcquisition.value as string,
                endDate: endDate.value as string,
                prizeType: selectedPrizeType.value.value,
                favorite: favorite.value as boolean,
                researchAreasId: researchAreaIds.value
            };

            if(props.edit) {
                prize.id = props.presetPrize?.id;
                emit("update", prize);
            } else {
                emit("create", prize);
            }  
        };

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
        };

        return {
            isFormValid, toMultilingualTextInput, savePrize,
            languageTags, title, requiredFieldRules, prizeTypes,
            dateOfAcquisition, description, keywords, endDate,
            selectedPrizeType, favorite, researchAreasSelectionRef,
            presetResearchAreas, researchAreaIds, saveResearchAreas
        };
    }
});
</script>
