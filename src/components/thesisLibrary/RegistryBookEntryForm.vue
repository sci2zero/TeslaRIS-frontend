<template>
    <v-stepper
        v-show="!loading"
        v-model="step"
        :editable="!validateEveryStep">
        <v-stepper-header>
            <v-stepper-item v-for="(label, index) in steps" :key="index" :value="index + 1">
                {{ $t(label) }}
            </v-stepper-item>
        </v-stepper-header>
  
        <v-stepper-window>
            <v-stepper-window-item :value="1" :eager="loadAll">
                <personal-information-form
                    v-model="registryEntry.personalInformation"
                    v-model:valid="validSteps[0]"
                />
            </v-stepper-window-item>
            <v-stepper-window-item :value="2" :eager="loadAll">
                <contact-information-form
                    v-model="registryEntry.contactInformation"
                    v-model:valid="validSteps[1]"
                />
            </v-stepper-window-item>
            <v-stepper-window-item :value="3" :eager="loadAll">
                <previous-title-information-form
                    v-model="registryEntry.previousTitleInformation"
                    v-model:valid="validSteps[2]"
                />
            </v-stepper-window-item>
            <v-stepper-window-item :value="4" :eager="loadAll">
                <dissertation-information-form
                    v-model="registryEntry.dissertationInformation"
                    v-model:valid="validSteps[3]"
                    :is-update="presetRegistryBookEntry ? true : false"
                />
            </v-stepper-window-item>
        </v-stepper-window>
  
        <template #actions>
            <div class="d-flex flex-row justify-between">
                <div>
                    <v-btn
                        class="ml-2"
                        :disabled="step === 1"
                        @click="prevStep">
                        {{ $t("previousLabel") }}
                    </v-btn>
                    <v-btn
                        class="ml-2"
                        :disabled="(validateEveryStep || step === validSteps.length) && !validSteps[step - 1]"
                        @click="step === steps.length ? submit() : nextStep()">
                        {{ step === steps.length ? getSaveButtonLabel() : $t("nextLabel") }}
                    </v-btn>
                    <v-btn
                        v-if="!isUpdate"
                        class="ml-2"
                        @click="saveDraft">
                        {{ $t("saveDraftLabel") }}
                    </v-btn>
                </div>
                <v-checkbox
                    v-model="validateEveryStep"
                    class="mr-2"
                    :label="$t('validateEveryStepLabel')"
                ></v-checkbox>
            </div>
        </template>
    </v-stepper>

    <v-progress-circular
        v-if="loading"
        color="primary"
        class="d-flex flex-row justify-center align-center"
        indeterminate
    ></v-progress-circular>

    <toast v-model="snackbar" :message="message" />
</template>  

<script lang="ts">
import { defineComponent, nextTick, onMounted, type PropType } from 'vue';
import { ref } from 'vue';
import { AcademicTitle, type RegistryBookEntry } from '@/models/ThesisLibraryModel';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PreviousTitleInformationForm from './PreviousTitleInformationForm.vue';
import ContactInformationForm from './ContactInformationForm.vue';
import PersonalInformationForm from './PersonalInformationForm.vue';
import DissertationInformationForm from './DissertationInformationForm.vue';
import Toast from '../core/Toast.vue';
import { useI18n } from 'vue-i18n';


