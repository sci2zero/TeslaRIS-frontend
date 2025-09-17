<template>
    <v-row justify="start">
        <v-dialog v-model="dialog" persistent max-width="800px">
            <template #activator="scope">
                <v-btn
                    density="compact" class="bottom-spacer ml-3" v-bind="scope.props"
                    v-on="scope.isActive">
                    {{ $t("addEmployeeLabel") }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ $t("addEmployeeLabel") }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-form v-model="isFormValid" @submit.prevent>
                            <v-row>
                                <v-col>
                                    <person-autocomplete-search
                                        v-model="selectedPerson"
                                        required>
                                    </person-autocomplete-search>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-select
                                        v-model="selectedEmploymentPosition"
                                        :items="employmentPositions"
                                        :label="$t('employmentPositionLabel') + '*'"
                                        :rules="requiredSelectionRules"
                                        return-object>
                                    </v-select>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="dialog = false">
                        {{ $t("closeLabel") }}
                    </v-btn>
                    <v-btn color="blue darken-1" :disabled="!isFormValid" @click="saveEmployment">
                        {{ $t("saveLabel") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script lang="ts">
import { computed, ref } from "vue";
import { defineComponent } from "vue";
import { InvolvementType, type Employment } from "@/models/InvolvementModel";
import InvolvementService from "@/services/InvolvementService";
import { getEmploymentPositionsForGivenLocale } from "@/i18n/employmentPosition";
import { useValidationUtils } from "@/utils/ValidationUtils";
import PersonAutocompleteSearch from "../PersonAutocompleteSearch.vue";


export default defineComponent({
    name: "AddEmploymentModal",
    components: { PersonAutocompleteSearch },
    props: {
        institutionId: {
            type: Number,
            required: true
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const dialog = ref(false);
        const isFormValid = ref(false);

        const searchPlaceholder = {title: "", value: -1};
        const selectedPerson = ref<{ title: string, value: number }>(searchPlaceholder);

        const employmentPositions = computed(() => getEmploymentPositionsForGivenLocale());
        const selectedEmploymentPosition = ref(searchPlaceholder);

        const { requiredSelectionRules } = useValidationUtils();

        const saveEmployment = () => {
            const involvement: Employment = {
                dateFrom: new Date().toJSON().slice(0, 10), // today's date
                dateTo: undefined,
                involvementType: InvolvementType.EMPLOYED_AT,
                affiliationStatement: [],
                organisationUnitId: props.institutionId,
                role: [],
                employmentPosition: selectedEmploymentPosition.value.value
            };

            InvolvementService.addEmployment(involvement, selectedPerson.value.value as number).then(() => {
                emit("update", true);
                dialog.value = false;
            }).catch(() => {
                emit("update", false);
                dialog.value = false;
            });
        };

        return {
            dialog, selectedPerson,
            saveEmployment, isFormValid,
            selectedEmploymentPosition,
            employmentPositions,
            requiredSelectionRules
        };
    }
});
</script>
