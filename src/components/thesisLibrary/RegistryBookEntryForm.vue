<template>
    <v-stepper v-model="step">
        <v-stepper-header>
            <v-stepper-item v-for="(label, index) in steps" :key="index" :value="index + 1">
                {{ $t(label) }}
            </v-stepper-item>
        </v-stepper-header>
  
        <v-stepper-window>
            <v-stepper-window-item :value="1">
                <personal-information-form
                    v-model="registryEntry.personalInformation"
                    v-model:valid="validSteps[0]"
                />
            </v-stepper-window-item>
            <v-stepper-window-item :value="2">
                <contact-information-form
                    v-model="registryEntry.contactInformation"
                    v-model:valid="validSteps[1]"
                />
            </v-stepper-window-item>
            <v-stepper-window-item :value="3">
                <previous-title-information-form
                    v-model="registryEntry.previousTitleInformation"
                    v-model:valid="validSteps[2]"
                />
            </v-stepper-window-item>
            <v-stepper-window-item :value="4">
                <dissertation-information-form
                    v-model="registryEntry.dissertationInformation"
                    v-model:valid="validSteps[3]"
                />
            </v-stepper-window-item>
        </v-stepper-window>
  
        <template #actions>
            <v-btn :disabled="step === 1" @click="prevStep">
                {{ $t("previousLabel") }}
            </v-btn>
            <v-btn :disabled="!validSteps[step - 1]" @click="step === steps.length ? submit() : nextStep()">
                {{ step === steps.length ? $t("saveLabel") : $t("nextLabel") }}
            </v-btn>
        </template>
    </v-stepper>
</template>  

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { ref } from 'vue';
import { AcademicTitle, type RegistryBookEntry } from '@/models/ThesisLibraryModel';
import RegistryBookService from '@/services/thesisLibrary/RegistryBookService';
import { returnCurrentLocaleContent } from '@/i18n/MultilingualContentUtil';
import PreviousTitleInformationForm from './PreviousTitleInformationForm.vue';
import ContactInformationForm from './ContactInformationForm.vue';
import PersonalInformationForm from './PersonalInformationForm.vue';
import DissertationInformationForm from './DissertationInformationForm.vue';


export default defineComponent({
    name: "PromotionForm",
    components: { PersonalInformationForm, ContactInformationForm, PreviousTitleInformationForm, DissertationInformationForm },
    props: {
        thesisId: {
            type: Number,
            required: true
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const step = ref(1);
        const steps = ["authorInfoLabel", "authorContactLabel", "previousTitleInfoLabel", "dissertationInfoLabel"];
        const validSteps = ref([false, false, false, false]);

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
            });
        });

        const prevStep = () => {
            if (step.value > 1) step.value--;
        };

        const nextStep = () => {
            if (validSteps.value[step.value - 1]) {
                if (step.value < steps.length) {
                    step.value++;
                } else {
                    submit();
                }
            }
        };

        const submit = () => {
            RegistryBookService.createRegistryBookEntry(registryEntry.value)
            .then(() => {
                emit("create", registryEntry);
            });
        };

        return {
            step, steps, validSteps,
            prevStep, nextStep,
            registryEntry, submit
        };
    }
});
</script>
