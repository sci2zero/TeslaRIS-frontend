<template>
    <v-form v-model="localValid" @submit.prevent>
        <v-row>
            <v-col cols="12" sm="6">
                <v-select
                    v-model="selectedCountry"
                    :items="countries"
                    item-title="title"
                    item-value="id"
                    :label="$t('countryLabel') + '*'"
                    return-object
                    :rules="requiredSelectionRules"
                    hide-details="auto"
                ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field
                    v-model="formValue.streetAndNumber"
                    :label="$t('streetAndNumberLabel') + '*'"
                    :rules="requiredFieldRules"
                ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="formValue.place"
                    :label="$t('placeLabel') + '*'"
                    :rules="requiredFieldRules"
                ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="formValue.municipality"
                    :label="$t('municipalityLabel')"
                ></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-text-field
                    v-model="formValue.postalCode"
                    :label="$t('postalCodeLabel')"
                ></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="formValue.contact.contactEmail"
                    :label="$t('emailLabel')"
                ></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field
                    v-model="formValue.contact.phoneNumber"
                    :label="$t('phoneNumberLabel')"
                ></v-text-field>
            </v-col>
        </v-row>
    </v-form>
</template>
  
<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted } from "vue";
import { useValidationUtils } from "@/utils/ValidationUtils";
import type { PropType } from "vue";
import type { RegistryBookContactInformation } from "@/models/ThesisLibraryModel";
import { type Country } from "@/models/Common";
import { type AxiosResponse } from "axios";
import CountryService from "@/services/CountryService";
import { returnCurrentLocaleContent } from "@/i18n/MultilingualContentUtil";


export default defineComponent({
    name: "ContactInformationForm",
    props: {
        modelValue: {
        type: Object as PropType<RegistryBookContactInformation>,
        required: true,
        },
        valid: {
        type: Boolean,
        required: true,
        },
    },
    emits: ["update:modelValue", "update:valid"],
    setup(props, { emit }) {
        const { requiredFieldRules, requiredSelectionRules } = useValidationUtils();

        const localValid = ref(true);

        const formValue = computed({
            get: () => props.modelValue,
            set: (val) => emit("update:modelValue", val),
        });

        onMounted(() => {
            fetchCountries();
        });

        const fetchCountries = () => {
            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [{ title: "", value: -1}];
                response.data.forEach(country => {
                    countries.value.push({title: returnCurrentLocaleContent(country.name) as string, value: country.id as number});
                });
            });
        };

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = computed({
            get: () => countries.value.find((c) => c.value === formValue.value.residenceCountryId),
            set: (val) => {
                if (val?.value) {
                    formValue.value.residenceCountryId = val.value;
                }
            },
        });

        watch(localValid, (val) => {
            emit("update:valid", val);
        });

        return {
            formValue,
            selectedCountry,
            requiredFieldRules,
            localValid, countries,
            requiredSelectionRules
        };
    },
});
</script>
