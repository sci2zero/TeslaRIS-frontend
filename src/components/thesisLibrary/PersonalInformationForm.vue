<template>
    <v-form v-model="localValid" @submit.prevent>
        <v-row>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="formValue.authorName.firstname"
                    :label="$t('firstNameLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="formValue.authorName.otherName"
                    :label="$t('middleNameLabel')"
                />
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="formValue.authorName.lastname"
                    :label="$t('surnameLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <date-picker
                    v-model="formValue.localBirthDate"
                    :label="$t('birthdateLabel') + '*'"
                    color="primary"
                    required
                ></date-picker>
            </v-col>
            <v-col cols="12" sm="6">
                <v-select
                    v-model="selectedCountry"
                    :items="countries"
                    item-title="title"
                    item-value="value"
                    return-object
                    :label="$t('countryOfBirthLabel') + '*'"
                    :rules="requiredSelectionRules"
                    hide-details="auto"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.placeOfBrith"
                    :label="$t('placeOfBirthLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.municipalityOfBrith"
                    :label="$t('municipalityOfBirthLabel') + '*'"
                    :rules="requiredFieldRules"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    ref="fatherNameRef"
                    v-model="formValue.fatherName"
                    :label="$t('fatherNameLabel') + '*'"
                    :rules="conditionalRule"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.fatherSurname"
                    :label="$t('fatherSurnameLabel')"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    ref="motherNameRef"
                    v-model="formValue.motherName"
                    :label="$t('motherNameLabel') + '*'"
                    :rules="conditionalRule"
                />
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.motherSurname"
                    :label="$t('motherSurnameLabel')"
                />
            </v-col>
            <v-col cols="12">
                <v-text-field
                    ref="guardianNameRef"
                    v-model="formValue.guardianNameAndSurname"
                    :label="$t('guardianNameAndSurnameLabel') + '*'"
                    :rules="conditionalRule"
                />
            </v-col>
        </v-row>
    </v-form>
</template>
  
<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted } from "vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
import type { RegistryBookPersonalInformation } from "@/models/ThesisLibraryModel";
import { type Country } from "@/models/Common";
import { type AxiosResponse } from "axios";
import CountryService from "@/services/CountryService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";
import DatePicker from "../core/DatePicker.vue";
import { VTextField } from "vuetify/lib/components/index.mjs";


export default defineComponent({
    name: "PersonalInformationForm",
    components: { DatePicker },
    props: {
        modelValue: {
            type: Object as PropType<RegistryBookPersonalInformation>,
            required: true,
        },
        valid: {
            type: Boolean,
            required: true,
        },
    },
    emits: ["update:modelValue", "update:valid"],
    setup(props, { emit }) {
        const localValid = ref(true);
        const formValue = computed({
            get: () => props.modelValue,
            set: (val) => emit("update:modelValue", val),
        });

        const { requiredFieldRules, requiredSelectionRules, atLeastOneRequiredRule } = useValidationUtils();
        const conditionalRule = atLeastOneRequiredRule(formValue, [
            "fatherName",
            "motherName",
            "guardianNameAndSurname"
        ]);

        const fatherNameRef = ref<typeof VTextField>();
        const motherNameRef = ref<typeof VTextField>();
        const guardianNameRef = ref<typeof VTextField>();
        watch(
        () => [
            formValue.value.fatherName,
            formValue.value.motherName,
            formValue.value.guardianNameAndSurname,
        ],
        () => {
            fatherNameRef.value?.validate?.();
            motherNameRef.value?.validate?.();
            guardianNameRef.value?.validate?.();
        });

        const countries = ref<{ title: string; value: number }[]>([]);

        const selectedCountry = computed({
            get: () => countries.value.find((c) => c.value === formValue.value.countryOfBirthId),
            set: (val) => {
                if (val?.value) {
                    formValue.value.countryOfBirthId = val.value;
                }
            },
        });

        const fetchCountries = () => {
            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [{ title: "", value: -1 }];
                response.data.forEach((country) => {
                countries.value.push({
                    title: returnCurrentLocaleContent(country.name) as string,
                    value: country.id as number,
                });
                });
            });
        };

        watch(localValid, (val) => {
            emit("update:valid", val);
        });

        onMounted(fetchCountries);

        return {
            formValue,
            selectedCountry,
            countries,
            requiredFieldRules,
            requiredSelectionRules,
            localValid, conditionalRule,
            fatherNameRef, motherNameRef,
            guardianNameRef
        };
    },
});
</script>
  