<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameRef"
                            v-model="name"
                            :rules="requiredFieldRules"
                            :label="$t('nameLabel') + '*'"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameAbbreviationRef"
                            v-model="nameAbbreviation"
                            :label="$t('nameAbbreviationLabel')"
                        />
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="descriptionRef"
                                v-model="description"
                                :label="$t('descriptionLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')" :rules="nonMandatoryEmailFieldRules" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="scopusAfid" label="Scopus AFID" placeholder="Scopus AFID" :rules="scopusAfidValidationRules" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="openAlexId" label="Open Alex ID" placeholder="Open Alex ID" :rules="institutionOpenAlexIdValidationRules" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="ror" label="ROR ID" placeholder="Research Organisation Registry ID" :rules="rorValidationRules" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="ringgold" label="Ringgold ID" placeholder="Ringgold ID" :rules="ringgoldValidationRules" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="fundref" label="FundRef" placeholder="FundRef" :rules="fundrefValidationRules" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="isni" label="ISNI" placeholder="ISNI" :rules="isniValidationRules" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="athensId" label="Athens ID" placeholder="Athens ID" :rules="athensIdValidationRules" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="ncesId" label="NCES ID" placeholder="NCES ID" :rules="ncesIdValidationRules" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="fctId" label="FCT ID" placeholder="FCT ID" :rules="fctIdValidationRules" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="dgeecId" label="DGEEC ID" placeholder="DGEEC ID" :rules="dgeecIdValidationRules" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="nifId" label="NIF ID" placeholder="NIF ID" :rules="nifIdValidationRules" />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris" is-website />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="selectedThesisType"
                                :label="$t('thesisTypeLabel') + '*'"
                                :items="thesisTypes"
                                :rules="requiredSelectionRules"
                                multiple
                                return-object
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select
                                v-model="selectedOuSector"
                                :label="$t('organisationUnitSectorLabel')"
                                :items="ouSectors"
                                return-object
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-checkbox
                                v-model="startup"
                                :label="$t('startupLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <date-picker
                                v-model="dateEstablished"
                                :label="$t('dateEstablishedLabel')"
                                color="primary"
                            />
                        </v-col>
                    </v-row>
                    <v-row v-if="isAdmin">
                        <v-col>
                            <v-checkbox
                                v-model="legalEntity"
                                :label="$t('legalEntityLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-container class="section-box">
                        <v-row v-if="isAdmin">
                            <v-col>
                                <v-checkbox
                                    v-model="clientInstitutionCris"
                                    :label="$t('clientInstitutionCrisLabel')"
                                />
                            </v-col>
                        </v-row>
                        <v-row v-if="isAdmin && clientInstitutionCris">
                            <v-col>
                                <v-checkbox
                                    v-model="validatingEmailDomainCris"
                                    :label="$t('validatingEmailDomainLabel')"
                                />
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-if="validatingEmailDomainCris"
                                    v-model="allowingSubdomainsCris"
                                    :label="$t('allowingSubdomainsLabel')"
                                />
                            </v-col>
                        </v-row>
                        <v-row v-if="isAdmin && clientInstitutionCris && validatingEmailDomainCris">
                            <v-col cols="12">
                                <v-text-field
                                    v-model="institutionEmailDomainCris"
                                    :label="$t('institutionEmailDomainLabel') + '*'"
                                    :placeholder="$t('institutionEmailDomainLabel') + '*'"
                                    :rules="requiredFieldRules"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-container class="section-box mt-2 mb-2">
                        <v-row>
                            <v-col>
                                <v-checkbox
                                    v-model="clientInstitutionDl"
                                    :label="$t('clientInstitutionDlLabel')"
                                />
                            </v-col>
                        </v-row>
                        <v-row v-if="isAdmin && clientInstitutionDl">
                            <v-col>
                                <v-checkbox
                                    v-model="validatingEmailDomainDl"
                                    :label="$t('validatingEmailDomainLabel')"
                                />
                            </v-col>
                            <v-col>
                                <v-checkbox
                                    v-if="validatingEmailDomainDl"
                                    v-model="allowingSubdomainsDl"
                                    :label="$t('allowingSubdomainsLabel')"
                                />
                            </v-col>
                        </v-row>
                        <v-row v-if="isAdmin && clientInstitutionDl && validatingEmailDomainDl">
                            <v-col cols="12">
                                <v-text-field
                                    v-model="institutionEmailDomainDl"
                                    :label="$t('institutionEmailDomainLabel') + '*'"
                                    :placeholder="$t('institutionEmailDomainLabel') + '*'"
                                    :rules="requiredFieldRules"
                                />
                            </v-col>
                        </v-row>
                    </v-container>
                    <h3>{{ $t('addressLabel') }}</h3>
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
                                :label="$t('cityLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="streetAndNumberRef"
                                v-model="streetAndNumber"
                                :label="$t('streetAndNumberLabel')"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <multilingual-text-input
                                ref="stateRef"
                                v-model="state"
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
                    <v-row>
                        <v-col cols="12">
                            <open-layers-map
                                ref="mapRef"
                                :read-only="false"
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
        </v-row>

        <v-row>
            <p class="required-fields-message">
                {{ $t("requiredFieldsMessage") }}
            </p>
        </v-row>
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
import { useUserRole } from '@/composables/useUserRole';
import { getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import { getOUSectorFromValueAutoLocale, getOUSectorsForGivenLocale } from '@/i18n/ouSector';
import DatePicker from '../core/DatePicker.vue';
import CountryService from '@/services/CountryService';
import { type AxiosResponse } from 'axios';


export default defineComponent({
    name: "SubmitOrganizationUnit",
    components: {MultilingualTextInput, OpenLayersMap, UriInput, Toast, DatePicker},
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
        const athensId = ref("");
        const ncesId = ref("");
        const fctId = ref("");
        const dgeecId = ref("");
        const nifId = ref("");

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
        const { loggedInUser, isAdmin } = useUserRole();

        watch(() => languageTags.value, () => {
            presetName();
        });

        const presetName = async () => {
            if (props.presetName) {
                const tag = languageTags.value.find(
                    lt => lt.languageCode === loggedInUser.value?.preferredReferenceCataloguingLanguage.toUpperCase()
                );
                if (tag) {
                    const mc: MultilingualContent[] = [
                        {content: props.presetName, languageTag: tag.languageCode, languageTagId: tag.id, priority: 1}
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
            athensIdValidationRules, ncesIdValidationRules,
            fctIdValidationRules, dgeecIdValidationRules,
            nifIdValidationRules
        } = useValidationUtils();

        const submit = (stayOnPage: boolean) => {
            const newOu: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                description: description.value,
                keyword: keywords.value,
                researchAreasId: [],
                location: {latitude: mapRef.value?.currentPosition.lat, longitude: mapRef.value?.currentPosition.lon, address: mapRef.value?.address},
                contact: {contactEmail: email.value, phoneNumber: phoneNumber.value},
                scopusAfid: scopusAfid.value,
                openAlexId: openAlexId.value,
                ror: ror.value,
                ringgold: ringgold.value,
                fundref: fundref.value,
                isni: isni.value,
                athensId: athensId.value,
                ncesId: ncesId.value,
                fctId: fctId.value,
                dgeecId: dgeecId.value,
                nifId: nifId.value,
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
                    athensId.value = "";
                    ncesId.value = "";
                    fctId.value = "";
                    dgeecId.value = "";
                    nifId.value = "";
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
            nonMandatoryEmailFieldRules,
            openAlexId, rorValidationRules, ror,
            institutionOpenAlexIdValidationRules,
            thesisTypes, selectedThesisType, isAdmin,
            requiredSelectionRules, allowingSubdomainsCris,
            validatingEmailDomainCris, institutionEmailDomainCris,
            clientInstitutionDl, allowingSubdomainsDl,
            validatingEmailDomainDl, institutionEmailDomainDl,
            ringgoldValidationRules, fundrefValidationRules,
            isniValidationRules, athensIdValidationRules,
            ncesIdValidationRules, fctIdValidationRules,
            dgeecIdValidationRules, nifIdValidationRules,
            ringgold, fundref, isni, athensId, ncesId,
            fctId, dgeecId, nifId, ouSectors,
            selectedOuSector, startup, dateEstablished,
            description, descriptionRef, city, cityRef,
            streetAndNumber, streetAndNumberRef, state,
            stateRef, countries, selectedCountry,
            postalNumber
        };
    }
});
</script>
