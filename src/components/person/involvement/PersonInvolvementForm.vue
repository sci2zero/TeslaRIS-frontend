<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col
                        v-if="!enterExternalOU"
                        cols="12">
                        <organisation-unit-autocomplete-search
                            ref="orgUnitAutocompleteRef"
                            v-model:model-value="selectedOrganisationUnit"
                            required
                        />
                    </v-col>
                </v-row>
                <v-row
                    v-if="enterExternalOU"
                    cols="12">
                    <v-col>
                        <multilingual-text-input
                            ref="externalOUNameRef"
                            v-model="externalOUName" :rules="requiredFieldRules"
                            :initial-value="toMultilingualTextInput(presetInvolvement && presetInvolvement.displayOrganisationUnit ? presetInvolvement.displayOrganisationUnit : [], languageTags)"
                            :label="$t('externalOUNameLabel') + '*'"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-btn
                            color="blue darken-1"
                            compact
                            @click="enterExternalOU = !enterExternalOU">
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
                        />
                    </v-col>
                    <v-col cols="6">
                        <date-picker
                            v-model="dateTo"
                            :label="$t('toLabel')"
                            color="primary"
                            persistent
                        />
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
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="description"
                            :label="$t('descriptionLabel')"
                            :initial-value="toMultilingualTextInput(presetInvolvement?.description, languageTags)"
                            is-area
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="keywords"
                            :label="$t('keywordsLabel')"
                            :initial-value="toMultilingualTextInput(presetInvolvement?.keywords, languageTags)"
                            is-area
                        />
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
                            :label="$t('academicTitleLabel') + '*'" :rules="requiredFieldRules"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="abbreviationTitle"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).abbreviationTitle : [], languageTags)"
                            :label="$t('abbreviationTitleLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <publication-autocomplete-search
                            v-model="selectedThesis"
                            :allowed-types="[PublicationType.THESIS]"
                            :form-props="{
                                presetThesisType: getThesisTypeFromDegreeType(selectedDegreeType.value),
                                presetInstitutionId: selectedOrganisationUnit.value,
                                presetInstitutionName: externalOUName,
                                presetYear: dateTo ? dateTo.split('-')[0] : null
                            }"
                            allow-manual-clearing
                            allow-creation
                            :label="'thesisLabel'"
                            :researcher-id="researcherId"
                            @create="setCreatedThesis"
                        />
                    </v-col>
                </v-row>
                <div>
                    <v-row v-show="supervisorInputMode === 'person'">
                        <v-col>
                            <person-autocomplete-search
                                v-model="selectedSupervisors"
                                multiple
                                disable-submission
                                label="supervisorsLabel"
                            />
                        </v-col>
                    </v-row>
                    <v-row v-show="supervisorInputMode === 'manual'">
                        <v-col>
                            <multilingual-text-input
                                v-model="displaySupervisors"
                                :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).displaySupervisors : [], languageTags)"
                                :label="$t('supervisorsLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" class="d-flex justify-start">
                            <v-btn
                                variant="text"
                                color="primary"
                                prepend-icon="mdi-swap-horizontal"
                                @click="toggleSupervisorInputMode">
                                {{ supervisorInputMode === 'person' ? $t('manualInputLabel') : $t('personSearchLabel') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedDegreeType"
                            hide-details="auto"
                            :items="degreeTypes"
                            :label="$t('degreeTypeLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedEducationStatus"
                            hide-details="auto"
                            :items="educationStatuses"
                            :label="$t('educationStatusLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="degreeCode"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).degreeCode : [], languageTags)"
                            :label="$t('degreeCodeLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="degreeClassification"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Education) ? (presetInvolvement as Education).degreeClassification : [], languageTags)"
                            :label="$t('degreeClassificationLabel')"
                        />
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
                            :label="$t('contributionabstractLabel')"
                            is-area
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="role"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).role : [], languageTags)"
                            :label="$t('roleLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedMembershipType"
                            hide-details="auto"
                            :items="membershipTypes"
                            :label="$t('membershipTypeLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-row v-if="selectedInvolvementType?.value === 'EMPLOYED_AT' || selectedInvolvementType?.value === 'HIRED_BY' || selectedInvolvementType?.value === 'CANDIDATE'">
            <v-col>
                <v-row v-if="!useHierarchy">
                    <v-col>
                        <v-select
                            v-model="selectedEmploymentPosition"
                            :items="employmentPositions"
                            :label="$t('employmentPositionLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row v-else>
                    <v-col>
                        <employment-position-selection
                            :employment-positions-hierarchy="selectedEmploymentPositionHierarchy"
                            submit-on-click
                            @update="saveEmploymentId"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col class="d-flex justify-end">
                        <v-btn variant="outlined" @click="useHierarchy = !useHierarchy">
                            {{ useHierarchy 
                                ? $t("chooseFromListLabel") 
                                : $t("chooseFromHierarchyLabel") 
                            }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <multilingual-text-input
                            v-model="role"
                            :initial-value="toMultilingualTextInput((presetInvolvement as Membership) ? (presetInvolvement as Membership).role : [], languageTags)"
                            :label="$t('roleLabel')"
                        />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-checkbox
                    v-model="favorite"
                    :label="$t('favoriteLabel')"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <uri-input ref="urisRef" v-model="uris" />
            </v-col>
        </v-row>

        <div>
            <h2
                class="mt-5!">
                {{ $t("researchAreasLabel") }}
            </h2>
            <v-row>
                <v-col cols="12">
                    <research-areas-selection
                        ref="researchAreasSelectionRef"
                        :research-areas-hierarchy="presetResearchAreas"
                        submit-on-click
                        @update="saveResearchAreas"
                    />
                </v-col>
            </v-row>
        </div>
            
        <v-row class="mt-5">
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
import { DegreeType, EducationStatus, InvolvementType, MembershipType, type Education, type Employment, type Involvement, type Membership } from '@/models/InvolvementModel';
import { useValidationUtils } from '@/utils/ValidationUtils';
import OrganisationUnitAutocompleteSearch from '@/components/organisationUnit/OrganisationUnitAutocompleteSearch.vue';
import { getEmploymentPositionsForGivenLocale, getEmploymentPositionTitleFromValueAutoLocale } from '@/i18n/employmentPosition';
import type { EmploymentPosition } from '@/models/PersonModel';
import DatePicker from '@/components/core/DatePicker.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import { getDegreeTypesForGivenLocale, getDegreeTypeTitleFromValueAutoLocale, getThesisTypeFromDegreeType } from '@/i18n/degreeType';
import { getEducationStatusesForGivenLocale, getEducationStatusTitleFromValueAutoLocale } from '@/i18n/educationStatus';
import { getMembershipTypesForGivenLocale, getMembershipTypeTitleFromValueAutoLocale } from '@/i18n/membershipType';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';
import { type ResearchArea } from '@/models/OrganisationUnitModel';
import UriInput from '@/components/core/UriInput.vue';
import PublicationAutocompleteSearch from '@/components/publication/PublicationAutocompleteSearch.vue';
import { type Document, PublicationType } from '@/models/PublicationModel';
import PersonAutocompleteSearch from '../PersonAutocompleteSearch.vue';
import EmploymentPositionSelection from '@/components/core/employmentPosition/EmploymentPositionSelection.vue';


export default defineComponent({
    name: "PersonInvolvementForm",
    components: { MultilingualTextInput, OrganisationUnitAutocompleteSearch, DatePicker, ResearchAreasSelection, UriInput, PublicationAutocompleteSearch, PersonAutocompleteSearch, EmploymentPositionSelection },
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
        },
        researcherId: {
            type: Number,
            default: null
        }
    },
    emits: ["update", "create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const { languageTags } = useLanguageTags();

        const enterExternalOU = ref(false);
        const supervisorInputMode = ref<"person" | "manual">("person");

        onMounted(() => {
            if( props.presetInvolvement?.organisationUnitId) {
                selectedOrganisationUnit.value = {title: returnCurrentLocaleContent(props.presetInvolvement.organisationUnitName) as string, value: props.presetInvolvement?.organisationUnitId as number};
            } else if (props.presetInvolvement) {
                enterExternalOU.value = true;
            }

            if(props.presetInvolvement && (props.presetInvolvement as Employment).employmentPosition) {
                selectedEmploymentPosition.value = {
                    title: getEmploymentPositionTitleFromValueAutoLocale((props.presetInvolvement as Employment).employmentPosition as EmploymentPosition) as string, 
                    value: (props.presetInvolvement as Employment).employmentPosition
                };
            }

            if(props.presetInvolvement && (props.presetInvolvement as Education).degreeType) {
                selectedDegreeType.value = {
                    title: getDegreeTypeTitleFromValueAutoLocale((props.presetInvolvement as Education).degreeType as DegreeType) as string, 
                    value: (props.presetInvolvement as Education).degreeType as DegreeType
                };
            }

            if(props.presetInvolvement && (props.presetInvolvement as Education).educationStatus) {
                selectedEducationStatus.value = {
                    title: getEducationStatusTitleFromValueAutoLocale((props.presetInvolvement as Education).educationStatus as EducationStatus) as string, 
                    value: (props.presetInvolvement as Education).educationStatus as EducationStatus
                };
            }

            if(props.presetInvolvement && (props.presetInvolvement as Education).thesisId) {
                selectedThesis.value = {
                    title: returnCurrentLocaleContent((props.presetInvolvement as Education).thesisTitle) as string,
                    value: (props.presetInvolvement as Education).thesisId as number
                };
            }

            selectedSupervisors.value.splice(0);
            if(props.presetInvolvement && 
                (props.presetInvolvement as Education).supervisorIds?.length &&
                (props.presetInvolvement as Education).supervisorNames?.length) {
                supervisorInputMode.value = "person";
                (props.presetInvolvement as Education).supervisorIds?.forEach((supervisorId: number, index: number) => {
                    selectedSupervisors.value.push({
                        title: (props.presetInvolvement as Education).supervisorNames?.[index] as string,
                        value: supervisorId
                    });
                });
            } else if (props.presetInvolvement) {
                supervisorInputMode.value = (props.presetInvolvement as Education).displaySupervisors?.length ? "manual" : "person";
            }

            if(props.presetInvolvement && (props.presetInvolvement as Membership).membershipType) {
                selectedMembershipType.value = {
                    title: getMembershipTypeTitleFromValueAutoLocale((props.presetInvolvement as Membership).membershipType as MembershipType) as string, 
                    value: (props.presetInvolvement as Membership).membershipType as MembershipType
                };
            }
        });

        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const dateFrom = ref(props.presetInvolvement?.dateFrom);
        const dateTo = ref(props.presetInvolvement?.dateTo);
        const contributionDescription = ref([]);
        const role = ref([]);
        const title = ref([]);
        const abbreviationTitle = ref([]);
        const displaySupervisors = ref([]);
        const externalOUName = ref([]);
        const degreeCode = ref([]);
        const degreeClassification = ref([]);
        const description = ref([]);
        const keywords = ref([]);
        const favorite = ref(props.presetInvolvement?.favorite);
        const uris = ref<string[]>(props.presetInvolvement?.uris ? props.presetInvolvement?.uris : []);

        const selectionPlaceholder: { title: string, value: any } = { title: "", value: null };

        const involvementTypes = props.edit ? 
            getSimilarInvolvementTypes(props.presetInvolvement?.involvementType as InvolvementType) : 
            getInvolvementTypesForGivenLocale();
        const selectedInvolvementType = ref<{title: string, value: InvolvementType}>(
            props.presetInvolvement?.involvementType ? 
            {
                title: getInvolvementTypeTitleFromValueAutoLocale(props.presetInvolvement?.involvementType) as string,
                value: props.presetInvolvement?.involvementType
            } : selectionPlaceholder
        );

        const selectedSupervisors = ref<{title: string, value: number}[]>([]);
        const selectedThesis = ref<{title: string, value: number}>();

        const degreeTypes = getDegreeTypesForGivenLocale();
        const selectedDegreeType = ref<{title: string, value: DegreeType}>(selectionPlaceholder);
        const educationStatuses = getEducationStatusesForGivenLocale();
        const selectedEducationStatus = ref<{title: string, value: EducationStatus}>(selectionPlaceholder);
        const membershipTypes = getMembershipTypesForGivenLocale();
        const selectedMembershipType = ref<{title: string, value: MembershipType}>(selectionPlaceholder);

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const employmentPositions = computed(() => getEmploymentPositionsForGivenLocale());
        const selectedEmploymentPosition = ref(selectionPlaceholder);

        const researchAreasSelectionRef = ref<typeof ResearchAreasSelection>();
        const presetResearchAreas = ref<ResearchArea[]>(props.presetInvolvement?.researchAreas as ResearchArea[]);
        const researchAreaIds = ref<number[]>(props.presetInvolvement?.researchAreas?.map(researchArea => researchArea.id) as number[]);

        const selectedEmploymentPositionHierarchy = ref<number[]>(
            (props.presetInvolvement as Employment)?.employmentPositionId ? 
            [(props.presetInvolvement as Employment)?.employmentPositionId as number] : []
        );

        const employmentPositionId = ref<number | undefined>((props.presetInvolvement as Employment)?.employmentPositionId);

        const saveEmploymentId = (newEmploymentPositionIds: number[]) => {
            employmentPositionId.value = (newEmploymentPositionIds.length ?? 0) > 0 ? newEmploymentPositionIds[0] : undefined;
        };

        const saveInvolvement = () => {
            const involvement: Involvement = {
                id: props.presetInvolvement?.id,
                dateFrom: dateFrom.value as string,
                dateTo: dateTo.value as string,
                involvementType: selectedInvolvementType.value?.value as InvolvementType,
                displayOrganisationUnit: externalOUName.value,
                organisationUnitId: (!enterExternalOU.value && selectedOrganisationUnit.value.value > 0) ? selectedOrganisationUnit.value.value : undefined,
                favorite: favorite.value,
                uris: uris.value,
                description: description.value,
                keywords: keywords.value,
                researchAreasId: researchAreaIds.value
            };

            if(involvement.involvementType == InvolvementType.MEMBER_OF) {
                (involvement as Membership).contributionDescription = contributionDescription.value;
                (involvement as Membership).role = role.value;
                (involvement as Membership).membershipType = selectedMembershipType.value.value;
            } 
            else if(involvement.involvementType == InvolvementType.HIRED_BY ||
                    involvement.involvementType == InvolvementType.EMPLOYED_AT ||
                    involvement.involvementType == InvolvementType.CANDIDATE) {
                (involvement as Employment).role = role.value;
                (involvement as Employment).employmentPosition = useHierarchy.value ? undefined : selectedEmploymentPosition.value.value;
                (involvement as Employment).employmentPositionId = useHierarchy.value ? employmentPositionId.value : undefined;
            } 
            else if(involvement.involvementType == InvolvementType.STUDIED_AT ||
                    involvement.involvementType == InvolvementType.POSTDOC_AT ||
                    involvement.involvementType == InvolvementType.COMPLETED_COURSE_AT) {
                (involvement as Education).title = title.value;
                (involvement as Education).abbreviationTitle = abbreviationTitle.value;
                (involvement as Education).degreeCode = degreeCode.value;
                (involvement as Education).degreeClassification = degreeClassification.value;
                (involvement as Education).degreeType = selectedDegreeType.value.value;
                (involvement as Education).educationStatus = selectedEducationStatus.value.value;
                (involvement as Education).thesisId = selectedThesis.value?.value && selectedThesis.value?.value > 0 ? selectedThesis.value?.value : undefined;
                
                if (supervisorInputMode.value === "person") {
                    (involvement as Education).supervisorIds = selectedSupervisors.value?.map(supervisor => supervisor.value);
                } else {
                    (involvement as Education).displaySupervisors = displaySupervisors.value;
                }
            }

            if(props.edit) {
                emit("update", involvement);
            } else {
                involvement.id = props.presetInvolvement?.id;
                emit("create", involvement);
            }  
        };

        const saveResearchAreas = (newResearchAreaIds: number[]) => {
            researchAreaIds.value = newResearchAreaIds;
        };

        const toggleSupervisorInputMode = () => {
            supervisorInputMode.value = supervisorInputMode.value === "person" ? "manual" : "person";
            
            if (supervisorInputMode.value === "person") {
                displaySupervisors.value = [];
            } else {
                selectedSupervisors.value = [];
            }
        };

        const setCreatedThesis = (thesis: Document) => {
            selectedThesis.value = {
                title: returnCurrentLocaleContent(thesis.title) as string,
                value: thesis.id as number
            };
        };

        const useHierarchy = ref((props.presetInvolvement as Employment)?.employmentPositionId ?? false);

        return {
            isFormValid, toMultilingualTextInput, involvementTypes,
            dateFrom, dateTo, saveInvolvement, enterExternalOU, favorite,
            languageTags, selectedInvolvementType, requiredSelectionRules,
            ouAutocompleteRef, selectedOrganisationUnit, contributionDescription,
            role, title, abbreviationTitle, displaySupervisors, employmentPositions,
            selectedEmploymentPosition, requiredFieldRules, externalOUName,
            uris, degreeCode, degreeClassification, description, keywords,
            degreeTypes, selectedDegreeType, educationStatuses, selectedEducationStatus,
            membershipTypes, selectedMembershipType, researchAreasSelectionRef,
            presetResearchAreas, saveResearchAreas, selectedSupervisors,
            selectedThesis, PublicationType, supervisorInputMode, setCreatedThesis,
            toggleSupervisorInputMode, getThesisTypeFromDegreeType,
            selectedEmploymentPositionHierarchy, saveEmploymentId, useHierarchy
        };
    }
});
</script>
