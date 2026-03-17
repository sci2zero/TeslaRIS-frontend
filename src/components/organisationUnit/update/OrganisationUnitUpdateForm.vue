<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameRef"
                            v-model="name"
                            :rules="requiredFieldRules"
                            :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetOU?.name, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameAbbreviationRef"
                            v-model="nameAbbreviation"
                            :label="$t('nameAbbreviationLabel')"
                            :initial-value="toMultilingualTextInput(presetOU?.nameAbbreviation, languageTags)"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field
                            v-model="email"
                            :label="$t('emailLabel')"
                            :placeholder="$t('emailLabel')"
                            :rules="nonMandatoryEmailFieldRules"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
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
                            v-model="scopusAfid"
                            label="Scopus AFID"
                            placeholder="Scopus AFID"
                            :rules="scopusAfidValidationRules"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="openAlexId"
                            label="Open Alex ID"
                            placeholder="Open Alex ID"
                            :rules="institutionOpenAlexIdValidationRules"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field
                            v-model="ror"
                            label="ROR ID"
                            placeholder="Research Organisation Registry ID"
                            :rules="rorValidationRules"
                        />
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
                    <v-checkbox
                        v-model="legalEntity"
                        :label="$t('legalEntityLabel')"
                    ></v-checkbox>
                </v-row>
                <v-container class="section-box">
                    <v-row v-if="isAdmin">
                        <v-checkbox
                            v-model="clientInstitutionCris"
                            :label="$t('clientInstitutionCrisLabel')"
                        ></v-checkbox>
                    </v-row>
                    <v-row v-if="clientInstitutionCris">
                        <v-checkbox
                            v-model="validatingEmailDomainCris"
                            :label="$t('validatingEmailDomainLabel')"
                        ></v-checkbox>
                        <v-checkbox
                            v-if="validatingEmailDomainCris"
                            v-model="allowingSubdomainsCris"
                            :label="$t('allowingSubdomainsLabel')"
                        ></v-checkbox>
                    </v-row>
                    <v-row v-if="clientInstitutionCris && validatingEmailDomainCris">
                        <v-col cols="12">
                            <v-text-field
                                v-model="institutionEmailDomainCris"
                                :label="$t('institutionEmailDomainLabel') + '*'"
                                :placeholder="$t('institutionEmailDomainLabel') + '*'"
                                :rules="requiredFieldRules">
                            </v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
                <v-container class="section-box mt-2 mb-2">
                    <v-row>
                        <v-col>
                            <v-checkbox
                                v-model="clientInstitutionDl"
                                :label="$t('clientInstitutionDlLabel')"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row v-if="isAdmin && clientInstitutionDl">
                        <v-col>
                            <v-checkbox
                                v-model="validatingEmailDomainDl"
                                :label="$t('validatingEmailDomainLabel')"
                            ></v-checkbox>
                        </v-col>
                        <v-col>
                            <v-checkbox
                                v-if="validatingEmailDomainDl"
                                v-model="allowingSubdomainsDl"
                                :label="$t('allowingSubdomainsLabel')"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                    <v-row v-if="isAdmin && clientInstitutionDl && validatingEmailDomainDl">
                        <v-col cols="12">
                            <v-text-field
                                v-model="institutionEmailDomainDl"
                                :label="$t('institutionEmailDomainLabel') + '*'"
                                :placeholder="$t('institutionEmailDomainLabel') + '*'"
                                :rules="requiredFieldRules">
                            </v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
                <v-row>
                    <v-col>
                        <uri-input ref="urisRef" v-model="uris" is-website></uri-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-select
                            v-model="selectedThesisType"
                            :label="$t('thesisTypeLabel')"
                            :items="thesisTypes"
                            :rules="requiredSelectionRules"
                            multiple
                            return-object
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <open-layers-map
                            ref="mapRef"
                            :read-only="false"
                            :init-address="presetOU?.location?.address"
                            :init-coordinates="[presetOU?.location?.longitude as number, presetOU?.location?.latitude as number]">
                        </open-layers-map>
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

    <toast v-model="snackbar" :message="message" />
</template>

<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { MultilingualContent } from '@/models/Common';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { type OrganisationUnitRequest, type OrganisationUnitResponse, OrganisationUnitSector } from '@/models/OrganisationUnitModel';
import OpenLayersMap from '@/components/core/OpenLayersMap.vue';
import UriInput from '@/components/core/UriInput.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import OrganisationUnitService from '@/services/OrganisationUnitService';
import Toast from '@/components/core/Toast.vue';
import { useI18n } from 'vue-i18n';
import { getThesisTitleFromValueAutoLocale, getThesisTypesForGivenLocale } from '@/i18n/thesisType';
import { ThesisType } from '@/models/PublicationModel';
import { useUserRole } from '@/composables/useUserRole';
import { getOUSectorFromValueAutoLocale, getOUSectorsForGivenLocale } from '@/i18n/ouSector';


