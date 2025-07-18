<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col :cols="inModal ? 12 : 8">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="nameAbbreviation" :label="$t('nameAbbreviationLabel')" :placeholder="$t('nameAbbreviationLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-btn color="blue darken-1" @click="additionalFields = !additionalFields">
                    {{ $t("additionalFieldsLabel") }} {{ additionalFields ? "▲" : "▼" }}
                </v-btn>
                <v-container v-if="additionalFields">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')" :rules="nonMandatoryEmailFieldRules"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="scopusAfid" label="Scopus AFID" placeholder="Scopus AFID" :rules="scopusAfidValidationRules"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="openAlexId" label="Open Alex ID" placeholder="Open Alex ID" :rules="institutionOpenAlexIdValidationRules"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="ror" label="ROR ID" placeholder="Research Organisation Registry ID" :rules="rorValidationRules"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <multilingual-text-input ref="keywordsRef" v-model="keywords" :label="$t('keywordsLabel')" is-area></multilingual-text-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <uri-input ref="urisRef" v-model="uris" is-website></uri-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <open-layers-map ref="mapRef" :read-only="false"></open-layers-map>
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
import { defineComponent, watch } from 'vue';
import MultilingualTextInput from '../core/MultilingualTextInput.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { OrganisationUnitRequest } from "@/models/OrganisationUnitModel";
import OpenLayersMap from '../core/OpenLayersMap.vue';
import OrganisationUnitService from "@/services/OrganisationUnitService";
import { useValidationUtils } from '@/utils/ValidationUtils';
import { getErrorMessageForErrorKey } from '@/i18n';
import { useI18n } from 'vue-i18n';
import UriInput from '../core/UriInput.vue';
import Toast from '../core/Toast.vue';
import { useLanguageTags } from '@/composables/useLanguageTags';
import type { MultilingualContent } from '@/models/Common';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import { useUserRole } from '@/composables/useUserRole';


export default defineComponent({
    name: "SubmitOrganizationUnit",
    components: {MultilingualTextInput, OpenLayersMap, UriInput, Toast},
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

        const nameRef = ref<typeof MultilingualTextInput>();
        const keywordsRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();

        const name = ref<any[]>([]);
        const nameAbbreviation = ref("");
        const email = ref("");
        const scopusAfid = ref("");
        const openAlexId = ref("");
        const ror = ref("");
        const phoneNumber = ref("");
        const keywords = ref([]);
        const uris = ref<string[]>([]);

        const { languageTags } = useLanguageTags();
        const { loggedInUser } = useUserRole();
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
            institutionOpenAlexIdValidationRules
        } = useValidationUtils();

        const submit = (stayOnPage: boolean) => {
            const newOu: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                keyword: keywords.value,
                researchAreasId: [],
                location: {latitude: mapRef.value?.currentPosition.lat, longitude: mapRef.value?.currentPosition.lon, address: mapRef.value?.address},
                contact: {contactEmail: email.value, phoneNumber: phoneNumber.value},
                scopusAfid: scopusAfid.value,
                openAlexId: openAlexId.value,
                ror: ror.value,
                uris: uris.value
            };

            OrganisationUnitService.createOrganisationUnit(newOu).then((response) => {
                if (props.inModal) {
                    emit("create", response.data);
                    return;
                }

                if (stayOnPage) {
                    nameRef.value?.clearInput();
                    keywordsRef.value?.clearInput();
                    nameAbbreviation.value = "";
                    email.value = "";
                    phoneNumber.value = "";
                    scopusAfid.value = "";
                    openAlexId.value = "";
                    ror.value = "";
                    mapRef.value?.clearInput();

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
            isFormValid, 
            additionalFields,
            snackbar, message,
            name, nameRef,
            nameAbbreviation,
            email, phoneNumber,
            keywords, keywordsRef,
            requiredFieldRules,
            submit, mapRef,
            scopusAfid, uris,
            scopusAfidValidationRules,
            nonMandatoryEmailFieldRules,
            openAlexId, rorValidationRules, ror,
            institutionOpenAlexIdValidationRules
        };
    }
});
</script>
