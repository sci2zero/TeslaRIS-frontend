<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col
                        v-if="!enterExternalOU"
                        cols="12">
                        <organisation-unit-autocomplete-search ref="orgUnitAutocompleteRef" v-model:model-value="selectedOrganisationUnit" required></organisation-unit-autocomplete-search>
                    </v-col>
                </v-row>
                <v-row
                    v-if="enterExternalOU"
                    cols="12">
                    <v-col>
                        <multilingual-text-input
                            ref="externalOUNameRef"
                            v-model="externalOUName" :rules="requiredFieldRules"
                            :initial-value="toMultilingualTextInput(presetInvolvement && presetInvolvement.affiliationStatement ? presetInvolvement.affiliationStatement : [], languageTags)"
                            :label="$t('externalOUNameLabel') + '*'">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-btn color="blue darken-1" compact @click="enterExternalOU = !enterExternalOU">
                            {{ enterExternalOU ? $t("searchInSystemLabel") : $t("enterExternalOULabel") }}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <date-picker
                            v-model="dateFrom"
                            :label="$t('fromLabel')"
                            color="primary"
                            persistent
                        ></date-picker>
                    </v-col>
                    <v-col cols="6">
                        <date-picker
                            v-model="dateTo"
                            :label="$t('toLabel')"
                            color="primary"
                            persistent
                        ></date-picker>
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
                        <multilingual-text-input
                            v-model="title"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).title : [], languageTags)"
                            :label="$t('academicTitleLabel') + '*'" :rules="requiredFieldRules">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="abbreviationTitle"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).abbreviationTitle : [], languageTags)"
                            :label="$t('abbreviationTitleLabel')">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="thesisTitle"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).thesisTitle : [], languageTags)"
                            :label="$t('thesisTitleLabel')">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-row v-if="selectedInvolvementType?.value === 'MEMBER_OF'">
            <v-col>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="contributionDescription"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).contributionDescription : [], languageTags)"
                            :label="$t('contributionabstractLabel')" is-area>
                        </multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="role"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).role : [], languageTags)"
                            :label="$t('roleLabel')">
                        </multilingual-text-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-row v-if="selectedInvolvementType?.value === 'EMPLOYED_AT' || selectedInvolvementType?.value === 'HIRED_BY' || selectedInvolvementType?.value === 'CANDIDATE'">
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
                        <multilingual-text-input v-model="role" :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).role : [], languageTags)" :label="$t('roleLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
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
import { computed, defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import { onMounted } from 'vue';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { getInvolvementTypesForGivenLocale, getInvolvementTypeTitleFromValueAutoLocale, getSimilarInvolvementTypes } from '@/i18n/involvementType';
import { InvolvementType, type Education, type Employment, type Involvement, type Membership } from '@/models/InvolvementModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { getEmploymentPositionsForGivenLocale, getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import type { EmploymentPosition } from '@/models/PersonModel';
import DatePicker from '@/components/core/DatePicker.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';


export default defineComponent({
    name: "PersonInvolvementForm",
    components: { MultilingualTextInput, OrganisationUnitAutocompleteSearch, DatePicker },
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
        const { languageTags } = useLanguageTags();

        const enterExternalOU = ref(false);

        onMounted(() => {
            if(props.presetInvolvement?.organisationUnitId) {
                selectedOrganisationUnit.value = {title: returnCurrentLocaleContent(props.presetInvolvement.organisationUnitName) as string, value: props.presetInvolvement?.organisationUnitId as number};
            }

            if(props.presetInvolvement && (props.presetInvolvement as Employment).employmentPosition) {
                selectedEmploymentPosition.value = {title: getEmploymentPositionTitleFromValueAutoLocale((props.presetInvolvement as Employment).employmentPosition as EmploymentPosition) as string, value: (props.presetInvolvement as Employment).employmentPosition};
            }
        });

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const dateFrom = ref(props.presetInvolvement?.dateFrom);
        const dateTo = ref(props.presetInvolvement?.dateTo);
        const contributionDescription = ref([]);
        const role = ref([]);
        const title = ref([]);
        const abbreviationTitle = ref([]);
        const thesisTitle = ref([]);
        const externalOUName = ref([]);

        const selectionPlaceholder: { title: string, value: any } = { title: "", value: null };

        const involvementTypes = props.edit ? getSimilarInvolvementTypes(props.presetInvolvement?.involvementType as InvolvementType) : getInvolvementTypesForGivenLocale();
        const selectedInvolvementType = ref<{title: string, value: InvolvementType}>(props.presetInvolvement?.involvementType ? {title: getInvolvementTypeTitleFromValueAutoLocale(props.presetInvolvement?.involvementType) as string, value: props.presetInvolvement?.involvementType} : selectionPlaceholder);

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const employmentPositions = computed(() => getEmploymentPositionsForGivenLocale());
        const selectedEmploymentPosition = ref(selectionPlaceholder);

        const saveInvolvement = () => {
            const involvement: Involvement = {
                id: props.presetInvolvement?.id,
                dateFrom: dateFrom.value as string,
                dateTo: dateTo.value as string,
                involvementType: selectedInvolvementType.value?.value as InvolvementType,
                affiliationStatement: externalOUName.value,
                organisationUnitId: selectedOrganisationUnit.value.value > 0 ? selectedOrganisationUnit.value.value : undefined
            };

            if(involvement.involvementType == InvolvementType.MEMBER_OF) {
                (involvement as Membership).contributionDescription = contributionDescription.value;
                (involvement as Membership).role = role.value;
            } 
            else if(involvement.involvementType == InvolvementType.HIRED_BY ||
                    involvement.involvementType == InvolvementType.EMPLOYED_AT ||
                    involvement.involvementType == InvolvementType.CANDIDATE) {
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
            dateFrom, dateTo, saveInvolvement, enterExternalOU,
            languageTags, selectedInvolvementType, requiredSelectionRules,
            ouAutocompleteRef, selectedOrganisationUnit, contributionDescription,
            role, title, abbreviationTitle, thesisTitle, employmentPositions,
            selectedEmploymentPosition, requiredFieldRules, externalOUName
        };
    }
});
</script>