export default defineComponent({
    name: "OrganisationUnitUpdateForm",
    components: { MultilingualTextInput, OpenLayersMap, UriInput, Toast },
    props: {
        presetOU: {
            type: Object as PropType<OrganisationUnitResponse | undefined>,
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
        const { isAdmin } = useUserRole();

        const snackbar = ref(false);
        const message = ref("");
        const i18n = useI18n();

        watch(() => props.presetOU, () => {
            if (props.presetOU) {
                refreshForm();
            }
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const nameAbbreviationRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();
        const urisRef = ref<typeof UriInput>();

        const name = ref<any>([]);
        const nameAbbreviation = ref<any>([]);
        const email = ref(props.presetOU?.contact?.contactEmail);
        const phoneNumber = ref(props.presetOU?.contact?.phoneNumber);
        const scopusAfid = ref(props.presetOU?.scopusAfid);
        const openAlexId = ref(props.presetOU?.openAlexId);
        const ror = ref(props.presetOU?.ror);
        const ringgold = ref(props.presetOU?.ringgold);
        const fundref = ref(props.presetOU?.fundref);
        const isni = ref(props.presetOU?.isni);
        const athensId = ref(props.presetOU?.athensId);
        const ncesId = ref(props.presetOU?.ncesId);
        const fctId = ref(props.presetOU?.fctId);
        const dgeecId = ref(props.presetOU?.dgeecId);
        const nifId = ref(props.presetOU?.nifId);
        const uris = ref<string[]>(props.presetOU?.uris as string[]);

        const startup = ref(props.presetOU?.startup);
        const dateEstablished = ref(props.presetOU?.dateEstablished);

        const clientInstitutionCris = ref(props.presetOU?.clientInstitutionCris);
        const validatingEmailDomainCris = ref(props.presetOU?.validatingEmailDomainCris);
        const allowingSubdomainsCris = ref(props.presetOU?.allowingSubdomainsCris);
        const institutionEmailDomainCris = ref(props.presetOU?.institutionEmailDomainCris);

        const clientInstitutionDl = ref(props.presetOU?.clientInstitutionDl);
        const validatingEmailDomainDl = ref(props.presetOU?.validatingEmailDomainDl);
        const allowingSubdomainsDl = ref(props.presetOU?.allowingSubdomainsDl);
        const institutionEmailDomainDl = ref(props.presetOU?.institutionEmailDomainDl);

        const legalEntity = ref(props.presetOU?.legalEntity);

        const thesisTypes = getThesisTypesForGivenLocale();
        const selectedThesisType = ref<{title: string, value: ThesisType | null}[]>(
            props.presetOU ?props.presetOU?.allowedThesisTypes.map(type => {
                return {title: getThesisTitleFromValueAutoLocale(type) as string, value: type};
            })
            : [{ title: "", value: null }]
        );

        const ouSectors = getOUSectorsForGivenLocale();
        const selectedOuSector = ref<{title: string, value: OrganisationUnitSector | null}>(
            { 
                title: getOUSectorFromValueAutoLocale(props.presetOU?.sector ? props.presetOU?.sector : OrganisationUnitSector.ACADEMIC) as string, 
                value: props.presetOU?.sector ? props.presetOU?.sector : OrganisationUnitSector.ACADEMIC 
            }
        );

        const {
            requiredFieldRules, scopusAfidValidationRules, rorValidationRules,
            nonMandatoryEmailFieldRules, institutionOpenAlexIdValidationRules,
            requiredSelectionRules, ringgoldValidationRules, fundrefValidationRules,
            isniValidationRules, athensIdValidationRules, ncesIdValidationRules,
            fctIdValidationRules, dgeecIdValidationRules, nifIdValidationRules
        } = useValidationUtils();

        const submit = async () => {
            if (props.inModal) {
                const organisationUnitId = props.presetOU?.id as number;
                const identifiers = [
                    { value: scopusAfid.value, error: "scopusAfidExistsError" }
                ].filter(id => id.value);

                const results = await Promise.all(
                    identifiers.map(id => OrganisationUnitService.checkIdentifierUsage(id.value as string, organisationUnitId))
                );

                const firstDuplicate = identifiers.find((_, index) => results[index].data);
                if (firstDuplicate) {
                    message.value = i18n.t(firstDuplicate.error);
                    snackbar.value = true;
                    return;
                }
            }

            const updatedOU: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                keyword: props.presetOU?.keyword as MultilingualContent[],
                description: props.presetOU?.description as MultilingualContent[],
                researchAreasId: [],
                location: {latitude: mapRef.value?.currentPosition.lat, longitude: mapRef.value?.currentPosition.lon, address: mapRef.value?.address},
                contact: {contactEmail: email.value as string, phoneNumber: phoneNumber.value as string},
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
                clientInstitutionCris: clientInstitutionCris.value as boolean,
                validatingEmailDomainCris: validatingEmailDomainCris.value as boolean,
                allowingSubdomainsCris: allowingSubdomainsCris.value as boolean,
                institutionEmailDomainCris: institutionEmailDomainCris.value as string,
                legalEntity: legalEntity.value as boolean,
                clientInstitutionDl: clientInstitutionDl.value as boolean,
                validatingEmailDomainDl: validatingEmailDomainDl.value as boolean,
                allowingSubdomainsDl: allowingSubdomainsDl.value as boolean,
                institutionEmailDomainDl: institutionEmailDomainDl.value as string,
                sector: selectedOuSector.value.value as OrganisationUnitSector,
                startup: startup.value,
                dateEstablished: dateEstablished.value
            };

            emit("update", updatedOU);
        };

        const refreshForm = () => {
            nameRef.value?.clearInput();
            name.value = props.presetOU?.name as MultilingualContent[];
            nameAbbreviationRef.value?.clearInput();
            nameAbbreviation.value = props.presetOU?.nameAbbreviation as MultilingualContent[];

            uris.value = props.presetOU?.uris as string[];
            email.value = props.presetOU?.contact?.contactEmail;
            phoneNumber.value = props.presetOU?.contact?.phoneNumber;
            scopusAfid.value = props.presetOU?.scopusAfid;
            openAlexId.value = props.presetOU?.openAlexId;
            ror.value = props.presetOU?.ror;
            ringgold.value = props.presetOU?.ringgold;
            fundref.value = props.presetOU?.fundref;
            isni.value = props.presetOU?.isni;
            athensId.value = props.presetOU?.athensId;
            ncesId.value = props.presetOU?.ncesId;
            nifId.value = props.presetOU?.nifId;
            dgeecId.value = props.presetOU?.dgeecId;
            fctId.value = props.presetOU?.fctId;
            selectedOuSector.value = {
                title: getOUSectorFromValueAutoLocale(props.presetOU?.sector as  OrganisationUnitSector) as string,
                value: props.presetOU?.sector as OrganisationUnitSector
            };
            startup.value = props.presetOU?.startup;
            dateEstablished.value = props.presetOU?.dateEstablished;
            urisRef.value?.refreshModelValue(uris.value);

            clientInstitutionCris.value = props.presetOU?.clientInstitutionCris;
            validatingEmailDomainCris.value = props.presetOU?.validatingEmailDomainCris;
            allowingSubdomainsCris.value = props.presetOU?.allowingSubdomainsCris;
            institutionEmailDomainCris.value = props.presetOU?.institutionEmailDomainCris;
            clientInstitutionDl.value = props.presetOU?.clientInstitutionDl;
            validatingEmailDomainDl.value = props.presetOU?.validatingEmailDomainDl;
            allowingSubdomainsDl.value = props.presetOU?.allowingSubdomainsDl;
            institutionEmailDomainDl.value = props.presetOU?.institutionEmailDomainDl;
            legalEntity.value = props.presetOU?.legalEntity;
            
            selectedThesisType.value.splice(0);
            props.presetOU?.allowedThesisTypes.forEach(type => {
                selectedThesisType.value.push({title: getThesisTitleFromValueAutoLocale(type) as string, value: type});
            });

            nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageTags.value));
            nameAbbreviationRef.value?.forceRefreshModelValue(toMultilingualTextInput(nameAbbreviation.value, languageTags.value));
        };

        return {
            isFormValid, name, mapRef,
            nameAbbreviation, refreshForm,
            email, phoneNumber, scopusAfid,
            requiredFieldRules, submit, message,
            toMultilingualTextInput, languageTags,
            scopusAfidValidationRules, nameRef, uris,
            nonMandatoryEmailFieldRules, snackbar, ror,
            openAlexId, institutionOpenAlexIdValidationRules,
            rorValidationRules, thesisTypes, selectedThesisType,
            requiredSelectionRules, clientInstitutionCris,
            validatingEmailDomainCris, allowingSubdomainsCris,
            institutionEmailDomainCris, isAdmin, legalEntity,
            clientInstitutionDl, validatingEmailDomainDl,
            allowingSubdomainsDl, institutionEmailDomainDl,
            nameAbbreviationRef, ringgold, fundref, isni,
            athensId, ncesId, fctId, dgeecId, nifId, ouSectors,
            selectedOuSector, startup, dateEstablished,
            ringgoldValidationRules, fundrefValidationRules,
            isniValidationRules, athensIdValidationRules, 
            ncesIdValidationRules, fctIdValidationRules,
            dgeecIdValidationRules, nifIdValidationRules
        };
    }
});
</script>
