<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <multilingual-text-input
                    ref="nameRef"
                    v-model="name"
                    :rules="requiredFieldRules"
                    :label="$t('nameLabel') + '*'"
                    :initial-value="toMultilingualTextInput(presetEmploymentPosition?.name, languageTags)"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="processedName"
                    :label="$t('processedNameLabel') + '*'"
                    :placeholder="$t('processedNameLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field
                    v-model="schemeName"
                    :label="$t('schemeNameLabel') + '*'"
                    :placeholder="$t('schemeNameLabel') + '*'"
                    :rules="requiredFieldRules"
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
import { onMounted } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { type EmploymentPositionHierarchy } from '@/models/InvolvementModel';


export default defineComponent({
    name: "EmploymentPositionForm",
    components: { MultilingualTextInput },
    props: {
        presetEmploymentPosition: {
            type: Object as PropType<EmploymentPositionHierarchy | undefined>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const { languageTags } = useLanguageTags();

        onMounted(() => {
            setDetails();
        });

        const setDetails = () => {
            if(props.presetEmploymentPosition?.superEmploymentPositionId) {
                selectedEmploymentPosition.value = {title: returnCurrentLocaleContent(props.presetEmploymentPosition.superEmploymentPositionName) as string, value: props.presetEmploymentPosition.superEmploymentPositionId};
            }
        };

        const nameRef = ref<typeof MultilingualTextInput>();

        const name = ref<any>([]);
        const processedName = ref<string>(props.presetEmploymentPosition?.processedName ?? "");
        const schemeName = ref<string>(props.presetEmploymentPosition?.schemeName ?? "");

        const searchPlaceholder = {title: "", value: -1};
        const selectedEmploymentPosition = ref<{ title: string, value: number }>(searchPlaceholder);

        const { requiredFieldRules } = useValidationUtils();

        const submit = () => {
            const employmentPosition: EmploymentPositionHierarchy = {
                name: name.value,
                processedName: processedName.value,
                schemeName: schemeName.value,
                superEmploymentPositionId: selectedEmploymentPosition.value.value > 0 ? selectedEmploymentPosition.value.value : undefined
            };

            emit("create", employmentPosition);
        };

        return {
            isFormValid,
            name, schemeName,
            nameRef, processedName,
            toMultilingualTextInput,
            languageTags, requiredFieldRules,
            selectedEmploymentPosition, submit
        };
    }
});
</script>