export default defineComponent({
    name: "RegistryBookEntryForm",
    components: { PersonalInformationForm, ContactInformationForm, PreviousTitleInformationForm, DissertationInformationForm, Toast },
    props: {
        thesisId: {
            type: Number,
            required: true
        },
        presetRegistryBookEntry: {
            type: Object as PropType<RegistryBookEntry>,
            default: undefined
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const step = ref(1);
        const steps = ["authorInfoLabel", "authorContactLabel", "previousTitleInfoLabel", "dissertationInfoLabel"];
        const validSteps = ref<boolean[]>([false, false, false, false]);
        const validateEveryStep = ref(true);
        const isUpdate = ref(false);

        const message = ref("");
        const snackbar = ref(false);
        const i18n = useI18n();

        const loadAll = ref(false);
        const loading = ref(false);

        const registryEntry = ref<RegistryBookEntry>(
            {
                personalInformation: {
                    authorName: {
                        firstname: "",
                        otherName: "",
                        lastname: ""
                    },
                    countryOfBirthId: -1,
                    municipalityOfBrith: "",
                    placeOfBrith: "",
                    fatherName: "",
                    fatherSurname: "",
                    guardianNameAndSurname: "",
                    localBirthDate: "",
                    motherName: "",
                    motherSurname: ""
                },
                contactInformation: {
                    municipality: "",
                    place: "",
                    postalCode: "",
                    streetAndNumber: "",
                    residenceCountryId: -1,
                    contact: {
                        phoneNumber: "",
                        contactEmail: ""
                    }
                },
                previousTitleInformation: {
                    academicTitle: AcademicTitle.MASTER_ACADEMIC_STUDIES,
                    graduationDate: "",
                    institutionName: "",
                    institutionPlace: "",
                    schoolYear: ""
                },
                dissertationInformation: {
                    dissertationTitle: "",
                    institutionPlace: "",
                    organisationUnitId: -1,
                    defenceDate: "",
                    acquiredTitle: "",
                    commission: "",
                    mentor: "",
                    grade: "",
                    diplomaIssueDate: "",
                    diplomaNumber: "",
                    diplomaSupplementsIssueDate: "",
                    diplomaSupplementsNumber: ""
                }
            }
        );

        onMounted(() => {
            step.value = 1;
            loading.value = true;

            if (!props.presetRegistryBookEntry) {
                RegistryBookService.getDraft(props.thesisId).then(response => {
                    if (!response.data) {
                        prepopulateMetadata();
                        return;
                    }

                    registryEntry.value = response.data;
                    findLastValidStep();
                }).finally(() => loading.value = false);
            } else {
                isUpdate.value = true;
                registryEntry.value = props.presetRegistryBookEntry;
                findLastValidStep();
            }
        });

        const prepopulateMetadata = () => {
            RegistryBookService.getEntryPrePopulatedData(props.thesisId)
                .then(response => {
                    registryEntry.value.personalInformation.authorName = response.data.personName;
                    registryEntry.value.personalInformation.localBirthDate = response.data.localBirthDate;
                    registryEntry.value.personalInformation.placeOfBrith = response.data.placeOfBirth;
                    registryEntry.value.contactInformation.place = returnCurrentLocaleContent(response.data.postalAddress.city) as string;
                    registryEntry.value.contactInformation.streetAndNumber = returnCurrentLocaleContent(response.data.postalAddress.streetAndNumber) as string;
                    registryEntry.value.contactInformation.residenceCountryId = response.data.postalAddress.countryId;
                    registryEntry.value.contactInformation.contact = response.data.contact;
                    registryEntry.value.dissertationInformation.commission = response.data.commission;
                    registryEntry.value.dissertationInformation.mentor = response.data.mentor;
                    registryEntry.value.dissertationInformation.defenceDate = response.data.defenceDate;
                    registryEntry.value.dissertationInformation.institutionPlace = response.data.place;
                    registryEntry.value.dissertationInformation.organisationUnitId = response.data.institutionId;
                    registryEntry.value.dissertationInformation.dissertationTitle = response.data.title;
                }).finally(() => loading.value = false);
        };

        const findLastValidStep = () => {
            nextTick()
                .then(() => {
                    loadAll.value = true;
                    return nextTick();
                })
                .then(() => nextTick())
                .then(() => nextTick())
                .then(() => nextTick())
                .then(() => {
                    const firstInvalidStep = validSteps.value.findIndex(val => !val) + 1;
                    if (firstInvalidStep > 0) {
                        step.value = firstInvalidStep;
                    } else if (step.value !== 4) {
                        step.value = 4;
                    }
                    loading.value = false;
                });
        };

        const prevStep = () => {
            if (step.value > 1) {
                step.value--;
            }
        };

        const nextStep = () => {
            if (validateEveryStep.value && !validSteps.value[step.value - 1]) {
                return;
            }

            if (step.value < steps.length) {
                step.value++;
            } else {
                submit();
            }
        };

        const submit = () => {
            emit("create", registryEntry.value);
        };

        const saveDraft = () => {
            RegistryBookService.saveDraft(
                registryEntry.value, props.thesisId
            ).then(() => {
                message.value = i18n.t("savedMessage");
                snackbar.value = true;
            });
        };

        const getSaveButtonLabel = () => {
            return !isUpdate.value ? i18n.t("createNewRegistryBookEntryLabel") : i18n.t("updateLabel");
        };

        return {
            step, steps, validSteps,
            prevStep, nextStep,
            registryEntry, submit,
            loadAll, loading,
            validateEveryStep,
            message, snackbar,
            getSaveButtonLabel,
            saveDraft, isUpdate
        };
    }
});
</script>
