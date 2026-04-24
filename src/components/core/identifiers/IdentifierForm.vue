<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="titleRef"
                    v-model="title"
                    :rules="requiredFieldRules"
                    :label="$t('titleLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetIdentifier?.title, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    :rules="requiredFieldRules"
                    :label="$t('descriptionLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetIdentifier?.description, languageTags)"
                    is-area
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="code"
                    :label="$t('codeLabel') + '*'"
                    :placeholder="$t('codeLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="regularExpression"
                    :label="$t('regularExpressionLabel') + '*'"
                    :placeholder="$t('regularExpressionLabel') + '*'"
                    :rules="regexValidationRules"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="uriPrefix"
                    :label="$t('uriPrefixLabel') + '*'"
                    :placeholder="$t('uriPrefixLabel') + '*'"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedAccessLevel"
                    :items="accessLevels"
                    :label="$t('accessLevelLabel') + '*'"
                    :rules="requiredSelectionRules"
                    return-object
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-select
                    v-model="selectedApplicableTypes"
                    :items="applicableTypes"
                    :label="$t('applicableTypeLabel') + '*'"
                    :rules="requiredMultiSelectionRules"
                    return-object
                    multiple
                />
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
import { AccessLevel, ApplicableEntityType } from '@/models/Common';
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { type Identifier, type IdentifierResponse } from '@/models/IdentifierModel';
import { getAccessLevelForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/accessLevel';
import IdentifierService from '@/services/IdentifierService';
import { getApplicableEntityTypesForGivenLocale, getApplicableEntityTypeTitleFromValueAutoLocale } from '@/i18n/applicableEntityType';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "IdentifierForm",
    components: {MultilingualTextInput},
    props: {
        presetIdentifier: {
            type: Object as PropType<IdentifierResponse | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            fetchDetails();
        });

        const fetchDetails = () => {
            if(props.presetIdentifier) {
                IdentifierService.fetchIdentifierAccessLevel(
                    props.presetIdentifier.id
                ).then(response => {
                    selectedAccessLevel.value = {
                        title: getTitleFromValueAutoLocale(response.data) as string,
                        value: response.data
                    };
                });

                selectedApplicableTypes.value = [];
                props.presetIdentifier.applicableEntityTypes.forEach(applicableType => {
                    selectedApplicableTypes.value.push(
                        {
                            title: getApplicableEntityTypeTitleFromValueAutoLocale(applicableType) as string,
                            value: applicableType
                        });
                });
            }
        };

        const titleRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();

        const accessLevels = getAccessLevelForGivenLocale();
        const selectedAccessLevel = ref<{ title: string, value: AccessLevel }>(
            {title: getTitleFromValueAutoLocale(AccessLevel.OPEN) as string, value: AccessLevel.OPEN});

        const applicableTypes = getApplicableEntityTypesForGivenLocale();
        const selectedApplicableTypes = ref<{ title: string, value: ApplicableEntityType }[]>([
            {title: getApplicableEntityTypeTitleFromValueAutoLocale(ApplicableEntityType.ALL) as string, value: ApplicableEntityType.ALL}]);

        const title = ref<any>([]);
        const description = ref<any>([]);
        const code = ref<string>(props.presetIdentifier ? props.presetIdentifier.code as string : "");
        const regularExpression = ref<string>(props.presetIdentifier ? props.presetIdentifier.regularExpression as string : "");
        const uriPrefix = ref<string>(props.presetIdentifier ? props.presetIdentifier.uriPrefix as string : "");

        const {
            requiredFieldRules,
            requiredSelectionRules,
            requiredMultiSelectionRules,
            regexValidationRules
        } = useValidationUtils();

        const submit = () => {
            const identifier: Identifier = {
                code: code.value,
                title: title.value,
                description: description.value,
                identifierAccessLevel: selectedAccessLevel.value.value,
                applicableTypes: selectedApplicableTypes.value.map(applicableTypeObject => applicableTypeObject.value),
                regularExpression: regularExpression.value,
                uriPrefix: uriPrefix.value
            };

            emit("create", identifier);
        };

        return {
            isFormValid, title, description,
            titleRef, descriptionRef,
            toMultilingualTextInput,
            languageTags, selectedAccessLevel,
            requiredFieldRules, code, submit,
            accessLevels, requiredSelectionRules,
            applicableTypes, selectedApplicableTypes,
            regularExpression, uriPrefix,
            requiredMultiSelectionRules,
            regexValidationRules
        };
    }
});
</script>
