<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <h3>{{ $t('personalInfoLabel') }}</h3>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedSex"
                            :items="sexes"
                            :label="$t('sexLabel')"
                            return-object>
                        </v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="placeOfBirth" :label="$t('placeOfBirthLabel')" :placeholder="$t('placeOfBirthLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <date-picker
                            v-model="birthdate"
                            :label="$t('birthdateLabel')"
                            color="primary"
                        ></date-picker>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="orcid" label="ORCID" placeholder="ORCID"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="mnid" label="MNID" placeholder="MNID"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="apvnt" label="APVNT" placeholder="APVNT"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="scopus" label="Scopus Author ID" placeholder="Scopus Author ID"></v-text-field>
                    </v-col>
                </v-row>
                <h3>{{ $t('contactLabel') }}</h3>
                <v-row>
                    <v-col>
                        <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <h3>{{ $t('addressLabel') }}</h3>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedCountry"
                            hide-details="auto"
                            :items="countries"
                            :label="$t('countryLabel')"
                            return-object
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="city" :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.postalAddress?.city, languageList)" :label="$t('cityLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input v-model="streetAndNumber" :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.postalAddress?.streetAndNumber, languageList)" :label="$t('streetAndNumberLabel')"></multilingual-text-input>
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
import { defineComponent, type PropType } from 'vue';
import { ref } from 'vue';
import type { Country, LanguageTagResponse } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/TranslationUtil';
import type { PersonalInfo, PersonResponse, Sex } from '@/models/PersonModel';
import { getSexForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/sex';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import CountryService from '@/services/CountryService';
import DatePicker from '@/components/core/DatePicker.vue';


export default defineComponent({
    name: "PersonUpdateForm",
    components: { MultilingualTextInput, DatePicker },
    props: {
        presetPerson: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const languageList = ref<LanguageTagResponse[]>([]);

        onMounted(() => {
            LanguageService.getAllLanguageTags().then((response: AxiosResponse<LanguageTagResponse[]>) => {
                languageList.value = response.data;
            });

            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [];
                response.data.forEach(country => {
                    countries.value.push({title: returnCurrentLocaleContent(country.name) as string, value: country.id});
                });
            });

            if(props.presetPerson?.personalInfo.postalAddress?.countryId) {
                CountryService.readCountry(props.presetPerson?.personalInfo.postalAddress?.countryId).then(response => {
                    selectedCountry.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id};
                });
            }
        });

        const placeOfBirth = ref(props.presetPerson?.personalInfo.placeOfBirth);
        const email = ref(props.presetPerson?.personalInfo.contact.contactEmail);
        const phoneNumber = ref(props.presetPerson?.personalInfo.contact.phoneNumber);
        const birthdate = ref(props.presetPerson?.personalInfo.localBirthDate);
        const orcid = ref(props.presetPerson?.personalInfo.orcid);
        const mnid = ref(props.presetPerson?.personalInfo.mnid);
        const apvnt = ref(props.presetPerson?.personalInfo.apvnt);
        const scopus = ref(props.presetPerson?.personalInfo.scopusAuthorId);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>();

        const city = ref([]);
        const streetAndNumber = ref([]);

        const sexes = getSexForGivenLocale();
        const selectedSex = ref({title: props.presetPerson?.personalInfo.sex ? getTitleFromValueAutoLocale(props.presetPerson?.personalInfo.sex as Sex) as string : "", value: props.presetPerson?.personalInfo.sex ? props.presetPerson?.personalInfo.sex as Sex : undefined});

        const updatePerson = () => {
            const updatedPerson: PersonalInfo = {
                contact: {phoneNumber: phoneNumber.value as string, contactEmail: email.value},
                localBirthDate: birthdate.value ? birthdate.value : "",
                sex: selectedSex.value.value as Sex,
                apvnt: apvnt.value,
                mnid: mnid.value,
                orcid: orcid.value,
                placeOfBirth: placeOfBirth.value,
                postalAddress: {city: city.value, countryId: selectedCountry.value?.value as number, streetAndNumber: streetAndNumber.value},
                scopusAuthorId: scopus.value
            };

            emit("update", updatedPerson);
        };

        return {
            isFormValid, email, phoneNumber, birthdate,
            orcid, mnid, apvnt, scopus, sexes, selectedSex,
            toMultilingualTextInput, languageList, updatePerson,
            placeOfBirth, city, streetAndNumber, countries, selectedCountry
        };
    }
});
</script>
