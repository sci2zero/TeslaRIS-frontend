<template>
    <v-form v-model="internalValid" @submit.prevent>
        <v-row>
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="localForm.institutionName"
                    :label="$t('institutionNameLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
  
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="localForm.institutionPlace"
                    :label="$t('placeLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
  
            <v-col cols="12" md="6">
                <v-text-field
                    v-model="localForm.schoolYear"
                    :label="$t('schoolYearLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
  
            <v-col cols="12" md="6">
                <v-select
                    v-model="localForm.academicTitle"
                    :label="$t('academicTitleLabel') + '*'"
                    :items="academicTitleOptions"
                    :rules="requiredFieldRules"
                />
            </v-col>
  
            <v-col cols="12" md="6">
                <date-picker
                    v-model="localForm.graduationDate"
                    :label="$t('graduationDateLabel') + '*'"
                    color="primary"
                    required
                ></date-picker>
            </v-col>
        </v-row>
    </v-form>
</template>
  
<script lang="ts">
import { defineComponent, ref, watch, toRefs, computed } from 'vue'
import type { PropType } from 'vue'
import type { PreviousTitleInformation } from '@/models/ThesisLibraryModel'
import DatePicker from '../core/DatePicker.vue'
import { useValidationUtils } from '@/utils/ValidationUtils'
import { getAcademicTitlesForGivenLocale } from '@/i18n/academicTitle'


export default defineComponent({
    name: "PreviousTitleInformationForm",
    components: { DatePicker },
    props: {
        modelValue: {
            type: Object as PropType<PreviousTitleInformation>,
            required: true,
        },
        valid: {
            type: Boolean,
            required: true,
        }
    },
    emits: ["update:modelValue", "update:valid"],
    setup(props, { emit }) {
        const { modelValue, valid } = toRefs(props);

        const internalValid = ref(valid.value);

        const localForm = ref({ ...modelValue.value });

        const { requiredFieldRules } = useValidationUtils();

        const academicTitleOptions = computed(() => getAcademicTitlesForGivenLocale());

        watch(localForm, (newValue) => {
            emit('update:modelValue', newValue);
        }, { deep: true });

        watch(internalValid, (newVal) => {
            emit('update:valid', newVal);
        });

        return {
            localForm,
            internalValid,
            requiredFieldRules,
            academicTitleOptions,
        };
    },
    })
</script>
  