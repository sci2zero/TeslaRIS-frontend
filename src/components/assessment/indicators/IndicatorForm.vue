<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef" v-model="title" :rules="requiredFieldRules" :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetIndicator?.title, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef" v-model="description" :rules="requiredFieldRules" :label="$t('descriptionLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetIndicator?.description, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="code" :label="$t('codeLabel')" :placeholder="$t('codeLabel') + '*'" :rules="requiredFieldRules"></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedAccessLevel"
                    :items="accessLevels"
                    :label="$t('accessLevelLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object>
                </v-select>
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
import { defineComponent, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { AccessLevel, type LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { IndicatorRequest, IndicatorResponse } from '@/models/AssessmentModel';
import { getAccessLevelForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/accessLevel';
import IndicatorService from '@/services/assessment/IndicatorService';


export default defineComponent({
    name: "IndicatorForm",
    components: {MultilingualTextInput},
    props: {
        presetIndicator: {
            type: Object as PropType<IndicatorResponse | undefined>,
            default: undefined
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const languageTags = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageTags.value = response.data;
            });

            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetIndicator) {
                IndicatorService.fetchIndicatorAccessLevel(props.presetIndicator.id).then(response => {
                    selectedAccessLevel.value = {title: getTitleFromValueAutoLocale(response.data) as string, value: response.data};
                });
            }
        };

        const titleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const accessLevels = getAccessLevelForGivenLocale();
        const selectedAccessLevel = ref<{ title: string, value: AccessLevel }>({title: getTitleFromValueAutoLocale(AccessLevel.OPEN) as string, value: AccessLevel.OPEN});

        const title = ref<any>([]);
        const description = ref<any>([]);
        const code = ref<string>(props.presetIndicator ? props.presetIndicator.code as string : "");

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const submit = () => {
            const indicator: IndicatorRequest = {
                code: code.value,
                title: title.value,
                description: description.value,
                indicatorAccessLevel: selectedAccessLevel.value.value
            };

            emit("update", indicator);
        };

        return {
            isFormValid,
            title, description,
            titleRef, descriptionRef,
            toMultilingualTextInput,
            languageTags, selectedAccessLevel,
            requiredFieldRules, code, submit,
            accessLevels, requiredSelectionRules
        };
    }
});
</script>
