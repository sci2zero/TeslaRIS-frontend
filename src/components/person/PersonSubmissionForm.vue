<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-account-outline"
            :title="$t('personLabel')"
            :description="$t('researcherDetailsHint')"
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ui-input
                    v-model="firstName"
                    :label="$t('firstNameLabel') + '*'"
                    :placeholder="$t('firstNameLabel')"
                    :rules="requiredFieldRules"
                />
                <ui-input
                    v-model="lastName"
                    :label="$t('surnameLabel') + '*'"
                    :placeholder="$t('surnameLabel')"
                    :rules="requiredFieldRules"
                />
            </div>
            <person-deduplication-table
                ref="deduplicationTableRef"
                :person-first-name="firstName"
                :person-last-name="lastName"
                :return-selected="inModal"
                @selected="returnToParent"
            />
            <organisation-unit-autocomplete-search
                ref="ouAutocompleteRef"
                v-model:model-value="selectedOrganisationUnit"
                :top-level-institution-id="role === 'INSTITUTIONAL_EDITOR' ? loggedInUser?.organisationUnitId : undefined"
            />
        </form-section>

        <form-section :title="$t('additionalFieldsLabel')">
            <ui-button block variant="outline" type="button" @click="additionalFields = !additionalFields">
                {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
            </ui-button>
            <template v-if="additionalFields">
                <ui-input v-model="middleName" :label="$t('middleNameLabel')" />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input
                        v-model="selectedEmploymentPosition"
                        control="select"
                        :items="employmentPositions"
                        :label="$t('employmentPositionLabel')"
                        return-object
                    />
                    <ui-input
                        v-model="selectedSex"
                        control="select"
                        :items="sexes"
                        :label="$t('sexLabel')"
                        return-object
                    />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="email" :label="$t('emailLabel')" />
                    <ui-input v-model="phoneNumber" :label="$t('phoneNumberLabel')" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <date-picker v-model="birthdate" :label="$t('birthdateLabel')" color="primary" />
                    <ui-input v-model="orcid" label="ORCID" :rules="orcidValidationRules" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="eCrisId" label="eCRIS-ID" :rules="eCrisIdValidationRules" />
                    <ui-input v-model="eNaukaId" label="enaukaID" :rules="eNaukaIdValidationRules" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="nationalScienceId" :label="$t('nationalScienceIdLabel')" :rules="personNationalIdValidationRules" />
                    <ui-input v-model="scholarId" label="Google Scholar ID" :rules="scholarIdValidationRules" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="apvnt" label="APVNT" :rules="apvntValidationRules" />
                    <ui-input v-model="scopus" label="Scopus Author ID" :rules="scopusAuthorIdValidationRules" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="openAlex" label="Open Alex ID" :rules="personOpenAlexIdValidationRules" />
                    <ui-input
                        v-model="webOfScienceId"
                        label="ResearcherID (WoS)"
                        placeholder="ResearcherID (WoS)"
                        :rules="personWebOfScienceIdValidationRules"
                    />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="authenticusId" label="Authenticus ID" :rules="personAuthenticusIdValidationRules" />
                    <ui-input v-model="lattesId" label="Lattes ID" :rules="lattesIdValidationRules" />
                </div>
                <multilingual-text-input v-model="displayTitle" :label="$t('displayTitleLabel')" />
            </template>
        </form-section>

        <form-section :title="$t('researchAreasLabel')">
            <research-areas-selection
                ref="researchAreasSelectionRef"
                :research-areas-hierarchy="undefined"
                submit-on-click
                @update="saveResearchAreas"
            />
        </form-section>

        <p class="text-sm text-slate-500">
            {{ $t("requiredFieldsMessage") }}
        </p>
    </v-form>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, type PropType } from 'vue';
import { ref } from 'vue';
import { computed } from 'vue';
import PersonService from "@/services/PersonService";
import { useRouter } from 'vue-router';
import { PersonNameType, type BasicPerson, type PersonIndex, type PersonName } from "@/models/PersonModel";
import OrganisationUnitAutocompleteSearch from "../organisationUnit/OrganisationUnitAutocompleteSearch.vue";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getSexForGivenLocale } from '@/i18n/sex';
import { getEmploymentPositionsForGivenLocale } from '@/i18n/employmentPosition';
import DatePicker from '../core/DatePicker.vue';
import { getErrorMessageForErrorKey } from '@/i18n';
import { useI18n } from 'vue-i18n';
import PersonDeduplicationTable from './PersonDeduplicationTable.vue';
import Toast from '../core/Toast.vue';
import UserService from '@/services/UserService';
import { type UserResponse } from '@/models/UserModel';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import UiInput from '@/components/ui/input/Input.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';
import ResearchAreasSelection from '@/components/core/ResearchAreasSelection.vue';


