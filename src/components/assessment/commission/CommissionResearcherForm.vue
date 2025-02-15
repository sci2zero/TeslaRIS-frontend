<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col>
                <person-autocomplete-search v-model="selectedPerson" required disable-submission :institution-id="institutionId"></person-autocomplete-search>
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
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import AssessmentResearchAreaService from '@/services/assessment/AssessmentResearchAreaService';
import PersonAutocompleteSearch from '@/components/person/PersonAutocompleteSearch.vue';


export default defineComponent({
    name: "AssessmentResearchAreaForm",
    components: { PersonAutocompleteSearch },
    props: {
        commissionId: {
            type: Number,
            required: true
        },
        presetResearchArea: {
            type: String,
            required: true
        },
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);

        const searchPlaceholder = {title: "", value: -1};
        const selectedPerson = ref<{ title: string, value: number }>(searchPlaceholder);

        const { requiredStringSelectionRules } = useValidationUtils();

        const submit = () => {
            AssessmentResearchAreaService.setPersonAssessmentResearchAreaForCommission(selectedPerson.value.value, props.presetResearchArea, props.commissionId).then(() => {
                emit("create");
            });
        };

        return {
            isFormValid,
            selectedPerson, submit,
            requiredStringSelectionRules
        };
    }
});
</script>
