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
                        <v-text-field v-model="orcid" label="ORCID" placeholder="ORCID" :rules="orcidValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="eCrisId" label="eCRIS-ID" placeholder="eCRIS-ID" :rules="eCrisIdValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="eNaukaId" label="enaukaID" placeholder="enaukaID" :rules="eNaukaIdValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="apvnt" label="APVNT" placeholder="APVNT" :rules="apvntValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="scopus" label="Scopus Author ID" placeholder="Scopus Author ID" :rules="scopusAuthorIdValidationRules"></v-text-field>
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
                        <multilingual-text-input ref="cityRef" v-model="city" :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.postalAddress?.city, languageList)" :label="$t('cityLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input ref="streetAndNumberRef" v-model="streetAndNumber" :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.postalAddress?.streetAndNumber, languageList)" :label="$t('streetAndNumberLabel')"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <uri-input ref="urisRef" v-model="uris" is-website></uri-input>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import type { Country, LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { PersonalInfo, PersonResponse, Sex } from '@/models/PersonModel';
import { getSexForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/sex';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import CountryService from '@/services/CountryService';
import DatePicker from '@/components/core/DatePicker.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import UriInput from '@/components/core/UriInput.vue';


export default defineComponent({
    name: "PersonUpdateForm",
    components: { MultilingualTextInput, DatePicker, UriInput },
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
        });

        watch(() => props.presetPerson, () => {
            if (props.presetPerson) {
                refreshForm();
            }
        });

        const placeOfBirth = ref(props.presetPerson?.personalInfo.placeOfBirth);
        const email = ref(props.presetPerson?.personalInfo.contact.contactEmail);
        const phoneNumber = ref(props.presetPerson?.personalInfo.contact.phoneNumber);
        const birthdate = ref(props.presetPerson?.personalInfo.localBirthDate);
        const orcid = ref(props.presetPerson?.personalInfo.orcid);
        const eCrisId = ref(props.presetPerson?.personalInfo.eCrisId);
        const eNaukaId = ref(props.presetPerson?.personalInfo.eNaukaId);
        const apvnt = ref(props.presetPerson?.personalInfo.apvnt);
        const scopus = ref(props.presetPerson?.personalInfo.scopusAuthorId);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>();

        const cityRef = ref<typeof MultilingualTextInput>();
        const streetAndNumberRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>()

        const city = ref<any>([]);
        const streetAndNumber = ref<any>([]);
        const uris = ref<string[]>(props.presetPerson?.personalInfo.uris as string[]);

        const sexes = getSexForGivenLocale();
        const selectedSex = ref({title: props.presetPerson?.personalInfo.sex ? getTitleFromValueAutoLocale(props.presetPerson?.personalInfo.sex as Sex) as string : "", value: props.presetPerson?.personalInfo.sex ? props.presetPerson?.personalInfo.sex as Sex : undefined});

        const { apvntValidationRules, eCrisIdValidationRules, eNaukaIdValidationRules,
            orcidValidationRules, scopusAuthorIdValidationRules } = useValidationUtils();

        const updatePerson = () => {
            const updatedPerson: PersonalInfo = {
                contact: {phoneNumber: phoneNumber.value as string, contactEmail: email.value},
                localBirthDate: birthdate.value ? birthdate.value : "",
                sex: selectedSex.value.value as Sex,
                apvnt: apvnt.value,
                eCrisId: eCrisId.value,
                eNaukaId: eNaukaId.value,
                orcid: orcid.value,
                placeOfBirth: placeOfBirth.value,
                postalAddress: {city: city.value, countryId: selectedCountry.value?.value as number, streetAndNumber: streetAndNumber.value},
                scopusAuthorId: scopus.value,
                uris: uris.value
            };

            emit("update", updatedPerson);
        };

        const refreshForm = () => {
            cityRef.value?.clearInput();
            city.value = props.presetPerson?.personalInfo.postalAddress?.city as MultilingualContent[];

            streetAndNumberRef.value?.clearInput();
            streetAndNumber.value = props.presetPerson?.personalInfo.postalAddress?.streetAndNumber as MultilingualContent[];

            selectedSex.value = {title: props.presetPerson?.personalInfo.sex ? getTitleFromValueAutoLocale(props.presetPerson?.personalInfo.sex as Sex) as string : "", value: props.presetPerson?.personalInfo.sex ? props.presetPerson?.personalInfo.sex as Sex : undefined};

            if(props.presetPerson?.personalInfo.postalAddress?.countryId) {
                CountryService.readCountry(props.presetPerson?.personalInfo.postalAddress?.countryId).then(response => {
                    selectedCountry.value = {title: returnCurrentLocaleContent(response.data.name) as string, value: response.data.id};
                });
            }

            uris.value = props.presetPerson?.personalInfo.uris as string[];
            placeOfBirth.value = props.presetPerson?.personalInfo.placeOfBirth;
            email.value = props.presetPerson?.personalInfo.contact.contactEmail;
            phoneNumber.value = props.presetPerson?.personalInfo.contact.phoneNumber;
            birthdate.value = props.presetPerson?.personalInfo.localBirthDate;
            orcid.value = props.presetPerson?.personalInfo.orcid;
            eCrisId.value = props.presetPerson?.personalInfo.eCrisId;
            eNaukaId.value = props.presetPerson?.personalInfo.eNaukaId;
            apvnt.value = props.presetPerson?.personalInfo.apvnt;
            scopus.value = props.presetPerson?.personalInfo.scopusAuthorId;
            urisRef.value?.refreshModelValue(uris.value);

            cityRef.value?.forceRefreshModelValue(toMultilingualTextInput(city.value, languageList.value));
            streetAndNumberRef.value?.forceRefreshModelValue(toMultilingualTextInput(streetAndNumber.value, languageList.value));
        };

        return {
            isFormValid, email, phoneNumber, birthdate,
            orcid, eCrisId, eNaukaId, apvnt, scopus, sexes, selectedSex,
            toMultilingualTextInput, languageList, updatePerson,
            placeOfBirth, city, streetAndNumber, countries, selectedCountry,
            apvntValidationRules, eCrisIdValidationRules, eNaukaIdValidationRules,
            orcidValidationRules, scopusAuthorIdValidationRules, cityRef,
            streetAndNumberRef, refreshForm, uris, urisRef
        };
    }
});
</script>