export default defineComponent({
    name: "PersonSubmissionForm",
    components: { OrganisationUnitAutocompleteSearch, DatePicker, PersonDeduplicationTable, Toast, MultilingualTextInput, UiInput, FormSection, UiButton, ResearchAreasSelection },
    props: {
        inModal: {
            type: Boolean,
            default: false
        },
        presetPersonName: {
            type: Object as PropType<PersonName | undefined>,
            default: undefined
        }
    },
    emits: ["create", "selected"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const i18n = useI18n();

        const role = computed(() => UserService.provideUserRole());
        const loggedInUser = ref<UserResponse>();

        onMounted(() => {
            UserService.getLoggedInUser().then(response => {
                loggedInUser.value = response.data;
            });

            prePopulatePersonName();
        });

        watch(() => props.presetPersonName, () => {
            prePopulatePersonName();
        });

        const prePopulatePersonName = () => {
            if (props.presetPersonName) {
                firstName.value = props.presetPersonName.firstname;
                lastName.value = props.presetPersonName.lastname;
            }
        };

        const router = useRouter();

        const firstName = ref("");
        const middleName = ref("");
        const lastName = ref("");

        const ouAutocompleteRef = ref<typeof OrganisationUnitAutocompleteSearch>();
        const selectedOrganisationUnit = ref<{ title: string, value: number }>({title: "", value: -1});

        const email = ref("");
        const phoneNumber = ref("");
        const birthdate = ref("");
        const orcid = ref("");
        const eCrisId = ref("");
        const eNaukaId = ref("");
        const apvnt = ref("");
        const scopus = ref("");
        const openAlex = ref("");
        const webOfScienceId = ref("");
        const nationalScienceId = ref("");
        const scholarId = ref("");
        const authenticusId = ref("");
        const lattesId = ref("");
        const displayTitle = ref([]);

        const { 
            requiredFieldRules, requiredSelectionRules,
            apvntValidationRules, eCrisIdValidationRules,
            eNaukaIdValidationRules, orcidValidationRules,
            scopusAuthorIdValidationRules, personNationalIdValidationRules,
            personOpenAlexIdValidationRules,
            personWebOfScienceIdValidationRules, scholarIdValidationRules,
            personAuthenticusIdValidationRules, lattesIdValidationRules
        } = useValidationUtils();

        const selectionPlaceholder: { title: string, value: any } = { title: "", value: undefined };

        const employmentPositions = computed(() => getEmploymentPositionsForGivenLocale());
        const selectedEmploymentPosition = ref(selectionPlaceholder);

        const sexes = getSexForGivenLocale();
        const selectedSex = ref(selectionPlaceholder);

        const deduplicationTableRef = ref<typeof PersonDeduplicationTable>();

        const researchAreasSelectionRef = ref<typeof ResearchAreasSelection>();
        const researchAreaIds = ref<number[]>([]);

        const saveResearchAreas = (researchAreas: number[]) => {
            researchAreaIds.value = researchAreas;
        };

        const submit = (stayOnPage: boolean) => {
            const newPerson: BasicPerson = {
                personName: {
                    firstname: firstName.value,
                    otherName: middleName.value,
                    lastname: lastName.value,
                    dateFrom: birthdate.value,
                    dateTo: null,
                    personNameType: PersonNameType.FULL_NAME
                },
                contactEmail: email.value,
                phoneNumber: phoneNumber.value,
                apvnt: apvnt.value,
                eCrisId: eCrisId.value,
                eNaukaId: eNaukaId.value,
                orcid: orcid.value,
                scopusAuthorId: scopus.value,
                openAlexId: openAlex.value,
                webOfScienceResearcherId: webOfScienceId.value,
                nationalScienceId: nationalScienceId.value,
                scholarId: scholarId.value,
                authenticusId: authenticusId.value,
                lattesId: lattesId.value,
                sex: selectedSex.value.value,
                localBirthDate: birthdate.value,
                organisationUnitId: selectedOrganisationUnit.value.value > 0 ? selectedOrganisationUnit.value.value : undefined,
                employmentPosition: selectedEmploymentPosition.value.value,
                displayTitle: displayTitle.value,
                researchAreasId: researchAreaIds.value
            };

            PersonService.createPerson(newPerson).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

                if (stayOnPage) {
                    firstName.value = "";
                    middleName.value = "";
                    lastName.value = "";
                    birthdate.value = "";
                    email.value = "";
                    phoneNumber.value = "";
                    apvnt.value = "";
                    eCrisId.value = "";
                    eNaukaId.value = "";
                    orcid.value = "";
                    scopus.value = "";
                    openAlex.value = "";
                    webOfScienceId.value = "";
                    nationalScienceId.value = "";
                    scholarId.value = "";
                    authenticusId.value = "";
                    lattesId.value = "";
                    selectedSex.value = selectionPlaceholder;
                    ouAutocompleteRef.value?.clearInput();
                    selectedEmploymentPosition.value = selectionPlaceholder;
                    deduplicationTableRef.value?.resetTable();
                    researchAreaIds.value = [];
                    researchAreasSelectionRef.value?.resetForm();
                    message.value = i18n.t("savedMessage");
                    snackbar.value = true;
                } else {
                    router.push({ name: "researcherLandingPage", params: {id: response.data.id} });
                }
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        const returnToParent = (item: PersonIndex) => {
            emit("selected", item)
        };

        return {
            isFormValid, additionalFields, snackbar, message, deduplicationTableRef, role,
            firstName, middleName, lastName, selectedOrganisationUnit, ouAutocompleteRef, eNaukaId,
            email, birthdate, orcid, eCrisId, apvnt,  scopus, employmentPositions, selectedEmploymentPosition,
            sexes, selectedSex, phoneNumber, requiredFieldRules, requiredSelectionRules, submit,
            apvntValidationRules, eCrisIdValidationRules, eNaukaIdValidationRules, orcidValidationRules,
            scopusAuthorIdValidationRules, personNationalIdValidationRules,
            loggedInUser, displayTitle, openAlex, personOpenAlexIdValidationRules,
            personWebOfScienceIdValidationRules, webOfScienceId, returnToParent, scholarIdValidationRules,
            personAuthenticusIdValidationRules, lattesIdValidationRules, nationalScienceId, scholarId,
            authenticusId, lattesId, researchAreasSelectionRef, saveResearchAreas
        };
    }
});
</script>
