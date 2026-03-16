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
                        <v-text-field v-model="placeOfBirth" :label="$t('placeOfBirthLabel')" :placeholder="$t('placeOfBirthLabel')" />
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
                        <v-text-field v-model="orcid" label="ORCID" placeholder="ORCID" :rules="orcidValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="eCrisId" label="eCRIS-ID" placeholder="eCRIS-ID" :rules="eCrisIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="eNaukaId" label="enaukaID" placeholder="enaukaID" :rules="eNaukaIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="nationalScienceId" :label="$t('nationalScienceIdLabel')" :placeholder="$t('nationalScienceIdLabel')" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="apvnt" label="APVNT" placeholder="APVNT" :rules="apvntValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="scopus" label="Scopus Author ID" placeholder="Scopus Author ID" :rules="scopusAuthorIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="openAlex" label="Open Alex ID" placeholder="Open Alex ID" :rules="personOpenAlexIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="webOfScienceId" label="ResearcherID (WoS)" placeholder="ResearcherID (WoS)" :rules="personWebOfScienceIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="scholarId" label="Google Scholar ID" placeholder="Google Scholar ID" :rules="scholarIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="authenticusId" label="Authenticus ID" placeholder="Authenticus ID" :rules="personAuthenticusIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="lattesId" label="Lattes ID" placeholder="Lattes ID" :rules="lattesIdValidationRules" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <uri-input
                            ref="urisRef"
                            v-model="uris"
                            is-website
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="displayTitleRef"
                            v-model="displayTitle"
                            :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.displayTitle, languageTags)"
                            :label="$t('displayTitleLabel')"
                        />
                    </v-col>
                </v-row>
                <h3>{{ $t('professionalContactLabel') }}</h3>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="email"
                            :label="$t('emailLabel')"
                            :placeholder="$t('emailLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="phoneNumber"
                            :label="$t('phoneNumberLabel')"
                            :placeholder="$t('phoneNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="faxNumber"
                            :label="$t('faxNumberLabel')"
                            :placeholder="$t('faxNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="mobilePhoneNumber"
                            :label="$t('mobilePhoneNumberLabel')"
                            :placeholder="$t('mobilePhoneNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <h3>{{ $t('privateContactLabel') }}</h3>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="emailPrivate"
                            :label="$t('emailLabel')"
                            :placeholder="$t('emailLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="phoneNumberPrivate"
                            :label="$t('phoneNumberLabel')"
                            :placeholder="$t('phoneNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="faxNumberPrivate"
                            :label="$t('faxNumberLabel')"
                            :placeholder="$t('faxNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="mobilePhoneNumberPrivate"
                            :label="$t('mobilePhoneNumberLabel')"
                            :placeholder="$t('mobilePhoneNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <h3>{{ $t('professionalAddressLabel') }}</h3>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedCountry"
                            hide-details="auto"
                            :items="countries"
                            :label="$t('countryLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="cityRef"
                            v-model="city"
                            :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.postalAddress?.city, languageTags)"
                            :label="$t('cityLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="streetAndNumberRef"
                            v-model="streetAndNumber"
                            :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.postalAddress?.streetAndNumber, languageTags)"
                            :label="$t('streetAndNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="stateRef"
                            v-model="state"
                            :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.postalAddress?.state, languageTags)"
                            :label="$t('stateLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="postalNumber"
                            :label="$t('postalNumberLabel')"
                            :placeholder="$t('postalNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <h3>{{ $t('privateAddressLabel') }}</h3>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedCountryPrivate"
                            hide-details="auto"
                            :items="countries"
                            :label="$t('countryLabel')"
                            return-object
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="cityPrivateRef"
                            v-model="cityPrivate"
                            :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.privatePostalAddress?.city, languageTags)"
                            :label="$t('cityLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="streetAndNumberPrivateRef"
                            v-model="streetAndNumberPrivate"
                            :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.privatePostalAddress?.streetAndNumber, languageTags)"
                            :label="$t('streetAndNumberLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <multilingual-text-input
                            ref="statePrivateRef"
                            v-model="statePrivate"
                            :initial-value="toMultilingualTextInput(presetPerson?.personalInfo.privatePostalAddress?.state, languageTags)"
                            :label="$t('stateLabel')"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="postalNumberPrivate"
                            :label="$t('postalNumberLabel')"
                            :placeholder="$t('postalNumberLabel')"
                        />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-form>

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import { ref } from 'vue';
import type { Country, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import type { AxiosResponse } from 'axios';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { PersonalInfo, PersonResponse, Sex } from '@/models/PersonModel';
import { getSexForGivenLocale, getTitleFromValueAutoLocale } from '@/i18n/sex';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import CountryService from '@/services/CountryService';
import DatePicker from '@/components/core/DatePicker.vue';
import { useValidationUtils } from '@/utils/ValidationUtils';
import UriInput from '@/components/core/UriInput.vue';
import { useI18n } from 'vue-i18n';
import { useLanguageTags } from '@/composables/useLanguageTags';
import PersonService from '@/services/PersonService';
import Toast from '@/components/core/Toast.vue';
import { useIdentifierCheck } from '@/composables/useIdentifierCheck';


export default defineComponent({
    name: "PersonUpdateForm",
    components: { MultilingualTextInput, DatePicker, UriInput, Toast },
    props: {
        presetPerson: {
            type: Object as PropType<PersonResponse | undefined>,
            required: true
        },
        inModal: {
            type: Boolean,
            default: true
        }
    },
    emits: ["update"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const { languageTags } = useLanguageTags();

        const { checkIdentifiers, message, snackbar } = useIdentifierCheck();
        const i18n = useI18n();

        onMounted(() => {
            fetchCountries();
        });

        const fetchCountries = () => {
            CountryService.readAllCountries().then((response: AxiosResponse<Country[]>) => {
                countries.value = [{ title: "", value: -1}];
                response.data.forEach(country => {
                    countries.value.push({title: returnCurrentLocaleContent(country.name) as string, value: country.id as number});
                });

                setAdditionalInfo();
            });
        };

        const setAdditionalInfo = () => {
            if (props.presetPerson?.personalInfo?.postalAddress && 
                props.presetPerson?.personalInfo?.postalAddress?.countryId
            ) {
                const country = countries.value.find(country => 
                    country.value === props.presetPerson?.personalInfo?.postalAddress?.countryId
                );
                if (country) {
                    selectedCountry.value = country;
                }
            }

            if (props.presetPerson?.personalInfo?.privatePostalAddress && 
                props.presetPerson?.personalInfo?.privatePostalAddress?.countryId
            ) {
                const country = countries.value.find(country => 
                    country.value === props.presetPerson?.personalInfo?.privatePostalAddress?.countryId
                );
                if (country) {
                    selectedCountryPrivate.value = country;
                }
            }
        };

        watch(() => props.presetPerson, () => {
            if (props.presetPerson) {
                refreshForm();
            }
        });

        watch(i18n.locale, () => {
            fetchCountries();
        });

        const placeOfBirth = ref(props.presetPerson?.personalInfo.placeOfBirth);
        
        const email = ref(props.presetPerson?.personalInfo.contact.contactEmail);
        const phoneNumber = ref(props.presetPerson?.personalInfo.contact.phoneNumber);
        const faxNumber = ref(props.presetPerson?.personalInfo.contact.faxNumber);
        const mobilePhoneNumber = ref(props.presetPerson?.personalInfo.contact.mobilePhoneNumber);

        const emailPrivate = ref(props.presetPerson?.personalInfo.privateContact?.contactEmail);
        const phoneNumberPrivate = ref(props.presetPerson?.personalInfo.privateContact?.phoneNumber);
        const faxNumberPrivate = ref(props.presetPerson?.personalInfo.privateContact?.faxNumber);
        const mobilePhoneNumberPrivate = ref(props.presetPerson?.personalInfo.privateContact?.mobilePhoneNumber);

        const birthdate = ref(props.presetPerson?.personalInfo.localBirthDate);
        const orcid = ref(props.presetPerson?.personalInfo.orcid);
        const eCrisId = ref(props.presetPerson?.personalInfo.eCrisId);
        const eNaukaId = ref(props.presetPerson?.personalInfo.eNaukaId);
        const apvnt = ref(props.presetPerson?.personalInfo.apvnt);
        const scopus = ref(props.presetPerson?.personalInfo.scopusAuthorId);
        const openAlex = ref(props.presetPerson?.personalInfo.openAlexId);
        const webOfScienceId = ref(props.presetPerson?.personalInfo.webOfScienceResearcherId);
        const nationalScienceId = ref(props.presetPerson?.personalInfo.nationalScienceId);
        const scholarId = ref(props.presetPerson?.personalInfo.scholarId);
        const authenticusId = ref(props.presetPerson?.personalInfo.authenticusId);
        const lattesId = ref(props.presetPerson?.personalInfo.lattesId);

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>();
        const selectedCountryPrivate = ref<{title: string, value: number}>();

        const cityRef = ref<typeof MultilingualTextInput>();
        const streetAndNumberRef = ref<typeof MultilingualTextInput>();
        const stateRef = ref<typeof MultilingualTextInput>();
        const cityPrivateRef = ref<typeof MultilingualTextInput>();
        const streetAndNumberPrivateRef = ref<typeof MultilingualTextInput>();
        const statePrivateRef = ref<typeof MultilingualTextInput>();
        const urisRef = ref<typeof UriInput>()

        const city = ref<any>([]);
        const streetAndNumber = ref<any>([]);
        const state = ref<any>([]);
        const cityPrivate = ref<any>([]);
        const streetAndNumberPrivate = ref<any>([]);
        const statePrivate = ref<any>([]);
        const uris = ref<string[]>(props.presetPerson?.personalInfo.uris as string[]);
        const displayTitle = ref<any>([]);

        const postalNumber = ref(props.presetPerson?.personalInfo.postalAddress?.postalNumber);
        const postalNumberPrivate = ref(props.presetPerson?.personalInfo.privatePostalAddress?.postalNumber);

        const sexes = getSexForGivenLocale();
        const selectedSex = ref({title: props.presetPerson?.personalInfo.sex ? getTitleFromValueAutoLocale(props.presetPerson?.personalInfo.sex as Sex) as string : "", value: props.presetPerson?.personalInfo.sex ? props.presetPerson?.personalInfo.sex as Sex : undefined});

        const {
            apvntValidationRules, eCrisIdValidationRules,
            eNaukaIdValidationRules, personOpenAlexIdValidationRules,
            orcidValidationRules, scopusAuthorIdValidationRules,
            personWebOfScienceIdValidationRules, scholarIdValidationRules,
            personAuthenticusIdValidationRules, lattesIdValidationRules
        } = useValidationUtils();

        const submit = async () => {
            if (props.inModal) {
                const { duplicateFound } = await checkIdentifiers(
                    [
                        { value: eNaukaId.value as string, error: "eNaukaIdExistsError" },
                        { value: scopus.value as string, error: "scopusIdExistsError" },
                        { value: apvnt.value as string, error: "apvntExistsError" },
                        { value: eCrisId.value as string, error: "eCrisIdExistsError" },
                        { value: orcid.value as string, error: "orcidIdExistsError" },
                        { value: openAlex.value as string, error: "openAlexIdExistsError"},
                        { value: webOfScienceId.value as string, error: "webOfScienceIdExistsError" },
                        { value: nationalScienceId.value as string, error: "nationalScienceIdExistsError" },
                        { value: scholarId.value as string, error: "scholarIdExistsError" },
                        { value: authenticusId.value as string, error: "authenticusIdExistsError" },
                        { value: lattesId.value as string, error: "lattesIdExistsError" }
                    ],
                    props.presetPerson?.id as number,
                    (id, docId) => PersonService.checkIdentifierUsage(id, docId)
                );

                if (duplicateFound) {
                    return;
                }
            }

            const updatedPerson: PersonalInfo = {
                contact: {
                    phoneNumber: phoneNumber.value as string,
                    contactEmail: email.value,
                    faxNumber: faxNumber.value,
                    mobilePhoneNumber: mobilePhoneNumber.value
                },
                privateContact: {
                    phoneNumber: phoneNumberPrivate.value as string,
                    contactEmail: emailPrivate.value,
                    faxNumber: faxNumberPrivate.value,
                    mobilePhoneNumber: mobilePhoneNumberPrivate.value
                },
                localBirthDate: birthdate.value || "",
                sex: selectedSex.value.value as Sex,
                apvnt: apvnt.value,
                eCrisId: eCrisId.value,
                eNaukaId: eNaukaId.value,
                orcid: orcid.value,
                placeOfBirth: placeOfBirth.value,
                postalAddress: {
                    city: city.value,
                    countryId: selectedCountry.value?.value as number,
                    streetAndNumber: streetAndNumber.value,
                    state: state.value,
                    postalNumber: postalNumber.value as string
                },
                privatePostalAddress: {
                    city: cityPrivate.value,
                    countryId: selectedCountryPrivate.value?.value as number,
                    streetAndNumber: streetAndNumberPrivate.value,
                    state: statePrivate.value,
                    postalNumber: postalNumberPrivate.value as string
                },
                scopusAuthorId: scopus.value,
                openAlexId: openAlex.value,
                webOfScienceResearcherId: webOfScienceId.value,
                nationalScienceId: nationalScienceId.value,
                scholarId: scholarId.value,
                authenticusId: authenticusId.value,
                lattesId: lattesId.value,
                uris: uris.value,
                displayTitle: displayTitle.value
            };

            emit("update", updatedPerson);
        };


        const refreshForm = () => {
            cityRef.value?.clearInput();
            city.value = props.presetPerson?.personalInfo.postalAddress?.city as MultilingualContent[];
            cityPrivateRef.value?.clearInput();
            cityPrivate.value = props.presetPerson?.personalInfo.privatePostalAddress?.city as MultilingualContent[];

            streetAndNumberRef.value?.clearInput();
            streetAndNumber.value = props.presetPerson?.personalInfo.postalAddress?.streetAndNumber as MultilingualContent[];
            streetAndNumberPrivateRef.value?.clearInput();
            streetAndNumberPrivate.value = props.presetPerson?.personalInfo.privatePostalAddress?.streetAndNumber as MultilingualContent[];

            stateRef.value?.clearInput();
            state.value = props.presetPerson?.personalInfo.postalAddress?.state as MultilingualContent[];
            statePrivateRef.value?.clearInput();
            statePrivate.value = props.presetPerson?.personalInfo.privatePostalAddress?.state as MultilingualContent[];

            postalNumber.value = props.presetPerson?.personalInfo.postalAddress?.postalNumber;
            postalNumberPrivate.value = props.presetPerson?.personalInfo.privatePostalAddress?.postalNumber;

            selectedSex.value = {title: props.presetPerson?.personalInfo.sex ? getTitleFromValueAutoLocale(props.presetPerson?.personalInfo.sex as Sex) as string : "", value: props.presetPerson?.personalInfo.sex ? props.presetPerson?.personalInfo.sex as Sex : undefined};

            setAdditionalInfo();

            uris.value = props.presetPerson?.personalInfo.uris as string[];
            placeOfBirth.value = props.presetPerson?.personalInfo.placeOfBirth;

            email.value = props.presetPerson?.personalInfo.contact.contactEmail;
            phoneNumber.value = props.presetPerson?.personalInfo.contact.phoneNumber;
            faxNumber.value = props.presetPerson?.personalInfo.contact.faxNumber;
            mobilePhoneNumber.value = props.presetPerson?.personalInfo.contact.mobilePhoneNumber;

            emailPrivate.value = props.presetPerson?.personalInfo.privateContact?.contactEmail;
            phoneNumberPrivate.value = props.presetPerson?.personalInfo.privateContact?.phoneNumber;
            faxNumberPrivate.value = props.presetPerson?.personalInfo.privateContact?.faxNumber;
            mobilePhoneNumberPrivate.value = props.presetPerson?.personalInfo.privateContact?.mobilePhoneNumber;

            birthdate.value = props.presetPerson?.personalInfo.localBirthDate;
            orcid.value = props.presetPerson?.personalInfo.orcid;
            eCrisId.value = props.presetPerson?.personalInfo.eCrisId;
            eNaukaId.value = props.presetPerson?.personalInfo.eNaukaId;
            apvnt.value = props.presetPerson?.personalInfo.apvnt;
            scopus.value = props.presetPerson?.personalInfo.scopusAuthorId;
            openAlex.value = props.presetPerson?.personalInfo.openAlexId;
            webOfScienceId.value = props.presetPerson?.personalInfo.webOfScienceResearcherId;
            nationalScienceId.value = props.presetPerson?.personalInfo.nationalScienceId;
            scholarId.value = props.presetPerson?.personalInfo.scholarId;
            authenticusId.value = props.presetPerson?.personalInfo.authenticusId;
            lattesId.value = props.presetPerson?.personalInfo.lattesId;
            urisRef.value?.refreshModelValue(uris.value);

            cityRef.value?.forceRefreshModelValue(toMultilingualTextInput(city.value, languageTags.value));
            streetAndNumberRef.value?.forceRefreshModelValue(toMultilingualTextInput(streetAndNumber.value, languageTags.value));
            stateRef.value?.forceRefreshModelValue(toMultilingualTextInput(state.value, languageTags.value));
            
            cityPrivateRef.value?.forceRefreshModelValue(toMultilingualTextInput(cityPrivate.value, languageTags.value));
            streetAndNumberPrivateRef.value?.forceRefreshModelValue(toMultilingualTextInput(streetAndNumberPrivate.value, languageTags.value));
            statePrivateRef.value?.forceRefreshModelValue(toMultilingualTextInput(statePrivate.value, languageTags.value));
        };

        return {
            isFormValid, email, phoneNumber, birthdate, snackbar,
            orcid, eCrisId, eNaukaId, apvnt, scopus, sexes, selectedSex,
            toMultilingualTextInput, languageTags, submit, message,
            placeOfBirth, city, streetAndNumber, countries, selectedCountry,
            apvntValidationRules, eCrisIdValidationRules, eNaukaIdValidationRules,
            orcidValidationRules, scopusAuthorIdValidationRules, cityRef,
            streetAndNumberRef, refreshForm, uris, urisRef, displayTitle,
            personOpenAlexIdValidationRules, openAlex, webOfScienceId,
            personWebOfScienceIdValidationRules, state, stateRef, postalNumber,
            faxNumber, mobilePhoneNumber, scholarIdValidationRules,
            personAuthenticusIdValidationRules, lattesIdValidationRules,
            nationalScienceId, scholarId, authenticusId, lattesId,
            emailPrivate, phoneNumberPrivate, faxNumberPrivate,
            mobilePhoneNumberPrivate, cityPrivateRef, statePrivateRef,
            streetAndNumberPrivateRef, cityPrivate, statePrivate,
            streetAndNumberPrivate, postalNumberPrivate, selectedCountryPrivate
        };
    }
});
</script>
