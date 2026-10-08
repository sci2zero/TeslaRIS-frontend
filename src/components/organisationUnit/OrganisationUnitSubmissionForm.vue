<template>
    <v-form v-model="isFormValid" class="flex flex-col gap-6" @submit.prevent>
        <form-section
            icon="mdi-domain"
            :title="$t('organisationUnitLabel')"
            :description="$t('organisationUnitDetailsHint')"
        >
            <multilingual-text-input
                ref="nameRef"
                v-model="name"
                :rules="requiredFieldRules"
                :label="$t('nameLabel') + '*'"
            />
            <multilingual-text-input
                ref="nameAbbreviationRef"
                v-model="nameAbbreviation"
                :label="$t('nameAbbreviationLabel')"
            />
        </form-section>

        <form-section :title="$t('additionalFieldsLabel')">
            <ui-button variant="outline" type="button" @click="additionalFields = !additionalFields">
                {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
            </ui-button>
            <template v-if="additionalFields">
                <multilingual-text-input
                    ref="descriptionRef"
                    v-model="description"
                    :label="$t('descriptionLabel')"
                />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="email" :label="$t('emailLabel')" :rules="nonMandatoryEmailFieldRules" />
                    <ui-input v-model="phoneNumber" :label="$t('phoneNumberLabel')" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="scopusAfid" label="Scopus AFID" :rules="scopusAfidValidationRules" />
                    <ui-input v-model="openAlexId" label="Open Alex ID" :rules="institutionOpenAlexIdValidationRules" />
                </div>
                <ui-input v-model="ror" label="ROR ID" placeholder="Research Organisation Registry ID" :rules="rorValidationRules" />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="ringgold" label="Ringgold ID" :rules="ringgoldValidationRules" />
                    <ui-input v-model="fundref" label="FundRef" :rules="fundrefValidationRules" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="isni" label="ISNI" :rules="isniValidationRules" />
                    <ui-input v-model="fctId" label="FCT ID" :rules="fctIdValidationRules" />
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="grid" label="GRID" :rules="gridValidationRules" />
                    <ui-input v-model="wikidata" label="Wikidata ID" :rules="wikidataValidationRules" />
                </div>
                <ui-input
                    v-model="nationalId"
                    :label="$t('nationalIdLabel')"
                    :rules="organisationUnitNationalIdValidationRules"
                />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ui-input v-model="numberOfEmployees" :label="$t('numberOfEmployeesLabel')" />
                    <ui-input v-model="taxNumber" :label="$t('taxNumberLabel')" :rules="taxNumberValidationRules" />
                </div>
                <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area />
                <uri-input ref="urisRef" v-model="uris" is-website />
                <ui-input
                    v-model="selectedThesisType"
                    control="select"
                    :label="$t('thesisTypeLabel') + '*'"
                    :items="thesisTypes"
                    :rules="requiredSelectionRules"
                    multiple
                    return-object
                />
                <ui-input
                    v-model="selectedOuSector"
                    control="select"
                    :label="$t('organisationUnitSectorLabel')"
                    :items="ouSectors"
                    return-object
                />
                <ui-checkbox v-model="startup" :label="$t('startupLabel')" />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <date-picker v-model="dateEstablished" :label="$t('dateEstablishedLabel')" color="primary" />
                    <date-picker v-model="dateDissolved" :label="$t('dateDissolvedLabel')" color="primary" />
                </div>
                <ui-checkbox v-if="isAdmin" v-model="active" :label="$t('activeLabel')" />
                <ui-checkbox v-if="isAdmin" v-model="legalEntity" :label="$t('legalEntityLabel')" />

                <div v-if="isAdmin" class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <ui-checkbox v-model="clientInstitutionCris" :label="$t('clientInstitutionCrisLabel')" />
                    <div v-if="clientInstitutionCris" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ui-checkbox v-model="validatingEmailDomainCris" :label="$t('validatingEmailDomainLabel')" />
                        <ui-checkbox
                            v-if="validatingEmailDomainCris"
                            v-model="allowingSubdomainsCris"
                            :label="$t('allowingSubdomainsLabel')"
                        />
                    </div>
                    <ui-input
                        v-if="clientInstitutionCris && validatingEmailDomainCris"
                        v-model="institutionEmailDomainCris"
                        :label="$t('institutionEmailDomainLabel') + '*'"
                        :rules="requiredFieldRules"
                    />
                </div>

                <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <ui-checkbox v-model="clientInstitutionDl" :label="$t('clientInstitutionDlLabel')" />
                    <div v-if="isAdmin && clientInstitutionDl" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ui-checkbox v-model="validatingEmailDomainDl" :label="$t('validatingEmailDomainLabel')" />
                        <ui-checkbox
                            v-if="validatingEmailDomainDl"
                            v-model="allowingSubdomainsDl"
                            :label="$t('allowingSubdomainsLabel')"
                        />
                    </div>
                    <ui-input
                        v-if="isAdmin && clientInstitutionDl && validatingEmailDomainDl"
                        v-model="institutionEmailDomainDl"
                        :label="$t('institutionEmailDomainLabel') + '*'"
                        :rules="requiredFieldRules"
                    />
                </div>

                <div class="flex flex-col gap-4">
                    <p class="text-sm font-semibold text-slate-800">
                        {{ $t('addressLabel') }}
                    </p>
                    <ui-input
                        v-model="selectedCountry"
                        control="select"
                        hide-details="auto"
                        :items="countries"
                        :label="$t('countryLabel')"
                        return-object
                    />
                    <multilingual-text-input ref="cityRef" v-model="city" :label="$t('cityLabel')" />
                    <multilingual-text-input ref="streetAndNumberRef" v-model="streetAndNumber" :label="$t('streetAndNumberLabel')" />
                    <multilingual-text-input ref="stateRef" v-model="state" :label="$t('stateLabel')" />
                    <ui-input v-model="postalNumber" :label="$t('postalNumberLabel')" />
                    <open-layers-map ref="mapRef" :read-only="false" />
                </div>
            </template>
        </form-section>

        <p class="text-sm text-slate-500">
            {{ $t("requiredFieldsMessage") }}
        </p>
    </v-form>
    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { type OrganisationUnitRequest, OrganisationUnitSector } from "@/models/OrganisationUnitModel";
import OpenLayersMap from '../core/OpenLayersMap.vue';
import OrganisationUnitService from "@/services/OrganisationUnitService";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getErrorMessageForErrorKey } from '@/i18n';
import { useI18n } from 'vue-i18n';
import UriInput from '../core/UriInput.vue';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import type { Country, MultilingualContent } from '@/models/Common';
import { returnCurrentLocaleContent, toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import { getOUSectorFromValueAutoLocale, getOUSectorsForGivenLocale } from '@/i18n/ouSector';
import DatePicker from '../core/DatePicker.vue';
import CountryService from '@/services/CountryService';
import { type AxiosResponse } from 'axios';
import { detectLanguage } from '@/utils/LanguageDetector.js';
import { useUserRole } from '@/composables/useUserRole.js';
import UiInput from '@/components/ui/input/Input.vue';
import UiCheckbox from '@/components/ui/checkbox/Checkbox.vue';
import FormSection from '@/components/ui/form-section/FormSection.vue';
import { UiButton } from '@/components/ui/button';


export default defineComponent({
    name: "SubmitOrganizationUnit",
    components: { MultilingualTextInput, OpenLayersMap, UriInput, Toast, DatePicker, UiInput, UiCheckbox, FormSection, UiButton },
    props: {
        inModal: {
            type: Boolean,
            default: false
        },
        presetName: {
            type: String,
            default: ""
        }
    },
    emits: ["create"],
    setup(props, { emit }) {
        const isFormValid = ref(false);
        const additionalFields = ref(false);

        const snackbar = ref(false);
        const message = ref("");

        const i18n = useI18n();
        const router = useRouter();

        const { isAdmin } = useUserRole();

        onMounted(() => {
            fetchCountries();
        });

        const fetchCountries = () => {
            CountryService.readAllCountries().then(
                (response: AxiosResponse<Country[]>) => {
                    countries.value = [{ title: "", value: -1}];
                    response.data.forEach(country => {
                        countries.value.push(
                            {
                                title: returnCurrentLocaleContent(country.name) as string,
                                value: country.id as number
                            }
                        );
                    });
                }
            );
        };

        const nameRef = ref<typeof MultilingualTextInput>();
        const nameAbbreviationRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const descriptionRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();

        const name = ref<any[]>([]);
        const nameAbbreviation = ref<any[]>([]);
        const description = ref<any[]>([]);
        const email = ref("");
        const scopusAfid = ref("");
        const openAlexId = ref("");
        const ror = ref("");
        const ringgold = ref("");
        const fundref = ref("");
        const isni = ref("");
        const fctId = ref("");
        const grid = ref("");
        const wikidata = ref("");
        const nationalId = ref("");
        const taxNumber = ref("");
        const numberOfEmployees = ref("");

        const phoneNumber = ref("");
        const keywords = ref([]);
        const uris = ref<string[]>([]);

        const clientInstitutionCris = ref(false);
        const validatingEmailDomainCris = ref(false);
        const allowingSubdomainsCris = ref(false);
        const institutionEmailDomainCris = ref("");
        const clientInstitutionDl = ref(false);
        const validatingEmailDomainDl = ref(false);
        const allowingSubdomainsDl = ref(false);
        const institutionEmailDomainDl = ref("");
        const legalEntity = ref(false);
        const startup = ref(false);
        const dateEstablished = ref();
        const dateDissolved = ref();
        const active = ref(true);

        const cityRef = ref<typeof MultilingualTextInput>();
        const streetAndNumberRef = ref<typeof MultilingualTextInput>();
        const stateRef = ref<typeof MultilingualTextInput>();
        const city = ref<any>([]);
        const streetAndNumber = ref<any>([]);
        const state = ref<any>([]);
        const postalNumber = ref();

        const countries = ref<{title: string, value: number}[]>([]);
        const selectedCountry = ref<{title: string, value: number}>({ title: "", value: -1 });

        const thesisTypes = getThesisTypesForGivenLocale();
        const selectedThesisType = ref<{title: string, value: ThesisType | null}[]>([{ title: "", value: null }]);

        const ouSectors = getOUSectorsForGivenLocale();
        const selectedOuSector = ref<{title: string, value: OrganisationUnitSector | null}>(
            { 
                title: getOUSectorFromValueAutoLocale(OrganisationUnitSector.ACADEMIC) as string, 
                value: OrganisationUnitSector.ACADEMIC 
            }
        );

        const { languageTags } = useLanguageTags();

        watch(() => languageTags.value, () => {
            presetName();
        });

        const presetName = async () => {
            if (props.presetName) {
                const detectedLocale = await detectLanguage(props.presetName);
                const tag = languageTags.value.find(
                    lt => lt.languageCode === detectedLocale
                );

                if (tag) {
                    const mc: MultilingualContent[] = [
                        {
                            content: props.presetName,
                            languageTag: tag.languageCode,
                            languageTagId: tag.id,
                            priority: 1
                        }
                    ];
                    name.value = mc;
                    nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(mc, languageTags.value));
                }
            }
        };

        const {
            requiredFieldRules, scopusAfidValidationRules,
            nonMandatoryEmailFieldRules, rorValidationRules,
            institutionOpenAlexIdValidationRules,
            requiredSelectionRules, ringgoldValidationRules,
            fundrefValidationRules, isniValidationRules,
            fctIdValidationRules, taxNumberValidationRules,
            gridValidationRules, wikidataValidationRules,
            organisationUnitNationalIdValidationRules
        } = useValidationUtils();

        const submit = (stayOnPage: boolean) => {
            const newOu: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: description.value,
                keyword: keywords.value,
                researchAreasId: [],
                location: {
                    latitude: mapRef.value?.currentPosition.lat,
                    longitude: mapRef.value?.currentPosition.lon,
                    address: mapRef.value?.address
                },
                contact: {
                    contactEmail: email.value,
                    phoneNumber: phoneNumber.value
                },
                scopusAfid: scopusAfid.value,
                openAlexId: openAlexId.value,
                ror: ror.value,
                ringgold: ringgold.value,
                fundref: fundref.value,
                isni: isni.value,
                fctId: fctId.value,
                taxNumber: taxNumber.value,
                grid: grid.value,
                wikidata: wikidata.value,
                nationalId: nationalId.value,
                uris: uris.value,
                allowedThesisTypes: selectedThesisType.value.filter(type => type.value !== null).map(type => type.value) as ThesisType[],
                clientInstitutionCris: clientInstitutionCris.value,
                validatingEmailDomainCris: validatingEmailDomainCris.value,
                allowingSubdomainsCris: allowingSubdomainsCris.value,
                institutionEmailDomainCris: institutionEmailDomainCris.value,
                legalEntity: legalEntity.value,
                clientInstitutionDl: clientInstitutionDl.value,
                validatingEmailDomainDl: validatingEmailDomainDl.value,
                allowingSubdomainsDl: allowingSubdomainsDl.value,
                institutionEmailDomainDl: institutionEmailDomainDl.value,
                sector: selectedOuSector.value.value as OrganisationUnitSector,
                startup: startup.value,
                dateEstablished: dateEstablished.value,
                dateDissolved: dateDissolved.value,
                active: active.value,
                numberOfEmployees: numberOfEmployees.value,
                postalAddress: {
                    city: city.value,
                    countryId: selectedCountry.value?.value as number,
                    streetAndNumber: streetAndNumber.value,
                    state: state.value,
                    postalNumber: postalNumber.value as string
                }
            };

            OrganisationUnitService.createOrganisationUnit(newOu).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

                if (stayOnPage) {
                    nameRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    nameAbbreviationRef.value?.clearInput();
                    descriptionRef.value?.clearInput();
                    email.value = "";
                    phoneNumber.value = "";
                    scopusAfid.value = "";
                    openAlexId.value = "";
                    ror.value = "";
                    ringgold.value = "";
                    fundref.value = "";
                    isni.value = "";
                    fctId.value = "";
                    taxNumber.value = "";
                    grid.value = "";
                    wikidata.value = "";
                    nationalId.value = "";
                    numberOfEmployees.value = "";
                    active.value = true;
                    selectedThesisType.value = [];
                    selectedOuSector.value = 
                        { 
                            title: getOUSectorFromValueAutoLocale(OrganisationUnitSector.ACADEMIC) as string, 
                            value: OrganisationUnitSector.ACADEMIC 
                        };
                    mapRef.value?.clearInput();
                    clientInstitutionCris.value = false;
                    validatingEmailDomainCris.value = false;
                    allowingSubdomainsCris.value = false;
                    institutionEmailDomainCris.value = "";
                    clientInstitutionDl.value = false;
                    validatingEmailDomainDl.value = false;
                    allowingSubdomainsDl.value = false;
                    institutionEmailDomainDl.value = "";
                    legalEntity.value = false;
                    startup.value = false;
                    dateEstablished.value = "";
                    dateDissolved.value = "";
                    cityRef.value?.clearInput();
                    streetAndNumberRef.value?.clearInput();
                    stateRef.value?.clearInput();
                    postalNumber.value = "";
                    selectedCountry.value = { title: "", value: -1 };

                    message.value = i18n.t("savedMessage");
                    snackbar.value = true;
                } else {
                    router.push({ name: "organisationUnitLandingPage", params: {id: response.data.id} });
                }
            }).catch((error) => {
                message.value = getErrorMessageForErrorKey(error.response.data.message);
                snackbar.value = true;
            });
        };

        return {
            isFormValid, nameAbbreviationRef,
            additionalFields, snackbar, message,
            name, nameRef, nameAbbreviation,
            email, phoneNumber, keywords, keywordsRef,
            requiredFieldRules, clientInstitutionCris,
            submit, mapRef, scopusAfid, uris,
            scopusAfidValidationRules, legalEntity,
            nonMandatoryEmailFieldRules, numberOfEmployees,
            openAlexId, rorValidationRules, ror,
            institutionOpenAlexIdValidationRules,
            thesisTypes, selectedThesisType, isAdmin,
            requiredSelectionRules, allowingSubdomainsCris,
            validatingEmailDomainCris, institutionEmailDomainCris,
            clientInstitutionDl, allowingSubdomainsDl, ouSectors,
            validatingEmailDomainDl, institutionEmailDomainDl,
            ringgoldValidationRules, fundrefValidationRules,
            isniValidationRules, fctIdValidationRules,
            ringgold, fundref, isni, fctId, taxNumber,
            selectedOuSector, startup, dateEstablished,
            description, descriptionRef, city, cityRef,
            streetAndNumber, streetAndNumberRef, state,
            stateRef, countries, selectedCountry, active,
            postalNumber, taxNumberValidationRules,
            grid, wikidata, nationalId, dateDissolved,
            gridValidationRules, wikidataValidationRules,
            organisationUnitNationalIdValidationRules
        };
    }
});
</script>
