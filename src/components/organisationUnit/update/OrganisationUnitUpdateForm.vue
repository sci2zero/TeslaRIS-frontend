<template>
    <v-form v-model="isFormValid" @submit.prevent>
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12">
                        <multilingual-text-input
                            ref="nameRef" v-model="name" :rules="requiredFieldRules" :label="$t('nameLabel') + '*'"
                            :initial-value="toMultilingualTextInput(presetOU?.name, languageList)"></multilingual-text-input>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="nameAbbreviation" :label="$t('nameAbbreviationLabel')" :placeholder="$t('nameAbbreviationLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="email" :label="$t('emailLabel')" :placeholder="$t('emailLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="phoneNumber" :label="$t('phoneNumberLabel')" :placeholder="$t('phoneNumberLabel')"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="scopusAfid" label="Scopus AFID" placeholder="Scopus AFID" :rules="scopusAfidValidationRules"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <open-layers-map ref="mapRef" :read-only="false" :init-coordinates="[presetOU?.location?.longitude as number, presetOU?.location?.latitude as number]"></open-layers-map>
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
import { defineComponent, watch, type PropType } from 'vue';
import MultilingualTextInput from '@/components/core/MultilingualTextInput.vue';
import { ref } from 'vue';
import type { LanguageTagResponse, MultilingualContent } from '@/models/Common';
import { onMounted } from 'vue';
import LanguageService from '@/services/LanguageService';
import type { AxiosResponse } from 'axios';
import { useValidationUtils } from '@/utils/ValidationUtils';
import { toMultilingualTextInput } from '@/i18n/MultilingualContentUtil';
import type { OrganisationUnitRequest, OrganisationUnitResponse } from '@/models/OrganisationUnitModel';
import OpenLayersMap from '@/components/core/OpenLayersMap.vue';

export default defineComponent({
    name: "OrganisationUnitUpdateForm",
    components: { MultilingualTextInput, OpenLayersMap },
    props: {
        presetOU: {
            type: Object as PropType<OrganisationUnitResponse | undefined>,
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
        });

        watch(() => props.presetOU, () => {
            if (props.presetOU) {
                refreshForm();
            }
        });

        const nameRef = ref<typeof MultilingualTextInput>();
        const mapRef = ref<typeof OpenLayersMap>();

        const name = ref<any>([]);
        const nameAbbreviation = ref(props.presetOU?.nameAbbreviation);
        const email = ref(props.presetOU?.contact?.contactEmail);
        const phoneNumber = ref(props.presetOU?.contact?.phoneNumber);
        const scopusAfid = ref(props.presetOU?.scopusAfid);

        const { requiredFieldRules, scopusAfidValidationRules } = useValidationUtils();

        const updateOU = () => {
            const updatedOU: OrganisationUnitRequest = {
                name: name.value,
                nameAbbreviation: nameAbbreviation.value,
                keyword: props.presetOU?.keyword as MultilingualContent[],
                researchAreasId: [],
                location: {latitude: mapRef.value?.currentPosition.lat, longitude: mapRef.value?.currentPosition.lon, address: mapRef.value?.address},
                contact: {contactEmail: email.value as string, phoneNumber: phoneNumber.value as string},
                scopusAfid: scopusAfid.value
            };

            emit("update", updatedOU);
        };

        const refreshForm = () => {
            nameRef.value?.clearInput();
            name.value = props.presetOU?.name as MultilingualContent[];

            nameAbbreviation.value = props.presetOU?.nameAbbreviation;
            email.value = props.presetOU?.contact?.contactEmail;
            phoneNumber.value = props.presetOU?.contact?.phoneNumber;
            scopusAfid.value = props.presetOU?.scopusAfid;

            nameRef.value?.forceRefreshModelValue(toMultilingualTextInput(name.value, languageList.value));
        };

        return {
            isFormValid, name, mapRef,
            nameAbbreviation, refreshForm,
            email, phoneNumber, scopusAfid,
            requiredFieldRules, updateOU,
            toMultilingualTextInput, languageList,
            scopusAfidValidationRules, nameRef
        };
    }
});
</script>
