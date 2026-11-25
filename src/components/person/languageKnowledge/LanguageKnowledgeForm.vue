<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <div class="space-y-4">
            <v-select
                v-model="selectedLanguage"
                :items="languageList"
                :label="$t('languageLabel') + '*'"
                :rules="requiredSelectionRules"
                return-object
            />
            <div>
                <ui-checkbox
                    v-model="motherTongue"
                    :label="$t('motherTongueLabel')"
                    :disabled="motherTongueTaken"
                />
                <p v-if="motherTongueTaken" class="mt-1 text-xs text-slate-500">
                    {{ $t("motherTongueAlreadyExistsMessage") }}
                </p>
            </div>
        </div>

        <div>
            <h2 class="mt-5 mb-3 text-sm font-semibold text-slate-800">
                {{ $t("languageLevelsLabel") }}
            </h2>
            <v-row>
                <v-col v-for="level in levels" :key="level.key" cols="12" md="6">
                    <v-select
                        v-model="level.value.value"
                        :items="languageLevels"
                        :label="$t(level.labelKey)"
                        clearable
                    />
                </v-col>
            </v-row>
        </div>

        <div class="mt-4">
            <p class="text-xs text-slate-500">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </div>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, onMounted, type PropType, ref } from 'vue';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { LanguageResponse } from '@/models/Common';
import type { LanguageKnowledge, LanguageKnowledgeResponse, LanguageLevel } from '@/models/PersonModel';
import UiCheckbox from '@/components/ui/checkbox/Checkbox.vue';


export default defineComponent({
    name: "LanguageKnowledgeForm",
    components: { UiCheckbox },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        presetLanguageKnowledge: {
            type: Object as PropType<LanguageKnowledgeResponse | undefined>,
            default: undefined
        },
        motherTongueTaken: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const { requiredSelectionRules } = useValidationUtils();

        // The levels are CEFR codes, so they stay as they are in every language.
        const languageLevels: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

        const languageList = ref<{ title: string, value: number }[]>([]);
        const selectedLanguage = ref<{ title: string, value: number } | null>(null);

        const motherTongue = ref(props.presetLanguageKnowledge?.motherTongue ?? false);

        const reading = ref(props.presetLanguageKnowledge?.reading);
        const writing = ref(props.presetLanguageKnowledge?.writing);
        const speaking = ref(props.presetLanguageKnowledge?.speaking);
        const listening = ref(props.presetLanguageKnowledge?.listening);
        const academicReview = ref(props.presetLanguageKnowledge?.academicReview);
        const academicWriting = ref(props.presetLanguageKnowledge?.academicWriting);
        const overall = ref(props.presetLanguageKnowledge?.overall);

        const levels = [
            { key: "overall", labelKey: "overallLevelLabel", value: overall },
            { key: "reading", labelKey: "readingLevelLabel", value: reading },
            { key: "writing", labelKey: "writingLevelLabel", value: writing },
            { key: "speaking", labelKey: "speakingLevelLabel", value: speaking },
            { key: "listening", labelKey: "listeningLevelLabel", value: listening },
            { key: "academicReview", labelKey: "academicReviewLevelLabel", value: academicReview },
            { key: "academicWriting", labelKey: "academicWritingLevelLabel", value: academicWriting }
        ];

        onMounted(() => {
            LanguageService.getAllLanguages().then((response: AxiosResponse<LanguageResponse[]>) => {
                languageList.value = response.data.map(language => ({
                    title: `${returnCurrentLocaleContent(language.name)} (${language.languageCode})`,
                    value: language.id
                }));

                const presetId = props.presetLanguageKnowledge?.language?.id;

                if (presetId) {
                    selectedLanguage.value = languageList.value.find(
                        language => language.value === presetId) ?? null;
                }
            });
        });

        const saveLanguageKnowledge = () => {
            const languageKnowledge: LanguageKnowledge = {
                languageId: selectedLanguage.value?.value as number,
                motherTongue: motherTongue.value,
                reading: reading.value,
                writing: writing.value,
                speaking: speaking.value,
                listening: listening.value,
                academicReview: academicReview.value,
                academicWriting: academicWriting.value,
                overall: overall.value
            };

            if (props.edit) {
                languageKnowledge.id = props.presetLanguageKnowledge?.id;
                emit("update", languageKnowledge);
            } else {
                emit("create", languageKnowledge);
            }
        };

        return {
            isFormValid, requiredSelectionRules, languageLevels, languageList,
            selectedLanguage, motherTongue, levels, saveLanguageKnowledge
        };
    }
});
</script>
