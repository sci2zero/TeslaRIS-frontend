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

        <v-row v-if="selectedInvolvementType?.value === 'STUDIED_AT' || selectedInvolvementType?.value === 'POSTDOC_AT' || selectedInvolvementType?.value === 'COMPLETED_COURSE_AT'">
            <v-col>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="title" :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).title : [], languageList)" :label="$t('academicTitleLabel') + '*'" :rules="requiredFieldRules"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="abbreviationTitle" :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).abbreviationTitle : [], languageList)" :label="$t('abbreviationTitleLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="thesisTitle" :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).thesisTitle : [], languageList)" :label="$t('thesisTitleLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-row v-if="selectedInvolvementType?.value === 'MEMBER_OF'">
            <v-col>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="contributionDescription" :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).contributionDescription : [], languageList)" :label="$t('contributionDescriptionLabel')" is-area></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="role" :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).role : [], languageList)" :label="$t('roleLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-row v-if="selectedInvolvementType?.value === 'EMPLOYED_AT' || selectedInvolvementType?.value === 'HIRED_BY'">
            <v-col>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedEmploymentPosition"
                            :items="employmentPositions"
                            :label="$t('employmentPositionLabel')"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="role" :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).role : [], languageList)" :label="$t('roleLabel')"></multilingual-text-input>
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
import { computed, defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import type { LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/TranslationUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { getInvolvementTypesForGivenLocale, getInvolvementTypeTitleFromValueAutoLocale } from '@/i18n/involvementType';
import { InvolvementType, type Education, type Employment, type Involvement, type Membership } from '@/models/InvolvementModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { getEmploymentPositionsForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import type { EmploymentPosition } from '@/models/PersonModel';


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

            if(props.presetInvolvement?.organisationUnitId) {
                selectedOrganisationUnit.value = {title: returnCurrentLocaleContent(props.presetInvolvement.organisationUnitName) as string, value: props.presetInvolvement?.organisationUnitId as number};
            }

            if(props.presetInvolvement && (props.presetInvolvement as Employment).employmentPosition) {
                selectedEmploymentPosition.value = {title: getTitleFromValueAutoLocale((props.presetInvolvement as Employment).employmentPosition as EmploymentPosition) as string, value: (props.presetInvolvement as Employment).employmentPosition};
            }
        });

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const dateFrom = ref(props.presetInvolvement?.dateFrom);
        const dateTo = ref(props.presetInvolvement?.dateTo);
        const affiliationStatement = ref([]);
        const contributionDescription = ref([]);
        const role = ref([]);
        const title = ref([]);
        const abbreviationTitle = ref([]);
        const thesisTitle = ref([]);

        const selectionPlaceholder: { title: string, value: any } = { title: "", value: undefined };

        const involvementTypes = getInvolvementTypesForGivenLocale();
        const selectedInvolvementType = ref<{title: string, value: InvolvementType}>(props.presetInvolvement?.involvementType ? {title: getInvolvementTypeTitleFromValueAutoLocale(props.presetInvolvement?.involvementType) as string, value: props.presetInvolvement?.involvementType} : selectionPlaceholder);

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const employmentPositions = computed(() => getEmploymentPositionsForGivenLocale());
        const selectedEmploymentPosition = ref(selectionPlaceholder);

        const saveInvolvement = () => {
            const involvement: Involvement = {
                dateFrom: dateFrom.value as string,
                dateTo: dateTo.value as string,
                involvementType: selectedInvolvementType.value?.value as InvolvementType,
                affiliationStatement: affiliationStatement.value,
                organisationUnitId: selectedOrganisationUnit.value.value
            };

            if(involvement.involvementType == InvolvementType.MEMBER_OF) {
                (involvement as Membership).contributionDescription = contributionDescription.value;
                (involvement as Membership).role = role.value;
            } 
            else if(involvement.involvementType == InvolvementType.HIRED_BY ||
                    involvement.involvementType == InvolvementType.EMPLOYED_AT) {
                (involvement as Employment).role = role.value;
                (involvement as Employment).employmentPosition = selectedEmploymentPosition.value.value;
            } 
            else if(involvement.involvementType == InvolvementType.STUDIED_AT ||
                    involvement.involvementType == InvolvementType.POSTDOC_AT ||
                    involvement.involvementType == InvolvementType.COMPLETED_COURSE_AT) {
                (involvement as Education).title = title.value;
                (involvement as Education).abbreviationTitle = abbreviationTitle.value;
                (involvement as Education).thesisTitle = thesisTitle.value;
            }

            if(props.edit) {
                emit("update", involvement);
            } else {
                involvement.id = props.presetInvolvement?.id;
                emit("create", involvement);
            }
            
        };

        return {
            isFormValid, toMultilingualTextInput, involvementTypes,
            dateFrom, dateTo, saveInvolvement, affiliationStatement,
            languageList, selectedInvolvementType, requiredSelectionRules,
            ouAutocompleteRef, selectedOrganisationUnit, contributionDescription,
            role, title, abbreviationTitle, thesisTitle, employmentPositions,
            selectedEmploymentPosition, requiredFieldRules
        };
    }
});
</script>
