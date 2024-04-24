<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <organisation-unit-autocomplete-search ref="orgUnitAutocompleteRef" v-model:model-value="selectedOrganisationUnit" required></organisation-unit-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="affiliationStatement" :initial-value="toMultilingualTextInput(presetInvolvement?.affiliationStatement, languageList)" :label="$t('affiliationStatementLabel')" is-area></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-text-field v-model="dateFrom" type="date" :label="$t('fromLabel')"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="dateTo" type="date" :label="$t('toLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedInvolvementType"
                            hide-details="auto"
                            :items="involvementTypes"
                            :rules="requiredSelectionRules"
                            :label="$t('involvementTypeLabel') + '*'"
                            return-object
                        ></v-select>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
            
        <v-row>
            <p style="margin-left: 20px;">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { toMultilingualTextInput } from '@/i18n/TranslationUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { getInvolvementTypesForGivenLocale } from '@/i18n/involvementType';
import type { Education, Employment, Involvement, InvolvementType, Membership } from '@/models/InvolvementModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';


export default defineComponent({
    name: "PersonInvolvementForm",
    components: { MultilingualTextInput, OrganisationUnitAutocompleteSearch },
    props: {
        edit: {
            type: Boolean,
            default: false
        },
        readOnly: {
            type: Boolean,
            default: false
        },
        presetInvolvement: {
            type: Object as PropType<Education | Membership | Employment | undefined>,
            required: true
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const languageList = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });

            
        });

        const { requiredSelectionRules } = useValidationUtils();

        const dateFrom = ref("");
        const dateTo = ref("");
        const affiliationStatement = ref([]);

        const involvementTypes = getInvolvementTypesForGivenLocale();
        const selectedInvolvementType = ref<{title: string, value: InvolvementType}>();

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const submitInvolvement = () => {
            const involvement: Involvement = {
                dateFrom: dateFrom.value,
                dateTo: dateTo.value,
                involvementType: selectedInvolvementType.value?.value as InvolvementType,
                affiliationStatement: affiliationStatement.value,
                organisationUnitId: -1
            };
            
            if(props.edit) {
                emit("update", involvement);
            } else {
                emit("create", involvement);
            }
            
        };

        return {
            isFormValid, toMultilingualTextInput, involvementTypes,
            dateFrom, dateTo, submitInvolvement, affiliationStatement,
            languageList, selectedInvolvementType, requiredSelectionRules,
            ouAutocompleteRef, selectedOrganisationUnit
        };
    }
});
</script>
