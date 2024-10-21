<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetAssessmentRulebook?.name, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row v-if="!isUpdate">
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef" v-model="description" :rules="requiredFieldRules" :label="$t('descriptionLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetAssessmentRulebook?.description, languageTags)"></multilingual-text-input>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                <date-picker
                    v-model="issueDate"
                    :label="$t('issueDateLabel') + '*'"
                    color="primary"
                    required
                ></date-picker>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <publisher-autocomplete-search ref="publisherAutocompleteRef" v-model="selectedPublisher"></publisher-autocomplete-search>
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
import type { MultilingualContent, LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import type { AssessmentRulebook, AssessmentRulebookResponse } from '@/models/AssessmentModel';
import PublisherService from '@/services/PublisherService';
import DatePicker from '@/components/core/DatePicker.vue';
import PublisherAutocompleteSearch from '@/components/publisher/PublisherAutocompleteSearch.vue';


export default defineComponent({
    name: "AssessmentRulebookForm",
    components: { MultilingualTextInput, DatePicker, PublisherAutocompleteSearch },
    props: {
        presetAssessmentRulebook: {
            type: Object as PropType<AssessmentRulebookResponse | undefined>,
            default: undefined
        },
        isUpdate: {
            type: Boolean,
            default: false
        },
    },
    emits: ["create"],
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
            if(props.presetAssessmentRulebook) {
                PublisherService.readPublisher(props.presetAssessmentRulebook.publisherId).then(response => {
                    selectedPublisher.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id as number};
                });
            }
        };

        const nameRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const searchPlaceholder = {title: "", value: -1};
        const selectedPublisher = ref<{ title: string, value: number }>(searchPlaceholder);

        const name = ref<any>([]);
        const description = ref<any>([]);
        const issueDate = ref(props.presetAssessmentRulebook?.issueDate ? props.presetAssessmentRulebook.issueDate : undefined);

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const submit = () => {
            const assessmentRulebook: AssessmentRulebook = {
                name: name.value as MultilingualContent[],
                description: description.value as MultilingualContent[],
                issueDate: issueDate.value as string,
                publisherId: selectedPublisher.value.value < 1 ? undefined : selectedPublisher.value.value as number,
                assessmentMeasureIds: []
            };

            emit("create", assessmentRulebook);
        };

        return {
            isFormValid,
            name, description,
            nameRef, descriptionRef,
            toMultilingualTextInput, issueDate,
            languageTags, requiredFieldRules,
            requiredSelectionRules, submit,
            selectedPublisher
        };
    }
});
</script>
