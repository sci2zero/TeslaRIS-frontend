<template>
    <v-form v-model="localValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-text-field
                    v-model="formValue.dissertationTitle"
                    :label="$t('dissertationTitleLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <organisation-unit-autocomplete-search
                    ref="ouAutocompleteRef"
                    v-model:model-value="selectedOrganisationUnit"
                    readonly
                    disable-submission
                    required>
                </organisation-unit-autocomplete-search>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.institutionPlace"
                    :label="$t('institutionPlaceLabel')"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-textarea
                    v-model="formValue.mentor"
                    :label="$t('mentorLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-textarea
                    v-model="formValue.commission"
                    :label="$t('commissionLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.grade"
                    :label="$t('gradeLabel')"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <date-picker
                    v-model="formValue.defenceDate"
                    :label="$t('defenceDateLabel') + '*'"
                    color="primary"
                    required
                ></date-picker>
            </v-col>
            <v-col cols="12">
                <v-text-field
                    v-model="formValue.acquiredTitle"
                    :label="$t('acquiredTitleLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.diplomaNumber"
                    :label="$t('diplomaNumberLabel')"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <date-picker
                    v-model="formValue.diplomaIssueDate"
                    :label="$t('diplomaIssueDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.diplomaSupplementsNumber"
                    :label="$t('diplomaSupplementsNumberLabel')"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <date-picker
                    v-model="formValue.diplomaSupplementsIssueDate"
                    :label="$t('diplomaSupplementsIssueDateLabel')"
                    color="primary"
                ></date-picker>
            </v-col>
        </v-row>
    </v-form>
</template>
  
<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted } from "vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
import type { DissertationInformation } from "@/models/ThesisLibraryModel";
import OrganisationUnitService from "@/services/OrganisationUnitService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import DatePicker from "../core/DatePicker.vue";
import OrganisationUnitAutocompleteSearch from "../organisationUnit/OrganisationUnitAutocompleteSearch.vue";


export default defineComponent({
    name: "DissertationInformationForm",
    components: { DatePicker, OrganisationUnitAutocompleteSearch },
    props: {
        modelValue: {
            type: Object as PropType<DissertationInformation>,
            required: true,
        },
        valid: {
            type: Boolean,
            required: true,
        },
        isUpdate: {
            type: Boolean,
            default: false
        }
    },
    emits: ["update:modelValue", "update:valid"],
    setup(props, { emit }) {
        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();
        const localValid = ref(true);

        const formValue = computed({
            get: () => props.modelValue,
            set: (val) => emit("update:modelValue", val),
        });

        onMounted(() => {
            if (props.modelValue.organisationUnitId > 0) {
                OrganisationUnitService.readOU(props.modelValue.organisationUnitId)
                .then(response => {
                    selectedOrganisationUnit.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id};
                });
            }
        });

        const selectedOrganisationUnit = ref<{title: string, value: number}>();
        watch(selectedOrganisationUnit, () => {
            if (selectedOrganisationUnit.value) {
                formValue.value.organisationUnitId = selectedOrganisationUnit.value.value;
            }
        });

        watch(localValid, (val) => {
            emit("update:valid", val);
        });

        watch(() => formValue.value.diplomaIssueDate, () => {
            if (formValue.value.diplomaIssueDate && !formValue.value.diplomaSupplementsIssueDate) {
                formValue.value.diplomaSupplementsIssueDate = formValue.value.diplomaIssueDate;
            }
        });

        return {
            formValue,
            selectedOrganisationUnit,
            requiredFieldRules,
            requiredSelectionRules,
            localValid
        };
    },
});
</script>
  